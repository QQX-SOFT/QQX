"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    ArrowLeft,
    Calendar,
    Filter,
    TrendingUp,
    Wallet,
    ArrowRight,
    Search
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";

export default function DriverStatsPage() {
    const [driver, setDriver] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"week" | "month" | "year">("week");

    useEffect(() => {
        fetchStats();
    }, [filter]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // 1. Get current driver Profile
            const { data: driverData } = await api.get("/drivers/me");
            setDriver(driverData);

            // Calculate start and end strings based on current filter
            const now = new Date();
            let start = new Date(now);
            const end = new Date(now);
            end.setDate(end.getDate() + 1); // tomorrow

            if (filter === "week") {
                start.setDate(now.getDate() - 7);
            } else if (filter === "month") {
                start.setMonth(now.getMonth() - 1);
            } else if (filter === "year") {
                start.setFullYear(now.getFullYear() - 1);
            }

            const startStr = start.toISOString().split('T')[0];
            const endStr = end.toISOString().split('T')[0];

            // 2. Query Reports
            const { data: reportData } = await api.get(`/reports/driver/${driverData.id}?start=${startStr}&end=${endStr}`);
            setStats(reportData);
        } catch (e) {
            console.error("Failed to fetch stats", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-600 text-lg font-medium">Laden der Zeitübersicht...</p>
            </div>
        );
    }

    const totalHours = stats?.summary?.totalHours || "0.00";
    const totalEarnings = stats?.summary?.totalEarnings || "0.00";
    const totalDays = stats?.summary?.totalDays || 0;
    
    // In many setups, charged hours could match worked hours or we can round up intervals.
    // For simplicity we show exactly worked hours but can call it Charged or create both.
    const chargedHours = totalHours; 

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 bg-slate-50 min-h-screen pb-24 font-sans">
            {/* Header */}
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/driver" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Zeitübersicht</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stunden & Verdienste</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400">
                        <Filter size={18} />
                    </button>
                </div>
            </header>

            {/* Filter Pills */}
            <div className="flex gap-2 p-1 bg-white border border-slate-100 rounded-2xl self-start w-fit">
                {["week", "month", "year"].map((t: any) => (
                    <button 
                        key={t}
                        onClick={() => setFilter(t)}
                        className={cn(
                            "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                            filter === t 
                                ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" 
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {t === "week" ? "Woche" : t === "month" ? "Monat" : "Jahr"}
                    </button>
                ))}
            </div>

            {/* Performance Stats Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
                {/* worked hours Card */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-blue-900/10">
                    <div className="relative z-10 flex justify-between items-center h-full">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Gearbeitete Stunden</p>
                            <h3 className="text-4xl font-black tracking-tighter tabular-nums mb-1">{totalHours} <span className="text-lg font-black text-slate-500">h</span></h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{totalDays} Arbeitstage im Zeitraum</p>
                        </div>
                        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition duration-500 shrink-0">
                            <Clock size={32} />
                        </div>
                    </div>
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                </div>

                {/* Grid row with smaller stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-lg transition duration-500">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition duration-500">
                            <Wallet size={20} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verdienst</p>
                        <h4 className="text-xl font-black text-slate-900 tabular-nums">€{Number(totalEarnings).toFixed(2)}</h4>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-lg transition duration-500">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition duration-500">
                            <TrendingUp size={20} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verrechnet</p>
                        <h4 className="text-xl font-black text-slate-900 tabular-nums">{chargedHours} <span className="text-sm">h</span></h4>
                    </div>
                </div>
            </div>

            {/* List entries for each documented Shift / Day */}
            <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Verlauf</h3>
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{stats?.entries?.length || 0} Einträge</p>
                </div>

                {stats?.entries?.length === 0 ? (
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 text-center text-slate-400">
                        <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">Keine Zeiteinträge im Zeitraum gefunden</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stats?.entries?.map((entry: any, i: number) => {
                            const hours = (entry.durationMinutes / 60).toFixed(2);
                            return (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.3 }}
                                    className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex flex-col items-center justify-center font-black group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                                            <span className="text-xs leading-none">{entry.date.split('.')[0]}</span>
                                            <span className="text-[8px] uppercase">{entry.date.split('.')[1]}.{entry.date.split('.')[2].slice(2,4)}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-sm">{hours} h gearbeitet</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                                {entry.startTime} - {entry.endTime} {entry.pauseMinutes > 0 ? `• Breaks: ${entry.pauseMinutes}m` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 text-sm">€{entry.earnings ? entry.earnings.toFixed(2) : "0.00"}</p>
                                        <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Umsatz</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
