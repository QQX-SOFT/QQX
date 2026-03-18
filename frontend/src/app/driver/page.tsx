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
    const [activeShift, setActiveShift] = useState<any>(null);
    const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        const lat = localStorage.getItem("driver_lat");
        const lng = localStorage.getItem("driver_lng");
        if (lat && lng) {
            setDriverLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
        }
        fetchDashboardData();
    }, []);

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

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

            const activeRes = await api.get(`/time-entries/active/${data.id}`);
            setActiveShift(activeRes.data);

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
            {!activeShift ? (
                <Link href="/driver/track">
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="bg-blue-600 p-4 rounded-xl shadow-xl shadow-blue-500/10 text-white flex items-center justify-between transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-800">
                                <Play size={20} className="text-blue-600 fill-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-black leading-tight">Jetzt Schicht starten</h2>
                                <p className="text-blue-100/80 text-xs font-medium">Tracking aktivieren</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-slate-200">
                            <span className="w-2 h-2 rounded-full animate-pulse bg-green-400" />
                            <span className="text-[10px] font-bold uppercase">Bereit</span>
                        </div>
                    </motion.div>
                </Link>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/driver/track" className="block h-full">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-amber-500 p-4 rounded-xl shadow-xl shadow-amber-500/10 text-white flex flex-col items-center justify-center h-full text-center gap-2">
                            <Clock size={24} />
                            <h2 className="text-sm font-black leading-tight">
                                {activeShift.status === 'PAUSED' ? "Schicht fortsetzen" : "Schicht pausieren"}
                            </h2>
                        </motion.div>
                    </Link>
                    <Link href="/driver/track" className="block h-full">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-rose-500 p-4 rounded-xl shadow-xl shadow-rose-500/10 text-white flex flex-col items-center justify-center h-full text-center gap-2">
                            <AlertCircle size={24} />
                            <h2 className="text-sm font-black leading-tight">Schicht beenden</h2>
                        </motion.div>
                    </Link>
                </div>
            )}

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
                        {orders.map((order: any) => {
                            const sellerName = order.senderName || order.tenant?.name || "Lokal / Partner";
                            const fee = order.amount ? order.amount.toFixed(2) : "0.00";
                            
                            let distanceStr = "- km";
                            if (driverLocation && order.lat && order.lng) {
                                distanceStr = `${getDistance(driverLocation.lat, driverLocation.lng, order.lat, order.lng).toFixed(1)} km`;
                            }

                            return (
                                <Link href={`/driver/orders?select=${order.id}`} key={order.id} className="block bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <MapPin size={20} className="fill-blue-100" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 truncate max-w-[160px] leading-tight">{sellerName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md tracking-widest">{distanceStr}</span>
                                                    <span className="text-[10px] font-medium text-slate-400 capitalize truncate max-w-[100px]">{order.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">Umsatz</span>
                                            <p className="font-black text-green-600 text-base">€{fee}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
