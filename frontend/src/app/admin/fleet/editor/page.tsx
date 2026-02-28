"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    Save,
    ArrowLeft,
    Car
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function FleetEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        licensePlate: "",
        make: "",
        model: "",
        milage: 0,
        nextMaintenance: ""
    });

    useEffect(() => {
        if (id) {
            fetchVehicle(id);
        }
    }, [id]);

    const fetchVehicle = async (vehicleId: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/vehicles/${vehicleId}`);
            setFormData({
                licensePlate: data.licensePlate || "",
                make: data.make || "",
                model: data.model || "",
                milage: data.milage || 0,
                nextMaintenance: data.nextMaintenance ? data.nextMaintenance.split('T')[0] : ""
            });
        } catch (error) {
            console.error("Failed to load vehicle", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                milage: Number(formData.milage)
            };

            if (id) {
                await api.patch(`/vehicles/${id}`, payload);
            } else {
                await api.post("/vehicles", payload);
            }
            router.push("/admin/fleet");
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Speichern des Fahrzeugs");
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Marke *</label>
                            <input
                                type="text" required
                                placeholder="z.B. Mercedes-Benz"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold transition"
                                value={formData.make}
                                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Modell *</label>
                            <input
                                type="text" required
                                placeholder="z.B. Sprinter"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold transition"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Kennzeichen *</label>
                            <input
                                type="text" required
                                placeholder="B-QX 123"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold transition"
                                value={formData.licensePlate}
                                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Kilometerstand *</label>
                            <input
                                type="number" required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold transition"
                                value={formData.milage}
                                onChange={(e) => setFormData({ ...formData, milage: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nächste Wartung</label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 font-bold transition text-slate-600"
                            value={formData.nextMaintenance}
                            onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
                        />
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                    <Link
                        href="/admin/fleet"
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
                        Fahrzeug speichern
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function FleetEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/fleet" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                            <Car size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Fuhrpark Editor</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Fahrzeug Details</h1>
                    <p className="text-slate-500 font-medium">Verwalten Sie Details zu einem Fahrzeug im Fuhrpark.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <FleetEditorForm />
            </Suspense>
        </div>
    );
}
