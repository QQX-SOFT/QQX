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
    Loader2
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
            label: "Aktive Fahrzeuge",
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
            trend: "+5.4%",
            color: "slate",
            icon: Clock
        },
        {
            label: "Kritische Warnungen",
            value: statsData?.alerts || "0",
            trend: statsData?.trends?.alerts || "Normal",
            color: "red",
            icon: AlertCircle
        },
    ] as const;

    return (
        <div className="space-y-12">
            {/* Welcome Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Flottenübersicht</h1>
                    <p className="text-slate-500 font-medium">Willkommen zurück! Hier ist der aktuelle Status Ihrer Flotte.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition">PDF Export</button>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200">Neuer Einsatz</button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-pulse h-40"></div>
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
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
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
                                    "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full",
                                    isPositive ? "text-green-600 bg-green-50" : isCritical ? "text-red-600 bg-red-50" : "text-slate-400 bg-slate-50"
                                )}>
                                    {isPositive ? <TrendingUp size={12} /> : null}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>

                            <Icon className="absolute bottom-[-20px] right-[-20px] text-slate-50 opacity-[0.03] group-hover:scale-150 transition duration-1000" size={160} />
                        </motion.div>
                    );
                })}
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Live Map Area (Placeholder) */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-4 relative h-[600px] overflow-hidden group">
                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            {/* Mock Map Grid */}
                            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                            {/* Simulated City/Roads */}
                            <svg className="absolute inset-0 w-full h-full text-white/5" viewBox="0 0 800 600">
                                <path d="M0,300 L800,300 M400,0 L400,600 M200,0 L200,600 M600,0 L600,600 M0,150 L800,150 M0,450 L800,450" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>

                            <div className="relative w-full h-full flex items-center justify-center">
                                {locations.length === 0 ? (
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 mb-4 mx-auto animate-pulse">
                                            <MapPin size={32} />
                                        </div>
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Warte auf aktive Einheiten...</p>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full overflow-hidden">
                                        {locations.map((loc, idx) => {
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
                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl shadow-2xl border border-slate-100 opacity-0 group-hover/pin:opacity-100 transition whitespace-nowrap z-20 pointer-events-none">
                                                            <p className="text-[10px] font-black text-slate-900">{loc.driverName}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Aktiv seit {new Date(loc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center animate-ping absolute -inset-2 opacity-30" />
                                                        <div className="w-8 h-8 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 relative z-10 border-2 border-white">
                                                            <Truck size={14} className="text-white fill-white" />
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
                            <div className="glass bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl min-w-[200px]">
                                <h4 className="font-black text-xs mb-3 text-white uppercase tracking-widest opacity-60">Live-Monitoring</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-400">Aktive Einheiten</span>
                                        <span className="text-xs font-black text-white">{locations.length}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(locations.length * 10, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Activity */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center justify-between">
                        Letzte Aktivitäten
                        <button className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">Alle ansehen</button>
                    </h3>
                    <div className="space-y-10">
                        {locations.length > 0 && (
                            <div className="relative pl-8 group">
                                <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm bg-green-500 ring-4 ring-green-50"></div>
                                <div className="absolute left-[4.5px] top-6 bottom-[-30px] w-0.5 bg-slate-50"></div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Live</p>
                                <h4 className="font-black text-slate-900 mb-1 flex items-center gap-2">
                                    Operationeller Status: Aktiv
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                                </h4>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{locations.length} Einheiten befinden sich aktuell im Einsatz.</p>
                            </div>
                        )}
                        {activities.map((item, i) => (
                            <div key={item.id} className="relative pl-8 group">
                                <div className={cn(
                                    "absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-all duration-300 group-hover:scale-150",
                                    item.type === "alert" ? "bg-red-500 ring-4 ring-red-50" : item.type === "success" ? "bg-green-500 ring-4 ring-green-50" : "bg-blue-500 ring-4 ring-blue-50"
                                )}></div>
                                {(i < activities.length - 1) && <div className="absolute left-[4.5px] top-6 bottom-[-30px] w-0.5 bg-slate-50"></div>}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{new Date(item.date).toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })}</p>
                                <h4 className="font-black text-slate-900 mb-1 flex items-center gap-2">
                                    {item.title}
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                                </h4>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-8 bg-blue-50 rounded-[2rem] border border-blue-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-black text-blue-900 mb-2">Wochenübersicht</h4>
                            <p className="text-xs font-bold text-blue-700/60 leading-relaxed">Ihre Flotteneffizienz ist im Vergleich zur Vorwoche um 14% gestiegen. Gute Arbeit!</p>
                        </div>
                        <TrendingUp className="absolute bottom-[-20px] right-[-20px] text-blue-600/10" size={100} />
                    </div>
                </div>
            </div>
        </div>
    );
}
