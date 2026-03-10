"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function CustomerLoginPage() {
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

            if (detectedRole === 'CUSTOMER') {
                document.cookie = `role=CUSTOMER; path=/; max-age=86400; SameSite=Lax`;
                localStorage.setItem("role", "CUSTOMER");
                if (response.data.user) {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }
                router.push("/customer");
            } else {
                setLoading(false);
                setError("Ungültige Rolle: Kein Kunden-Zugang.");
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
                    <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center mb-6 mx-auto rotate-3 shadow-2xl shadow-emerald-500/20 text-white">
                        <ShoppingBag size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Kunden Portal</h1>
                    <p className="text-slate-500 font-medium">Ihre Lieferungen im Überblick</p>
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
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Benutzername veya Email</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-600 transition" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition"
                                    placeholder="kunde@beispiel.at"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Passwort</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-600 transition" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
