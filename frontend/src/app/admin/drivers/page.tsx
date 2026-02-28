"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Star,
    FileText,
    Download,
    Mail,
    Phone,
    ChevronRight,
    Loader2,
    X,
    Calendar,
    Briefcase,
    ShieldCheck,
    Eye,
    CheckCircle,
    AlertTriangle,
    Clock,
    Building2,
    Hash,
    Banknote,
    Trash2,
    Power,
    PowerOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";

interface Driver {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    birthday: string | null;
    type: "ECHTER_DIENSTNEHMER" | "FREIER_DIENSTNEHMER" | "SELBSTSTANDIG";
    user?: {
        email: string;
    };
    status: string;
}

interface Document {
    id: string;
    type: string;
    title: string;
    status: string;
    expiryDate: string | null;
    fileUrl: string;
}

export default function DriversPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    // Document View State
    const [viewingDocs, setViewingDocs] = useState<Driver | null>(null);
    const [docs, setDocs] = useState<Document[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);


    const docRequirements = {
        ECHTER_DIENSTNEHMER: [
            "Lichtbildausweis/Reisepass",
            "Führerschein (Klasse B)",
            "Meldezettel",
            "ÖGK Anmeldung"
        ],
        FREIER_DIENSTNEHMER: [
            "Lichtbildausweis/Reisepass",
            "Führerschein (Klasse B)",
            "Meldezettel",
            "SVS Bestätigung"
        ],
        SELBSTSTANDIG: [
            "Lichtbildausweis/Reisepass",
            "Führerschein (Klasse B)",
            "Meldezettel",
            "GISA-Auszug",
            "SVS Bestätigung",
            "UID / Steuer-ID"
        ]
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const { data } = await api.get("/drivers");
            setDrivers(data);
        } catch (e) {
            console.error("Failed to fetch drivers", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDriverDocs = async (driver: Driver) => {
        setViewingDocs(driver);
        setLoadingDocs(true);
        try {
            const { data } = await api.get(`/documents/driver/${driver.id}`);
            setDocs(data);
        } catch (e) {
            console.error("Failed to fetch documents", e);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleToggleStatus = async (driver: Driver) => {
        const newStatus = driver.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        try {
            await api.patch(`/drivers/${driver.id}/status`, { status: newStatus });
            fetchDrivers();
        } catch (error) {
            alert("Fehler beim Aktualisieren des Status");
        }
    };

    const handleDeleteDriver = async (driver: Driver) => {
        if (driver.status === "ACTIVE") {
            alert("Aktive Fahrer können nicht gelöscht werden.");
            return;
        }
        if (!confirm(`Möchtest du ${driver.firstName} ${driver.lastName} wirklich löschen?`)) return;

        try {
            await api.delete(`/drivers/${driver.id}`);
            fetchDrivers();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Löschen");
        }
    };

    const handleDownloadReport = async (driver: Driver) => {
        alert(`Bericht für ${driver.firstName} ${driver.lastName} wird generiert...\n(In einer echten App würde hier ein PDF-Download starten)`);
    };

    // Create logic moved to editor page

    const filteredDrivers = drivers.filter(d =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Fahrer-Management</h1>
                </div>
                <Link
                    href="/admin/drivers/editor"
                    className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200"
                >
                    <Plus size={20} />
                    Fahrer einstellen
                </Link>
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white border border-slate-200 p-2 rounded-2xl flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-sm">
                    <div className="p-3">
                        <Search size={20} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Name oder E-Mail suchen..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 py-2 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {/* Drivers List */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
                    </div>
                ) : filteredDrivers.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <Users className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 font-bold uppercase tracking-widest">Keine Fahrer gefunden</p>
                    </div>
                ) : filteredDrivers.map((driver, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={driver.id}
                        className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500 flex flex-col lg:flex-row lg:items-center gap-8"
                    >
                        <div className="flex items-center gap-6 min-w-[300px]">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                                {driver.firstName[0]}{driver.lastName[0]}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition">{driver.firstName} {driver.lastName}</h3>
                                <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm font-medium">
                                    <div className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                        driver.type === "SELBSTSTANDIG" ? "bg-amber-50 text-amber-600" :
                                            driver.type === "FREIER_DIENSTNEHMER" ? "bg-purple-50 text-purple-600" :
                                                "bg-blue-50 text-blue-600"
                                    )}>
                                        <Briefcase size={10} />
                                        {driver.type === "SELBSTSTANDIG" ? "Selbstständig" :
                                            driver.type === "FREIER_DIENSTNEHMER" ? "Freier Dienstnehmer" :
                                                "Echter Dienstnehmer"}
                                    </div>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 truncate max-w-[150px]"><Mail size={12} /> {driver.user?.email || "-"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 flex-1">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <button
                                    onClick={() => handleToggleStatus(driver)}
                                    className={cn(
                                        "flex items-center gap-1.5 font-black text-sm uppercase tracking-tighter transition-colors",
                                        driver.status === "ACTIVE" ? "text-green-500 hover:text-amber-500" : "text-slate-300 hover:text-green-500"
                                    )}
                                >
                                    {driver.status === "ACTIVE" ? <ShieldCheck size={14} /> : <Clock size={14} />}
                                    {driver.status === "ACTIVE" ? "Aktiv" : "Passiv"}
                                </button>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Telefon</p>
                                <p className="font-black text-slate-900 flex items-center gap-2 truncate"><Phone size={14} className="text-slate-300" /> {driver.phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bewertung</p>
                                <div className="flex items-center gap-1 text-yellow-500 font-black">
                                    <Star size={14} className="fill-current" />
                                    <span>4.8</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={() => fetchDriverDocs(driver)}
                                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                                title="Dokumente ansehen"
                            >
                                <FileText size={20} />
                            </button>
                            <button
                                onClick={() => handleDownloadReport(driver)}
                                className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition"
                                title="Bericht exportieren"
                            >
                                <Download size={20} />
                            </button>

                            {driver.status !== "ACTIVE" && (
                                <button
                                    onClick={() => handleDeleteDriver(driver)}
                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                    title="Löschen"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}

                            <div className="h-8 w-px bg-slate-100 mx-2" />
                            <Link
                                href={`/admin/drivers/${driver.id}`}
                                className="px-6 py-3 bg-slate-50 text-slate-900 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-900 hover:text-white transition group/btn"
                            >
                                Profil
                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Document View Modal */}
            <AnimatePresence>
                {viewingDocs && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setViewingDocs(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>

                            <div className="mb-8">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2 block">Unterlagen</span>
                                <h2 className="text-3xl font-black text-slate-900">{viewingDocs.firstName} {viewingDocs.lastName}</h2>
                            </div>

                            <div className="space-y-4">
                                {loadingDocs ? (
                                    <div className="py-12 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
                                    </div>
                                ) : docs.length === 0 ? (
                                    <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <AlertTriangle className="mx-auto text-slate-300 mb-2" size={32} />
                                        <p className="text-slate-500 font-bold text-sm">Noch keine Dokumente hochgeladen</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {docs.map((doc) => (
                                            <div key={doc.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between hover:border-blue-200 transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 mb-0.5">{doc.title}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {doc.expiryDate ? (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    Exp: {new Date(doc.expiryDate).toLocaleDateString('de-DE')}
                                                                </span>
                                                            ) : "Unbefristet"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                                        doc.status === "VALID" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                                    )}>
                                                        {doc.status}
                                                    </span>
                                                    <a href={doc.fileUrl} target="_blank" className="p-2 bg-white rounded-xl text-slate-400 hover:text-blue-600 shadow-sm border border-slate-50 transition border-none">
                                                        <Eye size={18} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-8 border-t border-slate-50">
                                    <p className="text-xs font-bold text-slate-400 mb-4 px-2 uppercase tracking-widest">Gesetzlich erforderlich:</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(docRequirements[viewingDocs.type] || []).map((req: string) => {
                                            const hasDoc = docs.some(d => d.title.toLowerCase().includes(req.toLowerCase()) || d.type.toLowerCase().includes(req.toLowerCase()));
                                            return (
                                                <div key={req} className={cn(
                                                    "px-4 py-3 rounded-2xl border text-[11px] font-bold flex items-center gap-3 transition",
                                                    hasDoc ? "bg-green-50/50 border-green-100 text-green-700" : "bg-red-50/50 border-red-100 text-red-700"
                                                )}>
                                                    {hasDoc ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                                    {req}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Driver Creation Modal removed */}
        </div>
    );
}
