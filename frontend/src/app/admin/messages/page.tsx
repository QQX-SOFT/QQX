"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare,
    Send,
    Search,
    MoreVertical,
    CheckCheck,
    Image as ImageIcon,
    Paperclip,
    Phone,
    Video,
    Smile,
    X,
    User,
    ChevronLeft,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type Message = {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    isRead: boolean;
};

type Chat = {
    id: string;
    driverId: string;
    driverName: string;
    avatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    status: "ONLINE" | "OFFLINE";
    type: "ECHTER_DIENSTNEHMER" | "FREIER_DIENSTNEHMER" | "SELBSTSTANDIG";
};

export default function MessagesPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                // Mocking data for now as per system instructions to provide a WOW experience
                // In a real app, this would be api.get("/messages/chats")
                const mockChats: Chat[] = [
                    {
                        id: "1",
                        driverId: "d1",
                        driverName: "Maximilian Weber",
                        lastMessage: "Habe die Lieferung gerade abgeschlossen.",
                        lastMessageTime: "10:45",
                        unreadCount: 2,
                        status: "ONLINE",
                        type: "ECHTER_DIENSTNEHMER"
                    },
                    {
                        id: "2",
                        driverId: "d2",
                        driverName: "Sarah Schneider",
                        lastMessage: "Können wir die Route für morgen besprechen?",
                        lastMessageTime: "Gestern",
                        unreadCount: 0,
                        status: "OFFLINE",
                        type: "FREIER_DIENSTNEHMER"
                    },
                    {
                        id: "3",
                        driverId: "d3",
                        driverName: "Andreas Huber",
                        lastMessage: "Rechnung wurde hochgeladen.",
                        lastMessageTime: "Montag",
                        unreadCount: 0,
                        status: "ONLINE",
                        type: "SELBSTSTANDIG"
                    },
                    {
                        id: "4",
                        driverId: "d4",
                        driverName: "Elena Fischer",
                        lastMessage: "Bin in 5 Minuten am Depot.",
                        lastMessageTime: "09:12",
                        unreadCount: 0,
                        status: "ONLINE",
                        type: "ECHTER_DIENSTNEHMER"
                    }
                ];
                setChats(mockChats);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load chats", error);
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    const fetchMessages = async (chat: Chat) => {
        setActiveChat(chat);
        setMessages([
            { id: "1", senderId: "admin", text: "Hallo " + chat.driverName.split(' ')[0] + ", alles klar bei dir?", timestamp: "09:00", isRead: true },
            { id: "2", senderId: chat.driverId, text: "Ja, danke! Bin gerade auf dem Weg zur nächsten Station.", timestamp: "09:05", isRead: true },
            { id: "3", senderId: "admin", text: "Super, gib Bescheid wenn du fertig bist.", timestamp: "09:10", isRead: true },
            { id: "4", senderId: chat.driverId, text: chat.lastMessage, timestamp: chat.lastMessageTime, isRead: false },
        ]);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const msg: Message = {
            id: Date.now().toString(),
            senderId: "admin",
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false
        };

        setMessages([...messages, msg]);
        setNewMessage("");

        // Simulated reply
        setTimeout(() => {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                senderId: activeChat.driverId,
                text: "Verstanden!",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: false
            };
            setMessages(prev => [...prev, reply]);
        }, 1500);
    };

    const filteredChats = chats.filter(c =>
        c.driverName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-10rem)] flex bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden font-sans">
            {/* Sidebar: Chat List */}
            <aside className={cn(
                "w-full md:w-96 flex flex-col border-r border-slate-100 dark:border-slate-800 transition-all duration-300",
                activeChat && "hidden md:flex"
            )}>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Messages</h1>
                        <button className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition group">
                            <MessageSquare size={20} className="group-hover:scale-110 transition" />
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Suchen..."
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : (
                        filteredChats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => fetchMessages(chat)}
                                className={cn(
                                    "w-full p-4 rounded-3xl flex items-center gap-4 transition-all duration-300 group relative",
                                    activeChat?.id === chat.id
                                        ? "bg-blue-600 shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner",
                                        activeChat?.id === chat.id ? "bg-white text-blue-600" : "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                                    )}>
                                        {chat.driverName[0]}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 transition-colors",
                                        activeChat?.id === chat.id ? "border-blue-600" : "border-white dark:border-slate-900",
                                        chat.status === "ONLINE" ? "bg-green-500" : "bg-slate-300"
                                    )} />
                                </div>

                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={cn(
                                            "font-black text-sm transition-colors",
                                            activeChat?.id === chat.id ? "text-white" : "text-slate-900 dark:text-white"
                                        )}>{chat.driverName}</h3>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest",
                                            activeChat?.id === chat.id ? "text-blue-100" : "text-slate-400"
                                        )}>{chat.lastMessageTime}</span>
                                    </div>
                                    <p className={cn(
                                        "text-xs font-medium truncate",
                                        activeChat?.id === chat.id ? "text-blue-50" : "text-slate-500"
                                    )}>
                                        {chat.lastMessage}
                                    </p>
                                </div>

                                {chat.unreadCount > 0 && activeChat?.id !== chat.id && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5 shadow-lg shadow-red-500/20">
                                        {chat.unreadCount}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={cn(
                "flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 transition-all duration-300 relative",
                !activeChat && "hidden md:flex items-center justify-center"
            )}>
                {!activeChat ? (
                    <div className="text-center p-12">
                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center text-blue-600 mb-8 mx-auto animate-bounce">
                            <MessageSquare size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Team Communicationhub</h2>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">Wählen Sie einen Mitarbeiter aus der Liste aus, um das Messaging zu starten.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <header className="h-24 bg-white dark:bg-slate-800 px-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 shrink-0 sticky top-0 z-10">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setActiveChat(null)}
                                    className="md:hidden p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl text-slate-400"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/20">
                                        {activeChat.driverName[0]}
                                    </div>
                                    {activeChat.status === "ONLINE" && (
                                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{activeChat.driverName}</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                                            activeChat.type === "SELBSTSTANDIG" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" :
                                                activeChat.type === "FREIER_DIENSTNEHMER" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600" :
                                                    "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                        )}>
                                            {activeChat.type.replace('_', ' ')}
                                        </span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {activeChat.status === "ONLINE" ? "Jetzt Aktiv" : "Zuletzt Gesehen: 1h"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition shadow-sm">
                                    <Phone size={20} />
                                </button>
                                <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition shadow-sm">
                                    <Video size={20} />
                                </button>
                                <div className="h-8 w-px bg-slate-100 dark:bg-slate-700 mx-2" />
                                <button className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-8">
                            <AnimatePresence initial={false}>
                                {messages.map((msg, i) => {
                                    const isAdmin = msg.senderId === "admin";
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={cn(
                                                "flex flex-col max-w-[80%]",
                                                isAdmin ? "ml-auto items-end" : "items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-6 rounded-[2rem] text-sm font-bold shadow-sm relative",
                                                isAdmin
                                                    ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10"
                                                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700"
                                            )}>
                                                {msg.text}
                                            </div>
                                            <div className={cn(
                                                "mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                                isAdmin ? "text-slate-400" : "text-slate-400"
                                            )}>
                                                {msg.timestamp}
                                                {isAdmin && (
                                                    <div className="flex items-center text-blue-500">
                                                        <CheckCheck size={12} />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 shrink-0">
                            <form
                                onSubmit={handleSendMessage}
                                className="bg-white dark:bg-slate-800 p-3 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-2xl flex items-center gap-2 group focus-within:ring-4 focus-within:ring-blue-500/5 transition-all"
                            >
                                <button type="button" className="p-4 text-slate-400 hover:text-blue-600 transition">
                                    <Paperclip size={20} />
                                </button>
                                <button type="button" className="p-4 text-slate-400 hover:text-blue-600 transition">
                                    <ImageIcon size={20} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Nachricht schreiben..."
                                    className="flex-1 bg-transparent border-none outline-none py-4 px-2 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="button" className="p-4 text-slate-400 hover:text-blue-600 transition">
                                    <Smile size={20} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className={cn(
                                        "p-5 rounded-3xl transition-all duration-300 flex items-center justify-center shadow-lg",
                                        newMessage.trim()
                                            ? "bg-blue-600 text-white shadow-blue-500/30 hover:scale-105 active:scale-95"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                    )}
                                >
                                    <Send size={20} className={cn(newMessage.trim() && "animate-pulse-subtle")} />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
