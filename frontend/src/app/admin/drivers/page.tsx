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
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Driver {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    birthday?: string;
    employmentType: "ANGEMELDET" | "SELBSTSTANDIG";
    user?: {
        email: string;
    };
    status: string;
}

export default function DriversPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newDriver, setNewDriver] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        birthday: "",
        employmentType: "ANGEMELDET" as "ANGEMELDET" | "SELBSTSTANDIG"
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

    const handleCreateDriver = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post("/drivers", newDriver);
            setShowAddModal(false);
            setNewDriver({
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
                birthday: "",
                employmentType: "ANGEMELDET"
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
                                        driver.employmentType === "SELBSTSTANDIG" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        <Briefcase size={10} />
                                        {driver.employmentType === "SELBSTSTANDIG" ? "Subunternehmer" : "Angestellt"}
                                    </div>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Mail size={12} /> {driver.user?.email || "-"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 flex-1">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <div className="flex items-center gap-1.5 font-black text-green-500 text-sm uppercase tracking-tighter">
                                    <ShieldCheck size={14} />
                                    Aktiv
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Telefon</p>
                                <p className="font-black text-slate-900 flex items-center gap-2"><Phone size={14} className="text-slate-300" /> {driver.phone || "-"}</p>
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
                            <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                                <FileText size={20} />
                            </button>
                            <button className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition">
                                <Download size={20} />
                            </button>
                            <div className="h-8 w-px bg-slate-100 mx-2" />
                            <button className="px-6 py-3 bg-slate-50 text-slate-900 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-900 hover:text-white transition group/btn">
                                Profil
                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Driver Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black text-slate-900 mb-8">Neuen Fahrer einstellen</h2>

                            <form onSubmit={handleCreateDriver} className="space-y-6">
                                {/* Type Selector */}
                                <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Vorname</label>
                                        <input
                                            type="text" required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                            value={newDriver.firstName}
                                            onChange={(e) => setNewDriver({ ...newDriver, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nachname</label>
                                        <input
                                            type="text" required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                            value={newDriver.lastName}
                                            onChange={(e) => setNewDriver({ ...newDriver, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Email @</label>
                                        <input
                                            type="email" required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold text-blue-600"
                                            value={newDriver.email}
                                            onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Geburtsdatum</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="date" required
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                                value={newDriver.birthday}
                                                onChange={(e) => setNewDriver({ ...newDriver, birthday: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Telefonnummer</label>
                                    <div className="relative">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel" required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                            value={newDriver.phone}
                                            placeholder="+43 664 1234567"
                                            onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Information Box for Austria */}
                                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                                    <h4 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-[0.2em]">
                                        <ShieldCheck size={14} />
                                        Gesetzliche Anforderungen (Österreich)
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-widest">
                                        Basierend auf der Auswahl müssen folgende Dokumente vor Fahrtantritt im System hinterlegt werden:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {docRequirements[newDriver.employmentType].map((doc) => (
                                            <div key={doc} className="flex items-center gap-2 text-[11px] font-bold text-blue-900/80">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                {doc}
                                            </div>
                                        ))}
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
