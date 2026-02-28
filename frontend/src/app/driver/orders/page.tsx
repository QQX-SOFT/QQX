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
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";

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

    useEffect(() => {
        fetchAvailableOrders();
    }, []);

    const fetchAvailableOrders = async () => {
        try {
            // Mocking available approved orders
            const mockOrders: Order[] = [
                { id: "ORD-9921", customerName: "Max Mustermann", address: "Handelskai 214, 1020 Wien", amount: 25.50, status: "PENDING", createdAt: new Date().toISOString() },
                { id: "ORD-8842", customerName: "Sabine Mayer", address: "Laxenburger Str. 80, 1100 Wien", amount: 18.20, status: "PENDING", createdAt: new Date(Date.now() - 3600000).toISOString() },
            ];
            setOrders(mockOrders);
            setLoading(false);
        } catch (e) {
            console.error("Failed to fetch available orders", e);
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (id: string) => {
        try {
            // Simulated accept
            setOrders(prev => prev.filter(o => o.id !== id));
            alert("Auftrag erfolgreich angenommen! Er wird nun in deinem aktiven Bereich angezeigt.");
        } catch (e) {
            alert("Fehler beim Annehmen des Auftrags.");
        }
    };

    return (
        <div className="p-6 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-slate-50 min-h-screen pb-32 font-sans">
            {/* Header */}
            <header className="flex items-center gap-4">
                <Link href="/driver" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Verfügbare Aufträge</h1>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                        Live Marktplatz
                    </p>
                </div>
            </header>

            {/* Orders Feed */}
            <div className="space-y-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 animate-pulse h-40" />
                    ))
                ) : orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 text-center space-y-4 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                            <Package size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Aktuell keine Aufträge</h3>
                        <p className="text-xs text-slate-400 font-medium">Sobald ein neuer Auftrag freigegeben wird, erscheint er hier.</p>
                    </div>
                ) : orders.map((order, i) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bestellung</p>
                                        <h4 className="text-lg font-black text-slate-900 leading-none tracking-tight">#{order.id.split('-')[1]}</h4>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Netto Verdienst</p>
                                    <h4 className="text-2xl font-black text-green-600 leading-none">€{(order.amount * 0.4).toFixed(2)}</h4>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                        <Navigation size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Lieferadresse</p>
                                        <p className="text-sm font-bold text-slate-800 leading-tight">{order.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Distanz</p>
                                        <p className="text-sm font-bold text-slate-800 leading-tight">ca. 3.2 km • 12 min Fahrt</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAcceptOrder(order.id)}
                                className="w-full py-6 bg-blue-600 text-white rounded-[2.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                <Check size={20} strokeWidth={3} />
                                Auftrag Annehmen
                            </button>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50 transition duration-1000" />
                        <ShieldCheck className="absolute bottom-[-10px] right-[-10px] text-slate-500 opacity-5 group-hover:scale-150 transition duration-1000" size={120} />
                    </motion.div>
                ))}
            </div>

            {/* Info Section */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-slate-950/20">
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-lg">
                        <Info size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black uppercase tracking-tight leading-none mb-2">Automatisierung</h4>
                        <p className="text-slate-400 text-[10px] font-medium leading-relaxed uppercase tracking-widest">Alle Aufträge in diesem Feed sind bereits vom Admin geprüft und zur direkten Abholung freigegeben.</p>
                    </div>
                </div>
            </div>

            <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] py-4">Live Synchronisierung aktiv</p>
        </div>
    );
}
