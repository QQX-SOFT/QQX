"use client";

import { useState, useEffect, useRef } from "react";
import {
    Send,
    ChevronLeft,
    MoreVertical,
    Paperclip,
    Image as ImageIcon,
    Smile,
    ArrowLeft,
    ShieldCheck,
    CheckCheck,
    Loader2,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";

type Message = {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    isRead: boolean;
};

export default function DriverMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [userId, setUserId] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setUserId(JSON.parse(userStr).id);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Poll for new messages
            return () => clearInterval(interval);
        }
    }, [userId]);

    const fetchMessages = async () => {
        try {
            const { data } = await api.get("/messages");
            const mapped = data.map((m: any) => ({
                id: m.id,
                senderId: m.senderId === userId ? "driver" : "admin",
                text: m.text,
                timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: m.isRead,
                fileUrl: m.fileUrl
            }));
            setMessages(mapped);
        } catch (e) {
            console.error("Failed to fetch messages", e);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedImageFile) return;

        let fileUrl = null;
        try {
            if (selectedImageFile) {
                const formData = new FormData();
                formData.append("file", selectedImageFile);
                const uploadRes = await api.post("/upload", formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                fileUrl = uploadRes.data.url;
            }

            const { data } = await api.post("/messages", {
                senderId: userId,
                text: newMessage,
                fileUrl: fileUrl
            });

            // Update local state without waiting for poll
            const msg: Message = {
                id: data.id,
                senderId: "driver",
                text: newMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: false
            };
            setMessages([...messages, msg]);
            setNewMessage("");
            setSelectedImage(null);
            setSelectedImageFile(null);
        } catch (e) {
            console.error("Failed to send message", e);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] bg-slate-50 relative animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-6 py-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/driver" className="p-2 bg-slate-50 rounded-xl text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="relative">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-slate-900/10">
                            ZA
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                        <h2 className="font-black text-slate-900 tracking-tight leading-none mb-1">Zentrale (Admin)</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Dispatcher</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span className="text-[9px] font-bold text-slate-400">Online</span>
                        </div>
                    </div>
                </div>
                <button className="p-2 text-slate-400">
                    <MoreVertical size={20} />
                </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <div className="flex justify-center mb-8">
                    <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm border border-slate-100">Heute</span>
                </div>

                <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                        const isDriver = msg.senderId === "driver";
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={cn(
                                    "flex flex-col max-w-[85%]",
                                    isDriver ? "ml-auto items-end text-right" : "items-start text-left"
                                )}
                            >
                                <div className={cn(
                                    "p-5 rounded-[1.75rem] text-sm font-bold shadow-sm relative transition-all duration-300",
                                    isDriver
                                        ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10"
                                        : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                                )}>
                                    {msg.text}
                                </div>
                                <div className={cn(
                                    "mt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 px-1"
                                )}>
                                    {msg.timestamp}
                                    {isDriver && (
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

            {/* Quick Actions / Suggestions */}
            <div className="px-6 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {["In 5 Min zurück", "Unterwegs 👋", "Danke!", "👍", "Hilfe nötig"].map((text) => (
                    <button
                        key={text}
                        onClick={() => setNewMessage(text)}
                        className="bg-white px-4 py-2 rounded-full text-[10px] font-black text-slate-500 whitespace-nowrap border border-slate-100 shadow-sm hover:border-blue-500 transition-colors"
                    >
                        {text}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-6 shrink-0 bg-white border-t border-slate-100 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                {selectedImage && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 relative w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                        <img src={selectedImage} alt="Attachment" className="w-full h-full object-cover" />
                        <button onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
                
                <form
                    onSubmit={handleSendMessage}
                    className="bg-slate-50 p-2 rounded-[2rem] border border-slate-200 flex items-center gap-2 transition-all focus-within:ring-4 focus-within:ring-blue-500/5 group"
                >
                    <label className="p-3 text-slate-400 hover:text-blue-600 transition cursor-pointer">
                        <Paperclip size={20} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <input
                        type="text"
                        placeholder="Nachricht schreiben..."
                        className="flex-1 bg-transparent border-none outline-none py-3 px-1 text-sm font-bold text-slate-900 placeholder:text-slate-400 group-focus:placeholder:text-slate-300 transition-all font-sans"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() && !selectedImage}
                        className={cn(
                            "w-12 h-12 rounded-[1.25rem] transition-all duration-300 flex items-center justify-center shadow-lg",
                            newMessage.trim() || selectedImage
                                ? "bg-blue-600 text-white shadow-blue-500/30 rotate-0 scale-100"
                                : "bg-slate-200 text-slate-400 grayscale scale-95"
                        )}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
