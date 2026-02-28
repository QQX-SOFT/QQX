"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    Save,
    ArrowLeft,
    AlertCircle,
    User
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface Driver {
    id: string;
    firstName: string;
    lastName: string;
}

function ComplaintEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // Complaints don't currently have an edit endpoint in the modal, but we'll structure it like the others
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [drivers, setDrivers] = useState<Driver[]>([]);

    const [formData, setFormData] = useState({
        driverId: "",
        title: "",
        description: "",
        penalty: 0
    });

    useEffect(() => {
        fetchDrivers();
        if (id) {
            // we'd fetch the complaint here if supported, simulating
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
        if (!formData.driverId) return alert("Fahrer auswählen");
        setSaving(true);
        try {
            if (id) {
                // If edit is supported: await api.patch(`/complaints/${id}`, formData);
                await api.post("/complaints", formData); // fallback
            } else {
                await api.post("/complaints", formData);
            }
            router.push("/admin/complaints");
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Erstellen der Reklamation");
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
                            <User size={14} /> Betroffener Fahrer *
                        </label>
                        <select
                            required
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                            value={formData.driverId}
                            onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                        >
                            <option value="">Fahrer auswählen...</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Titel des Vorfalls *</label>
                        <input
                            type="text" required
                            placeholder="z.B. Verspätete Lieferung"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Beschreibung *</label>
                        <textarea
                            required rows={4}
                            placeholder="Details zum Vorfall..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertCircle size={14} className="text-red-500" /> Strafpunkte (optional)
                        </label>
                        <input
                            type="number"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                            value={formData.penalty}
                            onChange={e => setFormData({ ...formData, penalty: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                    <Link
                        href="/admin/complaints"
                        className="px-8 py-4 rounded-2xl font-bold text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center flex-1 md:flex-none"
                    >
                        Abbrechen
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black focus:outline-none hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-xl shadow-red-200 flex-1 md:flex-none"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : "Meldung speichern"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function ComplaintEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/complaints" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-500">
                            <AlertCircle size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Qualitätssicherung</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Vorfall melden</h1>
                    <p className="text-slate-500 font-medium">Reichen Sie eine neue Reklamation oder Meldung ein.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <ComplaintEditorForm />
            </Suspense>
        </div>
    );
}
