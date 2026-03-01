"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    Save,
    ArrowLeft,
    Users,
    ShieldCheck
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";

function DriverEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        birthday: "",
        employmentType: "ECHTER_DIENSTNEHMER" as "ECHTER_DIENSTNEHMER" | "FREIER_DIENSTNEHMER" | "SELBSTSTANDIG",
        street: "",
        zip: "",
        city: "",
        ssn: "",
        taxId: "",
        iban: "",
        bic: "",
        isKleinunternehmer: false,
        password: ""
    });

    const docRequirements = {
        ECHTER_DIENSTNEHMER: [
            "Lichtbildausweis/Reisepass",
            "Führerschein (Klasse B)",
            "Meldezettel",
            "ÖGK Anmeldung"
        ],
        FREIER_DIENSTNEHMER: [
            "Lichtbildausweis/Reisepass",
            "Führerschein (Klasse B)",
            "Meldezettel",
            "SVS Bestätigung"
        ],
        SELBSTSTANDIG: [
            "Lichtbildausweis/Reisepass",
            "Führerschein (Klasse B)",
            "Meldezettel",
            "GISA-Auszug",
            "SVS Bestätigung",
            "UID / Steuer-ID",
            "Gewerbeschein"
        ]
    };

    useEffect(() => {
        if (id) {
            fetchDriver(id);
        }
    }, [id]);

    const fetchDriver = async (driverId: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/drivers/${driverId}`);
            let eType: "ECHTER_DIENSTNEHMER" | "FREIER_DIENSTNEHMER" | "SELBSTSTANDIG" = "ECHTER_DIENSTNEHMER";
            if (data.type === "FREELANCE") eType = "FREIER_DIENSTNEHMER";
            if (data.type === "COMMERCIAL") eType = "SELBSTSTANDIG";

            setFormData({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                phone: data.phone || "",
                email: data.user?.email || "",
                birthday: data.birthday ? data.birthday.split('T')[0] : "",
                employmentType: eType,
                street: data.street || "",
                zip: data.zip || "",
                city: data.city || "",
                ssn: data.ssn || "",
                taxId: data.taxId || "",
                iban: data.iban || "",
                bic: data.bic || "",
                isKleinunternehmer: data.isKleinunternehmer || false,
                password: ""
            });
        } catch (error) {
            console.error("Failed to load driver", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (id) {
                const payload = { ...formData };
                // Using patch to update driver. The API might have specific fields expected.
                await api.patch(`/drivers/${id}`, payload);
                router.push(`/admin/drivers/${id}`);
            } else {
                await api.post("/drivers", formData);
                router.push("/admin/drivers");
            }
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Speichern des Fahrers");
            console.error("Save error", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50">
                {/* Type Selector */}
                <div className="flex p-1 bg-slate-100 rounded-2xl w-full mb-8">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, employmentType: "ECHTER_DIENSTNEHMER" })}
                        className={cn(
                            "flex-1 py-3 rounded-xl text-[11px] font-black transition-all",
                            formData.employmentType === "ECHTER_DIENSTNEHMER" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Echter DN
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, employmentType: "FREIER_DIENSTNEHMER" })}
                        className={cn(
                            "flex-1 py-3 rounded-xl text-[11px] font-black transition-all",
                            formData.employmentType === "FREIER_DIENSTNEHMER" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Freier DN
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, employmentType: "SELBSTSTANDIG" })}
                        className={cn(
                            "flex-1 py-3 rounded-xl text-[11px] font-black transition-all",
                            formData.employmentType === "SELBSTSTANDIG" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Selbstständig
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Personal Info */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Persönliche Daten</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Vorname *</label>
                                <input type="text" placeholder="Max" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Nachname *</label>
                                <input type="text" placeholder="Mustermann" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">E-Mail *</label>
                            <input type="email" placeholder="fahrer@beispiel.de" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold text-blue-600" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Telefon *</label>
                                <input type="tel" placeholder="+43 664..." required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Geburtsdatum *</label>
                                <input type="date" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold text-slate-600" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Passwort {id ? "(leer lassen für keine Änderung)" : "*"}</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required={!id}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Anschrift</h3>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Straße / Hausnummer</label>
                            <input type="text" placeholder="Musterstraße 1" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">PLZ</label>
                                <input type="text" placeholder="1010" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Stadt</label>
                                <input type="text" placeholder="Wien" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Legal Info */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Rechtliches / Steuern</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(formData.employmentType === "ECHTER_DIENSTNEHMER" || formData.employmentType === "FREIER_DIENSTNEHMER") && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">SV-Nummer (SSN) *</label>
                                    <input type="text" placeholder="1234 010190" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={formData.ssn} onChange={e => setFormData({ ...formData, ssn: e.target.value })} />
                                </div>
                            )}
                            {(formData.employmentType === "SELBSTSTANDIG" || formData.employmentType === "FREIER_DIENSTNEHMER") && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Steuer-ID / UID *</label>
                                    <input type="text" placeholder="Steuernummer / UID" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} />
                                </div>
                            )}
                        </div>

                        {formData.employmentType === "SELBSTSTANDIG" && (
                            <div className="mt-4 flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <input
                                    type="checkbox"
                                    id="kleinunternehmer"
                                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                                    checked={formData.isKleinunternehmer}
                                    onChange={e => setFormData({ ...formData, isKleinunternehmer: e.target.checked })}
                                />
                                <label htmlFor="kleinunternehmer" className="text-xs font-bold text-slate-700 cursor-pointer">
                                    Kleinunternehmerregelung (Umsatzsteuerbefreit)
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Bank Info */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Bankverbindung</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">IBAN *</label>
                                <input type="text" placeholder="AT..." required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-mono font-bold" value={formData.iban} onChange={e => setFormData({ ...formData, iban: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">BIC</label>
                                <input type="text" placeholder="BIC" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-mono font-bold" value={formData.bic} onChange={e => setFormData({ ...formData, bic: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Box */}
                {!id && (
                    <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4">
                        <ShieldCheck className="text-blue-600 shrink-0" size={24} />
                        <div>
                            <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Gesetzliche Anforderungen (Österreich)</h4>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4 uppercase tracking-widest">Die folgenden Dokumente werden für diesen Typ benötigt und können später im Profil hochgeladen werden:</p>
                            <div className="flex flex-wrap gap-2">
                                {(docRequirements[formData.employmentType] || []).map(req => (
                                    <span key={req} className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-blue-700 border border-blue-100">{req}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <Link
                        href={id ? `/admin/drivers/${id}` : "/admin/drivers"}
                        className="px-8 py-4 rounded-2xl font-bold text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                        Abbrechen
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black focus:outline-none hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Fahrer speichern
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function DriverEditorPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => window.history.back()} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 transition">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                            <Users size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Fahrereditor</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Fahrer Details</h1>
                    <p className="text-slate-500 font-medium">Legen Sie hier alle Details zum Fahrer an oder bearbeiten Sie sie.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <DriverEditorForm />
            </Suspense>
        </div>
    );
}
