"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    Save,
    ArrowLeft,
    FileText,
    User,
    UploadCloud
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface Driver {
    id: string;
    firstName: string;
    lastName: string;
}

function DocumentEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [drivers, setDrivers] = useState<Driver[]>([]);

    const [formData, setFormData] = useState({
        driverId: "",
        type: "",
        title: "",
        expiryDate: ""
    });
    const [file, setFile] = useState<File | null>(null);

    const docTypes: Record<string, string> = {
        IDENTITY: "Lichtbildausweis/Reisepass",
        LICENSE: "Führerschein (Klasse B)",
        MELDEZETTEL: "Meldezettel",
        GISA_EXTRACT: "GISA-Auszug (Gewerbe)",
        INSURANCE: "Haftpflichtversicherung",
        SVS_CONFIRMATION: "SVS Bestätigung",
        OGK_ANMELDUNG: "ÖGK Anmeldung",
        TAX_ID: "UID / Steuer-ID",
        OTHER: "Sonstiges"
    };

    useEffect(() => {
        fetchDrivers();
        if (id) {
            // documents usually are just uploaded, so edit may not exist 
            // but we'll skeleton it out anyway
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
        if (!formData.driverId || !formData.type || !formData.title || (!id && !file)) {
            alert("Bitte füllen Sie alle Pflichtfelder aus und wählen Sie eine Datei.");
            return;
        }

        setSaving(true);
        try {
            let uploadedFileUrl = "https://example.com/placeholder.pdf";

            if (file) {
                const formDataUpload = new FormData();
                formDataUpload.append("file", file);

                const uploadRes = await api.post("/upload", formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedFileUrl = uploadRes.data.url;
            }

            const payload = {
                ...formData,
                fileUrl: uploadedFileUrl
            };

            if (id) {
                // If edit is supported: await api.patch(`/documents/${id}`, payload);
                await api.post("/documents", payload);
            } else {
                await api.post("/documents", payload);
            }
            router.push("/admin/documents");
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
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50">
                <div className="space-y-8">

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <User size={14} /> Mitarbeiter / Fahrer *
                        </label>
                        <select
                            required
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold text-slate-700 appearance-none"
                            value={formData.driverId}
                            onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                        >
                            <option value="">Mitarbeiter auswählen...</option>
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.firstName} {driver.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dokument-Typ *</label>
                            <select
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold appearance-none"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="">Typ wählen...</option>
                                {Object.entries(docTypes).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-red-500 underline">Ablaufdatum (optional)</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Titel des Dokuments *</label>
                        <input
                            type="text"
                            required
                            placeholder="z.B. Führerschein 2024"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dokument-Datei *</label>
                        <div className="relative p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-center hover:border-blue-400 transition group cursor-pointer bg-slate-50 dark:bg-slate-900/50">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFile(e.target.files[0]);
                                    }
                                }}
                            />
                            <UploadCloud className="mx-auto text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition mb-2" size={32} />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                {file ? file.name : "Datei auswählen oder hierher ziehen"}
                            </p>
                        </div>
                    </div>

                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                    <Link
                        href="/admin/documents"
                        className="px-8 py-4 rounded-2xl font-bold text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center flex-1 md:flex-none"
                    >
                        Abbrechen
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black focus:outline-none hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-200 flex-1 md:flex-none"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : "Speichern"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function DocumentEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/documents" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                            <FileText size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Archiv</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Dokument hochladen</h1>
                    <p className="text-slate-500 font-medium">Laden Sie offizielle Dokumente und Zertifikate hoch.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <DocumentEditorForm />
            </Suspense>
        </div>
    );
}
