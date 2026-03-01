"use client";

import { useState, useEffect } from "react";
import {
    Play,
    Clock,
    Wallet,
    MapPin,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    ChevronRight,
    Star,
    Calendar,
    ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";

export default function DriverDashboard() {
    const [driverName, setDriverName] = useState("Laden...");
    const [stats, setStats] = useState({
        todayEarnings: 0,
        orders: 0,
        onlineHours: "0",
        rating: 5.0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.get("/drivers/me");
            setDriverName(data.firstName);
            // In a real app, these stats would come from a dedicated stats endpoint
            setStats({
                todayEarnings: data.stats?.todayEarnings || 0,
                orders: data.stats?.todayOrders || 0,
                onlineHours: data.stats?.onlineHours || "0",
                rating: data.rating || 5.0
            });
        } catch (e) {
            console.error("Failed to fetch driver stats", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Greeting */}
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Hallo, {driverName}! 👋</h1>
                <p className="text-slate-500 font-medium">Bereit für deine heutige Schicht?</p>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition duration-500">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition duration-500">
                        <Wallet size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Heute Verdient</p>
                    <h3 className="text-2xl font-black text-slate-900">€{stats.todayEarnings.toFixed(2)}</h3>
                    <TrendingUp className="absolute bottom-[-10px] right-[-10px] text-green-500/10" size={80} />
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition duration-500">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition duration-500">
                        <Star size={20} className="fill-blue-600" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bewertung</p>
                    <h3 className="text-2xl font-black text-slate-900">{stats.rating}</h3>
                    <Star className="absolute bottom-[-10px] right-[-10px] text-blue-500/10" size={80} />
                </div>
            </div>

            {/* Active Task / Go Online Call to Action */}
            <Link href="/driver/track">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-200 text-white relative overflow-hidden group mt-4 flex items-center justify-between"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Live Status: Offline</span>
                        </div>
                        <h2 className="text-2xl font-black mb-2">Jetzt Schicht starten</h2>
                        <p className="text-blue-100/80 text-sm font-medium">Starte dein Tracking für heute.</p>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl group-hover:rotate-12 transition duration-500 relative z-10">
                        <Play size={28} className="fill-blue-600" />
                    </div>

                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                </motion.div>
            </Link>

            {/* Recent Activity / Next Steps */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-black text-slate-900">Anstehende Erledigungen</h3>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Alle anzeigen</span>
                </div>

                <div className="space-y-3">
                    <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-amber-50 transition">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 leading-tight">Dokumente ablaufen</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Dein Meldezettel muss erneuert werden.</p>
                        </div>
                        <ChevronRight size={18} className="text-amber-300 group-hover:translate-x-1 transition" />
                    </div>

                    <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-slate-50 transition">
                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0">
                            <Calendar size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 leading-tight">Wartungstermin</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Mercedes Sprinter (B-QX 123) am Freitag.</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:translate-x-1 transition" />
                    </div>
                </div>
            </div>

            {/* Weekly Earnings Chart Placeholder */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wochenübersicht</p>
                            <h3 className="text-2xl font-black">€842.10</h3>
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black text-green-400 flex items-center gap-1 uppercase tracking-tighter">
                            <ArrowUpRight size={12} />
                            +12% vs Vorwoche
                        </div>
                    </div>

                    {/* Visual representation of a chart using divs */}
                    <div className="flex items-end justify-between h-20 gap-2">
                        {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.1, duration: 1 }}
                                className={cn(
                                    "flex-1 rounded-t-lg transition-all duration-500",
                                    i === 6 ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-slate-700 hover:bg-slate-600"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-full h-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            {/* Last Activity */}
            <div className="text-center pb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Letzte Synchronisierung: Gerade eben</p>
            </div>
        </div>
    );
}
