"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    ArrowLeft,
    Zap
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function FeatureEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // Simulating loading state for fetching if id is present
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        key: "",
        description: ""
    });

    useEffect(() => {
        if (id) {
            // we'd fetch the feature data here
            api.get("/superadmin/features").then((res) => {
                const feature = res.data.find((f: any) => f.id === id);
                if (feature) {
                    setFormData({
                        key: feature.key,
                        description: feature.description || ""
                    });
                }
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (id) {
                // await api.patch(`/superadmin/features/${id}`, formData);
                await api.post("/superadmin/features", formData);
            } else {
                await api.post("/superadmin/features", formData);
            }
            router.push("/superadmin/features");
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Speichern");
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
        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-700">
            <div className="bg-white dark:bg-[#0f111a] rounded-[2.5rem] p-8 lg:p-12 border border-slate-200 dark:border-white/5 shadow-2xl">
                <div className="space-y-8 font-sans">

                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Feature Key (UNIQUE)</label>
                        <input
                            required
                            value={formData.key}
                            onChange={e => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                            className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="MODULE_INVOICING"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Beschreibung</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold h-32 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="Ermöglicht das Erstellen von Rechnungen..."
                        />
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4">
                    <Link
                        href="/superadmin/features"
                        className="flex-1 py-5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition text-center flex items-center justify-center"
                    >
                        Abbrechen
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-[2] py-5 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : "Feature Registrieren"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function FeatureEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 mt-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/superadmin/features" className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Zap size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Superadmin</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Feature bearbeiten</h1>
                    <p className="text-slate-500 font-medium">Legen Sie ein neues Feature an oder bearbeiten Sie ein bestehendes Modul.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>}>
                <FeatureEditorForm />
            </Suspense>
        </div>
    );
}
