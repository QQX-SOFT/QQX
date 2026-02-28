"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    Save,
    ArrowLeft,
    Receipt,
    User,
    Calendar,
    Euro
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function InvoiceEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [drivers, setDrivers] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        driverId: "",
        amount: 0,
        period: ""
    });

    useEffect(() => {
        fetchDrivers();
        if (id) {
            // No edit endpoint for invoices, usually they are printed/immutable.
            setLoading(false);
        }
    }, [id]);

    const fetchDrivers = async () => {
        try {
            const { data } = await api.get("/drivers");
            setDrivers(data);
        } catch (e) {
            console.error("Failed to fetch drivers", e);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount)
            };

            if (id) {
                // If edit is supported: await api.patch(`/invoices/${id}`, payload);
                await api.post("/invoices", payload);
            } else {
                await api.post("/invoices", payload);
            }
            router.push("/admin/accounting");
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Erstellen der Rechnung");
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
        <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50">
                <div className="space-y-8">

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <User size={14} /> Fahrer auswählen *
                        </label>
                        <select
                            required
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold appearance-none"
                            value={formData.driverId}
                            onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                        >
                            <option value="">Fahrer wählen...</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Euro size={14} /> Betrag (€) *
                            </label>
                            <input
                                type="number" step="0.01" required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Calendar size={14} /> Zeitraum *
                            </label>
                            <input
                                type="text" required
                                placeholder="z.B. Feb 2026"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                            />
                        </div>
                    </div>

                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                    <Link
                        href="/admin/accounting"
                        className="px-8 py-4 rounded-2xl font-bold text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center flex-1 md:flex-none"
                    >
                        Abbrechen
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black focus:outline-none hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-200 flex-1 md:flex-none"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : "Rechnung Generieren"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function AccountingEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/accounting" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                            <Receipt size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Buchhaltung</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Rechnung erstellen</h1>
                    <p className="text-slate-500 font-medium">Neue Abrechnung für einen Fahrer anlegen.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <InvoiceEditorForm />
            </Suspense>
        </div>
    );
}
