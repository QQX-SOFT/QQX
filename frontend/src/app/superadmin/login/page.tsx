"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Lock,
    User,
    Loader2,
    ChevronRight,
    AlertCircle,
    Shield
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
        <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#07080d] flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-sm">
                        <Shield className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                            QQX Admin
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            Bitte melden Sie sich an, um fortzufahren
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    E-Mail Adresse
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        autoFocus
                                        className="w-full bg-[#f8f9fc] dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-10 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition text-sm placeholder:text-slate-400"
                                        placeholder="office@qqxsoft.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Passwort
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-[#f8f9fc] dark:bg-black border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-10 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition text-sm placeholder:text-slate-400"
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
                            className="w-full bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-black text-white font-medium py-3.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <>
                                    <span>Anmelden</span>
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 font-medium text-xs">
                        Geschützter Bereich &copy; {new Date().getFullYear()} QQX Software
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
