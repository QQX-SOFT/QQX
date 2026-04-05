"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    Save,
    ArrowLeft,
    Users,
    Upload,
    CheckCircle,
    Calendar,
    Briefcase,
    ShieldCheck,
    Search,
    ChevronDown
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { Autocomplete } from "@react-google-maps/api";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
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
        password: "",
        gisaNumber: "",
        driverNumber: "",
        workStyle: "PER_ORDER_CUSTOM",
        payPerOrder: 5.5,
        payPerKm: 0.3,
        nationality: "Österreich",
        workPermitUntil: ""
    });
    const [countries, setCountries] = useState<{ code: string, name: string }[]>([]);

    const [checkingVat, setCheckingVat] = useState(false);
    const [vatResult, setVatResult] = useState<{ valid: boolean; name?: string; address?: string } | null>(null);

    const [checkingGisa, setCheckingGisa] = useState(false);
    const [gisaResult, setGisaResult] = useState<{ valid: boolean; name?: string; description?: string } | null>(null);

    const checkGisa = async () => {
        if (!formData.gisaNumber) return alert("Bitte GISA-Zahl eingeben!");
        setCheckingGisa(true);
        setGisaResult(null);
        try {
            // Using full name or last name for check as required by GISA API
            const searchName = formData.lastName || formData.firstName;
            const { data } = await api.post("/gisa/validate", { 
                gisaNumber: formData.gisaNumber,
                name: searchName 
            });
            setGisaResult(data);
        } catch (error: any) {
            console.error("Failed to check GISA", error);
            setGisaResult({ valid: false });
        } finally {
            setCheckingGisa(false);
        }
    };

    const checkVat = async () => {
        if (!formData.taxId) return alert("Bitte UID eingeben!");
        setCheckingVat(true);
        setVatResult(null);
        try {
            const { data } = await api.post("/vat/validate", { vatNumber: formData.taxId });
            setVatResult(data);
        } catch (error: any) {
            console.error("Failed to check VAT", error);
            setVatResult({ valid: false });
        } finally {
            setCheckingVat(false);
        }
    };
    const formatIban = (val: string) => {
        const clean = val.replace(/\s/g, '').toUpperCase();
        return clean.match(/.{1,4}/g)?.join(' ') || clean;
    };

    const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const clean = e.target.value.replace(/\s/g, '').toUpperCase();
        if (clean.length > 34) return; // Full IBAN with formats
        setFormData({ ...formData, iban: formatIban(clean) });
    };

    const docRequirements = {
        ECHTER_DIENSTNEHMER: [
            "Lichtbildausweis/Reisepass",
            "Führerschein (Klasse B)",
            "Meldezettel",
            "E-Card Kopie"
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

    const [autocomplete, setAutocomplete] = useState<any>(null);

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            let route = "";
            let streetNumber = "";
            let postalCode = "";
            let locality = "";

            place.address_components?.forEach((c: any) => {
                const types = c.types;
                if (types.includes("route")) route = c.long_name;
                if (types.includes("street_number")) streetNumber = c.long_name;
                if (types.includes("postal_code")) postalCode = c.long_name;
                if (types.includes("locality")) {
                    locality = c.long_name;
                } else if (!locality && types.includes("administrative_area_level_2")) {
                    locality = c.long_name;
                }
            });

            setFormData(prev => ({
                ...prev,
                street: route ? `${route} ${streetNumber}` : `${place.name || ""}`,
                zip: postalCode,
                city: locality
            }));
        }
    };
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const { data } = await api.get('/applications/countries');
                setCountries(data);
            } catch (e) {
                console.error("Failed to fetch countries", e);
            }
        };
        fetchCountries();

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
                password: "",
                gisaNumber: data.gisaNumber || "",
                driverNumber: data.driverNumber || "",
                workStyle: data.workStyle || "PER_ORDER_CUSTOM",
                payPerOrder: data.payPerOrder ?? 5.5,
                payPerKm: data.payPerKm ?? 0.3,
                nationality: data.nationality || "Österreich",
                workPermitUntil: data.workPermitUntil ? data.workPermitUntil.split('T')[0] : ""
            });

            // Set formatted IBAN
            if (data.iban) {
                setFormData(prev => ({ ...prev, iban: formatIban(data.iban) }));
            }
        } catch (error) {
            console.error("Failed to load driver", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const payload = { 
            ...formData,
            iban: formData.iban.replace(/\s/g, '') // strip spaces for API
        };

        try {
            if (id) {
                // Using patch to update driver. The API might have specific fields expected.
                await api.patch(`/drivers/${id}`, payload);
                router.push(`/admin/drivers/${id}`);
            } else {
                await api.post("/drivers", payload);
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

    const SearchableSelectCountry = ({ label, value, options, onChange }: any) => {
        const [searchTerm, setSearchTerm] = useState("");
        const [open, setOpen] = useState(false);
        const filtered = options.filter((o: any) => o.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return (
            <div className="relative">
                <button type="button" onClick={() => setOpen(!open)} className={cn("w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold flex justify-between items-center transition-all", open && "border-blue-500 ring-4 ring-blue-500/5")}>
                    <span className={cn(!value && "text-slate-400")}>{value || label}</span>
                    <ChevronDown size={16} className={cn("transition-transform opacity-30", open && "rotate-180 opacity-100 text-blue-500")} />
                </button>
                {open && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                        <div className="absolute z-50 top-[110%] left-0 right-0 bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                                <Search size={14} className="text-slate-300" />
                                <input className="w-full bg-transparent border-none outline-none text-xs font-bold placeholder:text-slate-300" placeholder="Suchen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
                            </div>
                            <div className="max-h-64 overflow-y-auto overscroll-contain custom-scrollbar">
                                {filtered.map((o: any) => (
                                    <button key={o.code} type="button" onClick={() => { onChange(o.name); setOpen(false); setSearchTerm(""); }} className={cn("w-full p-5 text-left text-xs font-bold transition-colors border-b border-slate-50/50 last:border-0 hover:bg-blue-50 hover:text-blue-600", value === o.name ? "bg-blue-50 text-blue-600" : "text-slate-600")}>
                                        {o.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
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
                        Dienstnehmer
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, employmentType: "FREIER_DIENSTNEHMER" })}
                        className={cn(
                            "flex-1 py-3 rounded-xl text-[11px] font-black transition-all",
                            formData.employmentType === "FREIER_DIENSTNEHMER" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Freie Dienstnehmer
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, employmentType: "SELBSTSTANDIG" })}
                        className={cn(
                            "flex-1 py-3 rounded-xl text-[11px] font-black transition-all",
                            formData.employmentType === "SELBSTSTANDIG" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        SFU = Selbstfahrende Unternehmer
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Personal Info */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Persönliche Daten</h3>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Fahrer-ID (Manuell) *</label>
                            <input type="text" placeholder="F123" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold text-blue-600" value={formData.driverNumber} onChange={e => setFormData({ ...formData, driverNumber: e.target.value })} />
                        </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Staatsbürgerschaft *</label>
                                <SearchableSelectCountry 
                                    label="Staatsbürgerschaft wählen" 
                                    value={formData.nationality}
                                    options={countries}
                                    onChange={(val: string) => setFormData({ ...formData, nationality: val })}
                                />
                            </div>
                            {formData.nationality !== "Österreich" && (
                                <div className="animate-in slide-in-from-top-4 duration-300">
                                    <label className="block text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 ml-2">Aufenthaltserlaubnis vorhanden bis: *</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="w-full bg-red-50/30 border border-red-100 rounded-2xl px-5 py-4 focus:border-red-500 outline-none font-bold text-red-600" 
                                        value={formData.workPermitUntil} 
                                        onChange={e => setFormData({ ...formData, workPermitUntil: e.target.value })} 
                                    />
                                </div>
                            )}
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
                            <Autocomplete
                                onLoad={setAutocomplete}
                                onPlaceChanged={onPlaceChanged}
                            >
                                <input type="text" placeholder="Musterstraße 1" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                            </Autocomplete>
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
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Steuernummer / UID (z.B. ATU...)" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} />
                                        {formData.employmentType === "SELBSTSTANDIG" && (
                                            <button type="button" onClick={checkVat} disabled={checkingVat} className="bg-blue-600 text-white font-bold px-6 py-4 rounded-2xl hover:bg-blue-700 transition flex items-center gap-2">
                                                {checkingVat ? <Loader2 className="animate-spin" size={16} /> : "Prüfen"}
                                            </button>
                                        )}
                                    </div>
                                    {vatResult && (
                                        <div className={cn("mt-2 p-4 rounded-2xl border text-xs font-bold", vatResult.valid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200")}>
                                            {vatResult.valid ? (
                                                <div className="space-y-1">
                                                    <p className="font-black text-sm">✓ UID Gültig</p>
                                                    <p><span className="text-slate-500">Firma:</span> {vatResult.name}</p>
                                                    <p><span className="text-slate-500">Adresse:</span> {vatResult.address}</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-sm">✗ Ungültige UID / Fehler bei VIES</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {(formData.employmentType === "SELBSTSTANDIG" || formData.employmentType === "FREIER_DIENSTNEHMER") && (
                                <div className="mt-4">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">GISA-Zahl *</label>
                                    <div className="flex gap-2">
                                        <input 
                                          type="text" 
                                          placeholder="GISA-Zahl (z.B. 12345678)" 
                                          required 
                                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold" 
                                          value={formData.gisaNumber} 
                                          onChange={e => setFormData({ ...formData, gisaNumber: e.target.value })} 
                                        />
                                        <button 
                                          type="button" 
                                          onClick={checkGisa} 
                                          disabled={checkingGisa} 
                                          className="bg-blue-600 text-white font-bold px-6 py-4 rounded-2xl hover:bg-blue-700 transition flex items-center gap-2"
                                        >
                                            {checkingGisa ? <Loader2 className="animate-spin" size={16} /> : "GISA Prüfen"}
                                        </button>
                                    </div>
                                    {gisaResult && (
                                        <div className={cn("mt-2 p-4 rounded-2xl border text-xs font-bold", gisaResult.valid ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-700 border-red-200")}>
                                            {gisaResult.valid ? (
                                                <div className="space-y-1">
                                                    <p className="font-black text-sm">✓ GISA Aktiv</p>
                                                    <p><span className="text-slate-500">Inhaber/Firma:</span> {gisaResult.name}</p>
                                                    {gisaResult.description && <p><span className="text-slate-500">Wortlaut:</span> {gisaResult.description}</p>}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-sm">✗ GISA nicht gefunden / Name passt nicht</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
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

                    {/* Arbeitsstil / Bezahlung */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Arbeitsstil (Bezahlung)</h3>
                        <div className="space-y-4">
                            <label className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer hover:bg-slate-50",
                                formData.workStyle === "PER_ORDER_CUSTOM" ? "border-blue-600 bg-blue-50/30" : "border-slate-100 dark:border-slate-800"
                            )}>
                                <input 
                                    type="radio" 
                                    name="workStyle" 
                                    className="w-5 h-5 accent-blue-600"
                                    checked={formData.workStyle === "PER_ORDER_CUSTOM"}
                                    onChange={() => setFormData({ ...formData, workStyle: "PER_ORDER_CUSTOM" })}
                                />
                                <div className="flex-1 space-y-2">
                                    <p className="text-[11px] font-black text-slate-900 uppercase">Option A: Pauschal pro Bestellung</p>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-blue-600"
                                            value={formData.payPerOrder}
                                            onChange={e => setFormData({...formData, payPerOrder: parseFloat(e.target.value) || 0})}
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">€ pro Bestellung</span>
                                    </div>
                                </div>
                            </label>

                            <label className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer hover:bg-slate-50",
                                formData.workStyle === "PER_ORDER_KM_CUSTOM" ? "border-blue-600 bg-blue-50/30" : "border-slate-100 dark:border-slate-800"
                            )}>
                                <input 
                                    type="radio" 
                                    name="workStyle" 
                                    className="w-5 h-5 accent-blue-600"
                                    checked={formData.workStyle === "PER_ORDER_KM_CUSTOM"}
                                    onChange={() => setFormData({ ...formData, workStyle: "PER_ORDER_KM_CUSTOM" })}
                                />
                                <div className="flex-1 space-y-3">
                                    <p className="text-[11px] font-black text-slate-900 uppercase">Option B: Bestellung + Kilometer</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-blue-600"
                                                value={formData.payPerOrder}
                                                onChange={e => setFormData({...formData, payPerOrder: parseFloat(e.target.value) || 0})}
                                                onClick={e => e.stopPropagation()}
                                            />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">€ / Best.</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-blue-600"
                                                value={formData.payPerKm}
                                                onChange={e => setFormData({...formData, payPerKm: parseFloat(e.target.value) || 0})}
                                                onClick={e => e.stopPropagation()}
                                            />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">€ / km</span>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Bank Info */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-50 pb-2">Bankverbindung</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">IBAN *</label>
                                <input type="text" placeholder="AT..." required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-mono font-bold" value={formData.iban} onChange={handleIbanChange} />
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

            <GoogleMapsProvider>
                <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                    <DriverEditorForm />
                </Suspense>
            </GoogleMapsProvider>
        </div>
    );
}
