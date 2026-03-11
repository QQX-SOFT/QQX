"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Lock,
    User,
    Loader2,
    ChevronRight,
    AlertCircle,
    Server,
    Zap
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function SuperAdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", { email, password });
            
            if (response.data.role === "SUPER_ADMIN") {
                // Set cookie for middleware
                document.cookie = `role=${response.data.role}; path=/; max-age=86400; SameSite=Lax`;
                
                // LocalStorage for frontend use
                localStorage.setItem("role", response.data.role);
                if (response.data.user) {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }
                
                router.push("/superadmin");
            } else {
                setLoading(false);
                setError("Zugriff verweigert. Nur für Root-Administratoren.");
            }
        } catch (err: any) {
            setLoading(false);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError("Anmeldefehler. E-Mail oder Passwort falsch.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#07080d] flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Background Decoration - Premium Dark Theme */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[160px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[160px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.5, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-[0_20px_50px_rgba(79,70,229,0.3)] text-white relative group"
                    >
                        <ShieldCheck size={48} className="relative z-10" />
                        <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4 italic uppercase">
                            QQX <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 not-italic">ROOT</span>
                        </h1>
                        <p className="text-slate-400 font-bold tracking-[0.2em] text-[11px] uppercase">
                            Global Infrastructure Control Center
                        </p>
                    </motion.div>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Server size={120} className="text-indigo-500" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8 relative z-10">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-6">Access Identity</label>
                                <div className="relative group">
                                    <User className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition" size={20} />
                                    <input
                                        type="email"
                                        required
                                        autoFocus
                                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 transition font-bold placeholder:text-slate-600"
                                        placeholder="root@qqxsoft.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-6">Security Token</label>
                                <div className="relative group">
                                    <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition" size={20} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 transition font-bold placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-7 rounded-[2rem] transition-all duration-500 shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span className="uppercase tracking-[0.2em] text-sm">System Authentication</span>
                                    <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/5">
                        <Zap size={14} className="text-yellow-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Quantum Encryption Active</span>
                    </div>
                    <p className="text-slate-600 font-bold text-[9px] uppercase tracking-[0.4em]">
                        RESTRICTED ACCESS &bull; ID: {Math.random().toString(36).substring(2, 8).toUpperCase()}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
