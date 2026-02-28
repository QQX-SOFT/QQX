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
import Link from "next/link";

export default function AccountingPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    // Create logic moved to editor page

    const handleUpdateStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === "PAID" ? "PENDING" : "PAID";
        try {
            await api.patch(`/invoices/${id}/status`, { status: nextStatus });
            fetchInvoices();
        } catch (e) {
            console.error("Failed to update invoice status", e);
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
                <Link
                    href="/admin/accounting/editor"
                    className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200"
                >
                    <Plus size={20} />
                    Neue Rechnung erstellen
                </Link>
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
                                        <button
                                            onClick={() => handleUpdateStatus(inv.id, inv.status)}
                                            className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition hover:scale-105 active:scale-95",
                                                inv.status === "PAID" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                                            )}
                                        >
                                            {inv.status === "PAID" ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            {inv.status}
                                        </button>
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

            {/* Create Invoice Modal removed */}
        </div>
    );
}
