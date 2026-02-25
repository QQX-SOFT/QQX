"use client";

import { useState } from "react";
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
    Printer
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const mockInvoices = [
    { id: "INV-2026-001", driver: "Marco Reus", amount: 2450.00, status: "Paid", date: "20. Feb 2026", dueDate: "25. Feb 2026" },
    { id: "INV-2026-002", driver: "Sarah Meyer", amount: 1890.50, status: "Pending", date: "22. Feb 2026", dueDate: "27. Feb 2026" },
    { id: "INV-2026-003", driver: "Thomas Müller", amount: 3100.00, status: "Overdue", date: "15. Feb 2026", dueDate: "20. Feb 2026" },
    { id: "INV-2026-004", driver: "Lena Fischer", amount: 2120.00, status: "Pending", date: "24. Feb 2026", dueDate: "01. Mär 2026" },
];

export default function AccountingPage() {
    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Buchhaltung & Finanzen</h1>
                    <p className="text-slate-500 font-medium">Verwalten Sie Abrechnungen und erstellen Sie Rechnungen für gewerbliche Fahrer.</p>
                </div>
                <button className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200">
                    <Plus size={20} />
                    Neue Rechnung erstellen
                </button>
            </header>

            {/* Finance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Gesamtumsatz (MTD)", value: "€42.850", trend: "+8.2%", color: "blue", up: true },
                    { label: "Ausstehende Zahlungen", value: "€8.120", trend: "12 Rechnungen", color: "slate", icon: Clock },
                    { label: "Auszahlungen Fahrer", value: "€18.400", trend: "-2.4%", color: "indigo", up: false },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <div className={cn(
                                "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
                                stat.up === true ? "bg-green-50 text-green-600" : stat.up === false ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
                            )}>
                                {stat.up === true ? <ArrowUpRight size={12} /> : stat.up === false ? <ArrowDownRight size={12} /> : null}
                                {stat.trend}
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <h3 className="text-xl font-black text-slate-900">Letzte Abrechnungen</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rechnungsnummer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fahrer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Datum</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Betrag</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {mockInvoices.map((inv, i) => (
                                <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-8 py-6">
                                        <span className="font-bold text-slate-900">{inv.id}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-bold text-slate-700">{inv.driver}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-medium text-slate-500">{inv.date}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fällig: {inv.dueDate}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-black text-slate-900">€{inv.amount.toFixed(2)}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                            inv.status === "Paid" ? "bg-green-50 text-green-600" : inv.status === "Pending" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {inv.status === "Paid" ? <CheckCircle size={14} /> : <Clock size={14} />}
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
                <div className="p-8 bg-slate-50/30 text-center">
                    <button className="text-sm font-bold text-blue-600 uppercase tracking-widest hover:underline">Alle Rechnungen anzeigen</button>
                </div>
            </div>
        </div>
    );
}
