import { createContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const ChatContext = createContext();

const API = "http://localhost:3000/api";

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io("http://localhost:3000");

        socketRef.current.on("newMessage", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => socketRef.current.disconnect();
    }, []);

    const joinChat = (chatId) => {
        if (currentChat) {
            socketRef.current.emit("leaveChat", currentChat);
        }
        socketRef.current.emit("joinChat", chatId);
        setCurrentChat(chatId);
    };

    const fetchChats = async () => {
        const res = await fetch(`${API}/chat`, { credentials: "include" });
        const data = await res.json();
        setChats(data);
    };

    const createChat = async (title, members) => {
        const res = await fetch(`${API}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title, members }),
        });
        const data = await res.json();
        setChats((prev) => [...prev, data]);
        return data;
    };

    const fetchMessages = async (chatId) => {
        const res = await fetch(`${API}/message/${chatId}`, { credentials: "include" });
        const data = await res.json();
        setMessages(data);
    };

    const sendMessage = async (chatId, message) => {
        const res = await fetch(`${API}/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ chatId, message }),
        });
        return res.json();
    };

    const searchUsers = async (query) => {
        const res = await fetch(`${API}/chat/users?q=${query}`, { credentials: "include" });
        return res.json();
    };

    return (
        <ChatContext.Provider value={{
            chats,
            currentChat,
            messages,
            fetchChats,
            createChat,
            fetchMessages,
            sendMessage,
            joinChat,
            searchUsers,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
