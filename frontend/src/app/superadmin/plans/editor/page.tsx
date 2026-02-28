"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    ArrowLeft,
    CreditCard
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface PlanData {
    id: string;
    name: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    maxVehicles: number;
    maxUsers: number;
    maxLocations: number;
}

function PlanEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // In actual implementation, we'd fetch the existing plan if `id` is present.
    // For now we simulate.
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        priceMonthly: 0,
        maxVehicles: -1,
        maxUsers: -1,
        maxLocations: -1
    });

    useEffect(() => {
        if (id) {
            // we'd fetch the plan data and populate formData here.
            // Currently, plans are loaded in the page, so simulating a fetch.
            api.get("/superadmin/plans").then((res) => {
                const plan = res.data.find((p: PlanData) => p.id === id);
                if (plan) {
                    setFormData({
                        name: plan.name,
                        priceMonthly: plan.priceMonthly,
                        maxVehicles: plan.maxVehicles,
                        maxUsers: plan.maxUsers,
                        maxLocations: plan.maxLocations
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
                await api.patch(`/superadmin/plans/${id}`, formData);
            } else {
                await api.post("/superadmin/plans", formData);
            }
            router.push("/superadmin/plans");
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
        <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-[#0f111a] rounded-[2.5rem] p-8 lg:p-12 border border-slate-200 dark:border-white/5 shadow-2xl">
                <div className="space-y-8 font-sans">

                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Name</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold outline-none"
                            required
                            placeholder="z.B. STARTUP PRO"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Preis/Monat (€)</label>
                            <input
                                type="number"
                                value={formData.priceMonthly}
                                onChange={e => setFormData({ ...formData, priceMonthly: Number(e.target.value) })}
                                className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Max. Fahrzeuge</label>
                            <input
                                type="number"
                                value={formData.maxVehicles}
                                onChange={e => setFormData({ ...formData, maxVehicles: Number(e.target.value) })}
                                className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Max. User</label>
                            <input
                                type="number"
                                value={formData.maxUsers}
                                onChange={e => setFormData({ ...formData, maxUsers: Number(e.target.value) })}
                                className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Max. Standorte</label>
                            <input
                                type="number"
                                value={formData.maxLocations}
                                onChange={e => setFormData({ ...formData, maxLocations: Number(e.target.value) })}
                                className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold outline-none"
                                required
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-bold italic px-1">-1 steht für unbegrenzt.</p>

                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4">
                    <Link
                        href="/superadmin/plans"
                        className="flex-1 py-5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition text-center flex items-center justify-center"
                    >
                        Abbrechen
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-[2] py-5 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : "Tarifeinstellungen Speichern"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function PlanEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 mt-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/superadmin/plans" className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <CreditCard size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Superadmin</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Tarif bearbeiten</h1>
                    <p className="text-slate-500 font-medium">Legen Sie ein neues Abonnement-Modell an oder bearbeiten Sie ein bestehendes.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>}>
                <PlanEditorForm />
            </Suspense>
        </div>
    );
}
