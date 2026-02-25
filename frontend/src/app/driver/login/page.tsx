"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Lock, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Mock Login: Store demo driver ID
        setTimeout(() => {
            localStorage.setItem("driverId", "demo-driver-1");
            router.push("/driver/track");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 mx-auto rotate-3 shadow-2xl shadow-blue-500/20">
                        <Truck className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">QQX Driver Portal</h1>
                    <p className="text-slate-500 font-medium">Bitte melden Sie sich an, um Ihre Schicht zu starten.</p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email Adresse</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-500 transition" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:border-blue-500 transition"
                                    placeholder="name@firma.de"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Passwort</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-blue-500 transition" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:border-blue-500 transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Anmelden"}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-8 border-t border-white/5">
                        <p className="text-slate-500 text-xs font-medium italic">Demodaten: driver@qqx.de / beliebig</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
