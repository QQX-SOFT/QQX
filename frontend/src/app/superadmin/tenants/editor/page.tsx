"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    ArrowLeft,
    Users,
    Globe,
    Zap as ZapIcon
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function TenantEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // For now we don't have a fetch tenant endpoint in the provided context, but simulate
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        subdomain: ""
    });

    useEffect(() => {
        if (id) {
            // Suppose there is a way to get the tenant details, simulate loading
            setLoading(false);
        }
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (id) {
                // If edit is supported: await api.patch(`/tenants/${id}`, formData);
                await api.post("/tenants", formData);
            } else {
                await api.post("/tenants", formData);
            }
            router.push("/superadmin/tenants");
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Erstellen");
            console.error("Save error", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-[#0b0e14] rounded-[3rem] p-8 lg:p-12 border border-slate-200 dark:border-white/5 shadow-2xl shadow-indigo-500/5">
                <div className="space-y-8">

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">Unternehmensname *</label>
                        <div className="relative group">
                            <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition" size={18} />
                            <input
                                type="text"
                                required
                                placeholder="Bsp: QQX Logistics GmbH"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl text-slate-900 dark:text-white font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">Subdomain *</label>
                        <div className="relative group">
                            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition" size={18} />
                            <input
                                type="text"
                                required
                                placeholder="Bsp: mein-logistik"
                                value={formData.subdomain}
                                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                                className="w-full pl-16 pr-32 py-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl text-slate-900 dark:text-white font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase tracking-widest">
                                .qqxsoft.com
                            </div>
                        </div>
                        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Muss eindeutig sein und nur Kleinbuchstaben/Zahlen enthalten.</p>
                    </div>

                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4">
                    <Link
                        href="/superadmin/tenants"
                        className="flex-1 py-5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition text-center flex items-center justify-center"
                    >
                        Abbrechen
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-[2] py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {saving ? (
                            <ZapIcon className="animate-spin" size={18} />
                        ) : (
                            <ZapIcon size={18} fill="white" />
                        )}
                        {id ? "Mandant Aktualisieren" : "Mandant Erstellen"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function TenantEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/superadmin/tenants" className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Users size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Superadmin</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Neuer Mandant</h1>
                    <p className="text-slate-500 font-medium">Legen Sie ein neues Unternehmen mit dedizierter Subdomain an.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>}>
                <TenantEditorForm />
            </Suspense>
        </div>
    );
}
