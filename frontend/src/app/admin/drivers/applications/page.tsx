"use client";

import React, { useState, useEffect } from "react";
import { 
    Loader2, 
    FileText, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ChevronRight,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Search,
    Filter,
    ShieldCheck,
    CreditCard,
    ArrowLeft,
    ExternalLink,
    FileSearch,
    BadgeCheck,
    AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import PersonalStammdatenSheet from "@/components/PersonalStammdatenSheet";

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [showStammdaten, setShowStammdaten] = useState(false);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/applications");
            setApplications(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            setProcessing(true);
            await api.patch(`/applications/${id}/status`, { status });
            fetchApplications();
            setSelectedApp(null);
        } catch (e) {
            alert("Fehler beim Aktualisieren");
        } finally {
            setProcessing(false);
        }
    };

    const convertToDriver = async (app: any) => {
        try {
            setProcessing(true);
            const { data } = await api.post(`/applications/${app.id}/approve`);
            
            alert(`Fahrer wurde erfolgreich erstellt! Temporäres Passwort: ${data.tempPassword}`);
            fetchApplications();
            setSelectedApp(null);
        } catch (e: any) {
            alert(e.response?.data?.error || "Fehler beim Konvertieren");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fahrer-Bewerbungen</h1>
                   <p className="text-slate-500 font-medium">Verwalten Sie eingehende Bewerbungen von interessierten Fahrern.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-1 space-y-4">
                    {applications.length === 0 && (
                        <div className="bg-white p-12 rounded-[2.5rem] text-center border border-dashed border-slate-200">
                           <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Keine Bewerbungen</p>
                        </div>
                    )}
                    {applications.map((app) => (
                        <button
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className={cn(
                                "w-full text-left p-6 rounded-[2rem] border transition-all duration-300",
                                selectedApp?.id === app.id 
                                    ? "bg-white border-blue-600 shadow-xl shadow-blue-500/10 scale-[1.02]" 
                                    : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    app.status === "PENDING" ? "bg-amber-50 text-amber-600" :
                                    app.status === "APPROVED" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                )}>
                                    {app.status === "PENDING" ? "WARTEND" : app.status === "APPROVED" ? "BESTÄTIGT" : "ABGELEHNT"}
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                    {new Date(app.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-black text-slate-900">{app.firstName} {app.lastName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Briefcase size={12} className="text-slate-300" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.employmentType.replace('_', ' ')}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Details */}
                <div className="lg:col-span-2">
                    {selectedApp ? (
                        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl space-y-10 animate-in slide-in-from-right-4 duration-500">
                             <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white font-black text-2xl">
                                        {selectedApp.firstName[0]}
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900">{selectedApp.firstName} {selectedApp.lastName}</h2>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedApp.employmentType}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="text-xs font-bold text-slate-400">Eingegangen am {new Date(selectedApp.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {selectedApp.hasWorkPermit ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                                                <BadgeCheck size={14} />
                                                Arbeitsbewilligung: Ja
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm">
                                                <AlertCircle size={14} />
                                                Arbeitsbewilligung: Nein
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                      onClick={() => setShowStammdaten(true)}
                                      className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-lg shadow-black/20 flex items-center gap-2"
                                    >
                                        <FileSearch size={16} />
                                        Vorschau Stammdaten
                                    </button>
                                    {selectedApp.status === "PENDING" && (
                                        <>
                                            <button 
                                              onClick={() => updateStatus(selectedApp.id, "REJECTED")}
                                              className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                            <button 
                                              onClick={() => convertToDriver(selectedApp)}
                                              disabled={processing || !selectedApp.hasWorkPermit}
                                              className="px-6 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-500/20 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {processing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                                Bestätigen & Erstellen
                                            </button>
                                        </>
                                    )}
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Kontaktdaten</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Mail size={18} className="text-slate-300" />
                                            <span className="text-sm font-bold text-slate-700">{selectedApp.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={18} className="text-slate-300" />
                                            <span className="text-sm font-bold text-slate-700">{selectedApp.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin size={18} className="text-slate-300" />
                                            <span className="text-sm font-bold text-slate-700">{selectedApp.street}, {selectedApp.zip} {selectedApp.city}</span>
                                        </div>
                                    </div>
                                </div>

                                 <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Rechtliches & Bank</h4>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Geburtsdatum</p>
                                                <p className="text-sm font-bold text-slate-700">{selectedApp.birthday ? new Date(selectedApp.birthday).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Geburtsort</p>
                                                <p className="text-sm font-bold text-slate-700">{selectedApp.placeOfBirth || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Staatsbürgerschaft</p>
                                                <p className="text-sm font-bold text-slate-700">{selectedApp.nationality || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Familienstand</p>
                                                <p className="text-sm font-bold text-slate-700">{selectedApp.maritalStatus || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Religionszugehörigkeit</p>
                                            <p className="text-sm font-bold text-slate-700">{selectedApp.religion || 'N/A'}</p>
                                        </div>
                                        <div className="flex items-center gap-3 pt-2">
                                            <ShieldCheck size={18} className="text-slate-300" />
                                            <span className="text-sm font-bold text-slate-700">SSN: {selectedApp.ssn || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} className="text-slate-300" />
                                            <span className="text-sm font-bold text-slate-700">UID: {selectedApp.taxId || 'N/A'}</span>
                                        </div>
                                        {selectedApp.gisaNumber && (
                                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                                <p className="text-[9px] font-black text-blue-400 uppercase mb-1">GISA-Zahl</p>
                                                <p className="text-sm font-black text-blue-700">{selectedApp.gisaNumber}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <CreditCard size={18} className="text-slate-300" />
                                            <span className="text-xs font-mono font-bold text-slate-600">{selectedApp.iban} / {selectedApp.bic}</span>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             {/* Documents Section */}
                             <div className="space-y-6 pt-6 border-t border-slate-50">
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Hochgeladene Dokumente</h4>
                                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                     {[
                                         { id: "idCardUrl", label: "Passport" },
                                         { id: "licenseUrl", label: "Führerschein B" },
                                         { id: "meldezettelUrl", label: "Meldezettel" },
                                         { id: "eCardUrl", label: "eCard" },
                                         { id: "greyCardUrl", label: "Graue Karte" },
                                         { id: "businessRegUrl", label: "Gewerbeschein" },
                                         { id: "gisaExtractUrl", label: "GISA-Auszug" },
                                         { id: "svsConfirmationUrl", label: "SVS Bestätigung" }
                                     ].filter(doc => selectedApp[doc.id]).map(doc => (
                                         <a 
                                           key={doc.id}
                                           href={selectedApp[doc.id]} 
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition group"
                                         >
                                             <div className="flex items-center gap-3">
                                                 <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm"><FileSearch size={16} /></div>
                                                 <span className="text-[10px] font-black uppercase text-slate-600">{doc.label}</span>
                                             </div>
                                             <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-600 transition" />
                                         </a>
                                     ))}
                                 </div>
                             </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Wählen Sie eine Bewerbung aus</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Stammdaten Modal */}
            {showStammdaten && selectedApp && (
                <PersonalStammdatenSheet 
                    app={selectedApp} 
                    onClose={() => setShowStammdaten(false)} 
                />
            )}
        </div>
    );
}
