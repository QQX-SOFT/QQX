"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function AdminLoginPage() {
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

            if (detectedRole === 'CUSTOMER_ADMIN' || detectedRole === 'SUPER_ADMIN' || detectedRole === 'ADMIN') {
                const cookieRole = detectedRole === "CUSTOMER_ADMIN" ? "ADMIN" : detectedRole;
                document.cookie = `role=${cookieRole}; path=/; max-age=86400; SameSite=Lax`;
                localStorage.setItem("role", cookieRole);
                if (response.data.user) {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }

                if (detectedRole === 'SUPER_ADMIN') {
                    router.push("/superadmin");
                } else {
                    router.push("/admin");
                }
            } else {
                setLoading(false);
                setError("Ungültige Rolle: Kein Administrator-Zugang.");
            }
        } catch (err: any) {
            setLoading(false);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError("Anmeldefehler. Bitte überprüfen Sie Ihre Daten.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 mx-auto rotate-3 shadow-2xl shadow-blue-500/20 text-white">
                        <LayoutDashboard size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">QQX Control</h1>
                    <p className="text-slate-500 font-medium">Administration & Control Panel</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm font-bold">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                                    placeholder="admin@firma.at"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Passwort</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
