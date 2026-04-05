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
    Euro,
    Banknote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";

export default function AccountingPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [kpis, setKpis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

    useEffect(() => {
        fetchInvoices();
        fetchDrivers();
    }, []);

    useEffect(() => {
        fetchKpis();
    }, [selectedMonth, selectedYear]);

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

    const fetchKpis = async () => {
        try {
            const { data } = await api.get(`/kpis?month=${selectedMonth}&year=${selectedYear}`);
            setKpis(data);
        } catch (e) {
            console.error("Failed to fetch KPIs", e);
        }
    };

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Bezahlter Gesamtumsatz", value: `€${totalRevenue.toLocaleString()}`, trend: "Laufendes Jahr", up: null },
                    { label: "Ausstehende Zahlungen", value: `€${pendingAmount.toLocaleString()}`, trend: `${invoices.filter(i => i.status === 'PENDING').length} Rechnungen`, up: null },
                    { label: "Rechnungen Gesamt", value: invoices.length.toString(), trend: "Aktueller Stand", up: null },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">{stat.trend}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900">Letzte Abrechnungen (Manuell)</h3>
                    <Receipt className="text-slate-200" size={32} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nr.</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fahrer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zeitraum</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Betrag</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="py-10 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Keine Rechnungen</td></tr>
                            ) : invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/50">
                                    <td className="px-8 py-6 font-bold">{inv.invoiceNumber || inv.id.slice(0,8)}</td>
                                    <td className="px-8 py-6 font-bold">{inv.driver?.firstName} {inv.driver?.lastName}</td>
                                    <td className="px-8 py-6 text-sm">{inv.period}</td>
                                    <td className="px-8 py-6 font-black">€{inv.amount.toFixed(2)}</td>
                                    <td className="px-8 py-6">
                                        <button onClick={() => handleUpdateStatus(inv.id, inv.status)} className={cn("px-3 py-1 rounded-xl text-[10px] font-black uppercase", inv.status === "PAID" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600")}>
                                            {inv.status}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            <Printer size={18} className="text-slate-300" />
                                            <Download size={18} className="text-slate-300" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Monthly Worker Salary Overview */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden mt-12 mb-20">
                <div className="p-8 border-b border-slate-200 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Monatliche Gehalts-Übersicht</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Errechnet aus Excel-Reports (Bestellungen & KM)</p>
                    </div>
                    <div className="flex gap-4">
                        <select 
                            className="bg-white p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-sm min-w-[140px] shadow-sm"
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('de-DE', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select 
                            className="bg-white p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-sm shadow-sm"
                            value={selectedYear}
                            onChange={e => setSelectedYear(e.target.value)}
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fahrer Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rider ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Anstellung</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Satz/Rate</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Orders</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">KM Gesamt</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Gehalt (Netto)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {kpis.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        Keine Report-Daten für diesen Monat gefunden.
                                    </td>
                                </tr>
                             ) : (() => {
                                const grouped: any = {};
                                const perOrderIds = ['4530788', '4524536', '4328784', '4468810', '4524892'];

                                kpis.forEach(k => {
                                    const id = k.driverId || k.riderId;
                                    if (!grouped[id]) {
                                        grouped[id] = {
                                            driver: k.driver,
                                            riderId: k.riderId,
                                            riderName: k.riderName,
                                            totalOrders: 0,
                                            totalKm: 0,
                                            totalHours: 0,
                                            payPerOrder: k.driver?.payPerOrder || k.driver?.orderFee || 0,
                                            payPerKm: k.driver?.payPerKm || 0,
                                            hourlyWage: k.driver?.hourlyWage || 0,
                                            type: k.driver?.type || 'EMPLOYED'
                                        };
                                    }
                                    grouped[id].totalOrders += k.deliveredOrders || 0;
                                    grouped[id].totalKm += k.distanceTotal || 0;
                                    grouped[id].totalHours += k.hoursWorked || 0;
                                });

                                return Object.values(grouped).map((g: any, i) => {
                                    const isPerOrder = perOrderIds.includes(g.riderId);
                                    const totalWage = isPerOrder 
                                        ? (g.totalOrders * g.payPerOrder) + (g.totalKm * g.payPerKm)
                                        : (g.totalHours * g.hourlyWage);

                                    const employmentLabel = {
                                        'EMPLOYED': 'Angestellt',
                                        'FREELANCE': 'Freier Dienstnehmer',
                                        'COMMERCIAL': 'Gewerbe'
                                    }[g.type as string] || 'Angestellt';

                                    return (
                                        <tr key={i} className="hover:bg-blue-50/20 transition group border-l-4 border-l-transparent hover:border-l-blue-600">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 group-hover:text-blue-600 transition truncate max-w-[150px]">
                                                        {g.driver ? `${g.driver.firstName} ${g.driver.lastName}` : g.riderName}
                                                    </span>
                                                    {g.driver && <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Systembestätigt</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-400 italic">#{g.riderId}</td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">
                                                    {isPerOrder ? "Leistung (Pauschal)" : "Stundenbasis"}
                                                </span>
                                                <p className="text-[7px] font-black text-slate-300 uppercase mt-1">{employmentLabel}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    {isPerOrder ? (
                                                        <>
                                                            <span className="text-[10px] font-black text-blue-600 truncate">€{g.payPerOrder.toFixed(2)} / Ord</span>
                                                            <span className="text-[10px] font-black text-slate-400 text-[8px]">€{g.payPerKm.toFixed(2)} / KM</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-green-600 truncate">€{g.hourlyWage.toFixed(2)} / Std</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="px-3 py-1 bg-slate-50 text-slate-700 rounded-lg font-black text-xs">{g.totalOrders}</span>
                                                    {!isPerOrder && <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">{g.totalHours.toFixed(1)} Std</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-extrabold text-slate-950">{g.totalKm.toFixed(1)} km</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-lg font-black text-slate-900 italic tracking-tighter">€ {totalWage.toFixed(2)}</span>
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
