import React from 'react';
import { 
    User, 
    Home, 
    CreditCard, 
    ShieldCheck, 
    Briefcase, 
    Calendar,
    Globe,
    Signature,
    AlertCircle,
    FileText
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
                <div className="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden shrink-0">
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
                <div className="flex-1 overflow-y-auto p-12 print:p-0 print:overflow-visible bg-white print:bg-white" id="printable-sheet">
                    <div className="max-w-[21cm] mx-auto space-y-8 text-slate-900 font-sans border border-slate-200 p-10 rounded-sm">
                        
                        {/* Header Section */}
                        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
                            <div className="space-y-1">
                                <h1 className="text-4xl font-black tracking-tight uppercase">Personalblatt</h1>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stammdaten zur Personalverwaltung</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mandant</p>
                                <p className="text-sm font-black uppercase">QQX SOFT LOGISTICS</p>
                                <p className="text-[10px] font-medium text-slate-400">Stand: {new Date().toLocaleDateString('de-DE')}</p>
                            </div>
                        </div>

                        {/* Employee Status Table Style */}
                        <div className="grid grid-cols-2 border border-slate-900">
                            <div className="border-r border-b border-slate-900 p-3 bg-slate-50/50">
                                <p className="text-[9px] font-black uppercase tracking-widest">Persönliche Daten</p>
                            </div>
                            <div className="border-b border-slate-900 p-3 bg-slate-50/50">
                                <p className="text-[9px] font-black uppercase tracking-widest">Kontaktdaten</p>
                            </div>
                            
                            {/* Left Col: Personal */}
                            <div className="border-r border-slate-900 p-4 space-y-3">
                                <LabelValue label="Familienname" value={app.lastName} />
                                <LabelValue label="Vorname" value={app.firstName} />
                                <LabelValue label="Geburtsdatum" value={app.birthday ? new Date(app.birthday).toLocaleDateString('de-DE') : '___'} />
                                <LabelValue label="Geburtsort" value={app.placeOfBirth} />
                                <LabelValue label="Staatsbürgerschaft" value={app.nationality} />
                                <LabelValue label="Familienstand" value={app.maritalStatus} />
                                <LabelValue label="Religionszugehörigkeit" value={app.religion} />
                            </div>

                            {/* Right Col: Contact */}
                            <div className="p-4 space-y-3">
                                <LabelValue label="Straße / Nr." value={app.street} />
                                <LabelValue label="PLZ / Ort" value={`${app.zip} ${app.city}`} />
                                <LabelValue label="Arbeitsort" value={app.city} />
                                <LabelValue label="Telefon" value={app.phone} />
                                <LabelValue label="E-Mail" value={app.email} />
                                <LabelValue label="SV-Nummer" value={app.ssn} />
                            </div>
                        </div>

                        {/* Bank & Legal */}
                        <div className="grid grid-cols-2 border-x border-b border-slate-900">
                            <div className="border-r border-slate-900 p-4 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-tighter border-b border-slate-100 pb-1 mb-2">Bankverbindung</p>
                                <LabelValue label="IBAN" value={app.iban} mono />
                                <LabelValue label="BIC / SWIFT" value={app.bic} mono />
                            </div>
                            <div className="p-4 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-tighter border-b border-slate-100 pb-1 mb-2">Rechtliches</p>
                                <LabelValue label="UID / Steuernummer" value={app.taxId} />
                                <LabelValue label="GISA-Zahl" value={app.gisaNumber} />
                                <LabelValue label="Arbeitsbewilligung" value={app.hasWorkPermit ? "JA" : "NEIN"} badge={app.hasWorkPermit ? "green" : "red"} />
                                <LabelValue label="Visum Ablaufdatum" value={app.visaExpiry ? new Date(app.visaExpiry).toLocaleDateString('de-DE') : 'N/A'} />
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="grid grid-cols-3 border-x border-b border-slate-900">
                            <div className="border-r border-slate-900 p-4 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-tighter border-b border-slate-100 pb-1 mb-2">Beschäftigung</p>
                                <LabelValue label="Modell" value={app.employmentModel || 'Bestellbasis'} />
                                <LabelValue label="Art" value={app.employmentType?.replace('_', ' ')} />
                                <LabelValue label="Position" value="Rider / Fahrradkurier" />
                            </div>
                            <div className="border-r border-slate-900 p-4 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-tighter border-b border-slate-100 pb-1 mb-2">Vergütung</p>
                                <LabelValue label="Stundenlohn" value={app.hourlyWage ? `${app.hourlyWage} €` : '---'} />
                                <LabelValue label="Bestellgebühr" value={app.orderFee ? `${app.orderFee} €` : '---'} />
                                <LabelValue label="KM-Geld" value={app.kmMoney ? `${app.kmMoney} €` : '---'} />
                            </div>
                            <div className="p-4 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-tighter border-b border-slate-100 pb-1 mb-2">Zeitraum</p>
                                <LabelValue label="Eintritt" value={app.joinDate ? new Date(app.joinDate).toLocaleDateString('de-DE') : new Date().toLocaleDateString('de-DE')} />
                                <LabelValue label="Austritt" value={app.endDate ? new Date(app.endDate).toLocaleDateString('de-DE') : 'unbefristet'} />
                            </div>
                        </div>

                        {/* Notice */}
                        <div className="p-6 bg-slate-50 border-x border-b border-slate-900 flex gap-4 items-start">
                             <div className="p-2 bg-slate-200 rounded text-slate-600 shrink-0"><AlertCircle size={16} /></div>
                             <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">
                                Der Dienstnehmer verpflichtet sich, Änderungen der persönlichen Daten (Wohnsitz, Familienstand, Bankverbindung etc.) sowie Änderungen der Arbeitsbewilligung oder des Visums-Status unverzüglich dem Arbeitgeber zu melden. Alle Angaben basieren auf der Selbstauskunft des Bewerbers.
                             </p>
                        </div>

                        {/* Signature Section */}
                        <div className="pt-24 grid grid-cols-2 gap-20">
                            <div className="space-y-16">
                                <div className="border-b-2 border-slate-900 w-full" />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Arbeitgeber</p>
                                    <p className="text-[9px] font-medium text-slate-400 italic">Datum, Unterschrift</p>
                                </div>
                            </div>
                            <div className="space-y-16">
                                <div className="border-b-2 border-slate-900 w-full" />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Dienstnehmer</p>
                                    <p className="text-[9px] font-medium text-slate-400 italic">Datum, Unterschrift</p>
                                </div>
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
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}

function LabelValue({ label, value, mono, badge }: { label: string, value?: string, mono?: boolean, badge?: 'green' | 'red' }) {
    return (
        <div className="grid grid-cols-3 gap-2 items-baseline text-left">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter col-span-1">{label}:</span>
            <div className="col-span-2">
                {badge ? (
                    <span className={cn(
                        "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase",
                        badge === 'green' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                        {value || '---'}
                    </span>
                ) : (
                    <span className={cn(
                        "text-[10px] font-bold text-slate-900 tabular-nums uppercase break-words",
                        mono && "font-mono text-[9px] tracking-tighter"
                    )}>
                        {value || '___'}
                    </span>
                )}
            </div>
        </div>
    );
}
