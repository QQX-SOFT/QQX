"use client";

import { useState, useEffect } from "react";
import {
    Package,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    User,
    ChevronRight,
    MapPin,
    ArrowUpRight,
    ShoppingBag,
    Search,
    Filter,
    Calendar,
    ArrowRight,
    History,
    ShieldCheck,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";

type Order = {
    id: string;
    address: string;
    amount: number;
    status: "WAITING_APPROVAL" | "PENDING" | "ACCEPTED" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED";
    createdAt: string;
};

export default function CustomerDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Mocking for now to show premium experience
            const mockOrders: Order[] = [
                { id: "1", address: "Handelskai 214, 1020 Wien", amount: 45.90, status: "WAITING_APPROVAL", createdAt: new Date().toISOString() },
                { id: "2", address: "Gürtel 45, 1160 Wien", amount: 32.50, status: "ON_THE_WAY", createdAt: new Date(Date.now() - 3600000).toISOString() },
                { id: "3", address: "Favoritenstraße 12, 1100 Wien", amount: 15.00, status: "DELIVERED", createdAt: new Date(Date.now() - 86400000).toISOString() },
            ];
            setOrders(mockOrders);
            setLoading(false);
        } catch (e) {
            console.error("Failed to fetch customer orders", e);
            setLoading(false);
        }
    };

    const statusConfig: Record<string, any> = {
        WAITING_APPROVAL: { icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Wartet auf Bestätigung" },
        PENDING: { icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Bestätigt / Suche Fahrer" },
        ACCEPTED: { icon: Truck, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", label: "Fahrer zugewiesen" },
        ON_THE_WAY: { icon: MapPin, color: "text-blue-600", bg: "bg-blue-100/50 dark:bg-blue-900/40", label: "In Zustellung" },
        DELIVERED: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", label: "Erfolgreich geliefert" },
        CANCELLED: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label: "Storniert" },
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Hero / CTA Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase">Guten Tag, Max! 👋</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Verfolgen Sie Ihre Sendungen und erstellen Sie neue Aufträge in Echtzeit.</p>
                </div>
                <Link href="/customer/new-order">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-blue-600 text-white rounded-[1.75rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 flex items-center gap-3 active:bg-blue-700 transition duration-300"
                    >
                        <ShoppingBag size={20} />
                        Neue Bestellung aufgeben
                    </motion.button>
                </Link>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Aktive Bestellungen", value: orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length, icon: Package, color: "blue" },
                    { label: "Heute Geliefert", value: orders.filter(o => o.status === 'DELIVERED').length, icon: CheckCircle2, color: "green" },
                    { label: "Durchschn. Lieferzeit", value: "24 min", icon: Clock, color: "indigo" },
                    { label: "Support Tickets", value: "0", icon: AlertCircle, color: "slate" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition duration-500 group-hover:scale-110",
                            stat.color === "blue" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" :
                                stat.color === "green" ? "bg-green-50 dark:bg-green-900/20 text-green-600" :
                                    stat.color === "indigo" ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" :
                                        "bg-slate-50 dark:bg-slate-800 text-slate-400"
                        )}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</h3>

                        {/* Decor */}
                        <stat.icon size={80} className="absolute bottom-[-10px] right-[-10px] text-slate-500 opacity-5 group-hover:scale-125 transition duration-1000" />
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Orders Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Aktuelle Sendungen</h2>
                        <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:opacity-70 transition">Alle Ansehen</button>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 animate-pulse h-32" />
                            ))
                        ) : orders.map((order, i) => {
                            const config = statusConfig[order.status] || statusConfig.WAITING_APPROVAL;
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 relative overflow-hidden"
                                >
                                    <div className={cn(
                                        "w-20 h-20 rounded-[1.75rem] flex items-center justify-center shrink-0 transition duration-500 group-hover:scale-110",
                                        config.bg, config.color
                                    )}>
                                        <Icon size={32} />
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sendungs #QX-{order.id.padStart(4, '0')}</span>
                                            <span className="hidden md:block w-1.5 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('de-DE')}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 truncate max-w-sm">{order.address}</h3>
                                        <div className={cn("inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest", config.color)}>
                                            <Icon size={12} />
                                            {config.label}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Betrag</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">€{order.amount.toFixed(2)}</p>
                                        </div>
                                        <button className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition duration-500 shadow-sm active:scale-95">
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>

                                    {/* Decor */}
                                    <div className="absolute top-0 right-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition duration-500" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Tracking & Info Sidebar */}
                <div className="space-y-10">
                    {/* Live Tracker CTA */}
                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-slate-950/20">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Live Tracking</h3>
                            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Verfolgen Sie Ihre aktivste Sendung in Echtzeit auf der Karte.</p>

                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <MapPin size={24} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1 text-blue-400">Handelskai 214</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none text-slate-500 truncate">Noch 8 Minuten entfernt...</p>
                                </div>
                            </div>

                            <button className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-white/5 hover:scale-105 active:scale-95 transition-all duration-300">Karte öffnen</button>
                        </div>

                        {/* Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    </div>

                    {/* Quick Support Activity */}
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-10 flex items-center justify-between">
                            Support-Status
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.5)] animate-pulse" />
                        </h3>

                        <div className="space-y-8">
                            <div className="flex gap-4 relative">
                                <div className="absolute left-[7px] top-4 bottom-[-16px] w-[2px] bg-slate-50 dark:bg-slate-800" />
                                <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-50 dark:ring-blue-900/20 flex items-center justify-center shrink-0 relative z-10" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Heute, 10:45</p>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 leading-none uppercase tracking-tight">Bestellung bestätigt</h4>
                                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-[140px]">Ihre Bestellung #QX-0001 wurde vom Administrator genehmigt.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 z-10" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gestern</p>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">Konto Aktiviert</h4>
                                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-[140px]">Willkommen im QQX Portal! Ihr Zugang wurde vollständig freigeschaltet.</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-10 py-5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:text-blue-600 hover:bg-blue-50 transition duration-300">Help-Center</button>
                    </div>
                </div>
            </div>

            {/* Version Footer */}
            <div className="text-center pt-8">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.4em]">QQX Customer Experience Core v1.2.0 • Build ID: 28022026</p>
            </div>
        </div>
    );
}
