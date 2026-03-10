"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Lock,
    User,
    Loader2,
    Truck,
    ShieldCheck,
    ShoppingBag,
    ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function UnifiedLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState<"ADMIN" | "DRIVER" | "CUSTOMER">("ADMIN");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulation
        setTimeout(() => {
            // Set cookie for middleware
            document.cookie = `role=${userType}; path=/; max-age=86400; SameSite=Lax`;

            // Set localStorage for legacy compat
            localStorage.setItem("role", userType);

            // Redirect based on type
            if (userType === "ADMIN") router.push("/admin");
            else if (userType === "DRIVER") router.push("/driver");
            else if (userType === "CUSTOMER") router.push("/customer");
        }, 1500);
    };

    const types = [
        { id: "ADMIN", label: "Partner", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "DRIVER", label: "Driver", icon: Truck, color: "text-orange-600", bg: "bg-orange-50" },
        { id: "CUSTOMER", label: "Client", icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-blue-500/20 text-white"
                    >
                        <ShieldCheck size={40} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Welcome to <span className="text-blue-600">QQX</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Access your logistics control center.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <form onSubmit={handleLogin} className="space-y-10">
                        {/* User Type Selection */}
                        <div className="grid grid-cols-3 gap-4">
                            {types.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setUserType(t.id as any)}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300",
                                        userType === t.id
                                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/10 scale-105"
                                            : "border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn("p-3 rounded-2xl", t.bg)}>
                                        <t.icon size={22} className={t.color} />
                                    </div>
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", userType === t.id ? "text-blue-600" : "text-slate-400")}>
                                        {t.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Account Identifier</label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={20} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2rem] py-5 pl-16 pr-8 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-800 transition font-medium"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Password</label>
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
                                    <span>Secure Portal Access</span>
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center text-slate-400 dark:text-slate-600 font-bold text-[10px] uppercase tracking-[0.3em]">
                    Enterprise Grade Security &bull; QQX Infrastructure 2026
                </div>
            </motion.div>
        </div>
    );
}
