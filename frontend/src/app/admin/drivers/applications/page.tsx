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
    Trash2,
    Edit2,
    Save,
    X,
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
    
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/applications");
            setApplications(data);
            if (selectedApp) {
                const updated = data.find((a: any) => a.id === selectedApp.id);
                if (updated) setSelectedApp(updated);
            }
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

    const deleteApplication = async (id: string) => {
        if (!confirm("Bewerbung wirklich unwiderruflich löschen?")) return;
        try {
            setProcessing(true);
            await api.delete(`/applications/${id}`);
            fetchApplications();
            setSelectedApp(null);
        } catch (e) {
            alert("Fehler beim Löschen");
        } finally {
            setProcessing(false);
        }
    }

    const startEditing = () => {
        setEditForm({ ...selectedApp });
        setIsEditing(true);
    };

    const saveEdit = async () => {
        try {
            setProcessing(true);
            const { data } = await api.put(`/applications/${selectedApp.id}`, editForm);
            setIsEditing(false);
            fetchApplications();
        } catch (e: any) {
            alert(e.response?.data?.error || "Fehler beim Speichern");
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
                            onClick={() => { setSelectedApp(app); setIsEditing(false); }}
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
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.employmentType?.replace('_', ' ')}</span>
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
                                            <h2 className="text-2xl font-black text-slate-900">
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        <input 
                                                          className="bg-slate-50 border-none rounded-lg px-2 py-1 text-xl font-black w-32 focus:ring-2 ring-blue-500" 
                                                          value={editForm.firstName} 
                                                          onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                                                        />
                                                        <input 
                                                          className="bg-slate-50 border-none rounded-lg px-2 py-1 text-xl font-black w-32 focus:ring-2 ring-blue-500" 
                                                          value={editForm.lastName} 
                                                          onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                                                        />
                                                    </div>
                                                ) : `${selectedApp.firstName} ${selectedApp.lastName}`}
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedApp.employmentType}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="text-xs font-bold text-slate-400">Eingegangen am {new Date(selectedApp.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {selectedApp.hasWorkPermit ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm leading-none">
                                                <BadgeCheck size={14} />
                                                Arbeitsbewilligung: Ja
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm leading-none">
                                                <AlertCircle size={14} />
                                                Arbeitsbewilligung: Nein
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <button 
                                                onClick={() => setIsEditing(false)}
                                                className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition"
                                            >
                                                <X size={20} />
                                            </button>
                                            <button 
                                                onClick={saveEdit}
                                                disabled={processing}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {processing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                                Speichern
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                              onClick={() => deleteApplication(selectedApp.id)}
                                              className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
                                              title="Löschen"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                            <button 
                                              onClick={startEditing}
                                              className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                                              title="Bearbeiten"
                                            >
                                                <Edit2 size={20} />
                                            </button>
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
                                                      title="Ablehnen"
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
                                            <EditableField isEditing={isEditing} value={editForm?.email} label={selectedApp.email} onChange={v => setEditForm({...editForm, email: v})} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={18} className="text-slate-300" />
                                            <EditableField isEditing={isEditing} value={editForm?.phone} label={selectedApp.phone || 'N/A'} onChange={v => setEditForm({...editForm, phone: v})} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin size={18} className="text-slate-300" />
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1 w-full">
                                                    <input className="bg-slate-50 border-none rounded-lg px-2 py-1 text-sm font-bold w-full" value={editForm.street} onChange={e => setEditForm({...editForm, street: e.target.value})} placeholder="Straße" />
                                                    <div className="flex gap-2">
                                                        <input className="bg-slate-50 border-none rounded-lg px-2 py-1 text-sm font-bold w-20" value={editForm.zip} onChange={e => setEditForm({...editForm, zip: e.target.value})} placeholder="PLZ" />
                                                        <input className="bg-slate-50 border-none rounded-lg px-2 py-1 text-sm font-bold flex-1" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} placeholder="Ort" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-bold text-slate-700">{selectedApp.street}, {selectedApp.zip} {selectedApp.city}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                 <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Rechtliches & Bank</h4>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Geburtsdatum</p>
                                                <EditableField isEditing={isEditing} value={editForm?.birthday} label={selectedApp.birthday ? new Date(selectedApp.birthday).toLocaleDateString() : 'N/A'} onChange={v => setEditForm({...editForm, birthday: v})} type="date" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Geburtsort</p>
                                                <EditableField isEditing={isEditing} value={editForm?.placeOfBirth} label={selectedApp.placeOfBirth || 'N/A'} onChange={v => setEditForm({...editForm, placeOfBirth: v})} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Staatsbürgerschaft</p>
                                                <EditableField isEditing={isEditing} value={editForm?.nationality} label={selectedApp.nationality || 'N/A'} onChange={v => setEditForm({...editForm, nationality: v})} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Familienstand</p>
                                                <EditableField isEditing={isEditing} value={editForm?.maritalStatus} label={selectedApp.maritalStatus || 'N/A'} onChange={v => setEditForm({...editForm, maritalStatus: v})} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Religionszugehörigkeit</p>
                                            <EditableField isEditing={isEditing} value={editForm?.religion} label={selectedApp.religion || 'N/A'} onChange={v => setEditForm({...editForm, religion: v})} />
                                        </div>
                                        <div className="flex items-center gap-3 pt-2">
                                            <ShieldCheck size={18} className="text-slate-300" />
                                            <EditableField isEditing={isEditing} value={editForm?.ssn} label={`SSN: ${selectedApp.ssn || 'N/A'}`} onChange={v => setEditForm({...editForm, ssn: v})} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} className="text-slate-300" />
                                            <EditableField isEditing={isEditing} value={editForm?.taxId} label={`UID: ${selectedApp.taxId || 'N/A'}`} onChange={v => setEditForm({...editForm, taxId: v})} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                             <CreditCard size={18} className="text-slate-300" />
                                             {isEditing ? (
                                                <div className="flex flex-col gap-1 w-full">
                                                    <input className="bg-slate-50 border-none rounded-lg px-2 py-1 text-[10px] font-mono font-bold w-full" value={editForm.iban} onChange={e => setEditForm({...editForm, iban: e.target.value})} placeholder="IBAN" />
                                                    <input className="bg-slate-50 border-none rounded-lg px-2 py-1 text-[10px] font-mono font-bold w-full" value={editForm.bic} onChange={e => setEditForm({...editForm, bic: e.target.value})} placeholder="BIC" />
                                                </div>
                                             ) : (
                                                <span className="text-xs font-mono font-bold text-slate-600">{selectedApp.iban} / {selectedApp.bic}</span>
                                             )}
                                        </div>
                                    </div>
                                 </div>
                             </div>

                             {/* Compensation Section */}
                             <div className="space-y-6 pt-6 border-t border-slate-50">
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Konditionen & Timeline</h4>
                                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                     <div className="space-y-1">
                                         <p className="text-[9px] font-black text-slate-400 uppercase">Modell</p>
                                         <EditableField isEditing={isEditing} value={editForm?.employmentModel} label={selectedApp.employmentModel || 'Bestellbasis'} onChange={v => setEditForm({...editForm, employmentModel: v})} />
                                     </div>
                                     <div className="space-y-1">
                                         <p className="text-[9px] font-black text-slate-400 uppercase">Stundenlohn</p>
                                         <EditableField isEditing={isEditing} value={editForm?.hourlyWage} label={`${selectedApp.hourlyWage || 0} €`} onChange={v => setEditForm({...editForm, hourlyWage: Number(v)})} type="number" />
                                     </div>
                                     <div className="space-y-1">
                                         <p className="text-[9px] font-black text-slate-400 uppercase">Bestellgebühr</p>
                                         <EditableField isEditing={isEditing} value={editForm?.orderFee} label={`${selectedApp.orderFee || 0} €`} onChange={v => setEditForm({...editForm, orderFee: Number(v)})} type="number" />
                                     </div>
                                     <div className="space-y-1">
                                         <p className="text-[9px] font-black text-slate-400 uppercase">KM-Geld</p>
                                         <EditableField isEditing={isEditing} value={editForm?.kmMoney} label={`${selectedApp.kmMoney || 0} €`} onChange={v => setEditForm({...editForm, kmMoney: Number(v)})} type="number" />
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

function EditableField({ isEditing, value, label, onChange, type = "text" }: { isEditing: boolean, value: any, label: string, onChange: (v: string) => void, type?: string }) {
    if (!isEditing) return <span className="text-sm font-bold text-slate-700">{label}</span>;
    return (
        <input 
            type={type}
            className="bg-slate-50 border-none rounded-lg px-2 py-1 text-sm font-bold flex-1 w-full focus:ring-2 ring-blue-500" 
            value={value || ''} 
            onChange={e => onChange(e.target.value)}
        />
    );
}
