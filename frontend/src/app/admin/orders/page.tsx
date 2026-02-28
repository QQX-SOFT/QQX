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
    X,
    ShieldCheck,
    Check,
    Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type Order = {
    id: string;
    customerName: string;
    address: string;
    amount: number;
    status: "WAITING_APPROVAL" | "PENDING" | "ACCEPTED" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED" | "PROBLEMATIC";
    source: "DIRECT" | "CUSTOMER_PORTAL";
    createdAt: string;
    driverId?: string;
    driver?: {
        firstName: string;
        lastName: string;
    };
    externalId?: string;
    senderName?: string;
    senderAddress?: string;
    recipientName?: string;
    recipientAddress?: string;
    packageInfo?: string;
    serviceType?: string;
    priority?: string;
};

type activeDriver = {
    id: string;
    driverId: string;
    driverName: string;
    lat: number;
    lng: number;
    distance?: number;
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Drivers for dropdown
    const [drivers, setDrivers] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);

    const [newOrder, setNewOrder] = useState({
        customerId: "",
        senderName: "",
        senderAddress: "",
        recipientName: "",
        recipientAddress: "",
        packageInfo: "",
        serviceType: "standard",
        priority: "normal",
        amount: "",
        driverId: "",
        notes: ""
    });
    const [creating, setCreating] = useState(false);

    // Assignment Logic
    const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
    const [activeDrivers, setActiveDrivers] = useState<activeDriver[]>([]);
    const [loadingDrivers, setLoadingDrivers] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchDrivers();
        fetchCustomers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const { data } = await api.get("/drivers");
            setDrivers(data);
        } catch (e) {
            console.error("Failed to fetch drivers", e);
        }
    };

    const fetchCustomers = async () => {
        try {
            const { data } = await api.get("/customers");
            setCustomers(data);
        } catch (e) {
            console.error("Failed to fetch customers", e);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await api.get("/orders");
            // Injecting a mock customer order for demo
            const ordersWithCustomer = data.length > 0 ? data : [
                { id: "CUST-001", customerName: "Max Mustermann", address: "Handelskai 214, 1020 Wien", amount: 25.50, status: "WAITING_APPROVAL", source: "CUSTOMER_PORTAL", createdAt: new Date().toISOString() },
                { id: "ORD-1234", customerName: "Restaurant Bella", address: " Mariahilfer Str. 12, 1070 Wien", amount: 120.00, status: "PENDING", source: "DIRECT", createdAt: new Date().toISOString() }
            ];
            setOrders(ordersWithCustomer);
        } catch (e) {
            console.error("Failed to fetch orders", e);
            setOrders([
                { id: "CUST-001", customerName: "Max Mustermann", address: "Handelskai 214, 1020 Wien", amount: 25.50, status: "WAITING_APPROVAL", source: "CUSTOMER_PORTAL", createdAt: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveOrder = async (id: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { status: "PENDING" });
            fetchOrders();
        } catch (e) {
            console.error("Failed to approve order", e);
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            // Fetch coordinates for recipient address (nominatim)
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newOrder.recipientAddress)}&limit=1`);
            const geoData = await geoRes.json();

            const payload = {
                ...newOrder,
                amount: Number(newOrder.amount),
                customerName: newOrder.recipientName, // Map for compatibility
                address: newOrder.recipientAddress,   // Map for compatibility
                source: "DIRECT"
            };

            await api.post("/orders", payload);

            setShowAddModal(false);
            setNewOrder({
                customerId: "",
                senderName: "",
                senderAddress: "",
                recipientName: "",
                recipientAddress: "",
                packageInfo: "",
                serviceType: "standard",
                priority: "normal",
                amount: "",
                driverId: "",
                notes: ""
            });
            fetchOrders();
        } catch (e) {
            console.error("Failed to create order", e);
        } finally {
            setCreating(false);
        }
    };

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleAssignClick = async (order: Order) => {
        setAssigningOrder(order);
        setLoadingDrivers(true);
        try {
            // 1. Geocode order address
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(order.address)}&limit=1`);
            const geoData = await geoRes.json();
            const orderLat = geoData?.[0]?.lat ? parseFloat(geoData[0].lat) : null;
            const orderLng = geoData?.[0]?.lon ? parseFloat(geoData[0].lon) : null;

            // 2. Fetch active driver locations
            const { data: drivers } = await api.get("/time-entries/locations");

            // 3. Calculate distances if possible
            const driversWithDistance = drivers.map((d: any) => {
                let distance = undefined;
                if (orderLat && orderLng && d.lat && d.lng) {
                    distance = getDistance(orderLat, orderLng, d.lat, d.lng);
                }
                return { ...d, distance };
            }).sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));

            setActiveDrivers(driversWithDistance);
        } catch (e) {
            console.error("Failed to fetch drivers for assignment", e);
        } finally {
            setLoadingDrivers(false);
        }
    };

    const handleAssignDriver = async (driverId: string) => {
        if (!assigningOrder) return;
        setAssigning(true);
        try {
            await api.patch(`/orders/${assigningOrder.id}/assign`, { driverId });
            setAssigningOrder(null);
            fetchOrders();
        } catch (e) {
            console.error("Failed to assign driver", e);
        } finally {
            setAssigning(false);
        }
    };

    const statusIcons: Record<string, any> = {
        WAITING_APPROVAL: { icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-50", label: "Bestätigung hängig" },
        PENDING: { icon: Clock, color: "text-blue-500", bg: "bg-blue-50", label: "Wartend" },
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
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Quelle / ID</th>
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
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-wider mb-1 px-2 py-0.5 rounded-full w-fit",
                                                    order.source === "CUSTOMER_PORTAL" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {order.source === "CUSTOMER_PORTAL" ? "Portal" : "Direkt"}
                                                </span>
                                                <span className="font-black text-slate-400 leading-none">#{order.id.slice(0, 8)}</span>
                                            </div>
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
                                            ) : order.status === "WAITING_APPROVAL" ? (
                                                <span className="text-[10px] font-black text-slate-300 uppercase italic">Wartet auf Freigabe</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleAssignClick(order)}
                                                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline bg-blue-50 px-2 py-1 rounded-md"
                                                >
                                                    Zuweisen
                                                </button>
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
                                            <div className="flex items-center justify-end gap-2">
                                                {order.status === "WAITING_APPROVAL" && (
                                                    <button
                                                        onClick={() => handleApproveOrder(order.id)}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center gap-1.5"
                                                    >
                                                        <Check size={14} /> Freigeben
                                                    </button>
                                                )}
                                                <button className="p-2 hover:bg-white rounded-lg transition text-slate-400 hover:text-blue-600 shadow-sm opacity-0 group-hover:opacity-100">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Order Modal - Premium Design */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[3rem] p-10 w-full max-w-4xl shadow-2xl border border-slate-100 font-sans max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition p-2 hover:bg-slate-50 rounded-full">
                                <X size={24} />
                            </button>

                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                                        <Plus size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Operations</span>
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Auftrag Erstellen</h2>
                                <p className="text-slate-500 font-medium mt-1">Geben Sie die Details für die neue Lieferung ein.</p>
                            </div>

                            <form onSubmit={handleCreateOrder} className="space-y-10">
                                <div className="p-8 bg-blue-50/30 border border-blue-100 rounded-[2.5rem] relative overflow-hidden group transition-all hover:bg-blue-50/50">
                                    <div className="absolute top-0 right-0 p-8 text-blue-100/50 group-hover:text-blue-500/10 transition-colors">
                                        <Building2 size={80} />
                                    </div>
                                    <div className="relative z-10">
                                        <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 ml-1">Kunden-Zuweisung *</label>
                                        <select
                                            required
                                            className="w-full bg-white border border-blue-100 rounded-3xl px-8 py-5 focus:border-blue-500 outline-none font-black text-slate-900 transition-all shadow-sm appearance-none cursor-pointer"
                                            value={newOrder.customerId}
                                            onChange={e => {
                                                const cust = customers.find(c => c.id === e.target.value);
                                                setNewOrder({
                                                    ...newOrder,
                                                    customerId: e.target.value,
                                                    recipientName: cust?.contactPerson || cust?.name || "",
                                                    recipientAddress: cust?.address || ""
                                                });
                                            }}
                                        >
                                            <option value="">Bitte Kunden wählen...</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <p className="mt-3 ml-1 text-xs font-medium text-slate-400 group-hover:text-blue-400 transition-colors">Wählen Sie einen registrierten Kunden aus der Datenbank.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Left Column: People */}
                                    <div className="space-y-8">
                                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                    <MapPin size={16} />
                                                </div>
                                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Absender (Sender)</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Name des Absenders"
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm"
                                                        value={newOrder.senderName}
                                                        onChange={e => setNewOrder({ ...newOrder, senderName: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adresse</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Straße, Hausnummer..."
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm"
                                                        value={newOrder.senderAddress}
                                                        onChange={e => setNewOrder({ ...newOrder, senderAddress: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                                    <User size={16} />
                                                </div>
                                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Empfänger (Recipient)</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name *</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        placeholder="Name des Empfängers"
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm"
                                                        value={newOrder.recipientName}
                                                        onChange={e => setNewOrder({ ...newOrder, recipientName: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adresse *</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        placeholder="Straße, Hausnummer..."
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm"
                                                        value={newOrder.recipientAddress}
                                                        onChange={e => setNewOrder({ ...newOrder, recipientAddress: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Delivery Info */}
                                    <div className="space-y-8">
                                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                                    <Truck size={16} />
                                                </div>
                                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Paket & Service</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Service-Typ</label>
                                                        <select
                                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm appearance-none"
                                                            value={newOrder.serviceType}
                                                            onChange={e => setNewOrder({ ...newOrder, serviceType: e.target.value })}
                                                        >
                                                            <option value="standard">Standard</option>
                                                            <option value="essen">Essen Lieferung</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Priorität</label>
                                                        <select
                                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm appearance-none"
                                                            value={newOrder.priority}
                                                            onChange={e => setNewOrder({ ...newOrder, priority: e.target.value })}
                                                        >
                                                            <option value="normal">Normal</option>
                                                            <option value="express">Express</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Preis (€)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0,00"
                                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm"
                                                            value={newOrder.amount}
                                                            onChange={e => setNewOrder({ ...newOrder, amount: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fahrer zuweisen</label>
                                                        <select
                                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm appearance-none"
                                                            value={newOrder.driverId}
                                                            onChange={e => setNewOrder({ ...newOrder, driverId: e.target.value })}
                                                        >
                                                            <option value="">Kein Fahrer</option>
                                                            {drivers.map(d => (
                                                                <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Paket Information</label>
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Größe, Gewicht, Inhalt..."
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm resize-none"
                                                        value={newOrder.packageInfo}
                                                        onChange={e => setNewOrder({ ...newOrder, packageInfo: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notiz</label>
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Zusätzliche Informationen..."
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm resize-none"
                                                        value={newOrder.notes}
                                                        onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex gap-4 border-t border-slate-50">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 rounded-2xl bg-slate-50 font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition shadow-sm">Abbrechen</button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
                                    >
                                        {creating ? <Loader2 className="animate-spin" size={20} /> : "Auftrag Erstellen"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Assignment Modal */}
            <AnimatePresence>
                {assigningOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl border border-slate-100 font-sans flex flex-col max-h-[85vh]"
                        >
                            <button onClick={() => setAssigningOrder(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>

                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <Truck size={18} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Treiber-Zuweisung</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900">Nahegelegene Fahrer</h2>
                                <p className="text-slate-400 text-sm font-medium mt-2">{assigningOrder.address}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[300px]">
                                {loadingDrivers ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="animate-spin text-blue-500" size={32} />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Suche nach aktiven Fahrern...</p>
                                    </div>
                                ) : activeDrivers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <AlertCircle className="text-slate-300" size={40} />
                                        <div>
                                            <p className="font-black text-slate-900 mb-1">Keine aktiven Fahrer</p>
                                            <p className="text-xs text-slate-400 font-medium">Aktuell sind keine Fahrer online oder verfügbar.</p>
                                        </div>
                                    </div>
                                ) : (
                                    activeDrivers.map((driver) => (
                                        <div
                                            key={driver.id}
                                            className="group bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all duration-300 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                                                    {driver.driverName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{driver.driverName}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {driver.distance ? `${driver.distance.toFixed(2)} km entfernt` : "Position unbekannt"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAssignDriver(driver.driverId)}
                                                disabled={assigning}
                                                className="px-5 py-2.5 bg-white text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {assigning ? <Loader2 className="animate-spin" size={14} /> : "Zuweisen"}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-end">
                                <button
                                    onClick={() => setAssigningOrder(null)}
                                    className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition"
                                >
                                    Schließen
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
