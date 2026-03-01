"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ShieldCheck,
    Save,
    ArrowLeft,
    Building2,
    Users,
    Mail,
    Lock,
    Loader2,
    MapPin,
    FileText,
    Gavel
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function TenantEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        subdomain: "",
        address: "",
        zipCode: "",
        city: "",
        uidNumber: "",
        companyRegister: "",
        legalForm: "GmbH",
        commercialCourt: "",
        adminEmail: "",
        adminPassword: ""
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (id) {
                alert("Edit-Modus ist in Vorbereitung");
            } else {
                await api.post("/tenants", formData);
            }
            router.push("/superadmin/tenants");
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Speichern");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-20">
            {/* Basic Info */}
            <section className="bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                        <Building2 size={24} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Unternehmens-Basisdaten</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Name des Unternehmens *</label>
                        <input
                            type="text"
                            required
                            placeholder="z.B. Müller Logistik GmbH"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Subdomain *</label>
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl px-6 py-4 focus-within:border-indigo-500 transition">
                            <input
                                type="text"
                                required
                                placeholder="mueller"
                                className="bg-transparent border-none outline-none flex-1 text-slate-900 dark:text-white font-bold"
                                value={formData.subdomain}
                                onChange={e => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                            />
                            <span className="text-slate-400 dark:text-slate-500 font-bold">.qqx-app.de</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Address & Legal (Austria) */}
            <section className="bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                        <MapPin size={24} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Standort & Rechtliches (Österreich)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Straße & Hausnummer</label>
                        <input
                            type="text"
                            placeholder="Musterstraße 12/4"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">PLZ</label>
                        <input
                            type="text"
                            placeholder="1010"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                            value={formData.zipCode}
                            onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Ort</label>
                        <input
                            type="text"
                            placeholder="Wien"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Rechtsform</label>
                        <select
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold appearance-none"
                            value={formData.legalForm}
                            onChange={e => setFormData({ ...formData, legalForm: e.target.value })}
                        >
                            <option value="GmbH">GmbH</option>
                            <option value="Einzelunternehmen">Einzelunternehmen</option>
                            <option value="KG">KG</option>
                            <option value="OG">OG</option>
                            <option value="AG">AG</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">UID-Nummer</label>
                        <div className="relative">
                            <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="ATU12345678"
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                                value={formData.uidNumber}
                                onChange={e => setFormData({ ...formData, uidNumber: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Firmenbuchnummer</label>
                        <div className="relative">
                            <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="FN 123456 x"
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                                value={formData.companyRegister}
                                onChange={e => setFormData({ ...formData, companyRegister: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Zuständiges Gericht (Gerichtsstand)</label>
                        <div className="relative">
                            <Gavel className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Handelsgericht Wien"
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                                value={formData.commercialCourt}
                                onChange={e => setFormData({ ...formData, commercialCourt: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Admin Account */}
            {!id && (
                <section className="bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                            <Users size={24} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Erster Admin-Nutzer</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Admin E-Mail</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@kunde.at"
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                                    value={formData.adminEmail}
                                    onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Initiales Passwort</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                                <input
                                    type="text"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                                    value={formData.adminPassword}
                                    onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className="flex justify-end gap-4">
                <Link
                    href="/superadmin/tenants"
                    className="px-10 py-5 bg-white dark:bg-white/5 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition"
                >
                    Abbrechen
                </Link>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-3 shadow-2xl shadow-indigo-500/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {id ? "Speichern" : "Setup abschliessen & Live schalten"}
                </button>
            </div>
        </form>
    );
}

export default function TenantEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/superadmin/tenants" className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Super Admin</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Kunden-Setup (Avusturya)</h1>
                    <p className="text-slate-500 font-medium mt-2">Legen Sie ein neues österreichisches Unternehmen im System an.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>}>
                <TenantEditorForm />
            </Suspense>
        </div>
    );
}
