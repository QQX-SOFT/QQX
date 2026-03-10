"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Lock,
    User,
    Loader2,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function UnifiedLoginPage() {
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
            const detectedRole = response.data.role;

            // Set cookie for middleware
            // Map "CUSTOMER_ADMIN" to "ADMIN" in cookie for frontend redirection matching
            const cookieRole = detectedRole === "CUSTOMER_ADMIN" ? "ADMIN" : detectedRole;
            document.cookie = `role=${cookieRole}; path=/; max-age=86400; SameSite=Lax`;

            // LocalStorage for generic frontend use
            localStorage.setItem("role", cookieRole);
            if (response.data.user) {
                localStorage.setItem("user", JSON.stringify(response.data.user));
            }

            // Automatic redirect
            if (detectedRole === "SUPER_ADMIN") {
                router.push("/superadmin");
            } else if (detectedRole === "CUSTOMER_ADMIN" || detectedRole === "ADMIN") {
                router.push("/admin");
            } else if (detectedRole === "DRIVER") {
                router.push("/driver");
            } else if (detectedRole === "CUSTOMER") {
                router.push("/customer");
            } else {
                setLoading(false);
                setError("Ungültige Rolle oder Zugriff verweigert.");
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
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Hintergrund-Dekoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-blue-500/20 text-white"
                    >
                        <ShieldCheck size={40} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Willkommen bei <span className="text-blue-600">QQX</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Melden Sie sich an, um zu Ihrem Control Center zu gelangen.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">E-Mail Adresse</label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={20} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2rem] py-5 pl-16 pr-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-800 transition font-medium"
                                        placeholder="beispiel@firma.at"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Passwort</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={20} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2rem] py-5 pl-16 pr-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-800 transition font-medium"
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
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] transition-all duration-300 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span>Anmelden</span>
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center text-slate-400 dark:text-slate-600 font-bold text-[10px] uppercase tracking-[0.3em]">
                    Sicherheitszertifiziert &bull; QQX Infrastructure 2026
                </div>
            </motion.div>
        </div>
    );
}
