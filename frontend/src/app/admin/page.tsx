"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    TrendingDown,
    Truck,
    Users,
    MapPin,
    AlertCircle,
    Clock,
    ChevronRight,
    Loader2,
    Calendar,
    Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function Dashboard() {
    const [statsData, setStatsData] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/dashboard/stats");
                setStatsData(data);
                const actRes = await api.get("/dashboard/activities");
                setActivities(actRes.data);
            } catch (e) {
                console.error("Failed to fetch dashboard stats", e);
            } finally {
                setLoading(false);
            }
        };

        const fetchLocations = async () => {
            try {
                const { data } = await api.get("/time-entries/locations");
                setLocations(data);
            } catch (e) {
                console.error("Failed to fetch locations", e);
            }
        };

        fetchStats();
        fetchLocations();

        const interval = setInterval(fetchLocations, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const stats = [
        {
            label: "Fahrzeuge Gesamt",
            value: statsData?.vehicles || "0",
            trend: statsData?.trends?.vehicles || "+0%",
            color: "blue",
            icon: Truck
        },
        {
            label: "Fahrer Online",
            value: statsData?.activeDrivers || "0",
            trend: statsData?.trends?.drivers || "+0%",
            color: "indigo",
            icon: Users
        },
        {
            label: "Lieferungen heute",
            value: statsData?.ordersToday !== undefined ? statsData.ordersToday.toString() : "0",
            trend: statsData?.trends?.deliveries || "+0%",
            color: "slate",
            icon: Clock
        },
        {
            label: "Wartungen fällig",
            value: statsData?.alerts || "0",
            trend: statsData?.trends?.alerts || "Normal",
            color: "red",
            icon: AlertCircle
        },
    ] as const;

    return (
        <div className="space-y-12 pb-20 font-sans">
            {/* Welcome Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Live Cockpit</h1>
                    <p className="text-slate-500 font-medium">Echtzeit-Übersicht über Ihre gesamte Flotte und Performance.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition">Berichte</button>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center gap-2">
                        <Activity size={16} />
                        Live Status
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-pulse h-44"></div>
                    ))
                ) : stats.map((stat, i) => {
                    const Icon = stat.icon;
                    const isPositive = stat.trend.startsWith("+");
                    const isCritical = stat.trend === "Kritisch";

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "p-4 rounded-2xl transition duration-500 group-hover:scale-110",
                                    stat.color === "blue" && "bg-blue-50 text-blue-600",
                                    stat.color === "indigo" && "bg-indigo-50 text-indigo-600",
                                    stat.color === "slate" && "bg-slate-50 text-slate-600",
                                    stat.color === "red" && "bg-red-50 text-red-600"
                                )}>
                                    <Icon size={24} />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter",
                                    isPositive ? "text-green-600 bg-green-50" : isCritical ? "text-red-600 bg-red-50" : "text-slate-400 bg-slate-50"
                                )}>
                                    {isPositive ? <TrendingUp size={12} /> : null}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>

                            <Icon className="absolute bottom-[-20px] right-[-20px] text-slate-50 opacity-[0.03] group-hover:scale-150 transition duration-1000" size={160} />
                        </motion.div>
                    );
                })}
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Live Map Area */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-4 relative h-[650px] overflow-hidden group">
                        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                            {/* Grid effect */}
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                            <div className="relative w-full h-full flex items-center justify-center">
                                {locations.length === 0 ? (
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 mb-6 mx-auto animate-pulse">
                                            <MapPin size={40} />
                                        </div>
                                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Warte auf Live-Signale...</p>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full">
                                        {locations.map((loc) => {
                                            const x = 400 + (loc.lng - 13.4050) * 50000;
                                            const y = 300 - (loc.lat - 52.5200) * 50000;

                                            return (
                                                <motion.div
                                                    key={loc.id}
                                                    initial={{ scale: 0 }}
                                                    animate={{
                                                        x: Math.min(Math.max(x, 50), 750),
                                                        y: Math.min(Math.max(y, 50), 550),
                                                        scale: 1
                                                    }}
                                                    className="absolute"
                                                >
                                                    <div className="relative group/pin">
                                                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 opacity-0 group-hover/pin:opacity-100 transition duration-300 whitespace-nowrap z-20 pointer-events-none">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs">
                                                                    {loc.driverName.split(' ').map((n: string) => n[0]).join('')}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900">{loc.driverName}</p>
                                                                    <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">In Fahrt</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center animate-ping absolute -inset-4 opacity-30" />
                                                        <div className="w-10 h-10 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-blue-500/50 relative z-10 border-2 border-white">
                                                            <Truck size={18} className="text-white fill-white" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Map Overlays */}
                        <div className="absolute top-8 left-8 flex flex-col gap-3">
                            <div className="bg-slate-950/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/5 shadow-2xl min-w-[240px]">
                                <h4 className="font-black text-[10px] mb-4 text-white uppercase tracking-[0.2em] opacity-40">Monitoring</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-300">Aktive Einheiten</span>
                                        <span className="text-sm font-black text-blue-400">{locations.length}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(locations.length * 10, 100)}%` }}
                                            transition={{ duration: 1 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Activity */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center justify-between">
                        Aktivitätsfeed
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </h3>
                    <div className="space-y-12 flex-1">
                        {activities.length === 0 && !loading && (
                            <div className="text-center py-20 opacity-30">
                                <Activity className="mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">Keine aktuellen Daten</p>
                            </div>
                        )}
                        {activities.map((item, i) => (
                            <div key={item.id} className="relative pl-10 group">
                                <div className={cn(
                                    "absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white shadow-xl transition-all duration-300 group-hover:scale-150",
                                    item.type === "alert" ? "bg-red-500 ring-4 ring-red-50" : item.type === "success" ? "bg-green-500 ring-4 ring-green-50" : "bg-blue-500 ring-4 ring-blue-50"
                                )}></div>
                                {(i < activities.length - 1) && <div className="absolute left-[5.5px] top-8 bottom-[-40px] w-1 bg-slate-50 rounded-full"></div>}
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">{new Date(item.date).toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })} Uhr</p>
                                <h4 className="font-black text-slate-900 mb-1 flex items-center gap-2 group-hover:text-blue-600 transition">
                                    {item.title}
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </h4>
                                <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-8 bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-100 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="font-black text-white mb-2">System Gesundheit</h4>
                            <p className="text-[10px] font-black text-blue-100/60 uppercase tracking-widest leading-loose">Alle Schnittstellen aktiv. Latenz < 40ms.</p>
                        </div>
                        <Activity className="absolute bottom-[-20px] right-[-20px] text-white/10 group-hover:scale-150 transition duration-1000" size={120} />
                    </div>
                </div>
            </div>
        </div>
    );
}
