"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    ShieldTerm,
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    Eye,
    MoreVertical,
    Plus,
    Search,
    Loader2,
    Database,
    UploadCloud,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

type Doc = {
    id: string;
    type: string;
    title: string;
    status: string;
    expiryDate: string | null;
    fileUrl: string;
    driver: {
        firstName: string;
        lastName: string;
    }
};

export default function DocumentsPage() {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const { data } = await api.get("/documents");
            setDocs(data);
        } catch (e) {
            console.error("Failed to fetch documents", e);
        } finally {
            setLoading(false);
        }
    };

    const docTypes: Record<string, string> = {
        LICENSE: "Führerschein",
        INSURANCE: "Versicherung",
        TAX_ID: "Steuer-ID",
        BUSINESS_REG: "Gewerbeanmeldung",
        OTHER: "Sonstiges"
    };

    const getStatusStyles = (status: string, expiryDate: string | null) => {
        if (expiryDate && new Date(expiryDate) < new Date()) {
            return { color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle, label: "Abgelaufen" };
        }
        if (expiryDate) {
            const warningDays = 30;
            const diff = (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            if (diff < warningDays) {
                return { color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle, label: "Läuft bald ab" };
            }
        }
        return { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle, label: "Gültig" };
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <FileText size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Compliance</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dokumentenverwaltung</h1>
                    <p className="text-slate-500 font-medium">Überwachung von Lizenzen, Versicherungen und behördlichen Dokumenten.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition flex items-center gap-2">
                        <Database size={18} />
                        Archiv
                    </button>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center gap-2">
                        <UploadCloud size={18} />
                        Dokument hochladen
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gesamtanzahl</p>
                        <h3 className="text-4xl font-black text-slate-900">{docs.length}</h3>
                    </div>
                    <FileText className="absolute bottom-[-20px] right-[-20px] text-slate-50 opacity-10 group-hover:scale-125 transition duration-700" size={140} />
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Läuft bald ab (30T)</p>
                        <h3 className="text-4xl font-black text-amber-500">
                            {docs.filter(d => d.expiryDate && (new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 30 && (new Date(d.expiryDate).getTime() > new Date().getTime())).length}
                        </h3>
                    </div>
                    <Clock className="absolute bottom-[-20px] right-[-20px] text-amber-50 opacity-10 group-hover:scale-125 transition duration-700" size={140} />
                </div>
                <div className="bg-red-500 p-8 rounded-[2.5rem] shadow-xl shadow-red-100 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-red-100 uppercase tracking-widest mb-2">Ablaufwarnungen</p>
                        <h3 className="text-4xl font-black text-white">
                            {docs.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date()).length}
                        </h3>
                    </div>
                    <AlertTriangle className="absolute bottom-[-20px] right-[-20px] text-white/10 group-hover:scale-125 transition duration-700" size={140} />
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Nach Fahrer oder Dokument suchen..."
                            className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dokument / Typ</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fahrer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ablaufdatum</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
                                    </td>
                                </tr>
                            ) : docs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                                        Keine Dokumente gefunden
                                    </td>
                                </tr>
                            ) : docs.map((doc, i) => {
                                const status = getStatusStyles(doc.status, doc.expiryDate);
                                const StatusIcon = status.icon;

                                return (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={doc.id}
                                        className="hover:bg-slate-50/50 transition group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 leading-none mb-1">{doc.title}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{docTypes[doc.type] || doc.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-bold text-slate-700">{doc.driver.firstName} {doc.driver.lastName}</span>
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
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "font-mono text-sm font-bold",
                                                status.label === "Abgelaufen" ? "text-red-600" : "text-slate-600"
                                            )}>
                                                {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('de-DE') : "—"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-slate-400 hover:text-blue-600 transition">
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-blue-600 transition">
                                                    <Download size={18} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-blue-600 transition opacity-0 group-hover:opacity-100">
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
        </div>
    );
}
