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
    const [orders, setOrders] = useState<any[]>([]);
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
            setStats({
                todayEarnings: data.stats?.todayEarnings || 0,
                orders: data.stats?.todayOrders || 0,
                onlineHours: data.stats?.onlineHours || "0",
                rating: data.rating || 5.0
            });

            // Fetch available orders
            const { data: availOrders } = await api.get("/orders/available");
            setOrders(availOrders.slice(0, 3)); // show top 3
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
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                            <Wallet size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Heute</p>
                            <h3 className="text-xl font-black text-slate-900">€{stats.todayEarnings.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <Star size={16} className="fill-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Bewertung</p>
                            <h3 className="text-xl font-black text-slate-900">{stats.rating.toFixed(1)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Task / Go Online Call to Action */}
            <Link href="/driver/track">
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="bg-blue-600 p-4 rounded-xl shadow-xl shadow-blue-500/10 text-white flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600">
                            <Play size={20} className="fill-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-black leading-tight">Jetzt Schicht starten</h2>
                            <p className="text-blue-100/80 text-xs font-medium">Tracking aktivieren</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-200">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase">Bereit</span>
                    </div>
                </motion.div>
            </Link>

            {/* Available Orders Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 tracking-tight">Verfügbare Aufträge</h3>
                    <Link href="/driver/orders" className="text-xs font-bold text-blue-600">Alle ansehen</Link>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-100 text-center text-slate-400 text-sm">
                        Keine verfügbaren Aufträge in deiner Nähe
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order: any) => (
                            <Link href="/driver/orders" key={order.id} className="block bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 truncate max-w-[180px]">{order.address}</p>
                                            <p className="text-[10px] font-bold text-slate-400">Netto Verdienst</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-green-600 text-sm">€{(order.amount * 0.4).toFixed(2)}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
