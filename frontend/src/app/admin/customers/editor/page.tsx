"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    Save,
    ArrowLeft,
    Building2
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function CustomerEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // Data states
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        password: ""
    });

    useEffect(() => {
        if (id) {
            fetchCustomer(id);
        }
    }, [id]);

    const fetchCustomer = async (customerId: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/customers/${customerId}`);
            setFormData({
                name: data.name || "",
                contactPerson: data.contactPerson || "",
                email: data.email || "",
                phone: data.phone || "",
                address: data.address || "",
                password: ""
            });
        } catch (error) {
            console.error("Failed to load customer", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (id) {
                await api.patch(`/customers/${id}`, formData);
            } else {
                await api.post("/customers", formData);
            }

            router.push("/admin/customers");
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Speichern des Kunden");
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
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Unternehmensname *</label>
                        <input
                            type="text"
                            required
                            placeholder="z.B. Logistik Pro GmbH"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold transition-all shadow-sm"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Kontaktperson</label>
                            <input
                                type="text"
                                placeholder="Vor- und Nachname"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold transition-all shadow-sm"
                                value={formData.contactPerson}
                                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">E-Mail</label>
                            <input
                                type="email"
                                placeholder="info@firma.at"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold transition-all shadow-sm"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Telefon</label>
                            <input
                                type="tel"
                                placeholder="+43..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold transition-all shadow-sm"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Anschrift</label>
                            <input
                                type="text"
                                placeholder="Straße, PLZ, Stadt"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold transition-all shadow-sm"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Passwort {id ? "(leer lassen für keine Änderung)" : "*"}</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required={!id}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-500 outline-none font-bold transition-all shadow-sm"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                        <Link
                            href="/admin/customers"
                            className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            Abbrechen
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-500/20"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Kunde speichern
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default function CustomerEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/customers" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                            <Building2 size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Kundeneditor</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Kunden bearbeiten</h1>
                    <p className="text-slate-500 font-medium">Legen Sie einen neuen Kunden an oder bearbeiten Sie einen bestehenden.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <CustomerEditorForm />
            </Suspense>
        </div>
    );
}
