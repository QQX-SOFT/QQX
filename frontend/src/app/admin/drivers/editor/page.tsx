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
    ChevronDown,
    Building2,
    MapPin,
    Stethoscope,
    Wallet,
    Info,
    Check
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
        workPermitUntil: "",
        imageUrl: "",
        workLocation: "",
        employmentModel: "",
        address: "",
        citizenship: "",
        jobTitle: "",
        employmentStart: "",
        employmentEnd: "",
        signatureStatus: "",
        visaExpiry: "",
        orderFee: 0,
        hourlyWage: 0,
        hasWorkPermit: false
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
        if (clean.length > 34) return;
        setFormData({ ...formData, iban: formatIban(clean) });
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
                workStyle: data.workStyle || (data.hourlyWage > 0 ? "HOURLY" : (data.orderFee > 0 ? "ORDER_FEE" : "HOURLY")),
                payPerOrder: data.payPerOrder || 0,
                payPerKm: data.payPerKm || 0,
                nationality: data.nationality || "Österreich",
                workPermitUntil: data.workPermitUntil ? data.workPermitUntil.split('T')[0] : "",
                imageUrl: data.imageUrl || "",
                workLocation: data.workLocation || "",
                employmentModel: data.employmentModel || "",
                address: data.address || "",
                citizenship: data.citizenship || "",
                jobTitle: data.jobTitle || "",
                employmentStart: data.employmentStart ? data.employmentStart.split('T')[0] : "",
                employmentEnd: data.employmentEnd ? data.employmentEnd.split('T')[0] : "",
                signatureStatus: data.signatureStatus || "",
                visaExpiry: data.visaExpiry ? data.visaExpiry.split('T')[0] : "",
                orderFee: data.orderFee || 0,
                hourlyWage: data.hourlyWage || 0,
                hasWorkPermit: data.hasWorkPermit || false
            });

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
            iban: formData.iban.replace(/\s/g, '')
        };

        try {
            if (id) {
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

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-20">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 lg:p-14 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40">
                {/* Type Selector */}
                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full mb-12 shadow-inner">
                    {[
                        { key: "ECHTER_DIENSTNEHMER", label: "Dienstnehmer" },
                        { key: "FREIER_DIENSTNEHMER", label: "Freier Dienstnehmer" },
                        { key: "SELBSTSTANDIG", label: "Selbstständig (SFU)" }
                    ].map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setFormData({ ...formData, employmentType: t.key as any })}
                            className={cn(
                                "flex-1 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                                formData.employmentType === t.key ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
                    {/* Personal Data Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={18} /></div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Persönliche Daten</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Fahrer-ID (Manuell) *</label>
                                <input type="text" placeholder="z.B. 955" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-black text-blue-600 shadow-sm" value={formData.driverNumber} onChange={e => setFormData({ ...formData, driverNumber: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Job Titel</label>
                                <input type="text" placeholder="Rider" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Vorname *</label>
                                <input type="text" placeholder="Max" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Nachname *</label>
                                <input type="text" placeholder="Mustermann" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">E-Mail *</label>
                                <input type="email" placeholder="email@beispiel.at" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold text-blue-600" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Telefon</label>
                                <input type="tel" placeholder="+43 660..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Geburtsdatum</label>
                                <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Staatsbürgerschaft</label>
                                <SearchableSelectCountry options={countries} value={formData.nationality} onChange={(val: string) => setFormData({ ...formData, nationality: val })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                             <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Dienstbeginn</label>
                                <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.employmentStart} onChange={e => setFormData({ ...formData, employmentStart: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Dienstende</label>
                                <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.employmentEnd} onChange={e => setFormData({ ...formData, employmentEnd: e.target.value })} />
                            </div>
                        </div>

                        {formData.nationality !== "Österreich" && (
                            <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Stethoscope className="text-red-500" size={20} />
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Arbeitsbewilligung Details</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-red-100">
                                        <input type="checkbox" id="hasWorkPermit" checked={formData.hasWorkPermit} onChange={e => setFormData({ ...formData, hasWorkPermit: e.target.checked })} className="w-5 h-5 accent-red-500" />
                                        <label htmlFor="hasWorkPermit" className="text-xs font-black text-red-700 cursor-pointer">Vorhanden</label>
                                    </div>
                                    <input type="date" value={formData.visaExpiry} onChange={e => setFormData({ ...formData, visaExpiry: e.target.value })} className="w-full bg-white border border-red-100 rounded-xl px-4 py-3 focus:border-red-500 outline-none font-bold text-red-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Address & Work Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={18} /></div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Anschrift & Arbeitsort</h3>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Straße / Nr (Autocomplete)</label>
                            <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
                                <input type="text" placeholder="Musterstraße 1" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                            </Autocomplete>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">PLZ</label>
                                <input type="text" placeholder="1010" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Stadt / Ort</label>
                                <input type="text" placeholder="Wien" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Arbeitsort (Region)</label>
                            <input type="text" placeholder="z.B. Wien" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.workLocation} onChange={e => setFormData({ ...formData, workLocation: e.target.value })} />
                        </div>

                        {/* Financials Section */}
                        <div className="pt-8 flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet size={18} /></div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Vergütung & Finanzen</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Arbeitsmodell *</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer text-slate-700 disabled:opacity-50"
                                        value={formData.workStyle || "HOURLY"}
                                        onChange={e => setFormData({ ...formData, workStyle: e.target.value })}
                                        required
                                    >
                                        <option value="HOURLY">Stundenlohn</option>
                                        <option value="ORDER_FEE">Bestellgebühr + KM Geld</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            
                            {formData.workStyle === "HOURLY" ? (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Stundenlohn (€)</label>
                                    <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-black text-green-600" value={formData.hourlyWage} onChange={e => setFormData({ ...formData, hourlyWage: parseFloat(e.target.value) || 0 })} />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Bestellgebühr (€)</label>
                                        <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-black text-blue-600" value={formData.orderFee} onChange={e => setFormData({ ...formData, orderFee: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">KM-Geld (€)</label>
                                        <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-black text-indigo-600" value={formData.payPerKm} onChange={e => setFormData({ ...formData, payPerKm: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                </>
                            )}
                        </div>


                        <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">IBAN *</label>
                             <input type="text" placeholder="AT..." required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-mono font-black" value={formData.iban} onChange={handleIbanChange} />
                        </div>

                        {(formData.employmentType === "ECHTER_DIENSTNEHMER" || formData.employmentType === "FREIER_DIENSTNEHMER") && (
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">SV-Nummer (SSN) *</label>
                                <input type="text" placeholder="1234 010190" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold" value={formData.ssn} onChange={e => setFormData({ ...formData, ssn: e.target.value })} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-20 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 text-slate-400 italic">
                        <Info size={16} />
                        <p className="text-[10px] uppercase font-bold tracking-widest">Alle mit * markierten Felder sind Pflichtfelder.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                         <Link href={id ? `/admin/drivers/${id}` : "/admin/drivers"} className="flex-1 md:flex-none px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">Abbrechen</Link>
                         <button type="submit" disabled={saving} className="flex-1 md:flex-none px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-3 active:scale-95">
                             {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                             Fahrer Speichern
                         </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default function DriverEditorPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
            <header className="flex items-center gap-6">
                <Link href="/admin/drivers" className="p-4 bg-white border border-slate-100 rounded-[2rem] text-slate-400 hover:text-slate-900 transition shadow-sm active:scale-95"><ArrowLeft size={24} /></Link>
                <div>
                   <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Fahrereditor</h1>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2 ml-1">Zentrale Personalverwaltung</p>
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
