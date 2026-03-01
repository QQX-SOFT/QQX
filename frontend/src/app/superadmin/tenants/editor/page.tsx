"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ShieldCheck,
    Save,
    ArrowLeft,
    Building2,
    Users,
    Settings,
    Currency,
    Clock,
    Truck,
    Mail,
    Lock,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Link from "next/link";

function TenantEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        subdomain: "",
        currency: "EUR",
        timezone: "Europe/Berlin",
        basePrice: 15.00,
        distanceMultiplier: 0.50,
        adminEmail: "",
        adminPassword: ""
    });

    useEffect(() => {
        if (id) {
            // Fetch tenant logic would go here if editing
            // for now we focus on creating as per user request
        }
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (id) {
                // await api.patch(`/tenants/${id}`, formData);
                alert("Edit-Modus ist in Vorbereitung (Mock)");
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
        <form onSubmit={handleSave} className="space-y-8">
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
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Name des Unternehmens</label>
                        <input
                            type="text"
                            required
                            placeholder="z.B. Müller Logistik"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Subdomain</label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Währung</label>
                        <div className="relative">
                            <Currency className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold appearance-none"
                                value={formData.currency}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">Dollar ($)</option>
                                <option value="TRY">Lira (₺)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Zeitzone</label>
                        <div className="relative">
                            <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold appearance-none"
                                value={formData.timezone}
                                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                            >
                                <option value="Europe/Berlin">Europe/Berlin</option>
                                <option value="Europe/Istanbul">Europe/Istanbul</option>
                                <option value="Europe/Vienna">Europe/Vienna</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Config */}
            {!id && (
                <section className="bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                            <Truck size={24} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Tarif-Konfiguration</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Basispreis (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                                value={formData.basePrice}
                                onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Kilometer-Konstante</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition text-slate-900 dark:text-white font-bold"
                                value={formData.distanceMultiplier}
                                onChange={e => setFormData({ ...formData, distanceMultiplier: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* First Admin Account */}
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
                                    placeholder="admin@kunde.de"
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

            <div className="flex justify-end gap-4 pb-20">
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
        <div className="max-w-4xl mx-auto space-y-12">
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
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Kunden-Setup (Tenant)</h1>
                    <p className="text-slate-500 font-medium mt-2">Erstellen Sie eine neue, isolierte Umgebung für Ihren Kunden.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>}>
                <TenantEditorForm />
            </Suspense>
        </div>
    );
}
