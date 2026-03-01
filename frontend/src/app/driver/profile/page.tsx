"use client";

import { useState, useEffect } from "react";
import {
    User,
    ShieldCheck,
    FileText,
    UploadCloud,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Camera,
    Settings,
    Bell,
    CreditCard,
    Briefcase,
    Building2,
    LogOut,
    ArrowLeft,
    X,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";

export default function DriverProfilePage() {
    const [driverInfo, setDriverInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        employmentType: "ECHTER_DIENSTNEHMER" as "ECHTER_DIENSTNEHMER" | "FREIER_DIENSTNEHMER" | "SELBSTSTANDIG",
        joinedDate: "",
        profilePic: null,
        iban: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get("/drivers/me");
            setDriverInfo({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                email: data.user?.email || "",
                phone: data.phone || "",
                address: `${data.street || ""}, ${data.zip || ""} ${data.city || ""}`,
                employmentType: data.type || "ECHTER_DIENSTNEHMER",
                joinedDate: new Date(data.createdAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }),
                profilePic: data.profilePic,
                iban: data.iban || ""
            });
        } catch (e) {
            console.error("Failed to load profile", e);
        } finally {
            setLoading(false);
        }
    };

    const docRequirements = {
        ECHTER_DIENSTNEHMER: [
            { id: "IDENTITY", title: "Lichtbildausweis/Reisepass", status: "VALID", expiry: "12.2025" },
            { id: "LICENSE", title: "Führerschein (Klasse B)", status: "VALID", expiry: "08.2028" },
            { id: "MELDEZETTEL", title: "Meldezettel", status: "EXPIRED", expiry: "01.2024" },
            { id: "OGK_ANMELDUNG", title: "ÖGK Anmeldung", status: "VALID", expiry: null }
        ],
        FREIER_DIENSTNEHMER: [
            { id: "IDENTITY", title: "Lichtbildausweis/Reisepass", status: "VALID", expiry: "12.2025" },
            { id: "LICENSE", title: "Führerschein (Klasse B)", status: "VALID", expiry: "08.2028" },
            { id: "MELDEZETTEL", title: "Meldezettel", status: "VALID", expiry: "01.2025" },
            { id: "SVS_CONFIRMATION", title: "SVS Bestätigung", status: "VALID", expiry: null }
        ],
        SELBSTSTANDIG: [
            { id: "IDENTITY", title: "Lichtbildausweis/Reisepass", status: "VALID", expiry: "12.2025" },
            { id: "LICENSE", title: "Führerschein (Klasse B)", status: "VALID", expiry: "08.2028" },
            { id: "MELDEZETTEL", title: "Meldezettel", status: "VALID", expiry: "01.2025" },
            { id: "GISA_EXTRACT", title: "GISA-Auszug", status: "VALID", expiry: null },
            { id: "SVS_CONFIRMATION", title: "SVS Bestätigung", status: "VALID", expiry: null },
            { id: "TAX_ID", title: "UID / Steuer-ID", status: "VALID", expiry: null }
        ]
    };

    const currentDocs = docRequirements[driverInfo.employmentType];
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);

    const handleUploadClick = (doc: any) => {
        setSelectedDoc(doc);
        setShowUploadModal(true);
    };

    return (
        <div className="p-6 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 bg-slate-50 min-h-screen pb-32 font-sans relative">
            {/* Header */}
            <header className="flex items-center justify-between mb-2">
                <Link href="/driver" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex gap-2">
                    <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition">
                        <Settings size={20} />
                    </button>
                    <button className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-400 hover:text-red-600 transition">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Profile Hero */}
            <div className="flex flex-col items-center text-center">
                <div className="relative group cursor-pointer mb-6">
                    <div className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-blue-500/30 group-hover:scale-105 transition duration-500 group-hover:rotate-3">
                        {driverInfo.firstName[0]}{driverInfo.lastName[0]}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white border-4 border-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-xl group-hover:text-blue-600 transition duration-500">
                        <Camera size={20} />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{driverInfo.firstName} {driverInfo.lastName}</h2>
                <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm",
                    driverInfo.employmentType === "SELBSTSTANDIG" ? "bg-amber-100/50 text-amber-700 border border-amber-200" :
                        driverInfo.employmentType === "FREIER_DIENSTNEHMER" ? "bg-purple-100/50 text-purple-700 border border-purple-200" :
                            "bg-blue-100/50 text-blue-700 border border-blue-200"
                )}>
                    <Briefcase size={10} />
                    {driverInfo.employmentType.replace('_', ' ')}
                </div>
                <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">Dabei seit {driverInfo.joinedDate}</p>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:shadow-lg transition duration-500">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition duration-500">
                        <CreditCard size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Bankverbindung</p>
                        <h4 className="font-bold text-slate-700 leading-none">AT64 1234 **** ****</h4>
                    </div>
                    <ChevronRight size={18} className="text-slate-200 group-hover:translate-x-1 transition duration-500 shrink-0" />
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:shadow-lg transition duration-500">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition duration-500">
                        <Building2 size={20} />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Wohnadresse</p>
                        <h4 className="font-bold text-slate-700 leading-none truncate w-48">{driverInfo.address}</h4>
                    </div>
                    <ChevronRight size={18} className="text-slate-200 group-hover:translate-x-1 transition duration-500 shrink-0" />
                </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-6 pt-6 relative overflow-visible">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Dokumente & Status</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alle Aktuell</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {currentDocs.map((doc: any, i) => (
                        <div
                            key={doc.id}
                            onClick={() => handleUploadClick(doc)}
                            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner",
                                doc.status === "VALID" ? "bg-green-50 text-green-600" : doc.status === "EXPIRED" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                            )}>
                                {doc.status === "VALID" ? <CheckCircle2 size={24} /> : doc.status === "EXPIRED" ? <AlertCircle size={24} /> : <Clock size={24} />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-slate-900 text-base leading-none tracking-tight mb-2">{doc.title}</h4>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full",
                                        doc.status === "VALID" ? "bg-green-100/50 text-green-700" : doc.status === "EXPIRED" ? "bg-red-100/50 text-red-700" : "bg-blue-100/50 text-blue-700"
                                    )}>
                                        {doc.status === "VALID" ? "Gültig" : doc.status === "EXPIRED" ? "Beendet" : "Warten"}
                                    </span>
                                    {doc.expiry && (
                                        <>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exp: {doc.expiry}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition duration-500 rounded-xl flex items-center justify-center">
                                <UploadCloud size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Card */}
            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white overflow-hidden relative group mt-4">
                <div className="relative z-10">
                    <h4 className="text-xl font-black mb-1">Passfoto aktualisieren</h4>
                    <p className="text-blue-100/80 text-xs font-medium max-w-[200px]">Erneuere dein Profilbild für eine bessere Erkennung.</p>
                    <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:scale-105 active:scale-95 transition">
                        Foto Aufnehmen
                    </button>
                </div>
                <Camera className="absolute bottom-[-20px] right-[-20px] text-white/10 group-hover:scale-150 transition duration-1000 group-hover:rotate-12" size={160} />
            </div>

            {/* Logout Footer Section */}
            <div className="pt-10 flex flex-col items-center gap-6">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">QQX Driver Version 1.0.4 - Build 2802</p>
                <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 rounded-[2rem] text-slate-500 font-bold hover:bg-red-50 hover:text-red-500 transition duration-300 shadow-sm active:scale-95">
                    <LogOut size={20} />
                    Abmelden
                </button>
            </div>

            {/* Upload Modal Overlay */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-t-[3rem] sm:rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="absolute top-8 right-8 p-2 bg-slate-50 text-slate-400 hover:text-slate-900 transition rounded-xl"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-3xl font-black text-slate-900 mb-2 leading-none">Upload</h2>
                            <p className="text-slate-500 font-medium mb-8 uppercase text-[10px] tracking-widest font-sans">{selectedDoc?.title}</p>

                            <div className="space-y-8">
                                <div className="p-16 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-300 transition-all duration-500 bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition duration-500 transform group-hover:-rotate-3">
                                        <UploadCloud size={40} />
                                    </div>
                                    <h4 className="font-black text-slate-900 mb-2">Datei auswählen</h4>
                                    <p className="text-xs text-slate-400 font-medium max-w-[180px]">PDF, JPG oder PNG werden unterstützt.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setShowUploadModal(false)} className="py-5 bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl">Abbrechen</button>
                                    <button className="py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
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
