"use client";

import { useState, useEffect } from "react";
import {
    ClipboardList,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    ExternalLink,
    Loader2,
    Calendar,
    MapPin,
    User,
    ChevronRight,
    Scan,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type Order = {
    id: string;
    customerName: string;
    address: string;
    amount: number;
    status: string;
    source: string;
    createdAt: string;
    driver?: {
        firstName: string;
        lastName: string;
    };
    externalId?: string;
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newOrder, setNewOrder] = useState({
        customerName: "",
        address: "",
        amount: "",
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get("/orders");
            setOrders(data);
        } catch (e) {
            console.error("Failed to fetch orders", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post("/orders", {
                ...newOrder,
                amount: Number(newOrder.amount),
                source: "DIRECT" // Default source since UI is hidden
            });
            setShowAddModal(false);
            setNewOrder({ customerName: "", address: "", amount: "" });
            fetchOrders();
        } catch (e) {
            console.error("Failed to create order", e);
        } finally {
            setCreating(false);
        }
    };

    const statusIcons: Record<string, any> = {
        PENDING: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", label: "Wartend" },
        ACCEPTED: { icon: Truck, color: "text-blue-500", bg: "bg-blue-50", label: "Zugewiesen" },
        ON_THE_WAY: { icon: MapPin, color: "text-indigo-500", bg: "bg-indigo-50", label: "Unterwegs" },
        DELIVERED: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", label: "Zugestellt" },
        CANCELLED: { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50", label: "Storniert" },
        PROBLEMATIC: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", label: "Problem" },
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <ClipboardList size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Operations</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Auftragsmanagement</h1>
                    <p className="text-slate-500 font-medium font-sans">Zentrale Übersicht aller Lieferungen und Status-Echtzeit-Updates.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition flex items-center gap-2">
                        <Scan size={18} />
                        QR Scan
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Neuer Auftrag
                    </button>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: "Offene Aufträge", value: orders.filter(o => o.status === 'PENDING').length, color: "text-amber-600" },
                    { label: "In Zustellung", value: orders.filter(o => o.status === 'ON_THE_WAY' || o.status === 'ACCEPTED').length, color: "text-blue-600" },
                    { label: "Heute Zugestellt", value: orders.filter(o => o.status === 'DELIVERED').length, color: "text-green-600" },
                    { label: "Probleme", value: orders.filter(o => o.status === 'PROBLEMATIC').length, color: "text-red-600" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className={cn("text-2xl font-black font-sans", stat.color)}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative flex-1 w-full font-sans">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Kunde, Adresse oder ID suchen..."
                        className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto font-sans">
                    <button className="flex-1 md:flex-none px-5 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex-1 md:flex-none px-5 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition">
                        <Calendar size={18} />
                        Zeitraum
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden font-sans">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Auftrags-ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kunde / Adresse</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fahrer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Wert</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                                        Keine Aufträge vorhanden
                                    </td>
                                </tr>
                            ) : orders.map((order, i) => {
                                const status = statusIcons[order.status] || statusIcons.PENDING;
                                const StatusIcon = status.icon;

                                return (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={order.id}
                                        className="hover:bg-slate-50/50 transition group"
                                    >
                                        <td className="px-8 py-6">
                                            <span className="font-black text-slate-400 leading-none">#{order.id.slice(0, 8)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 leading-none mb-1">{order.customerName}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[200px]">{order.address}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {order.driver ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-[10px] font-black uppercase">
                                                        {order.driver.firstName[0]}{order.driver.lastName[0]}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{order.driver.firstName} {order.driver.lastName.slice(0, 1)}.</span>
                                                </div>
                                            ) : (
                                                <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline bg-blue-50 px-2 py-1 rounded-md">Zuweisen</button>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-slate-900">€{order.amount.toFixed(2)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                                status.bg,
                                                status.color
                                            )}>
                                                <StatusIcon size={12} />
                                                {status.label}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 hover:bg-white rounded-lg transition text-slate-400 hover:text-blue-600 shadow-sm opacity-0 group-hover:opacity-100">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Order Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl border border-slate-100 font-sans"
                        >
                            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>
                            <h2 className="text-3xl font-black text-slate-900 mb-8">Neuer Auftrag</h2>
                            <form onSubmit={handleCreateOrder} className="space-y-6">
                                <div className="space-y-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Kundenname</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                                            value={newOrder.customerName}
                                            onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                                            placeholder="Vor- und Nachname"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Lieferadresse</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                                            value={newOrder.address}
                                            onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                                            placeholder="Straße, Hausnummer, PLZ Stadt"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Warenwert (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                                            value={newOrder.amount}
                                            onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>
                                <div className="pt-8 flex gap-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 rounded-2xl bg-slate-50 font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition">Abbrechen</button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-100"
                                    >
                                        {creating ? <Loader2 className="animate-spin" size={20} /> : "Speichern"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
