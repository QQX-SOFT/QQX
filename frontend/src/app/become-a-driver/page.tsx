"use client";

import React, { useState } from "react";
import { 
    Loader2, 
    CheckCircle2, 
    ArrowRight, 
    Car, 
    ShieldCheck, 
    FileText, 
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Briefcase,
    Upload,
    FileCheck
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function BecomeADriverPage() {
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthday: "",
        employmentType: "ECHTER_DIENSTNEHMER",
        street: "",
        zip: "",
        city: "",
        ssn: "",
        taxId: "",
        gisaNumber: "",
        iban: "",
        bic: "",
        idCardUrl: "",
        licenseUrl: "",
        meldezettelUrl: "",
        gisaExtractUrl: "",
        svsConfirmationUrl: "",
        businessRegUrl: "",
        acceptedTerms: false,
    });

    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingField(field);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const { data } = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFormData(prev => ({ ...prev, [field]: data.url }));
        } catch (e) {
            alert("Upload fehlgeschlagen.");
        } finally {
            setUploadingField(null);
        }
    };

    const docRequirements: any = {
        ECHTER_DIENSTNEHMER: [
            { id: "idCardUrl", label: "Lichtbildausweis / Passport" },
            { id: "licenseUrl", label: "Führerschein (Klasse B)" },
            { id: "meldezettelUrl", label: "Meldezettel" }
        ],
        FREIER_DIENSTNEHMER: [
            { id: "idCardUrl", label: "Lichtbildausweis / Passport" },
            { id: "licenseUrl", label: "Führerschein (Klasse B)" },
            { id: "meldezettelUrl", label: "Meldezettel" },
            { id: "svsConfirmationUrl", label: "SVS Bestätigung" }
        ],
        SELBSTSTANDIG: [
            { id: "idCardUrl", label: "Lichtbildausweis / Passport" },
            { id: "licenseUrl", label: "Führerschein (Klasse B)" },
            { id: "meldezettelUrl", label: "Meldezettel" },
            { id: "gisaExtractUrl", label: "GISA-Auszug" },
            { id: "svsConfirmationUrl", label: "SVS Bestätigung" },
            { id: "businessRegUrl", label: "Gewerbeschein" }
        ]
    };

    const [checkingGisa, setCheckingGisa] = useState(false);
    const [gisaResult, setGisaResult] = useState<any>(null);

    const [checkingVat, setCheckingVat] = useState(false);
    const [vatResult, setVatResult] = useState<any>(null);

    const checkVat = async () => {
        if (!formData.taxId) return alert("UID-Nummer fehlt!");
        setCheckingVat(true);
        try {
            const { data } = await api.post("/vat/validate", { vatNumber: formData.taxId });
            setVatResult(data);
        } catch (e) {
            setVatResult({ valid: false });
        } finally {
            setCheckingVat(false);
        }
    };

    const checkGisa = async () => {
        if (!formData.gisaNumber) return alert("GISA-Zahl fehlt!");
        setCheckingGisa(true);
        try {
            const { data } = await api.post("/gisa/validate", { 
                gisaNumber: formData.gisaNumber,
                name: formData.lastName || formData.firstName 
            });
            setGisaResult(data);
        } catch (e) {
            setGisaResult({ valid: false });
        } finally {
            setCheckingGisa(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/applications", formData);
            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            alert("Fehler beim Senden der Bewerbung.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
                <div className="max-w-xl w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="text-green-500" size={48} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Bewerbung gesendet!</h1>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Vielen Dank für Ihr Interesse! Wir haben Ihre Unterlagen erhalten und werden diese umgehend prüfen. 
                            Unser Team wird sich in Kürze per E-Mail bei Ihnen melden.
                        </p>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition shadow-xl"
                    >
                        Zurück zur Startseite
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <header className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                        <Car size={14} />
                        Join the Fleet
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Fahrer werden</h1>
                    <p className="text-slate-500 font-medium max-w-lg mx-auto">Starten Sie Ihre Karriere bei QQX. Füllen Sie das Formular aus und wir melden uns bei Ihnen.</p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-8 lg:p-16 border border-slate-200 shadow-2xl space-y-12">
                    {/* Employment Type Selector */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-xl"><Briefcase size={18} className="text-white" /></div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Wählen Sie Ihren Vertragstyp</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { id: "ECHTER_DIENSTNEHMER", label: "Dienstnehmer", sub: "Geregeltes Dienstverhältnis" },
                                { id: "FREIER_DIENSTNEHMER", label: "Freier Dienstnehmer", sub: "Selbstständige Basis" },
                                { id: "SELBSTSTANDIG", label: "Unternehmer (SFU)", sub: "Eigener Gewerbeschein" }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, employmentType: type.id })}
                                    className={cn(
                                        "p-6 rounded-[2rem] border-2 text-left transition-all duration-300",
                                        formData.employmentType === type.id 
                                            ? "border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/10 ring-4 ring-blue-500/5 scale-[1.02]" 
                                            : "border-slate-100 bg-white hover:border-slate-200"
                                    )}
                                >
                                    <p className={cn("font-black text-sm uppercase mb-1", formData.employmentType === type.id ? "text-blue-600" : "text-slate-900")}>{type.label}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">{type.sub}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Personal Info */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl"><User size={18} className="text-white" /></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Persönliche Informationen</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Vorname" required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                    <input placeholder="Nachname" required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-5 text-slate-300" size={18} />
                                    <input type="email" placeholder="E-Mail Adresse" required className="w-full bg-slate-50 p-5 pl-14 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-5 text-slate-300" size={18} />
                                    <input placeholder="Telefonnummer" required className="w-full bg-slate-50 p-5 pl-14 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <input type="date" placeholder="Geburtsdatum" required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold text-slate-500 uppercase text-[10px] tracking-widest" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} />
                            </div>
                        </section>

                        {/* Address */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl"><MapPin size={18} className="text-white" /></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Anschrift</h3>
                            </div>
                            <div className="space-y-4">
                                <input placeholder="Straße / Hausnummer" className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="PLZ" className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                                    <input placeholder="Stadt" className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Legal & Bank */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl"><FileText size={18} className="text-white" /></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Rechtliches</h3>
                            </div>
                            <div className="space-y-4">
                                {(formData.employmentType === "ECHTER_DIENSTNEHMER" || formData.employmentType === "FREIER_DIENSTNEHMER") && (
                                    <input placeholder="SV-Nummer (SSN)" required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.ssn} onChange={e => setFormData({ ...formData, ssn: e.target.value })} />
                                )}
                                {(formData.employmentType === "SELBSTSTANDIG" || formData.employmentType === "FREIER_DIENSTNEHMER") && (
                                    <div className="space-y-6">
                                        {/* UID Section */}
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">UID-Nummer (Steuer-ID)</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    placeholder="ATU..." 
                                                    className="flex-1 bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" 
                                                    value={formData.taxId} 
                                                    onChange={e => setFormData({ ...formData, taxId: e.target.value.toUpperCase() })} 
                                                />
                                                <button type="button" onClick={checkVat} disabled={checkingVat} className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition">
                                                    {checkingVat ? <Loader2 className="animate-spin" size={16} /> : "UID Prüfen"}
                                                </button>
                                            </div>
                                            {vatResult && (
                                                <div className={cn("p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest", vatResult.valid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200")}>
                                                    {vatResult.valid ? `✓ UID Gültig: ${vatResult.name}` : "✗ UID ungültig"}
                                                </div>
                                            )}
                                        </div>

                                        {/* GISA Section */}
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">GISA-Zahl</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    placeholder="GISA-Zahl" 
                                                    className="flex-1 bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" 
                                                    value={formData.gisaNumber} 
                                                    onChange={e => setFormData({ ...formData, gisaNumber: e.target.value })} 
                                                />
                                                <button type="button" onClick={checkGisa} disabled={checkingGisa} className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition">
                                                    {checkingGisa ? <Loader2 className="animate-spin" size={16} /> : "GISA Prüfen"}
                                                </button>
                                            </div>
                                            {gisaResult && (
                                                <div className={cn("p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest", gisaResult.valid ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-700 border-red-200")}>
                                                    {gisaResult.valid ? `✓ GISA Aktiv: ${gisaResult.name}` : "✗ GISA nicht gefunden"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl"><CreditCard size={18} className="text-white" /></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Bankverbindung</h3>
                            </div>
                            <div className="space-y-4">
                                <input placeholder="IBAN" required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-mono font-bold" value={formData.iban} onChange={e => setFormData({ ...formData, iban: e.target.value.toUpperCase() })} />
                                <input placeholder="BIC" className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-mono font-bold" value={formData.bic} onChange={e => setFormData({ ...formData, bic: e.target.value.toUpperCase() })} />
                            </div>
                        </section>
                    </div>

                    {/* Documents Upload Section */}
                    <section className="space-y-6 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-xl"><Upload size={18} className="text-white" /></div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Geforderte Dokumente (PDF / Foto)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {docRequirements[formData.employmentType].map((doc: any) => (
                                <div key={doc.id} className={cn(
                                    "p-6 rounded-[2rem] border-2 transition-all relative group overflow-hidden",
                                    formData[doc.id as keyof typeof formData] 
                                        ? "border-green-100 bg-green-50/30" 
                                        : "border-slate-50 bg-slate-50/50 hover:border-slate-100"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-2xl",
                                                formData[doc.id as keyof typeof formData] ? "bg-green-100 text-green-600" : "bg-white text-slate-400"
                                            )}>
                                                {formData[doc.id as keyof typeof formData] ? <FileCheck size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{doc.label}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                                                    {formData[doc.id as keyof typeof formData] ? "Erfolgreich hochgeladen" : "Nicht hochgeladen"}
                                                </p>
                                            </div>
                                        </div>
                                        <label className="cursor-pointer">
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="application/pdf,image/*" 
                                                onChange={(e) => handleFileUpload(e, doc.id)}
                                                disabled={uploadingField === doc.id}
                                            />
                                            <div className={cn(
                                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                uploadingField === doc.id ? "bg-slate-200 text-slate-400 animate-pulse" :
                                                formData[doc.id as keyof typeof formData] ? "bg-white text-green-600 border border-green-100" : "bg-slate-900 text-white hover:scale-105"
                                            )}>
                                                {uploadingField === doc.id ? "Wird geladen..." : formData[doc.id as keyof typeof formData] ? "Ändern" : "Hochladen"}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="pt-8 border-t border-slate-100 space-y-6">
                        <div className="flex items-start gap-3 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                           <input 
                             type="checkbox" 
                             id="terms" 
                             required 
                             className="mt-1 w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                             checked={formData.acceptedTerms}
                             onChange={e => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                           />
                           <label htmlFor="terms" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed cursor-pointer">
                              Ich habe die <span className="text-blue-600 font-black">Datenschutzerklärung</span> gelesen und akzeptiere diese. Ich stimme der Verarbeitung meiner Daten zum Zwecke der Bewerbung zu.
                           </label>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !!uploadingField}
                            className="w-full py-8 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-2xl shadow-blue-500/20"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    Jetzt Bewerbung absenden
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                        <p className="text-center mt-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Durch das Absenden akzeptieren Sie unsere Datenschutzbestimmungen.</p>
                    </div>
                </form>

                <footer className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] pb-20">
                    QQX Logistics Fleet Management • Austria
                </footer>
            </div>
        </div>
    );
}
