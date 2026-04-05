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
    BarChart3
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminKpiPage() {
    const [kpis, setKpis] = useState<any[]>([]);
    const [uploads, setUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState<string>("");

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
            e.target.value = "";
        }
    };

    // Calculate totals
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
                                {uploads.slice(0, 5).map(u => (
                                    <div key={u.id} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-900 truncate">{u.filename}</p>
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
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Rider Performance Liste</h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input placeholder="Suchen..." className="pl-12 pr-6 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-blue-500 font-bold text-sm" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rider</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Woche</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Best.</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">h (Online)</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">UTR</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acc %</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                                            </td>
                                        </tr>
                                    ) : kpis.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                Keine Daten vorhanden. Bitte Report hochladen.
                                            </td>
                                        </tr>
                                    ) : kpis.map((k) => (
                                        <tr key={k.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900">{k.riderName}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {k.riderId}</span>
                                                        {k.driver ? (
                                                            <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase">Verknüpft ✅</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] font-black uppercase">Unbekannt ❓</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-600">Woche {k.isoweek}</td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-black text-xs">{k.deliveredOrders}</span>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-600">{k.hoursWorked.toFixed(1)}h</td>
                                            <td className="px-8 py-6">
                                                <div className={cn(
                                                    "text-sm font-black tabular-nums",
                                                    (k.utr || 0) < 1.5 ? "text-red-500" : (k.utr || 0) < 2.5 ? "text-amber-500" : "text-green-600"
                                                )}>
                                                    {(k.utr || 0).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-black text-slate-600">{(k.acceptanceRate || 0).toFixed(0)}%</td>
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
