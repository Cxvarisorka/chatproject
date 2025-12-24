import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { ChatContext } from "../context/chat.context";
import { VoiceContext } from "../context/voice.context";

const Chat = () => {
    const { user, logout } = useContext(AuthContext);
    const { chats, messages, currentChat, fetchChats, fetchMessages, sendMessage, joinChat, createChat, searchUsers } = useContext(ChatContext);
    const { callUser, callStatus } = useContext(VoiceContext);
    const [message, setMessage] = useState("");
    const [newChatTitle, setNewChatTitle] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Get the current chat object to access members
    const currentChatData = chats.find(c => c._id === currentChat);
    // Get the other user in the chat (for 1-on-1 calls)
    const otherMember = currentChatData?.members?.find(m => m._id !== user._id);

    const handleCall = () => {
        if (otherMember && callStatus === 'idle') {
            callUser(otherMember._id, otherMember.username);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }
        fetchChats();
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (userSearch.length >= 2) {
            searchUsers(userSearch).then(setSearchResults);
        } else {
            setSearchResults([]);
        }
    }, [userSearch]);

    const handleSelectChat = (chatId) => {
        joinChat(chatId);
        fetchMessages(chatId);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || !currentChat) return;
        await sendMessage(currentChat, message);
        setMessage("");
    };

    const handleCreateChat = async (e) => {
        e.preventDefault();
        if (!newChatTitle.trim()) return;
        await createChat(newChatTitle, selectedUsers.map(u => u._id));
        setNewChatTitle("");
        setSelectedUsers([]);
        setUserSearch("");
        setShowModal(false);
    };

    const addUser = (user) => {
        if (!selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setUserSearch("");
        setSearchResults([]);
    };

    const removeUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
    };

    const closeModal = () => {
        setShowModal(false);
        setNewChatTitle("");
        setSelectedUsers([]);
        setUserSearch("");
        setSearchResults([]);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    if (!user) return null;

    return (
        <div className="h-screen flex bg-gray-900">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <span className="text-white">{user.username}</span>
                    <button onClick={handleLogout} className="text-gray-400 text-sm hover:text-white">
                        Logout
                    </button>
                </div>
                <div className="p-2">
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full bg-blue-600 text-white p-2 rounded text-sm hover:bg-blue-700"
                    >
                        New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div
                            key={chat._id}
                            onClick={() => handleSelectChat(chat._id)}
                            className={`p-3 cursor-pointer hover:bg-gray-700 ${currentChat === chat._id ? "bg-gray-700" : ""}`}
                        >
                            <p className="text-white text-sm">{chat.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {currentChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-medium">{currentChatData?.title}</h2>
                                {otherMember && (
                                    <p className="text-gray-400 text-sm">{otherMember.username}</p>
                                )}
                            </div>
                            {otherMember && (
                                <button
                                    onClick={handleCall}
                                    disabled={callStatus !== 'idle'}
                                    className={`p-2 rounded-full transition-colors ${
                                        callStatus === 'idle'
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                                    title="Voice Call"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`mb-2 ${msg.senderId._id === user._id ? "text-right" : ""}`}
                                >
                                    <span className="text-gray-400 text-xs">{msg.senderId.username}</span>
                                    <div
                                        className={`inline-block p-2 rounded-lg mt-1 ${
                                            msg.senderId._id === user._id
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-700 text-white"
                                        }`}
                                    >
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 p-2 rounded bg-gray-700 text-white"
                                />
                                <button className="bg-blue-600 px-4 rounded text-white hover:bg-blue-700">
                                    Send
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a chat to start messaging
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h2 className="text-white mb-4">New Chat</h2>
                        <form onSubmit={handleCreateChat}>
                            <input
                                type="text"
                                value={newChatTitle}
                                onChange={(e) => setNewChatTitle(e.target.value)}
                                placeholder="Chat name"
                                className="w-full p-2 rounded bg-gray-700 text-white mb-4"
                                required
                            />

                            {/* User Search */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search users to add..."
                                    className="w-full p-2 rounded bg-gray-700 text-white"
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute w-full bg-gray-700 rounded mt-1 max-h-32 overflow-y-auto">
                                        {searchResults.map((u) => (
                                            <div
                                                key={u._id}
                                                onClick={() => addUser(u)}
                                                className="p-2 hover:bg-gray-600 cursor-pointer text-white text-sm"
                                            >
                                                {u.username}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Users */}
                            {selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedUsers.map((u) => (
                                        <span
                                            key={u._id}
                                            className="bg-blue-600 text-white text-sm px-2 py-1 rounded flex items-center gap-1"
                                        >
                                            {u.username}
                                            <button
                                                type="button"
                                                onClick={() => removeUser(u._id)}
                                                className="hover:text-red-300"
                                            >
                                                x
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button type="button" onClick={closeModal} className="flex-1 p-2 rounded bg-gray-600 text-white">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 p-2 rounded bg-blue-600 text-white">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
