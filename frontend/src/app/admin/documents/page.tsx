"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    ShieldAlert,
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
    X,
    Filter,
    User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Doc = {
    id: string;
    type: string;
    title: string;
    status: string;
    expiryDate: string | null;
    fileUrl: string;
    driver: {
        id: string;
        firstName: string;
        lastName: string;
    }
};

type Driver = {
    id: string;
    firstName: string;
    lastName: string;
};

export default function DocumentsPage() {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadWorkerType, setUploadWorkerType] = useState<"ECHTER_DIENSTNEHMER" | "FREIER_DIENSTNEHMER" | "SELBSTSTANDIG">("ECHTER_DIENSTNEHMER");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [docsRes, driversRes] = await Promise.all([
                api.get("/documents"),
                api.get("/drivers")
            ]);
            setDocs(docsRes.data);
            setDrivers(driversRes.data);
        } catch (e) {
            console.error("Failed to fetch documents", e);
        } finally {
            setLoading(false);
        }
    };

    const docTypes: Record<string, string> = {
        IDENTITY: "Lichtbildausweis/Reisepass",
        LICENSE: "Führerschein (Klasse B)",
        MELDEZETTEL: "Meldezettel",
        GISA_EXTRACT: "GISA-Auszug (Gewerbe)",
        INSURANCE: "Haftpflichtversicherung",
        SVS_CONFIRMATION: "SVS Bestätigung",
        OGK_ANMELDUNG: "ÖGK Anmeldung",
        TAX_ID: "UID / Steuer-ID",
        OTHER: "Sonstiges"
    };

    const workerRequirements = {
        ECHTER_DIENSTNEHMER: ["IDENTITY", "LICENSE", "MELDEZETTEL", "OGK_ANMELDUNG"],
        FREIER_DIENSTNEHMER: ["IDENTITY", "LICENSE", "MELDEZETTEL", "SVS_CONFIRMATION"],
        SELBSTSTANDIG: ["IDENTITY", "LICENSE", "MELDEZETTEL", "GISA_EXTRACT", "SVS_CONFIRMATION", "TAX_ID"]
    };

    const getStatusStyles = (status: string, expiryDate: string | null) => {
        if (expiryDate && new Date(expiryDate) < new Date()) {
            return { color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle, label: "Abgelaufen", variant: "EXPIRED" };
        }
        if (expiryDate) {
            const warningDays = 30;
            const diff = (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            if (diff < warningDays) {
                return { color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle, label: "Läuft bald ab", variant: "WARNING" };
            }
        }
        return { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle, label: "Gültig", variant: "VALID" };
    };

    const filteredDocs = docs.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${doc.driver.firstName} ${doc.driver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === "ALL") return matchesSearch;

        const status = getStatusStyles(doc.status, doc.expiryDate);
        return matchesSearch && status.variant === statusFilter;
    });

    // Upload handler moved to editor page

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <FileText size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Archiv</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dokumentenverwaltung</h1>
                    <p className="text-slate-500 font-medium font-sans">Offizielle Dokumente und Zertifikate Ihrer Mitarbeiter.</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/documents/editor"
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center gap-2"
                    >
                        <UploadCloud size={18} />
                        Dokument hochladen
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative flex-1 w-full max-w-md font-sans">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Nach Fahrer oder Dokument suchen..."
                            className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/10 transition cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Alle Status</option>
                            <option value="VALID">Gültig</option>
                            <option value="EXPIRED">Abgelaufen</option>
                            <option value="WARNING">Läuft bald ab</option>
                        </select>
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
                            ) : filteredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                                        Keine Dokumente gefunden
                                    </td>
                                </tr>
                            ) : filteredDocs.map((doc, i) => {
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
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs">
                                                    {doc.driver.firstName[0]}{doc.driver.lastName[0]}
                                                </div>
                                                <span className="font-bold text-slate-700">{doc.driver.firstName} {doc.driver.lastName}</span>
                                            </div>
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
                                                <a href={doc.fileUrl} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 transition">
                                                    <Eye size={18} />
                                                </a>
                                                <button className="p-2 text-slate-400 hover:text-blue-600 transition">
                                                    <Download size={18} />
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

            {/* Upload Modal removed */}
        </div>
    );
}
