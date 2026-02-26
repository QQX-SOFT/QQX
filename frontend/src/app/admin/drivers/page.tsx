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
    Banknote
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
    type: "EMPLOYED" | "FREELANCE";
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
    const [showAddModal, setShowAddModal] = useState(false);
    const [creating, setCreating] = useState(false);

    // Document View State
    const [viewingDocs, setViewingDocs] = useState<Driver | null>(null);
    const [docs, setDocs] = useState<Document[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const [newDriver, setNewDriver] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        birthday: "",
        employmentType: "ANGEMELDET" as "ANGEMELDET" | "SELBSTSTANDIG",
        street: "",
        zip: "",
        city: "",
        ssn: "",
        taxId: "",
        iban: "",
        bic: ""
    });

    const docRequirements = {
        ANGEMELDET: [
            "Lichtbildausweis/Reisepass",
            "Führerschein (Klasse B)",
            "Meldezettel",
            "ÖGK Anmeldung"
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

    const handleDownloadReport = async (driver: Driver) => {
        alert(`Bericht für ${driver.firstName} ${driver.lastName} wird generiert...\n(In einer echten App würde hier ein PDF-Download starten)`);
    };

    const handleCreateDriver = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            // Mapping frontend types to backend Prisma types
            const payload = {
                ...newDriver,
                // The backend route handles the mapping of employmentType to Prisma enum
            };
            await api.post("/drivers", payload);
            setShowAddModal(false);
            setNewDriver({
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
                birthday: "",
                employmentType: "ANGEMELDET",
                street: "",
                zip: "",
                city: "",
                ssn: "",
                taxId: "",
                iban: "",
                bic: ""
            });
            fetchDrivers();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Erstellen des Fahrers");
        } finally {
            setCreating(false);
        }
    };

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
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200"
                >
                    <Plus size={20} />
                    Fahrer einstellen
                </button>
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
                                        driver.type === "FREELANCE" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        <Briefcase size={10} />
                                        {driver.type === "FREELANCE" ? "Subunternehmer" : "Angestellt"}
                                    </div>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 truncate max-w-[150px]"><Mail size={12} /> {driver.user?.email || "-"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 flex-1">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <div className="flex items-center gap-1.5 font-black text-green-500 text-sm uppercase tracking-tighter">
                                    <ShieldCheck size={14} />
                                    {driver.status}
                                </div>
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
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
                                        {(viewingDocs.type === "FREELANCE" ? docRequirements.SELBSTSTANDIG : docRequirements.ANGEMELDET).map((req: string) => {
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

            {/* Detailed Add Driver Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-10 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black text-slate-900 mb-8">Neuen Fahrer einstellen</h2>

                            <form onSubmit={handleCreateDriver} className="space-y-8">
                                {/* Type Selector */}
                                <div className="flex p-1 bg-slate-100 rounded-2xl max-w-md">
                                    <button
                                        type="button"
                                        onClick={() => setNewDriver({ ...newDriver, employmentType: "ANGEMELDET" })}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-sm font-black transition-all",
                                            newDriver.employmentType === "ANGEMELDET" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        Angestellt
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewDriver({ ...newDriver, employmentType: "SELBSTSTANDIG" })}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-sm font-black transition-all",
                                            newDriver.employmentType === "SELBSTSTANDIG" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        Selbstständig (Sub)
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    {/* Personal Info */}
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Persönliche Daten</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="Vorname" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={newDriver.firstName} onChange={e => setNewDriver({ ...newDriver, firstName: e.target.value })} />
                                            <input type="text" placeholder="Nachname" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={newDriver.lastName} onChange={e => setNewDriver({ ...newDriver, lastName: e.target.value })} />
                                        </div>
                                        <input type="email" placeholder="E-Mail" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold text-blue-600" value={newDriver.email} onChange={e => setNewDriver({ ...newDriver, email: e.target.value })} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="tel" placeholder="Telefon" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })} />
                                            <input type="date" placeholder="Geburtsdatum" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={newDriver.birthday} onChange={e => setNewDriver({ ...newDriver, birthday: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Address Info */}
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Anschrift</h3>
                                        <input type="text" placeholder="Straße / Hausnummer" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={newDriver.street} onChange={e => setNewDriver({ ...newDriver, street: e.target.value })} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="PLZ" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={newDriver.zip} onChange={e => setNewDriver({ ...newDriver, zip: e.target.value })} />
                                            <input type="text" placeholder="Stadt" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={newDriver.city} onChange={e => setNewDriver({ ...newDriver, city: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Legal Info */}
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Rechtliches / Steuern</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="SV-Nummer (SSN)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={newDriver.ssn} onChange={e => setNewDriver({ ...newDriver, ssn: e.target.value })} />
                                            <input type="text" placeholder="Steuer-ID / UID" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={newDriver.taxId} onChange={e => setNewDriver({ ...newDriver, taxId: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Bank Info */}
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Bankverbindung</h3>
                                        <input type="text" placeholder="IBAN" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-mono font-bold" value={newDriver.iban} onChange={e => setNewDriver({ ...newDriver, iban: e.target.value })} />
                                        <input type="text" placeholder="BIC" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-mono font-bold" value={newDriver.bic} onChange={e => setNewDriver({ ...newDriver, bic: e.target.value })} />
                                    </div>
                                </div>

                                {/* Information Box */}
                                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4">
                                    <ShieldCheck className="text-blue-600 shrink-0" size={24} />
                                    <div>
                                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Gesetzliche Anforderungen (Österreich)</h4>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4 uppercase tracking-widest">Die folgenden Dokumente werden für diesen Typ benötigt:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(newDriver.employmentType === "SELBSTSTANDIG" ? docRequirements.SELBSTSTANDIG : docRequirements.ANGEMELDET).map(req => (
                                                <span key={req} className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-blue-700 border border-blue-100">{req}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition">Abbrechen</button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
                                    >
                                        {creating ? <Loader2 className="animate-spin" size={20} /> : "Fahrer Anlegen"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
