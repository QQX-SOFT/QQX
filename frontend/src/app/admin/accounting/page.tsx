"use client";

import { useState, useEffect } from "react";
import {
    Receipt,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Download,
    CheckCircle,
    Clock,
    ChevronRight,
    Printer,
    Loader2,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function AccountingPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newInvoice, setNewInvoice] = useState({ driverId: "", amount: 0, period: "" });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchInvoices();
        fetchDrivers();
    }, []);

    const fetchInvoices = async () => {
        try {
            const { data } = await api.get("/invoices");
            setInvoices(data);
        } catch (e) {
            console.error("Failed to fetch invoices", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const { data } = await api.get("/drivers");
            setDrivers(data);
        } catch (e) {
            console.error("Failed to fetch drivers", e);
        }
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post("/invoices", {
                ...newInvoice,
                amount: Number(newInvoice.amount)
            });
            setShowAddModal(false);
            setNewInvoice({ driverId: "", amount: 0, period: "" });
            fetchInvoices();
        } catch (e: any) {
            alert(e.response?.data?.error || "Fehler beim Erstellen der Rechnung");
        } finally {
            setCreating(false);
        }
    };

    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.status === 'PAID' ? inv.amount : 0), 0);
    const pendingAmount = invoices.reduce((acc, inv) => acc + (inv.status === 'PENDING' ? inv.amount : 0), 0);

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Buchhaltung & Finanzen</h1>
                    <p className="text-slate-500 font-medium">Verwalten Sie Abrechnungen und erstellen Sie Rechnungen für gewerbliche Fahrer.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200"
                >
                    <Plus size={20} />
                    Neue Rechnung erstellen
                </button>
            </header>

            {/* Finance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Bezahlter Gesamtumsatz", value: `€${totalRevenue.toLocaleString()}`, trend: "+5.2%", color: "blue", up: true },
                    { label: "Ausstehende Zahlungen", value: `€${pendingAmount.toLocaleString()}`, trend: `${invoices.filter(i => i.status === 'PENDING').length} Rechnungen`, color: "slate", icon: Clock },
                    { label: "Rechnungen Gesamt", value: invoices.length.toString(), trend: "Aktueller Stand", color: "indigo", up: null },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition hover:shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            {stat.up !== null && (
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
                                    stat.up === true ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                )}>
                                    {stat.up === true ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {stat.trend}
                                </div>
                            )}
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900">Letzte Abrechnungen</h3>
                    <Receipt className="text-slate-200" size={32} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nr.</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fahrer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zeitraum/Datum</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Betrag</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
                                        Keine Rechnungen gefunden
                                    </td>
                                </tr>
                            ) : invoices.map((inv, i) => (
                                <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-8 py-6">
                                        <span className="font-bold text-slate-900">{inv.invoiceNumber || inv.id.slice(0, 8)}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-bold text-slate-700">{inv.driver?.firstName} {inv.driver?.lastName}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-bold text-slate-900">{inv.period}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {new Date(inv.createdAt).toLocaleDateString('de-DE')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-black text-slate-900">€{inv.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                            inv.status === "PAID" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                                        )}>
                                            {inv.status === "PAID" ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            {inv.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Drucken">
                                                <Printer size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Download">
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative"
                        >
                            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>
                            <h2 className="text-3xl font-black text-slate-900 mb-8">Rechnung erstellen</h2>
                            <form onSubmit={handleCreateInvoice} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Fahrer auswählen</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition appearance-none"
                                        value={newInvoice.driverId}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, driverId: e.target.value })}
                                    >
                                        <option value="">Fahrer wählen...</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Betrag (€)</label>
                                        <input
                                            type="number" step="0.01" required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                                            value={newInvoice.amount}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, amount: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Zeitraum</label>
                                        <input
                                            type="text" required
                                            placeholder="z.B. Feb 2026"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                                            value={newInvoice.period}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, period: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="pt-6 flex gap-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition">Abbrechen</button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                    >
                                        {creating ? <Loader2 className="animate-spin" size={20} /> : "Rechnung Generieren"}
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
