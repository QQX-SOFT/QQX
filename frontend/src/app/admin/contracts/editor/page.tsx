"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ScrollText,
    Loader2,
    Save,
    ArrowLeft
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";

type ContractType = "GENERAL" | "CUSTOMER" | "DRIVER" | "VEHICLE";
type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";

function ContractEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // Data states
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [drivers, setDrivers] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "GENERAL" as ContractType,
        status: "ACTIVE" as ContractStatus,
        startDate: "",
        endDate: "",
        driverId: "",
        customerId: "",
        fileUrl: ""
    });

    useEffect(() => {
        fetchDependencies();
        if (id) {
            fetchContract(id);
        }
    }, [id]);

    const fetchDependencies = async () => {
        try {
            const [driversRes, customersRes, templatesRes] = await Promise.all([
                api.get("/drivers"),
                api.get("/customers"),
                api.get("/contract-templates")
            ]);
            setDrivers(driversRes.data);
            setCustomers(customersRes.data);
            setTemplates(templatesRes.data);
        } catch (error) {
            console.error("Failed to load dependencies", error);
        }
    };

    const fetchContract = async (contractId: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/contracts/${contractId}`);
            setFormData({
                title: data.title,
                description: data.description || "",
                type: data.type,
                status: data.status,
                startDate: data.startDate ? data.startDate.substring(0, 10) : "",
                endDate: data.endDate ? data.endDate.substring(0, 10) : "",
                driverId: data.driverId || "",
                customerId: data.customerId || "",
                fileUrl: data.fileUrl || ""
            });
        } catch (error) {
            console.error("Failed to load contract", error);
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
                driverId: formData.type === "DRIVER" ? formData.driverId : null,
                customerId: formData.type === "CUSTOMER" ? formData.customerId : null,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
            };

            if (id) {
                await api.patch(`/contracts/${id}`, payload);
            } else {
                await api.post("/contracts", payload);
            }

            router.push("/admin/contracts");
            router.refresh();
        } catch (error) {
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
            {!id && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-6 mb-6">
                    <label className="block text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest mb-2">Aus Vorlage laden (Optional)</label>
                    <select
                        onChange={(e) => {
                            const t = templates.find(temp => temp.id === e.target.value);
                            if (t) {
                                setFormData(prev => ({
                                    ...prev,
                                    title: t.name,
                                    description: t.description || "",
                                    type: t.type
                                }));
                            }
                        }}
                        className="w-full bg-white dark:bg-slate-800 border-2 border-transparent rounded-xl px-4 py-3 outline-none focus:border-blue-500/20 transition font-bold"
                    >
                        <option value="">Keine Vorlage verwenden...</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                        ))}
                    </select>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400 mt-2">Wählen Sie eine Vorlage wie "Freier Dienstnehmer", um Basisdaten automatisch zu laden.</p>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Vertragstitel</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-bold"
                            placeholder="z.B. Rahmenvertrag 2026"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Vertragsart</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContractType })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-bold appearance-none"
                            >
                                <option value="GENERAL">Allgemein (General)</option>
                                <option value="CUSTOMER">Kunde (Customer)</option>
                                <option value="DRIVER">Fahrer (Driver)</option>
                                <option value="VEHICLE">Fahrzeug (Vehicle)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Status</label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ContractStatus })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-bold appearance-none"
                            >
                                <option value="DRAFT">Entwurf (Draft)</option>
                                <option value="ACTIVE">Aktiv (Active)</option>
                                <option value="EXPIRED">Abgelaufen (Expired)</option>
                                <option value="TERMINATED">Gekündigt (Terminated)</option>
                            </select>
                        </div>
                    </div>

                    {formData.type === "DRIVER" && (
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Fahrer auswählen</label>
                            <select
                                required
                                value={formData.driverId}
                                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-bold appearance-none"
                            >
                                <option value="">Fahrer wählen...</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.type === "CUSTOMER" && (
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Kunde auswählen</label>
                            <select
                                required
                                value={formData.customerId}
                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-bold appearance-none"
                            >
                                <option value="">Kunde wählen...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Startdatum</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-bold text-slate-600 dark:text-slate-300"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Enddatum</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-bold text-slate-600 dark:text-slate-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Dokument Link (PDF URL)</label>
                        <input
                            type="url"
                            value={formData.fileUrl}
                            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-bold text-blue-600"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Beschreibung</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-medium min-h-[120px] resize-none"
                            placeholder="Zusätzliche Vereinbarungen..."
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <Link
                        href="/admin/contracts"
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
                        Vertrag speichern
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function ContractEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/contracts" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <ScrollText size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Vertragseditor</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Vertrag bearbeiten</h1>
                    <p className="text-slate-500 font-medium">Legen Sie einen neuen Vertrag an oder bearbeiten Sie einen bestehenden.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <ContractEditorForm />
            </Suspense>
        </div>
    );
}
