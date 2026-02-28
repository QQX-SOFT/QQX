"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    FileText,
    Loader2,
    Save,
    ArrowLeft
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

type ContractType = "GENERAL" | "CUSTOMER" | "DRIVER" | "VEHICLE";

function TemplateEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    // Data states
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "GENERAL" as ContractType,
        driverType: "",
        content: ""
    });

    useEffect(() => {
        if (id) {
            fetchTemplate(id);
        }
    }, [id]);

    const fetchTemplate = async (templateId: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/contract-templates/${templateId}`);
            setFormData({
                name: data.name,
                description: data.description || "",
                type: data.type,
                driverType: data.driverType || "",
                content: data.content
            });
        } catch (error) {
            console.error("Failed to load template", error);
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
                driverType: formData.type === "DRIVER" ? formData.driverType : null
            };

            if (id) {
                await api.patch(`/contract-templates/${id}`, payload);
            } else {
                await api.post("/contract-templates", payload);
            }

            router.push("/admin/contracts/templates");
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
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Vorlagenname</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-bold"
                                placeholder="z.B. Freier Dienstnehmer Vertrag"
                            />
                        </div>

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
                    </div>

                    {formData.type === "DRIVER" && (
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Beschäftigungsart</label>
                            <select
                                value={formData.driverType}
                                onChange={(e) => setFormData({ ...formData, driverType: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-bold appearance-none"
                            >
                                <option value="">Nicht spezifisch</option>
                                <option value="EMPLOYED">Angestellter / Echter Dienstnehmer</option>
                                <option value="FREELANCE">Freier Dienstnehmer</option>
                                <option value="COMMERCIAL">Gewerblich / Selbstständig</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Vertragstext (Markdown / HTML)</label>
                        <p className="text-xs text-slate-400 mb-2 px-2">Nutzen Sie Platzhalter wie {'{{driver_name}}'}, {'{{customer_name}}'}, {'{{date}}'} oder {'{{company_name}}'}.</p>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-medium min-h-[400px] font-mono text-sm leading-relaxed"
                            placeholder="Sehr geehrte(r) {{driver_name}}, hiermit vereinbaren wir..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Kurzbeschreibung</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-medium min-h-[80px] resize-none"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <Link
                        href="/admin/contracts/templates"
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
                        Vorlage speichern
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function TemplateEditorPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/contracts/templates" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
                            <FileText size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Vorlageneditor</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Vorlage bearbeiten</h1>
                    <p className="text-slate-500 font-medium">Text und Platzhalter für Verträge konfigurieren.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <TemplateEditorForm />
            </Suspense>
        </div>
    );
}
