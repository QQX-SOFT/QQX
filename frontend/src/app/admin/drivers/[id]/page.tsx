"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Mail,
    Phone,
    Calendar,
    ShieldCheck,
    FileText,
    Clock,
    CreditCard,
    Star,
    TrendingUp,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Eye,
    Plus,
    X,
    Upload,
    Building2,
    Hash,
    Banknote,
    Power,
    PowerOff,
    Edit,
    Briefcase,
    Stethoscope,
    Globe,
    Euro
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

const formatIBAN = (iban: string) => {
    return iban.replace(/\s+/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim();
};

interface DriverDetails {
    id: string;
    firstName: string;
    lastName: string;
    driverNumber: string | null;
    phone: string | null;
    birthday: string | null;
    type: string;
    status: string;
    walletBalance: number;
    ssn: string | null;
    taxId: string | null;
    street: string | null;
    zip: string | null;
    city: string | null;
    iban: string | null;
    bic: string | null;
    jobTitle: string | null;
    workLocation: string | null;
    citizenship: string | null;
    nationality: string | null;
    employmentStart: string | null;
    employmentEnd: string | null;
    visaExpiry: string | null;
    hasWorkPermit: boolean;
    hourlyWage: number;
    orderFee: number;
    payPerOrder: number | null;
    payPerKm: number | null;
    workStyle: string | null;
    imageUrl: string | null;
    user: {
        email: string;
    };
    documents: any[];
    ratings: any[];
    riderKpis: any[];
}

export default function DriverProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [driver, setDriver] = useState<DriverDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newDoc, setNewDoc] = useState({
        type: 'OTHER',
        title: '',
        fileUrl: '',
        expiryDate: ''
    });

    useEffect(() => {
        fetchDriverDetails();
    }, [params.id]);

    const fetchDriverDetails = async () => {
        try {
            const { data } = await api.get(`/drivers/${params.id}`);
            setDriver(data);
        } catch (error) {
            console.error("Failed to fetch driver details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!driver) return;
        const newStatus = driver.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        try {
            await api.patch(`/drivers/${driver.id}/status`, { status: newStatus });
            fetchDriverDetails();
        } catch (error) {
            alert("Fehler beim Aktualisieren des Status");
        }
    };

    const handleUploadDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            const docData = {
                ...newDoc,
                driverId: params.id,
                fileUrl: newDoc.fileUrl || "https://example.com/placeholder-doc.pdf"
            };
            await api.post('/documents', docData);
            setShowUploadModal(false);
            setNewDoc({ type: 'OTHER', title: '', fileUrl: '', expiryDate: '' });
            fetchDriverDetails();
        } catch (error) {
            alert("Fehler beim Hochladen");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    if (!driver) {
        return (
            <div className="p-12 text-center bg-white rounded-3xl m-6 border border-slate-100 shadow-sm">
                <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
                <h2 className="text-2xl font-black text-slate-900 mb-2">Fahrer nicht gefunden</h2>
                <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline">Zurück zur Liste</button>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Nav Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-4 bg-white border border-slate-100 rounded-[2rem] text-slate-400 hover:text-slate-900 shadow-sm transition active:scale-95">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                             <h1 className="text-4xl font-black text-slate-900 tracking-tight">{driver.firstName} {driver.lastName}</h1>
                             <span className={cn(
                                 "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", 
                                 driver.status === "ACTIVE" ? "bg-green-50 text-green-600" : 
                                 driver.status === "GEKUENDIGT" ? "bg-red-50 text-red-600" :
                                 "bg-slate-100 text-slate-400"
                             )}>
                                 {driver.status === "ACTIVE" ? "Aktiv" : 
                                  driver.status === "GEKUENDIGT" ? "Gekündigt" : 
                                  driver.status === "PASSIV" ? "Passiv" : "Passiv"}
                             </span>
                        </div>
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em]">Rider-ID: {driver.driverNumber || "-"}</p>
                    </div>
                </div>
                <Link href={`/admin/drivers/editor?id=${driver.id}`} className="flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-black transition shadow-xl shadow-slate-200">
                    <Edit size={16} /> Profil bearbeiten
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Profile Card */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[3.5rem] p-10 border border-slate-50 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
                         <div className="absolute top-10 right-10">
                             <button onClick={handleToggleStatus} className={cn(
                                "p-4 rounded-3xl border transition-all", 
                                driver.status === "ACTIVE"
                                     ? "bg-green-50 text-green-600 border-green-100 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100"
                                     : driver.status === "GEKUENDIGT"
                                     ? "bg-red-50 text-red-600 border-red-100 hover:bg-green-50 hover:text-green-600 hover:border-green-100"
                                     : "bg-slate-50 text-slate-300 border-slate-100"
                             )}>
                                {driver.status === "ACTIVE" ? <Power size={24} /> : 
                                 driver.status === "GEKUENDIGT" ? <X size={24} /> :
                                 <PowerOff size={24} />}
                             </button>
                         </div>

                        <div className="w-32 h-32 bg-blue-600 rounded-[3rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-200 mb-8">
                             {driver.firstName[0]}{driver.lastName[0]}
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                <Mail className="text-blue-500" size={20} />
                                <div className="overflow-hidden"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-Mail</p><p className="font-bold text-slate-900 text-sm truncate">{driver.user.email}</p></div>
                            </div>
                            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                <Phone className="text-blue-500" size={20} />
                                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefon</p><p className="font-bold text-slate-900 text-sm">{driver.phone || "-"}</p></div>
                            </div>
                            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                <MapPin className="text-blue-500" size={20} />
                                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anschrift</p><p className="font-bold text-slate-900 text-sm">{driver.street || "-"}, {driver.zip} {driver.city}</p></div>
                            </div>
                        </div>
                    </div>

                     {/* Financial Summary */}
                    <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-200/20">
                         <TrendingUp className="absolute -right-10 -bottom-10 text-white/5" size={250} />
                         <div className="relative z-10 space-y-8">
                             <div>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Gesamtguthaben inkl. Reports</p>
                                <h3 className="text-5xl font-black italic tracking-tighter">
                                    € {(() => {
                                        const totalKpiSalary = (driver.riderKpis || []).reduce((acc, k) => {
                                            const payOrders = k.deliveredOrders * (driver.payPerOrder || driver.orderFee || 0);
                                            const payKm = (k.distanceTotal || 0) * (driver.payPerKm || 0);
                                            return acc + payOrders + payKm;
                                        }, 0);
                                        return (driver.walletBalance + totalKpiSalary).toFixed(2);
                                    })()}
                                </h3>
                             </div>
                             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                 <div><p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1 text-green-400">Stundenlohn</p><p className="font-black text-lg">€ {(driver.hourlyWage || 0).toFixed(2)}</p></div>
                                 <div className="group relative">
                                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1 text-blue-400">Pauschale</p>
                                    <p className="font-black text-lg">€ {(driver.payPerOrder || driver.orderFee || 0).toFixed(2)}</p>
                                 </div>
                             </div>
                             <button className="w-full py-5 bg-blue-600 hover:bg-blue-700 rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition">
                                <CreditCard size={18} /> Auszahlung
                             </button>
                         </div>
                    </div>

                    {/* KPI & Gehalt (Monthly Aggregated) */}
                    {driver.riderKpis && driver.riderKpis.length > 0 && (
                        <div className="bg-white rounded-[3.5rem] p-10 border-2 border-blue-50 shadow-2xl shadow-blue-200/20 space-y-8">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                <div className="flex items-center gap-3">
                                    <Euro className="text-blue-600" size={24} />
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic tracking-tight">Report Abrechnung</h3>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase">Aktuelles Monat</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Delivered</p>
                                    <p className="text-xl font-black text-slate-900">{driver.riderKpis.reduce((acc, k) => acc + k.deliveredOrders, 0)}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Distanz (KM)</p>
                                    <p className="text-xl font-black text-slate-900">{driver.riderKpis.reduce((acc, k) => acc + (k.distanceTotal || 0), 0).toFixed(1)}</p>
                                </div>
                            </div>

                            <div className="p-8 bg-blue-600 rounded-[2.5rem] shadow-xl shadow-blue-200 text-white relative overflow-hidden">
                                <Banknote className="absolute -right-6 -bottom-6 text-white/10" size={120} />
                                <div className="relative z-10">
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Errechneter Verdienst</p>
                                    <h4 className="text-4xl font-black italic tracking-tighter">
                                        € {(() => {
                                            const totalOrders = driver.riderKpis.reduce((acc, k) => acc + k.deliveredOrders, 0);
                                            const totalKm = driver.riderKpis.reduce((acc, k) => acc + (k.distanceTotal || 0), 0);
                                            const payOrders = totalOrders * (driver.payPerOrder || driver.orderFee || 0);
                                            const payKm = totalKm * (driver.payPerKm || 0);
                                            return (payOrders + payKm).toFixed(2);
                                        })()}
                                    </h4>
                                    <div className="mt-4 flex gap-4 opacity-70">
                                        <p className="text-[8px] font-bold uppercase tracking-widest">Rate: €{(driver.payPerOrder || driver.orderFee || 0)}/Order</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                                ANALYTIK ÖFFNEN
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Areas */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Employment Details */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                <Briefcase className="text-blue-600" size={20} />
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Beschäftigung</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl"><span className="text-[10px] font-bold text-slate-400 uppercase">Titel</span><span className="font-black text-slate-900 uppercase">{driver.jobTitle || "-"}</span></div>
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl"><span className="text-[10px] font-bold text-slate-400 uppercase">Region</span><span className="font-black text-slate-900 uppercase text-blue-600">{driver.workLocation || "-"}</span></div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                     <div className="p-4 bg-slate-50 rounded-2xl text-center"><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Eintritt</p><p className="font-black text-xs">{driver.employmentStart ? new Date(driver.employmentStart).toLocaleDateString('de-DE') : "-"}</p></div>
                                     <div className="p-4 bg-slate-50 rounded-2xl text-center"><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Austritt</p><p className="font-black text-xs">{driver.employmentEnd ? new Date(driver.employmentEnd).toLocaleDateString('de-DE') : "-"}</p></div>
                                </div>
                            </div>
                        </div>

                        {/* Legal & Nationality */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8">
                             <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                <Globe className="text-blue-600" size={20} />
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Rechtliches</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl"><Hash className="text-slate-300" size={18} /><div><p className="text-[9px] font-bold text-slate-400 uppercase">SV-Nummer</p><p className="font-black text-slate-900">{driver.ssn || "-"}</p></div></div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl"><Globe className="text-slate-300" size={18} /><div><p className="text-[9px] font-bold text-slate-400 uppercase">Nationalität</p><p className="font-black text-slate-900">{driver.nationality || "-"}</p></div></div>
                                {driver.nationality !== "Österreich" && (
                                     <div className={cn("p-4 rounded-2xl border flex items-center gap-4", driver.hasWorkPermit ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100")}>
                                         <Stethoscope className={driver.hasWorkPermit ? "text-green-600" : "text-red-600"} size={18} />
                                         <div>
                                             <p className={cn("text-[9px] font-black uppercase tracking-widest", driver.hasWorkPermit ? "text-green-600" : "text-red-600")}>Arbeitsbewilligung</p>
                                             <p className="font-black text-xs italic">{driver.visaExpiry ? `Gültig bis: ${new Date(driver.visaExpiry).toLocaleDateString('de-DE')}` : "Nicht vorhanden"}</p>
                                         </div>
                                     </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-6 mb-8">
                             <div className="flex items-center gap-3"><FileText className="text-blue-600" size={20} /><h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Unterlagen & Verträge</h3></div>
                             <button onClick={() => setShowUploadModal(true)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition shadow-sm"><Plus size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {driver.documents.length === 0 ? (
                                <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100"><FileText className="mx-auto text-slate-200 mb-2" size={32} /><p className="text-xs font-bold text-slate-400 uppercase">Warten auf Bilduploads...</p></div>
                             ) : driver.documents.map(doc => (
                                <div key={doc.id} className="p-5 bg-white border border-slate-50 rounded-3xl flex items-center justify-between hover:border-blue-200 transition-all shadow-sm">
                                    <div className="flex items-center gap-4 truncate">
                                        <div className="p-3 bg-slate-50 text-blue-600 rounded-xl"><FileText size={18} /></div>
                                        <div className="truncate"><p className="font-black text-slate-900 text-xs truncate">{doc.title}</p><p className="text-[9px] font-bold text-slate-400 uppercase">{doc.type}</p></div>
                                    </div>
                                    <a href={doc.fileUrl} target="_blank" className="p-2 text-slate-300 hover:text-blue-600 transition"><Eye size={18} /></a>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reuse Modals from existing code or make new ones */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[3rem] p-12 w-full max-w-lg shadow-2xl relative">
                            <button onClick={() => setShowUploadModal(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 transition"><X size={24} /></button>
                            <h2 className="text-3xl font-black text-slate-900 mb-8 italic tracking-tighter uppercase">Dokument hinzufügen</h2>
                            <form onSubmit={handleUploadDoc} className="space-y-6">
                                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Kategorie</label><select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 font-bold" value={newDoc.type} onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}><option value="LICENSE">Führerschein</option><option value="INSURANCE">Versicherung</option><option value="TAX_ID">Steuer</option><option value="BUSINESS_REG">Gewerbe</option><option value="OTHER">Sonstiges</option></select></div>
                                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Bezeichnung</label><input type="text" required placeholder="z.B. Reisepass" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 font-bold" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} /></div>
                                <div className="p-10 border-4 border-dashed border-slate-50 rounded-[2.5rem] text-center hover:bg-blue-50/30 hover:border-blue-100 transition-all cursor-pointer group"><Upload className="mx-auto text-slate-200 group-hover:text-blue-400 transition-colors mb-4" size={40} /><p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Datei hochladen</p></div>
                                <button type="submit" disabled={uploading} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-200 active:scale-95 transition-all">{uploading ? <Loader2 className="animate-spin" size={20} /> : "Dokument speichern"}</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
