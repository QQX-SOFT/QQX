"use client";

import React, { useState, useEffect } from "react";
import { 
    Loader2, 
    Upload, 
    FileText, 
    TrendingUp, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    Download,
    Search,
    Filter,
    ArrowUpRight,
    Coins,
    BarChart3,
    Trash2
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminKpiPage() {
    const [kpis, setKpis] = useState<any[]>([]);
    const [uploads, setUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState<string>("");
    const [visibleColumns, setVisibleColumns] = useState<string[]>(["riderId", "riderName", "cityName", "dateLocal", "deliveredOrders", "hoursWorked"]);

    const allColumnOptions = [
        { id: "riderId", label: "Rider ID" },
        { id: "riderName", label: "Name" },
        { id: "cityName", label: "Stadt" },
        { id: "dateLocal", label: "Datum" },
        { id: "deliveredOrders", label: "Best." },
        { id: "hoursWorked", label: "Stunden" },
        { id: "utr", label: "UTR" },
        { id: "acceptanceRate", label: "Akzeptanz" },
        { id: "avgDeliveryTime", label: "Lief. Zeit" }
    ];

    const toggleColumn = (id: string) => {
        setVisibleColumns(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const fetchKpis = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/kpis${selectedWeek ? `?week=${selectedWeek}` : ''}`);
            setKpis(data);
            
            const { data: uploadData } = await api.get('/kpis/uploads');
            setUploads(uploadData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKpis();
    }, [selectedWeek]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const { data } = await api.post("/kpis/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert(`Erfolgreich importiert: ${data.recordCount} Datensätze für Woche ${data.isoweek}`);
            fetchKpis();
        } catch (e: any) {
            const errorMsg = e.response?.data?.error || "Fehler beim Hochladen";
            alert(errorMsg);
            console.error("Upload error", e);
        } finally {
            setUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    const handleDeleteUpload = async (id: string) => {
        if (!confirm("Möchten Sie diesen Upload und ALLE damit verbundenen Daten wirklich löschen?")) return;
        try {
            await api.delete(`/kpis/uploads/${id}`);
            fetchKpis();
        } catch (e) {
            alert("Löschvorgang fehlgeschlagen.");
        }
    };
    const totalOrders = kpis.reduce((acc, curr) => acc + curr.deliveredOrders, 0);
    const totalHours = kpis.reduce((acc, curr) => acc + curr.hoursWorked, 0);
    const avgUtr = kpis.length ? (kpis.reduce((acc, curr) => acc + (curr.utr || 0), 0) / kpis.length).toFixed(2) : 0;

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Fahrer-KPI & Analyse</h1>
                    <p className="text-slate-500 font-medium font-sans">Importieren und analysieren Sie Rider-Reports für Gehaltsabrechnungen.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/admin/drivers/kpi/validation" className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:border-blue-600 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-100/10">
                        <BarChart3 size={16} />
                        DEBUG & VALIDIERUNG
                    </Link>
                    <label className="cursor-pointer">
                        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} disabled={uploading} />
                        <div className={cn(
                            "px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10",
                            uploading && "opacity-50 pointer-events-none"
                        )}>
                            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                            {uploading ? "WIRD IMPORTIERT..." : "REPORT HOCHLADEN"}
                        </div>
                    </label>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={<CheckCircle2 className="text-green-500" />} label="GELIEFERTE BESTELLUNGEN" value={totalOrders} color="green" />
                <StatCard icon={<Clock className="text-blue-500" />} label="GESAMTSTUNDEN (ONLINE)" value={totalHours.toFixed(1)} color="blue" />
                <StatCard icon={<TrendingUp className="text-purple-500" />} label="Ø UTR (BESTELLUNGEN/H)" value={avgUtr} color="purple" />
                <StatCard icon={<Coins className="text-amber-500" />} label="BEREITS GEZAHLT (WALLET)" value="0.00 €" color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filter */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Wochenansicht (ISO Week)</label>
                           <select 
                            className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                            value={selectedWeek}
                            onChange={e => setSelectedWeek(e.target.value)}
                           >
                                <option value="">Alle Wochen</option>
                                {[...new Set(uploads.map(u => u.isoweek))].filter(Boolean).sort((a: any, b: any) => b - a).map(w => (
                                    <option key={w} value={w}>Woche {w}</option>
                                ))}
                           </select>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-2">Letzte Uploads</h4>
                            <div className="space-y-3">
                                {uploads.slice(0, 10).map(u => (
                                    <div key={u.id} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-[10px] font-bold text-slate-900 truncate flex-1">{u.filename}</p>
                                            <button 
                                                onClick={() => handleDeleteUpload(u.id)}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">Woche {u.isoweek}</span>
                                            <span className="text-[8px] font-medium text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Rider Performance Liste</h3>
                            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                {/* Column Selector */}
                                <div className="flex flex-wrap gap-2 mr-4">
                                    {allColumnOptions.map(col => (
                                        <button 
                                            key={col.id}
                                            onClick={() => toggleColumn(col.id)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
                                                visibleColumns.includes(col.id) 
                                                    ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            {col.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative flex-1 md:flex-initial">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input placeholder="Suchen..." className="pl-12 pr-6 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-blue-500 font-bold text-sm w-full" />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        {visibleColumns.includes("riderId") && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rider ID</th>}
                                        {visibleColumns.includes("riderName") && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rider Name</th>}
                                        {visibleColumns.includes("cityName") && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stadt</th>}
                                        {visibleColumns.includes("dateLocal") && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Datum</th>}
                                        {visibleColumns.includes("deliveredOrders") && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Best.</th>}
                                        {visibleColumns.includes("hoursWorked") && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">h (Online)</th>}
                                        {visibleColumns.includes("utr") && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">UTR</th>}
                                        {visibleColumns.includes("acceptanceRate") && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Accept.</th>}
                                        {visibleColumns.includes("avgDeliveryTime") && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ø Zeit</th>}
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={visibleColumns.length + 1} className="py-20 text-center">
                                                <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                                            </td>
                                        </tr>
                                    ) : kpis.length === 0 ? (
                                        <tr>
                                            <td colSpan={visibleColumns.length + 1} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                Keine Daten vorhanden. Bitte Report hochladen.
                                            </td>
                                        </tr>
                                    ) : kpis.map((k) => (
                                        <tr key={k.id} className="hover:bg-slate-50/50 transition-colors group">
                                            {visibleColumns.includes("riderId") && <td className="px-8 py-6 text-sm font-black text-slate-900">{k.riderId}</td>}
                                            {visibleColumns.includes("riderName") && (
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-900">
                                                            {k.driver ? `${k.driver.firstName} ${k.driver.lastName}` : k.riderName}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {k.driver ? (
                                                                <span className="text-[8px] font-black text-green-600 uppercase flex items-center gap-1">
                                                                    Verknüpft <CheckCircle2 size={8} />
                                                                </span>
                                                            ) : (
                                                                <span className="text-[8px] font-black text-amber-600 uppercase">Unbekannt ❓</span>
                                                            )}
                                                            <span className="text-[8px] font-medium text-slate-400 italic">({k.riderName})</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                            {visibleColumns.includes("cityName") && <td className="px-8 py-6 text-sm font-bold text-slate-600 uppercase">{k.cityName || "-"}</td>}
                                            {visibleColumns.includes("dateLocal") && (
                                                <td className="px-8 py-6 text-sm font-bold text-slate-400">
                                                    {k.dateLocal ? new Date(k.dateLocal).toLocaleDateString('de-DE') : `Woche ${k.isoweek}`}
                                                </td>
                                            )}
                                            {visibleColumns.includes("deliveredOrders") && (
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-black text-xs">{k.deliveredOrders}</span>
                                                </td>
                                            )}
                                            {visibleColumns.includes("hoursWorked") && <td className="px-8 py-6 text-sm font-bold text-slate-600">{k.hoursWorked.toFixed(1)}h</td>}
                                            {visibleColumns.includes("utr") && <td className="px-8 py-6 text-sm font-bold text-slate-600">{k.utr?.toFixed(2) || "-"}</td>}
                                            {visibleColumns.includes("acceptanceRate") && <td className="px-8 py-6 text-sm font-bold text-slate-600">{(k.acceptanceRate * 100).toFixed(0)}%</td>}
                                            {visibleColumns.includes("avgDeliveryTime") && <td className="px-8 py-6 text-sm font-bold text-slate-600">{k.avgDeliveryTime?.toFixed(1) || "-"} min</td>}
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition shadow-sm group-hover:scale-110">
                                                    <Coins size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    const colorClasses: any = {
        green: "bg-green-50",
        blue: "bg-blue-50",
        purple: "bg-purple-50",
        amber: "bg-amber-50"
    };
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4 hover:scale-[1.02] transition-all cursor-default">
            <div className={cn("inline-flex p-3 rounded-2xl", colorClasses[color])}>
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{value}</span>
                </div>
            </div>
        </div>
    );
}
