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
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadWorkerType, setUploadWorkerType] = useState<"ECHTER_DIENSTNEHMER" | "FREIER_DIENSTNEHMER" | "SELBSTSTANDIG">("ECHTER_DIENSTNEHMER");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Form state
    const [uploadData, setUploadData] = useState({
        driverId: "",
        type: "",
        title: "",
        expiryDate: ""
    });

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

    const handleUpload = async () => {
        if (!uploadData.driverId || !uploadData.type || !uploadData.title) {
            alert("Bitte füllen Sie alle Pflichtfelder aus.");
            return;
        }

        try {
            await api.post("/documents", {
                ...uploadData,
                fileUrl: "https://example.com/placeholder.pdf" // Placeholder until real upload logic
            });
            setShowUploadModal(false);
            setUploadData({ driverId: "", type: "", title: "", expiryDate: "" });
            fetchData();
        } catch (e) {
            alert("Fehler beim Hochladen");
        }
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
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Archiv</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dokumentenverwaltung</h1>
                    <p className="text-slate-500 font-medium font-sans">Offizielle Dokumente und Zertifikate Ihrer Mitarbeiter.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center gap-2"
                    >
                        <UploadCloud size={18} />
                        Dokument hochladen
                    </button>
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

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowUploadModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black text-slate-900 mb-8">Dokument hochladen</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <User size={14} /> Mitarbeiter / Fahrer
                                    </label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold text-slate-700"
                                        value={uploadData.driverId}
                                        onChange={(e) => setUploadData({ ...uploadData, driverId: e.target.value })}
                                    >
                                        <option value="">Mitarbeiter auswählen...</option>
                                        {drivers.map(driver => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.firstName} {driver.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dokument-Typ</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                            value={uploadData.type}
                                            onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                                        >
                                            <option value="">Typ wählen...</option>
                                            {Object.entries(docTypes).map(([val, label]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-red-500 underline">Ablaufdatum (optional)</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                            value={uploadData.expiryDate}
                                            onChange={(e) => setUploadData({ ...uploadData, expiryDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Titel des Dokuments</label>
                                    <input
                                        type="text"
                                        placeholder="z.B. Führerschein 2024"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                        value={uploadData.title}
                                        onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                    />
                                </div>

                                <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-center hover:border-blue-400 transition group cursor-pointer">
                                    <UploadCloud className="mx-auto text-slate-300 group-hover:text-blue-500 transition mb-2" size={32} />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Datei auswählen oder hierher ziehen</p>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition">Abbrechen</button>
                                    <button
                                        onClick={handleUpload}
                                        className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition shadow-xl shadow-blue-200"
                                    >
                                        Speichern
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
