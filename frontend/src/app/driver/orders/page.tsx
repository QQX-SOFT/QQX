"use client";

import { useState, useEffect } from "react";
import {
    Package,
    Truck,
    MapPin,
    Clock,
    CheckCircle2,
    ArrowRight,
    Navigation,
    Info,
    Calendar,
    ArrowLeft,
    Check,
    X,
    Loader2,
    ShieldCheck,
    User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";

type Order = {
    id: string;
    customerName: string;
    address: string;
    amount: number;
    status: "PENDING" | "ACCEPTED" | "ON_THE_WAY" | "DELIVERED";
    createdAt: string;
};

export default function DriverOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [driverId, setDriverId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'money' | 'distance'>('distance');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

    const searchParams = useSearchParams();
    const filter = searchParams.get("filter");

    useEffect(() => {
        const lat = localStorage.getItem("driver_lat");
        const lng = localStorage.getItem("driver_lng");
        if (lat && lng) {
            setDriverLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
        }
    }, []);

    useEffect(() => {
        fetchDashboardAndOrders();
    }, [filter]);

    const fetchDashboardAndOrders = async () => {
        setLoading(true);
        try {
            // 1. Fetch current driver ID
            const meRes = await api.get("/drivers/me");
            const meId = meRes.data.id;
            setDriverId(meId);

            // 2. Fetch Orders based on Filter Type
            if (!filter) {
                // Default: Market/Available orders
                const { data } = await api.get("/orders/available");
                setOrders(data);
            } else {
                // Fetch ALL Tenant Orders and apply JS filter
                const { data } = await api.get("/orders");
                if (filter === "accepted") {
                    setOrders(data.filter((o: any) => o.driverId === meId && (o.status === "ACCEPTED" || o.status === "ON_THE_WAY")));
                } else if (filter === "completed") {
                    setOrders(data.filter((o: any) => o.driverId === meId && o.status === "DELIVERED"));
                }
            }
        } catch (e) {
            console.error("Failed to fetch available orders", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (id: string) => {
        try {
            await api.patch(`/orders/${id}/assign`, { driverId });
            setOrders(prev => prev.filter(o => o.id !== id));
            setSelectedOrder(null); // Close modal if open
            alert("Auftrag erfolgreich angenommen! Er wird nun in deinem aktiven Bereich angezeigt.");
        } catch (e) {
            alert("Fehler beim Annehmen des Auftrags.");
        }
    };

    // Simple Haversine distance calc for basic sorting
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

    const getSortedOrders = () => {
        let sorted = [...orders];
        if (sortBy === 'money') {
            sorted.sort((a, b) => b.amount - a.amount);
        } else if (sortBy === 'distance') {
            if (driverLocation) {
                // If order has no lat/lng, we push it down. (Assuming order has senderLat/senderLng later, or we fallback)
                // For now, pseudo sorting by ID or leaving as is if no coordinates are present in your Order schema.
                // Assuming we can't do real distance without lat/lng on Order yet, we fallback to a string sort or 0.
                sorted.sort((a: any, b: any) => {
                    const distA = a.lat && a.lng ? getDistance(driverLocation.lat, driverLocation.lng, a.lat, a.lng) : 9999;
                    const distB = b.lat && b.lng ? getDistance(driverLocation.lat, driverLocation.lng, b.lat, b.lng) : 9999;
                    return distA - distB;
                });
            } else {
                sorted.sort((a, b) => (a.address || "").localeCompare(b.address || ""));
            }
        }
        return sorted;
    };

    return (
        <div className="p-6 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-slate-50 min-h-screen pb-32 font-sans">
             {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/driver" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                            {!filter ? "Verfügbare Aufträge" : filter === "accepted" ? "Angenommene Aufträge" : "Absolvierte Aufträge"}
                        </h1>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                            {!filter ? "Live Marktplatz" : filter === "accepted" ? "Aktive Route" : "Historie"}
                        </p>
                    </div>
                </div>
            </header>

            {/* Sorting Tabs - Only for Available Market */}
            {!filter && (
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setSortBy('money')} 
                        className={cn("flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-1", sortBy === 'money' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
                    >
                        💰 Nach Geld
                    </button>
                    <button 
                        onClick={() => setSortBy('distance')} 
                        className={cn("flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition duration-300 flex items-center justify-center gap-1", sortBy === 'distance' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
                    >
                        📍 Nach Entfernung
                    </button>
                </div>
            )}

            {/* Orders Feed */}
            <div className="space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse h-32" />
                    ))
                ) : getSortedOrders().length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4">
                        <Package size={40} className="mx-auto text-slate-300" />
                        <h3 className="text-sm font-black text-slate-900 uppercase">Nichts gefunden</h3>
                    </div>
                ) : getSortedOrders().map((order, i) => (
                    <motion.div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition duration-300 cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm">#{order.id.split('-')[1]}</h4>
                                    <p className="text-xs font-medium text-slate-500 truncate max-w-[200px]">{order.address}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-green-600 font-extrabold">€{(order.amount * 0.4).toFixed(2)}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Detail Modal Overlay */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: "0" }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 inset-x-0 bg-white rounded-t-[3rem] p-6 z-50 shadow-2xl max-h-[85vh] overflow-y-auto">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Detailauftrag</p>
                                        <h2 className="text-xl font-black text-slate-900">#{selectedOrder.id.split('-')[1]}</h2>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Netto Verdienst</p>
                                    <h3 className="text-2xl font-black text-green-600">€{(selectedOrder.amount * 0.4).toFixed(2)}</h3>
                                </div>
                            </div>

                            <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                                <div className="flex gap-3">
                                    <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lieferadresse</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedOrder.address}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <User size={18} className="text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kunde</p>
                                        <p className="text-sm font-bold text-slate-800">{(selectedOrder as any).customerName || 'Unbekannt'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedOrder.status}</p>
                                    </div>
                                </div>
                            </div>

                            {!filter && (
                                <button 
                                    onClick={() => handleAcceptOrder(selectedOrder.id)}
                                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20"
                                >
                                    Auftrag Annehmen
                                </button>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] py-4">Live Synchronisierung aktiv</p>
        </div>
    );
}
