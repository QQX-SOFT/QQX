"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Bell, Mail, Smartphone, Globe, Plus, Search, Filter, Megaphone, AlertTriangle, Info } from "lucide-react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get("/superadmin/notifications");
                // Transform API data to match UI expectations if necessary
                const transformed = data.map((n: any) => ({
                    id: n.id,
                    type: "SYSTEM",
                    category: n.priority || "Incident",
                    title: n.title,
                    date: new Date(n.createdAt).toLocaleString('de-DE'),
                    status: "SENT",
                    icon: n.priority === 'HIGH' ? AlertTriangle : Info,
                    color: n.priority === 'HIGH' ? "text-amber-500" : "text-blue-500",
                    bg: n.priority === 'HIGH' ? "bg-amber-500/10" : "bg-blue-500/10"
                }));
                setNotifications(transformed);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                        Benachrichtigungen
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Verwalten Sie systemweite Ankündigungen und automatisierte Meldungen.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-indigo-500/20 active:scale-95">
                    <Megaphone size={20} />
                    <span>Ankündigung erstellen</span>
                </button>
            </div>

            {/* Channels Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "E-Mail Versand", value: "99.8%", sub: "Zustellrate", icon: Mail, color: "blue" },
                    { label: "In-App Meldungen", value: "1.2k", sub: "Letzte 24h", icon: Globe, color: "indigo" },
                    { label: "Webhooks", value: "24", sub: "Aktive Endpunkte", icon: Smartphone, color: "emerald" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#0f111a] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* List Table */}
            <div className="bg-white dark:bg-[#0f111a] rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-black text-lg uppercase tracking-tight">Letzte Benachrichtigungen</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Suchen..."
                                className="bg-slate-50 dark:bg-white/5 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-medium w-48 focus:w-64 transition-all"
                            />
                        </div>
                        <button className="p-2 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 transition">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                            Lade Benachrichtigungen...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">
                            Keine Benachrichtigungen gefunden
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div key={n.id} className="p-6 flex items-center gap-6 hover:bg-slate-50/50 dark:hover:bg-white/5 transition group">
                                <div className={`${n.bg} ${n.color} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0`}>
                                    <n.icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{n.category}</span>
                                        <span className="text-[10px] font-black text-slate-300">•</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{n.type}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition">{n.title}</h4>
                                    <p className="text-xs font-medium text-slate-400 mt-0.5">{n.date}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full ${n.status === 'SENT' ? 'text-emerald-500 bg-emerald-500/10' : 'text-blue-500 bg-blue-500/10'}`}>
                                        {n.status === 'SENT' ? 'Gesendet' : 'Geplant'}
                                    </span>
                                    <button className="text-xs font-bold text-slate-300 hover:text-indigo-500 transition">Details</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-slate-50/50 dark:bg-white/5 text-center">
                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-500 transition">
                        Alle Benachrichtigungen anzeigen
                    </button>
                </div>
            </div>
        </div>
    );
}
