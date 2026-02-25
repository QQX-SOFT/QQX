"use client";

import { useState, useEffect } from "react";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Loader2,
    Download,
    MoreVertical
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type Payout = {
    id: string;
    amount: number;
    status: string;
    notes: string | null;
    createdAt: string;
    driver: {
        firstName: string;
        lastName: string;
    }
};

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const { data } = await api.get("/wallet/payouts");
            setPayouts(data);
        } catch (e) {
            console.error("Failed to fetch payouts", e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === "PAID" ? "PENDING" : "PAID";
        try {
            await api.patch(`/wallet/payouts/${id}`, { status: nextStatus });
            fetchPayouts();
        } catch (e) {
            console.error("Failed to update payout status", e);
        }
    };

    const totalOpen = payouts.reduce((acc, p) => acc + (p.status === 'PENDING' ? p.amount : 0), 0);
    const totalPaid = payouts.reduce((acc, p) => acc + (p.status === 'PAID' ? p.amount : 0), 0);

    const statusIcons: Record<string, any> = {
        PENDING: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", label: "Ausstehend" },
        APPROVED: { icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50", label: "Freigegeben" },
        PAID: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", label: "Auszgezahlt" },
        REJECTED: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", label: "Abgelehnt" },
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <Wallet size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Finanzen</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Auszahlungen</h1>
                    <p className="text-slate-500 font-medium">Verwalten Sie Fahrer-Auszahlungen, Vorschüsse und Wallet-Guthaben.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 shadow-sm">
                        <Download size={18} />
                        SEPA-Export
                    </button>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center gap-2">
                        Manueller Ausgleich
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-amber-500 p-8 rounded-[2rem] shadow-xl shadow-amber-200 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-amber-100">Offene Anforderungen</p>
                        <h3 className="text-4xl font-black">€{totalOpen.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <Clock className="absolute bottom-[-20px] right-[-20px] text-white/20 group-hover:scale-125 transition duration-700" size={140} />
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Diesen Monat Ausgezahlt</p>
                        <h3 className="text-4xl font-black text-slate-900">€{totalPaid.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <ArrowUpRight className="absolute bottom-[-20px] right-[-20px] text-green-50 opacity-50 group-hover:scale-125 transition duration-700" size={140} />
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Wallet Verbindlichkeiten</p>
                        <h3 className="text-4xl font-black text-slate-900">€0,00</h3>
                    </div>
                    <Wallet className="absolute bottom-[-20px] right-[-20px] text-slate-50 opacity-50 group-hover:scale-125 transition duration-700" size={140} />
                </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <h3 className="text-xl font-black text-slate-900">Auszahlungsanträge</h3>
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Suchen..."
                            className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fahrer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Anfrage Datum</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Mitteilung</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Betrag</th>
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
                            ) : payouts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                                        Keine offenen Anforderungen
                                    </td>
                                </tr>
                            ) : payouts.map((payout, i) => {
                                const status = statusIcons[payout.status] || statusIcons.PENDING;
                                const StatusIcon = status.icon;

                                return (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={payout.id}
                                        className="hover:bg-slate-50/50 transition group"
                                    >
                                        <td className="px-8 py-6">
                                            <span className="font-bold text-slate-900">{payout.driver.firstName} {payout.driver.lastName}</span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-slate-500">
                                            {new Date(payout.createdAt).toLocaleDateString("de-DE")}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-medium text-slate-400">{payout.notes || "-"}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-slate-900">€{payout.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => handleUpdateStatus(payout.id, payout.status)}
                                                className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition hover:scale-105 active:scale-95",
                                                    status.bg,
                                                    status.color
                                                )}
                                            >
                                                <StatusIcon size={12} />
                                                {status.label}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 transition opacity-0 group-hover:opacity-100">
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
        </div>
    );
}
