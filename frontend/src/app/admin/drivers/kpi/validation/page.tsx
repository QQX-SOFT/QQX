"use client";

import { useState } from "react";
import { 
    Upload, 
    CheckCircle2, 
    XCircle, 
    Search, 
    FileSpreadsheet, 
    ChevronLeft, 
    ArrowRight,
    AlertTriangle,
    Tag,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function KpiValidationPage() {
    const [file, setFile] = useState<File | null>(null);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleValidate = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const { data } = await api.post("/kpis/validate", formData);
            setResults(data);
        } catch (error) {
            alert("Fehler bei der Validierung");
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(r => 
        (r.riderName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.riderId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.matchedDriver && r.matchedDriver.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: results.length,
        matched: results.filter(r => r.matchType !== 'NONE').length,
        unmatched: results.filter(r => r.matchType === 'NONE').length,
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
            <div className="max-w-[1600px] mx-auto px-10 pt-10">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <Link href="/admin/drivers/kpi" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition font-black text-[10px] uppercase tracking-widest mb-4 group">
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition" />
                            Zurück zu KPIs
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                            Excel Abgleich <span className="text-blue-600">Debugger</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Prüfen Sie, wie die Excel-Daten mit der Datenbank gematcht werden, bevor Sie importieren.</p>
                    </div>

                    {!results.length ? (
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all font-black text-xs uppercase tracking-widest text-slate-600 group">
                                <FileSpreadsheet size={16} className="text-slate-400 group-hover:text-blue-600 transition" />
                                {file ? file.name : "Excel wählen"}
                                <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileChange} />
                            </label>
                            <button 
                                onClick={handleValidate} 
                                disabled={!file || loading}
                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-20 flex items-center gap-3"
                            >
                                {loading ? "Analysiere..." : "Vergleichen"}
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => { setResults([]); setFile(null); }} className="px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition shadow-sm">
                            Neu Starten
                        </button>
                    )}
                </header>

                <AnimatePresence mode="wait">
                    {!results.length ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-32 text-center"
                        >
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-inner">
                                <Upload size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Transparente Datenpflege</h3>
                            <p className="text-slate-400 font-medium max-w-sm mx-auto">Laden Sie Ihre KPI Excel hoch, um zu sehen welche Fahrer korrekt erkannt werden.</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gesamt Zeilen</p>
                                    <h4 className="text-4xl font-black text-slate-900">{stats.total}</h4>
                                    <FileSpreadsheet className="absolute -bottom-4 -right-4 text-slate-50 opacity-10 group-hover:scale-110 transition duration-500" size={120} />
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                    <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Erfolgreiche Matches</p>
                                    <div className="flex items-end gap-3">
                                        <h4 className="text-4xl font-black text-green-500">{stats.matched}</h4>
                                        <span className="text-sm font-black text-slate-300 mb-1">/{stats.total}</span>
                                    </div>
                                    <CheckCircle2 className="absolute -bottom-4 -right-4 text-green-50 opacity-10 group-hover:scale-110 transition duration-500" size={120} />
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Unbekannte Fahrer</p>
                                    <div className="flex items-end gap-3">
                                        <h4 className="text-4xl font-black text-red-500">{stats.unmatched}</h4>
                                    </div>
                                    <AlertTriangle className="absolute -bottom-4 -right-4 text-red-50 opacity-10 group-hover:scale-110 transition duration-500" size={120} />
                                </div>
                            </div>

                            {/* Main Table View */}
                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input 
                                            placeholder="Nach ID veya Name suchen..." 
                                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-xs transition-all shadow-sm"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-4 py-2 bg-slate-100 rounded-xl font-black text-[10px] text-slate-400 uppercase tracking-widest">Live Abgleich</span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Excel Daten (Rider ID/Name)</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Stadt</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Datum</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Eşleşme Tipi</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Gefundener Fahrer (DB)</th>
                                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredResults.map((row, idx) => (
                                                <tr key={idx} className="group hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-black text-slate-900 group-hover:text-blue-600 transition">{row.riderName || "Unbekannt"}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">ID: {row.riderId || "KEINE"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-xs font-black text-slate-500 uppercase">{row.cityName || "-"}</td>
                                                    <td className="px-8 py-6 text-[10px] font-bold text-slate-400">
                                                        {row.dateLocal ? new Date(row.dateLocal).toLocaleDateString('de-DE') : "-"}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        {row.matchType !== 'NONE' ? (
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full w-fit">
                                                                <Tag size={10} />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                                    {row.matchType === 'PRIMARY_ID' ? 'HAUPT ID' : row.matchType === 'SECONDARY_ID' ? 'ZWEIT ID' : 'NAME MATCH'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-slate-300">---</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        {row.matchedDriver ? (
                                                            <span className="text-xs font-black text-slate-700">{row.matchedDriver}</span>
                                                        ) : (
                                                            <span className="text-xs font-bold text-red-400 italic">Nicht gefunden</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {row.matchType !== 'NONE' ? (
                                                            <CheckCircle2 className="ml-auto text-green-500" size={20} />
                                                        ) : (
                                                            <XCircle className="ml-auto text-red-200" size={20} />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
