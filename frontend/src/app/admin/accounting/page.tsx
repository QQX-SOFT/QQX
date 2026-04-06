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
    Banknote,
    Mail
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
    const [activeTab, setActiveTab] = useState<'ALL' | 'EMPLOYED' | 'FREELANCE' | 'COMMERCIAL'>('ALL');
    const [basisFilter, setBasisFilter] = useState<'ALL' | 'STUNDENBASIS' | 'BESTELLBASIS'>('ALL');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

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
    
    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

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

                {/* Tabs & Filters Section */}
                <div className="px-8 bg-white border-b border-slate-100">
                    <div className="flex gap-6 overflow-x-auto no-scrollbar py-4 border-b border-slate-50">
                        {[
                            { id: 'ALL', label: 'Alle Sürücüler' },
                            { id: 'EMPLOYED', label: 'Echte Dienstnehmer' },
                            { id: 'FREELANCE', label: 'Freie Dienstnehmer' },
                            { id: 'COMMERCIAL', label: 'Selbstständige' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em] pb-3 border-b-2 transition-all whitespace-nowrap",
                                    activeTab === tab.id ? "text-blue-600 border-blue-600" : "text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-6 overflow-x-auto no-scrollbar py-4">
                        {[
                            { id: 'ALL', label: 'Alle Abrechnungsarten' },
                            { id: 'STUNDENBASIS', label: 'Stundenbasis' },
                            { id: 'BESTELLBASIS', label: 'Bestellbasis' }
                        ].map(basis => (
                            <button
                                key={basis.id}
                                onClick={() => setBasisFilter(basis.id as any)}
                                className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all",
                                    basisFilter === basis.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                )}
                            >
                                {basis.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                {[
                                    { key: 'riderName', label: 'Fahrer Name', center: false },
                                    { key: 'riderId', label: 'Rider ID', center: false },
                                    { key: 'basis', label: 'Anstellung', center: false },
                                    { key: 'rate', label: 'Satz/Rate', center: false },
                                    { key: 'totalOrders', label: 'Orders', center: true },
                                    { key: 'totalKm', label: 'KM Gesamt', center: true },
                                    { key: 'totalWage', label: 'Gehalt (Netto)', center: true },
                                    { key: null, label: 'Aktionen', center: true }
                                ].map((h, i) => (
                                    <th 
                                        key={i} 
                                        onClick={() => h.key && requestSort(h.key)}
                                        className={cn(
                                            "px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition",
                                            h.center && "text-center",
                                            !h.center && h.key === 'totalWage' && "text-right"
                                        )}
                                    >
                                        <div className={cn("flex items-center gap-2", h.center && "justify-center")}>
                                            {h.label}
                                            {sortConfig?.key === h.key && (
                                                sortConfig.direction === 'asc' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />
                                            )}
                                        </div>
                                    </th>
                                ))}
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

                                let rows = Object.values(grouped).filter((g: any) => {
                                    const matchesType = activeTab === 'ALL' || g.type === activeTab;
                                    const isBestellbasis = g.payPerKm > 0 || (g.payPerOrder > 0 && g.hourlyWage === 0);
                                    const matchesBasis = basisFilter === 'ALL' || 
                                                        (basisFilter === 'STUNDENBASIS' && !isBestellbasis) || 
                                                        (basisFilter === 'BESTELLBASIS' && isBestellbasis);
                                    return matchesType && matchesBasis;
                                }).map((g: any) => {
                                    const orderEarnings = g.totalOrders * g.payPerOrder;
                                    const kmEarnings = g.totalKm * g.payPerKm;
                                    const hourlyEarnings = g.totalHours * g.hourlyWage;
                                    const totalWage = orderEarnings + kmEarnings + hourlyEarnings;
                                    const isBestellbasis = g.payPerKm > 0 || (g.payPerOrder > 0 && g.hourlyWage === 0);
                                    
                                    return { 
                                        ...g, 
                                        totalWage, 
                                        isBestellbasis,
                                        riderName: g.driver ? `${g.driver.firstName} ${g.driver.lastName}` : g.riderName
                                    };
                                });

                                if (sortConfig !== null) {
                                    rows.sort((a: any, b: any) => {
                                        let aVal = a[sortConfig.key];
                                        let bVal = b[sortConfig.key];
                                        
                                        if (sortConfig.key === 'basis') {
                                            aVal = a.isBestellbasis ? 'B' : 'A';
                                            bVal = b.isBestellbasis ? 'B' : 'A';
                                        }

                                        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                                        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                                        return 0;
                                    });
                                }

                                if (rows.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan={8} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                Keine Einträge für diese Kategorie vorhanden.
                                            </td>
                                        </tr>
                                    );
                                }

                                return rows.map((g: any, i) => {
                                    const employmentLabel = {
                                        'EMPLOYED': 'Dienstnehmer',
                                        'FREELANCE': 'Freier Dienstnehmer',
                                        'COMMERCIAL': 'Gewerbe'
                                    }[g.type as string] || 'Dienstnehmer';

                                    return (
                                        <tr key={i} className="hover:bg-blue-50/20 transition group border-l-4 border-l-transparent hover:border-l-blue-600">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 group-hover:text-blue-600 transition truncate max-w-[150px]">
                                                        {g.riderName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-400 italic">#{g.riderId}</td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none",
                                                    g.isBestellbasis ? "bg-blue-900 text-white" : "bg-slate-900 text-white"
                                                )}>
                                                    {g.isBestellbasis ? "Bestellbasis" : "Stundenbasis"}
                                                </span>
                                                <p className="text-[7px] font-black text-slate-300 uppercase mt-1">{employmentLabel}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    {g.hourlyWage > 0 && (
                                                        <span className="text-[10px] font-black text-green-600 truncate">€{g.hourlyWage.toFixed(2)} / Std</span>
                                                    )}
                                                    {g.payPerOrder > 0 && (
                                                        <span className="text-[10px] font-black text-blue-600 truncate">€{g.payPerOrder.toFixed(2)} / Ord</span>
                                                    )}
                                                    {g.payPerKm > 0 && (
                                                        <span className="text-[10px] font-black text-slate-400 text-[8px]">€{g.payPerKm.toFixed(2)} / KM</span>
                                                    )}
                                                    {g.hourlyWage === 0 && g.payPerOrder === 0 && (
                                                        <span className="text-[10px] font-black text-slate-300 italic">Keine Rate</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="px-3 py-1 bg-slate-50 text-slate-700 rounded-lg font-black text-xs">{g.totalOrders}</span>
                                                    {g.totalHours > 0 && <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">{g.totalHours.toFixed(1)} Std</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-extrabold text-slate-950">{g.totalKm.toFixed(1)} km</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-lg font-black text-slate-900 italic tracking-tighter">€ {g.totalWage.toFixed(2)}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {g.type === 'COMMERCIAL' && (
                                                    <button 
                                                        onClick={() => {
                                                            alert(`An Info-Mail wurde an ${g.riderName} gesendet.\n\nInhalt:\n- Gelieferte Bestellungen: ${g.totalOrders}\n- Fahrtstrecke: ${g.totalKm.toFixed(1)} km\n- Nettoverdienst: €${g.totalWage.toFixed(2)}\n\nBitte senden Sie uns eine Rechnung.`);
                                                        }}
                                                        className="flex items-center gap-2 ml-auto px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition group/btn"
                                                    >
                                                        <Mail size={14} className="group-hover/btn:scale-110 transition" />
                                                        Mail senden
                                                    </button>
                                                )}
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
