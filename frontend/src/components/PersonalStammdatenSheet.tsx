import React from 'react';
import { 
    User, 
    Home, 
    CreditCard, 
    ShieldCheck, 
    Briefcase, 
    Calendar,
    Globe,
    Signature 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalStammdatenSheetProps {
    app: any;
    onClose: () => void;
}

export default function PersonalStammdatenSheet({ app, onClose }: PersonalStammdatenSheetProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                {/* Header / Toolbar */}
                <div className="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-xl text-white"><FileText size={18} /></div>
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Personalstammdatenblatt - Vorschau</h2>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition"
                        >
                            Schließen
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                        >
                            Drucken / PDF
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="flex-1 overflow-y-auto p-12 print:p-0 print:overflow-visible bg-white" id="printable-sheet">
                    <div className="max-w-[21cm] mx-auto space-y-12 text-slate-900 font-sans">
                        
                        {/* Letterhead */}
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black tracking-tighter uppercase">Personalstammdaten</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">QQX Logistics Management • Austria</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold bg-slate-100 px-4 py-2 rounded-lg">Erstellt am {new Date().toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Grid Content */}
                        <div className="grid grid-cols-2 gap-x-16 gap-y-12">
                            
                            {/* Personal Details */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                                    <User size={14} className="text-slate-400" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Persönliche Daten</h3>
                                </div>
                                <div className="space-y-4">
                                    <Field label="Nachname" value={app.lastName} />
                                    <Field label="Vorname" value={app.firstName} />
                                    <Field label="Geburtsdatum" value={app.birthday ? new Date(app.birthday).toLocaleDateString() : ''} />
                                    <Field label="Geburtsort" value={app.placeOfBirth} />
                                    <Field label="Staatsbürgerschaft" value={app.nationality} />
                                    <Field label="Religionszugehörigkeit" value={app.religion} />
                                    <Field label="Familienstand" value={app.maritalStatus} />
                                </div>
                            </div>

                            {/* Contact & Address */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                                    <Home size={14} className="text-slate-400" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anschrift & Kontakt</h3>
                                </div>
                                <div className="space-y-4">
                                    <Field label="Straße / Hausnr." value={app.street} />
                                    <Field label="PLZ / Ort" value={`${app.zip} ${app.city}`} />
                                    <Field label="E-Mail" value={app.email} />
                                    <Field label="Telefon" value={app.phone} />
                                </div>
                            </div>

                            {/* Legal & Finance */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                                    <ShieldCheck size={14} className="text-slate-400" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Behörden & Finanzen</h3>
                                </div>
                                <div className="space-y-4">
                                    <Field label="SV-Nummer (SSN)" value={app.ssn} />
                                    <Field label="UID-Nummer" value={app.taxId} />
                                    <Field label="GISA-Zahl" value={app.gisaNumber} />
                                    <Field label="Beschäftigungsart" value={app.employmentType?.replace('_', ' ')} />
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                                    <CreditCard size={14} className="text-slate-400" />
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bankverbindung</h3>
                                </div>
                                <div className="space-y-4">
                                    <Field label="IBAN" value={app.iban} />
                                    <Field label="BIC" value={app.bic} />
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                             <div className="flex items-center gap-3 mb-2">
                                <Briefcase size={14} className="text-slate-400" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eintritt & Sonstiges</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <Field label="Eintrittsdatum" value={new Date().toLocaleDateString()} />
                                <Field label="Arbeitsbewilligung vorhanden" value={app.hasWorkPermit ? "Ja" : "Nein"} />
                            </div>
                        </div>

                        {/* Signature Section */}
                        <div className="pt-20 grid grid-cols-2 gap-16">
                            <div className="space-y-12">
                                <div className="border-b border-slate-900 h-10 w-full" />
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Unterschrift Arbeitgeber</p>
                            </div>
                            <div className="space-y-12 text-right">
                                <div className="border-b border-slate-900 h-10 w-full" />
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Unterschrift Dienstnehmer</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    header, footer, nav, button, .print\\:hidden {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    #printable-sheet {
                        display: block !important;
                        height: auto !important;
                        overflow: visible !important;
                        padding: 2cm !important;
                    }
                }
            `}</style>
        </div>
    );
}

function Field({ label, value }: { label: string, value?: string }) {
    return (
        <div className="space-y-1">
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
            <p className="text-sm font-black text-slate-900 tabular-nums border-b border-slate-50 pb-1">{value || '---'}</p>
        </div>
    );
}

function FileText(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    );
}
