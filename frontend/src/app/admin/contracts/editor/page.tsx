"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ScrollText,
    Loader2,
    Save,
    ArrowLeft,
    Type,
    FileText,
    ChevronDown,
    Wand2,
    Sparkles,
    UserCheck,
    CalendarDays
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type ContractType = "GENERAL" | "CUSTOMER" | "DRIVER" | "VEHICLE";
type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";

function ContractEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content: "",
        type: "GENERAL" as ContractType,
        status: "ACTIVE" as ContractStatus,
        startDate: "",
        endDate: "",
        driverId: "",
        customerId: "",
        fileUrl: "",
        templateId: ""
    });

    // Track if content has been manually edited by the user
    const [isManuallyEdited, setIsManuallyEdited] = useState(false);

    useEffect(() => {
        fetchDependencies();
        if (id) fetchContract(id);
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
        } catch (error) { console.error(error); }
    };

    const fetchContract = async (contractId: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/contracts/${contractId}`);
            setFormData({
                title: data.title,
                description: data.description || "",
                content: data.content || "",
                type: data.type,
                status: data.status,
                startDate: data.startDate ? data.startDate.substring(0, 10) : "",
                endDate: data.endDate ? data.endDate.substring(0, 10) : "",
                driverId: data.driverId || "",
                customerId: data.customerId || "",
                fileUrl: data.fileUrl || "",
                templateId: data.templateId || ""
            });
            // If editing existing, assume it was manual or finalized
            setIsManuallyEdited(true);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const fillPlaceholders = useCallback((templateContent: string, driverId: string, startDate: string) => {
        if (!templateContent) return "";
        
        let filled = templateContent;
        const driver = drivers.find(d => d.id === driverId);

        if (driver) {
            filled = filled
                .replace(/{{driver_firstName}}/g, driver.firstName || "")
                .replace(/{{driver_lastName}}/g, driver.lastName || "")
                .replace(/{{driver_address}}/g, driver.address || "")
                .replace(/{{driver_birthDate}}/g, driver.birthDate ? new Date(driver.birthDate).toLocaleDateString('de-DE') : "")
                .replace(/{{driver_svNumber}}/g, driver.svNumber || "")
                .replace(/{{driver_phone}}/g, driver.phone || "")
                .replace(/{{current_date}}/g, new Date().toLocaleDateString('de-DE'))
                .replace(/{{contract_startDate}}/g, startDate ? new Date(startDate).toLocaleDateString('de-DE') : new Date().toLocaleDateString('de-DE'));
        }
        return filled;
    }, [drivers]);

    // Re-fill when driver or template changes, but only if not manually edited yet OR if specifically requested
    useEffect(() => {
        if (!id && formData.templateId && formData.driverId && !isManuallyEdited) {
            const template = templates.find(t => t.id === formData.templateId);
            if (template) {
                const newContent = fillPlaceholders(template.content, formData.driverId, formData.startDate);
                setFormData(prev => ({ ...prev, content: newContent }));
            }
        }
    }, [formData.driverId, formData.templateId, formData.startDate, templates, fillPlaceholders, isManuallyEdited, id]);

    const handleTemplateSelection = (templateId: string) => {
        const t = templates.find(temp => temp.id === templateId);
        if (!t) {
            setFormData(prev => ({ ...prev, templateId: "", content: "" }));
            return;
        }

        const newContent = fillPlaceholders(t.content, formData.driverId, formData.startDate);
        setIsManuallyEdited(false); // Reset manual edit flag when template is changed to allow auto-fill

        setFormData(prev => ({
            ...prev,
            templateId: t.id,
            title: t.name,
            content: newContent,
            type: t.type
        }));
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
            if (id) await api.patch(`/contracts/${id}`, payload);
            else await api.post("/contracts", payload);
            router.push("/admin/contracts");
        } catch (error) { console.error(error); } finally { setSaving(false); }
    };

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;

    return (
        <form onSubmit={handleSave} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Meta Settings */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 space-y-10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><Wand2 size={20} /></div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Konfiguration</h3>
                            </div>
                            {formData.templateId && (
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        const t = templates.find(temp => temp.id === formData.templateId);
                                        if (t) setFormData(prev => ({ ...prev, content: fillPlaceholders(t.content, formData.driverId, formData.startDate) }));
                                        setIsManuallyEdited(false);
                                    }}
                                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition"
                                    title="Auto-Fill zurücksetzen"
                                >
                                    <Sparkles size={18} />
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Vertragsart</label>
                                <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as ContractType })} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/20 transition font-black text-xs appearance-none">
                                    <option value="GENERAL">Allgemein</option>
                                    <option value="CUSTOMER">Kunde</option>
                                    <option value="DRIVER">Fahrer</option>
                                    <option value="VEHICLE">Fahrzeug</option>
                                </select>
                            </div>

                            {formData.type === "DRIVER" && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Fahrer</label>
                                    <div className="relative">
                                        <select required value={formData.driverId} onChange={(e) => setFormData({ ...formData, driverId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/20 transition font-bold text-xs appearance-none pr-12">
                                            <option value="">Wählen...</option>
                                            {drivers.map(d => (<option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><UserCheck size={18} /></div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Vorlage laden</label>
                                <select value={formData.templateId} onChange={(e) => handleTemplateSelection(e.target.value)} className={cn("w-full border-2 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/20 transition font-black text-xs appearance-none", 
                                    formData.templateId ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-slate-50 border-slate-50 text-slate-500")}>
                                    <option value="">Keine Vorlage</option>
                                    {templates
                                        .filter(t => t.type === formData.type)
                                        .map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Beginn</label>
                                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-4 py-4 outline-none text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Ende</label>
                                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-4 py-4 outline-none text-xs font-bold" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white rounded-[2rem] py-8 font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200/50 hover:bg-black transition flex items-center justify-center gap-4">
                        {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                        Vertrag speichern
                    </button>
                    <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Sicher & Zertifiziert</p>
                </div>

                {/* Content Editor */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-12 min-h-[800px] relative overflow-hidden">
                        <div className="space-y-4 relative z-10">
                            <input
                                placeholder="Vertragstitel eingeben..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full text-4xl font-black text-slate-900 dark:text-white bg-transparent outline-none border-b-4 border-slate-50 focus:border-indigo-500/20 pb-4 transition tracking-tighter"
                            />
                            <div className="flex items-center gap-6">
                                <span className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border", 
                                    formData.status === 'ACTIVE' ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100")}>
                                    {formData.status}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    <CalendarDays size={14} />
                                    Erstellt am: {new Date().toLocaleDateString('de-DE')}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center ml-4">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <FileText size={14} />
                                    Vertragsinhalt (Volltext)
                                </label>
                                {isManuallyEdited && !id && (
                                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">
                                        <Sparkles size={10} /> Manueller Modus aktiv
                                    </span>
                                )}
                            </div>
                            <textarea
                                value={formData.content}
                                onChange={(e) => {
                                    setFormData({ ...formData, content: e.target.value });
                                    setIsManuallyEdited(true);
                                }}
                                className="w-full min-h-[600px] bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-10 font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 outline-none border-2 border-transparent focus:border-indigo-500/20 transition-all shadow-inner"
                                placeholder="Fügen Sie hier den Vertragstext ein veya bir Vorlage seçin..."
                            />
                        </div>
                        <FileText className="absolute bottom-[-100px] right-[-100px] text-slate-50 opacity-5 pointer-events-none" size={500} />
                    </div>
                </div>
            </div>
        </form>
    );
}

export default function ContractEditorPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
            <header className="flex items-center gap-6">
                <Link href="/admin/contracts" className="p-4 bg-white dark:bg-slate-800 border border-slate-100 rounded-[2rem] text-slate-400 hover:text-slate-900 transition shadow-sm"><ArrowLeft size={24} /></Link>
                <div>
                   <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Vertragseditor</h1>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2 ml-1">Rechtssichere Dokumentenerstellung</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <ContractEditorForm />
            </Suspense>
        </div>
    );
}
