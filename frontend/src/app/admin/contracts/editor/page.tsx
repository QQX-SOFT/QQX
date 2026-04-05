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
    CalendarDays,
    Eye,
    Edit3,
    Printer,
    Download,
    CheckCircle2
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

    const [activeTab, setActiveTab] = useState<"EDIT" | "PREVIEW">("EDIT");

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
        setIsManuallyEdited(false);
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

    const renderPreview = () => {
        let text = formData.content;
        // Highlighting placeholders visually
        const segments = text.split(/({{.*?}})/g);
        return segments.map((seg, i) => {
            if (seg.startsWith("{{") && seg.endsWith("}}")) {
                return <span key={i} className="bg-indigo-100 text-indigo-700 px-1 inline-block mx-0.5 rounded italic font-bold border border-indigo-200">{seg}</span>;
            }
            return <span key={i}>{seg}</span>;
        });
    };

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;

    return (
        <form onSubmit={handleSave} className="space-y-10 font-sans pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Meta Side Bar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 space-y-10 sticky top-10">
                        <div className="flex justify-between items-center px-2">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><Wand2 size={20} /></div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">Sözleşme Ayarları</h3>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Vertragsart</label>
                                <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as ContractType })} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/20 transition font-black text-xs appearance-none">
                                    <option value="GENERAL">Allgemein (Genel)</option>
                                    <option value="CUSTOMER">Kunde (Müşteri)</option>
                                    <option value="DRIVER">Fahrer (Şoför)</option>
                                    <option value="VEHICLE">Fahrzeug (Araç)</option>
                                </select>
                            </div>

                            {formData.type === "DRIVER" && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Şoför Seçimi</label>
                                    <select required value={formData.driverId} onChange={(e) => setFormData({ ...formData, driverId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/20 transition font-black text-xs appearance-none">
                                        <option value="">Lütfen şoför seçiniz...</option>
                                        {drivers.map(d => (<option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Vorlage (Şablon)</label>
                                <select value={formData.templateId} onChange={(e) => handleTemplateSelection(e.target.value)} className={cn("w-full border-2 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/20 transition font-black text-xs appearance-none", 
                                    formData.templateId ? "bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-100" : "bg-slate-50 border-slate-50 text-slate-500")}>
                                    <option value="">Şablon Kullanma...</option>
                                    {templates.filter(t => t.type === formData.type).map(t => (<option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Beginn</label>
                                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-4 py-4 outline-none text-xs font-black uppercase" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Ende</label>
                                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-4 py-4 outline-none text-xs font-black uppercase" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 space-y-4">
                             <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white rounded-[2rem] py-8 font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition flex items-center justify-center gap-4 active:scale-95">
                                {saving ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                                {id ? "Güncellemeyi Kaydet" : "Sözleşmeyi Kaydet"}
                            </button>
                             <button type="button" onClick={() => window.print()} className="w-full bg-white border-2 border-slate-100 text-slate-400 rounded-[2rem] py-6 font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition flex items-center justify-center gap-4">
                                <Printer size={20} />
                                Çıktı Al (PDF)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Mode Tabs */}
                    <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm self-start">
                        <button type="button" onClick={() => setActiveTab("EDIT")} className={cn("px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition flex items-center gap-3", activeTab === "EDIT" ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}><Edit3 size={16} /> Düzenle</button>
                        <button type="button" onClick={() => setActiveTab("PREVIEW")} className={cn("px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition flex items-center gap-3", activeTab === "PREVIEW" ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}><Eye size={16} /> Önizleme</button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "EDIT" ? (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                <div className="bg-white dark:bg-slate-900 rounded-[4rem] p-16 border border-slate-100 dark:border-slate-800 shadow-2xl relative">
                                    <div className="mb-12">
                                        <input 
                                            placeholder="Sözleşme Adı (Örn: Mart 2024 Freelance Sözleşmesi)"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full text-5xl font-black text-slate-900 dark:text-white bg-transparent outline-none border-b-8 border-slate-50 focus:border-indigo-600/10 pb-6 transition tracking-tight uppercase italic"
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center ml-6">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><FileText size={16} /> Sözleşme Metni (Maden Dosyası)</label>
                                            {isManuallyEdited && (
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1 border border-orange-100 bg-orange-50 px-3 py-1 rounded-full animate-pulse shadow-sm"><Wand2 size={10} /> Manuel Mod Aktif</span>
                                                     {formData.templateId && (
                                                    <button type="button" onClick={() => { const t = templates.find(temp => temp.id === formData.templateId); if (t) setFormData(prev => ({ ...prev, content: fillPlaceholders(t.content, formData.driverId, formData.startDate) })); setIsManuallyEdited(false); }} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline flex items-center gap-1"><Sparkles size={10} /> Veriyi Sıfırla</button>
                                                )}
                                                </div>
                                            )}
                                        </div>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => { setFormData({ ...formData, content: e.target.value }); setIsManuallyEdited(true); }}
                                            className="w-full min-h-[900px] bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] p-12 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-300 outline-none border-4 border-transparent focus:border-indigo-600/5 transition shadow-inner"
                                            placeholder="Sözleşme metnini buraya girin veya soldan bir şablon seçin..."
                                        />
                                    </div>
                                    <ScrollText className="absolute bottom-[-100px] right-[-100px] text-slate-50 opacity-10 pointer-events-none" size={600} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center">
                                {/* A4 Document Look */}
                                <div className="bg-white text-slate-900 border border-slate-200 shadow-[0_30px_100px_rgba(0,0,0,0.15)] w-full max-w-[800px] p-[80px] min-h-[1130px] rounded-[1rem] relative overflow-hidden" id="contract-preview">
                                    <header className="flex justify-between items-start mb-20 border-b-2 border-slate-100 pb-12">
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-indigo-600">FastRoute GmbH</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Achstraße 42, 6922 Wolfurt • Österreich</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 justify-end mb-1 text-[10px] font-black text-slate-300 uppercase italic">Dokument-ID</div>
                                            <div className="font-mono text-xs">{id || "NEW-DRAFT"}</div>
                                        </div>
                                    </header>

                                    <div className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-justify mb-20">
                                        {renderPreview()}
                                    </div>

                                    <footer className="mt-auto pt-20 flex justify-between gap-20 border-t-2 border-slate-50 border-dashed">
                                        <div className="flex-1 space-y-12">
                                            <div className="h-px w-full bg-slate-200" />
                                            <div className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest">FastRoute GmbH (Auftraggeber)</div>
                                        </div>
                                        <div className="flex-1 space-y-12">
                                            <div className="h-px w-full bg-slate-200" />
                                            <div className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest">Auftragnehmer ({formData.driverId ? drivers.find(d => d.id === formData.driverId).lastName : 'Unterschrift'})</div>
                                        </div>
                                    </footer>
                                    
                                    <div className="absolute top-0 right-0 p-8">
                                        <Sparkles className="text-indigo-50" size={100} />
                                    </div>
                                </div>
                                <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-[0.5em] flex items-center gap-3">
                                    <Download size={14} /> PDF Olarak İndirilebilir Mod
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </form>
    );
}

export default function ContractEditorPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700 bg-slate-50 py-10 px-6 rounded-[4rem]">
            <header className="flex items-center gap-6">
                <Link href="/admin/contracts" className="p-4 bg-white dark:bg-slate-800 border border-slate-100 rounded-[2rem] text-slate-400 hover:text-slate-900 transition shadow-sm active:scale-95"><ArrowLeft size={24} /></Link>
                <div>
                   <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Vertrags-Designer</h1>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2 ml-1">Akıllı Belge Yönetim Paneli</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <ContractEditorForm />
            </Suspense>
        </div>
    );
}
