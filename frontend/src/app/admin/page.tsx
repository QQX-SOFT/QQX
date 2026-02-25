"use client";

import {
    TrendingUp,
    TrendingDown,
    Truck,
    Users,
    MapPin,
    AlertCircle,
    Clock,
    ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const stats = [
    { label: "Aktive Fahrzeuge", value: "842", trend: "+12.5%", color: "blue", icon: Truck },
    { label: "Fahrer Online", value: "312", trend: "+3.2%", color: "indigo", icon: Users },
    { label: "Lieferungen heute", value: "1.204", trend: "-1.4%", color: "slate", icon: Clock },
    { label: "Offene Warnungen", value: "14", trend: "Kritisch", color: "red", icon: AlertCircle },
] as const;

export default function Dashboard() {
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
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    const isNegative = stat.trend.startsWith("-");
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
                                    stat.trend.startsWith("+") ? "text-green-600 bg-green-50" : isCritical ? "text-red-600 bg-red-50" : "text-slate-400 bg-slate-50"
                                )}>
                                    {stat.trend.startsWith("+") ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : null}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>

                            {/* Decorative Background Icon */}
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
                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                            {/* Mock Map Background */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
                            <div className="relative text-center">
                                <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 mb-4 mx-auto animate-pulse">
                                    <MapPin size={32} />
                                </div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Live-Tracking Map Engine wird geladen...</p>
                            </div>
                        </div>

                        {/* Map Overlays */}
                        <div className="absolute top-8 left-8 flex flex-col gap-3">
                            <div className="glass bg-white/80 p-5 rounded-3xl border border-white shadow-xl min-w-[200px]">
                                <h4 className="font-black text-sm mb-3">Aktive Einheiten</h4>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <div className="bg-slate-100 h-2 w-full rounded-full overflow-hidden">
                                                <div className="bg-blue-600 h-full w-[70%]" style={{ width: `${40 + i * 15}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
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
                        {[
                            { title: "Fahrzeug 402 - Motorsatcheck", time: "vor 2 Min.", desc: "Präventive Wartung für Einheit #402 ausgelöst.", type: "alert" },
                            { title: "Neuer Fahrer an Bord", time: "vor 15 Min.", desc: "Marco K. ist der Frankfurter Flotte beigetreten.", type: "notif" },
                            { title: "Lieferung optimiert", time: "vor 1 Std.", desc: "KI-Optimierung sparte 24km auf Route B4.", type: "success" },
                            { title: "Routenverzögerung", time: "vor 3 Std.", desc: "Starker Verkehr in Berlin betrifft 4 Einheiten.", type: "alert" },
                        ].map((item, i) => (
                            <div key={i} className="relative pl-8 group">
                                <div className={cn(
                                    "absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-all duration-300 group-hover:scale-150",
                                    item.type === "alert" ? "bg-red-500 ring-4 ring-red-50" : item.type === "success" ? "bg-green-500 ring-4 ring-green-50" : "bg-blue-500 ring-4 ring-blue-50"
                                )}></div>
                                {i < 3 && <div className="absolute left-[4.5px] top-6 bottom-[-30px] w-0.5 bg-slate-50"></div>}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.time}</p>
                                <h4 className="font-black text-slate-900 mb-1 flex items-center gap-2">
                                    {item.title}
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition translate-x-[-10px] group-hover:translate-x-0" />
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
