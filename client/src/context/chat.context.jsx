import { createContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

export const ChatContext = createContext();

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on("newMessage", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => newSocket.disconnect();
    }, []);

    const joinChat = useCallback((chatId) => {
        if (!socket) return;
        if (currentChat) {
            socket.emit("leaveChat", currentChat);
        }
        socket.emit("joinChat", chatId);
        setCurrentChat(chatId);
    }, [socket, currentChat]);

    const fetchChats = useCallback(async () => {
        const res = await fetch(`${API}/chat`, { credentials: "include" });
        const data = await res.json();
        setChats(data);
    }, []);

    const createChat = useCallback(async (title, members) => {
        const res = await fetch(`${API}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title, members }),
        });
        const data = await res.json();
        setChats((prev) => [...prev, data]);
        return data;
    }, []);

    const fetchMessages = useCallback(async (chatId) => {
        const res = await fetch(`${API}/message/${chatId}`, { credentials: "include" });
        const data = await res.json();
        setMessages(data);
    }, []);

    const sendMessage = useCallback(async (chatId, message) => {
        const res = await fetch(`${API}/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ chatId, message }),
        });
        return res.json();
    }, []);

    const searchUsers = useCallback(async (query) => {
        const res = await fetch(`${API}/chat/users?q=${query}`, { credentials: "include" });
        return res.json();
    }, []);

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
            socket,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
