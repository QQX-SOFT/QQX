"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    Search,
    Filter,
    Plus,
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
    Trash2,
    ChevronDown,
    MapPin
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
    type: "EMPLOYED" | "FREELANCE" | "COMMERCIAL";
    user?: {
        email: string;
    };
    status: string;
    driverNumber: string | null;
    workStyle: string | null;
    workLocation: string | null;
    employmentModel: string | null;
    employmentType: string | null;
    city: string | null;
    street: string | null;
    employmentStart: string | null;
    employmentEnd: string | null;
    orderFee: number | null;
    hourlyWage: number | null;
    payPerKm: number | null;
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
    const [viewingDocs, setViewingDocs] = useState<Driver | null>(null);
    const [docs, setDocs] = useState<Document[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    
    // Detailed Filter States
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['ACTIVE']);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

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
        const newStatus = driver.status === "ACTIVE" ? "PASSIV" : "ACTIVE";
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

    // Modified to split comma-separated locations
    const cities = ["ALL", ...Array.from(new Set(
        drivers.flatMap(d => {
            const loc = d.workLocation || d.city || "";
            return loc.split(",").map((s: string) => s.trim());
        })
    )).filter(Boolean).sort() as string[]];

    const filteredDrivers = drivers.filter(d => {
        const matchesSearch = `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.driverNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(d.status);
        
        const driverCity = d.workLocation || d.city || "";
        const driverLocs = driverCity.split(",").map((s: string) => s.trim());
        const matchesCity = selectedCities.length === 0 || driverLocs.some(loc => selectedCities.includes(loc));

        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(d.type);

        return matchesSearch && matchesStatus && matchesCity && matchesType;
    });

    const toggleFilter = (list: string[], setList: (val: string[]) => void, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const activeFilterCount = selectedCities.length + selectedStatuses.length + selectedTypes.length;

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Fahrer-Stamm</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2 ml-1">Personalverwaltung & Fuhrpark</p>
                </div>
                <Link
                    href="/admin/drivers/editor"
                    className="flex items-center gap-4 px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition shadow-2xl shadow-blue-200 active:scale-95"
                >
                    <Plus size={20} />
                    Fahrer einstellen
                </Link>
            </header>

            {/* Filters & Search BAR */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col lg:flex-row gap-4">
                <div className="flex-1 bg-slate-50 border border-slate-100 p-2 rounded-[1.5rem] flex items-center gap-2 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                    <div className="p-3">
                        <Search size={20} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="ID, Name oder E-Mail suchen..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-black text-slate-900 placeholder:text-slate-300 placeholder:font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={() => setShowFiltersModal(true)}
                        className={cn(
                            "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-sm border",
                            activeFilterCount > 0 
                                ? "bg-blue-600 text-white border-blue-500" 
                                : "bg-slate-50 text-slate-600 border-slate-100 hover:border-blue-200"
                        )}
                    >
                        <Filter size={18} />
                        Filter
                        {activeFilterCount > 0 && (
                            <span className="bg-white text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-[9px]">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {activeFilterCount > 0 && (
                        <button 
                            onClick={() => {
                                setSelectedCities([]);
                                setSelectedStatuses([]);
                                setSelectedTypes([]);
                            }}
                            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                            Reset
                        </button>
                    )}

                    <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition shadow-lg active:scale-95 ml-2">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Drivers List */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={48} />
                    </div>
                ) : filteredDrivers.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] mx-auto flex items-center justify-center text-slate-200 mb-6">
                             <Users size={40} />
                        </div>
                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Keine Fahrer gefunden</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredDrivers.map((driver, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                key={driver.id}
                                className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 flex flex-col lg:flex-row lg:items-center gap-10"
                            >
                                <div className="flex items-center gap-8 min-w-[350px]">
                                    <div className="relative group-hover:scale-105 transition-transform duration-500">
                                        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-blue-100">
                                            {driver.firstName[0]}{driver.lastName[0]}
                                        </div>
                                        <div className={cn(
                                            "absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-white shadow-sm flex items-center justify-center",
                                            driver.status === "ACTIVE" ? "bg-green-500" : 
                                            driver.status === "GEKUENDIGT" ? "bg-red-500" : "bg-slate-300"
                                        )}>
                                            {driver.status === "ACTIVE" ? <ShieldCheck size={12} className="text-white" /> : <Clock size={12} className="text-white" />}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition tracking-tight">{driver.firstName} {driver.lastName}</h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-3 py-1 bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 rounded-full">{driver.driverNumber || "NEW"}</span>
                                            <span className="text-slate-300">•</span>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {(driver.workLocation || driver.city || "Unbekannt").split(",").map((loc: string, idx: number) => (
                                                    <span key={idx} className="flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 uppercase tracking-tighter hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                        <MapPin size={10} /> {loc.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 flex-1 w-full mt-6 lg:mt-0 lg:ml-4 border-t lg:border-t-0 lg:border-l border-slate-50 pt-6 lg:pt-0 lg:pl-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</p>
                                        <p className={cn(
                                            "font-black text-xs uppercase tracking-widest",
                                            driver.status === "ACTIVE" ? "text-green-500" : 
                                            driver.status === "GEKUENDIGT" ? "text-red-500" : "text-slate-400"
                                        )}>
                                            {driver.status === "ACTIVE" ? "Aktiv" : 
                                             driver.status === "GEKUENDIGT" ? "Gekündigt" : "Passiv"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Vertrag & Modell</p>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-black text-[10px] text-blue-600 uppercase tracking-tighter">
                                                {driver.type === "COMMERCIAL" ? "SFU (Gewerbe)" : driver.type === "FREELANCE" ? "Freier DN" : "Echter DN"}
                                            </span>
                                            <span className="font-bold text-[9px] text-slate-400 uppercase italic">
                                                {driver.employmentModel || "Standard"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Dienstverhältnis</p>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-[10px] text-slate-700">
                                                <span className="text-slate-400 mr-1">Start:</span>
                                                {driver.employmentStart ? new Date(driver.employmentStart).toLocaleDateString('de-DE') : "-"}
                                            </span>
                                            {(driver.employmentEnd || driver.status === "GEKUENDIGT") && (
                                                <span className={cn(
                                                    "font-bold text-[10px]",
                                                    driver.status === "GEKUENDIGT" ? "text-red-500" : "text-slate-700"
                                                )}>
                                                    <span className={cn("mr-1", driver.status === "GEKUENDIGT" ? "text-red-400" : "text-slate-400")}>Ende:</span>
                                                    {driver.employmentEnd ? new Date(driver.employmentEnd).toLocaleDateString('de-DE') : "-"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Lohn & Spesen</p>
                                        <div className="flex flex-col gap-1">
                                            {driver.hourlyWage ? (
                                                <span className="font-bold text-[10px] text-slate-700">
                                                    Stundenlohn: <span className="text-slate-900">{driver.hourlyWage}€/h</span>
                                                </span>
                                            ) : null}
                                            {driver.orderFee ? (
                                                <span className="font-bold text-[10px] text-slate-700">
                                                    Pro Drop: <span className="text-slate-900">{driver.orderFee}€</span>
                                                </span>
                                            ) : null}
                                            {driver.payPerKm ? (
                                                <span className="font-bold text-[10px] text-slate-700">
                                                    Spesen: <span className="text-slate-900">{driver.payPerKm}€/km</span>
                                                </span>
                                            ) : null}
                                            {!driver.hourlyWage && !driver.orderFee && !driver.payPerKm && (
                                                <span className="font-bold text-[10px] text-slate-400 italic">Nicht definiert</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Kontakt</p>
                                        <p className="font-bold text-xs text-slate-900 truncate max-w-[150px]">{driver.phone || driver.user?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Bewertung</p>
                                        <div className="flex items-center gap-1 text-amber-400"><Star size={14} fill="currentColor" /><span className="font-black text-xs text-slate-900">-</span></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 justify-end">
                                    <button
                                        onClick={() => fetchDriverDocs(driver)}
                                        className="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition shadow-sm active:scale-90"
                                        title="Dokumente"
                                    >
                                        <FileText size={20} />
                                    </button>
                                    
                                    <div className="h-10 w-px bg-slate-50 mx-2" />
                                    
                                    <Link
                                        href={`/admin/drivers/${driver.id}`}
                                        className="px-8 py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 hover:text-white transition shadow-sm active:scale-95"
                                    >
                                        Profil
                                        <ChevronRight size={16} />
                                    </Link>
                                    
                                    {driver.status !== "ACTIVE" && (
                                        <button
                                            onClick={() => handleDeleteDriver(driver)}
                                            className="p-4 text-slate-200 hover:text-red-500 transition active:scale-90"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) }
            </div>


            {/* Document View Modal */}
            <AnimatePresence>
                {viewingDocs && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[3.5rem] p-12 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setViewingDocs(null)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>

                            <div className="mb-10">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3 block">Unterlagen-Check</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">{viewingDocs.firstName} {viewingDocs.lastName}</h2>
                            </div>

                            <div className="space-y-6">
                                {loadingDocs ? (
                                    <div className="py-20 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {docs.map((doc) => (
                                            <div key={doc.id} className="p-6 bg-slate-50 border border-slate-50 rounded-3xl flex items-center justify-between hover:border-blue-200 transition group shadow-sm">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm mb-1 uppercase tracking-tight">{doc.title}</p>
                                                        <div className="flex items-center gap-3">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                                doc.status === "VALID" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                                            )}>
                                                                {doc.status}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 italic">
                                                                {doc.expiryDate ? `Ablauf: ${new Date(doc.expiryDate).toLocaleDateString('de-DE')}` : "Unbefristet"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <a href={doc.fileUrl} target="_blank" className="p-3 bg-white rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition active:scale-95">
                                                    <Eye size={20} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Advanced Filters Modal */}
            <AnimatePresence>
                {showFiltersModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white rounded-[4rem] p-12 w-full max-w-4xl shadow-2xl relative max-h-[85vh] flex flex-col"
                        >
                            <button onClick={() => setShowFiltersModal(false)} className="absolute top-10 right-10 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>

                            <div className="mb-10">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3 block italic">Erweiterte Suche</span>
                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Filter</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar grid grid-cols-1 md:grid-cols-3 gap-12">
                                {/* City Column */}
                                <div className="space-y-6">
                                    <h4 className="flex items-center gap-3 text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4">
                                        <MapPin size={16} className="text-blue-500" />
                                        Arbeitsort
                                    </h4>
                                    <div className="space-y-3">
                                        {cities.filter(c => c !== "ALL").map(city => (
                                            <button 
                                                key={city}
                                                onClick={() => toggleFilter(selectedCities, setSelectedCities, city)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                                    selectedCities.includes(city)
                                                        ? "bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-500/10"
                                                        : "bg-white border-slate-100 text-slate-500 hover:border-blue-100"
                                                )}
                                            >
                                                <span className="text-[11px] font-black uppercase tracking-tight">{city}</span>
                                                {selectedCities.includes(city) && <CheckCircle size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Column */}
                                <div className="space-y-6">
                                    <h4 className="flex items-center gap-3 text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4">
                                        <Hash size={16} className="text-blue-500" />
                                        Status
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'ACTIVE', label: 'Aktiv', color: 'bg-green-500' },
                                            { id: 'PASSIV', label: 'Passiv', color: 'bg-slate-300' },
                                            { id: 'GEKUENDIGT', label: 'Gekündigt', color: 'bg-red-500' }
                                        ].map(s => (
                                            <button 
                                                key={s.id}
                                                onClick={() => toggleFilter(selectedStatuses, setSelectedStatuses, s.id)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                                    selectedStatuses.includes(s.id)
                                                        ? "bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-500/10"
                                                        : "bg-white border-slate-100 text-slate-500 hover:border-blue-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-2 h-2 rounded-full", s.color)} />
                                                    <span className="text-[11px] font-black uppercase tracking-tight">{s.label}</span>
                                                </div>
                                                {selectedStatuses.includes(s.id) && <CheckCircle size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Vertrag Column */}
                                <div className="space-y-6">
                                    <h4 className="flex items-center gap-3 text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4">
                                        <Briefcase size={16} className="text-blue-500" />
                                        Vertrag
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'EMPLOYED', label: 'Dienstnehmer' },
                                            { id: 'FREELANCE', label: 'Freier DN' },
                                            { id: 'COMMERCIAL', label: 'SFU (Gewerbe)' }
                                        ].map(t => (
                                            <button 
                                                key={t.id}
                                                onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t.id)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                                    selectedTypes.includes(t.id)
                                                        ? "bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-500/10"
                                                        : "bg-white border-slate-100 text-slate-500 hover:border-blue-100"
                                                )}
                                            >
                                                <span className="text-[11px] font-black uppercase tracking-tight">{t.label}</span>
                                                {selectedTypes.includes(t.id) && <CheckCircle size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center">
                                <button 
                                    onClick={() => {
                                        setSelectedCities([]);
                                        setSelectedStatuses([]);
                                        setSelectedTypes([]);
                                    }}
                                    className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
                                >
                                    Filter zurücksetzen
                                </button>
                                <button 
                                    onClick={() => setShowFiltersModal(false)}
                                    className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-95"
                                >
                                    Ergebnisse anzeigen
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
