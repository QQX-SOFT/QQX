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
    CheckCircle2,
    Mail,
    Send,
    Search
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
        type: "DRIVER" as ContractType,
        status: "ACTIVE" as ContractStatus,
        startDate: "",
        endDate: "",
        driverId: "",
        customerId: "",
        fileUrl: "",
        templateId: "",
        isSigned: false,
        signatureImageUrl: ""
    });

    const [isManuallyEdited, setIsManuallyEdited] = useState(false);
    const [driverSearch, setDriverSearch] = useState("");
    const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);

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
                templateId: data.templateId || "",
                isSigned: data.isSigned,
                signatureImageUrl: data.signatureImageUrl || ""
            });
            setIsManuallyEdited(true);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const sendContractEmail = async (contractId: string) => {
        try {
            setSaving(true);
            await api.post(`/contracts/${contractId}/share`);
            alert("Vertrag wurde erfolgreich per E-Mail gesendet!");
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Senden");
        } finally {
            setSaving(false);
        }
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
        const segments = text.split(/({{.*?}})/g);
        return segments.map((seg, i) => {
            if (seg.startsWith("{{") && seg.endsWith("}}")) {
                return <span key={i} className="bg-blue-100 text-blue-700 px-1 inline-block mx-0.5 rounded italic font-bold border border-blue-200">{seg}</span>;
            }
            return <span key={i} className="whitespace-pre-wrap">{seg}</span>;
        });
    };

    const driver = drivers.find(d => d.id === formData.driverId);
    const filteredDrivers = drivers.filter(d => 
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(driverSearch.toLowerCase())
    );

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;

    return (
        <form onSubmit={handleSave} className="space-y-10 font-sans pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 space-y-10 sticky top-10">
                        <div className="flex justify-between items-center px-2">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Wand2 size={20} /></div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Konfiguration</h3>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 italic leading-none">Fahrer auswählen & suchen</label>
                                <div className="relative group">
                                    <input 
                                        type="text"
                                        placeholder={driver ? `${driver.firstName} ${driver.lastName}` : "Suche Fahrer..."}
                                        value={driverSearch}
                                        onChange={(e) => { setDriverSearch(e.target.value); setIsDriverDropdownOpen(true); }}
                                        onFocus={() => setIsDriverDropdownOpen(true)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-12 py-4 outline-none focus:border-blue-500/20 transition font-black text-xs placeholder:text-slate-300"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition" size={16} />
                                    {driver && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setFormData({...formData, driverId: ""}); setDriverSearch(""); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-slate-300 hover:text-red-500 transition"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {isDriverDropdownOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto"
                                        >
                                            {filteredDrivers.length === 0 ? (
                                                <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase">Keine Fahrer gefunden</div>
                                            ) : (
                                                filteredDrivers.map(d => (
                                                    <button
                                                        key={d.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, driverId: d.id });
                                                            setDriverSearch("");
                                                            setIsDriverDropdownOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-6 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition border-b border-slate-50 dark:border-slate-800/50 last:border-0",
                                                            formData.driverId === d.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">{d.firstName[0]}{d.lastName[0]}</div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1">{d.firstName} {d.lastName}</p>
                                                                <p className="text-[10px] font-bold text-slate-400">{d.email || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {isDriverDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDriverDropdownOpen(false)} />}

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Vertragsvorlage</label>
                                <select value={formData.templateId} onChange={(e) => handleTemplateSelection(e.target.value)} className={cn("w-full border-2 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-black text-xs appearance-none", 
                                    formData.templateId ? "bg-blue-600 text-white border-transparent shadow-lg shadow-blue-100" : "bg-slate-50 border-slate-50 text-slate-500")}>
                                    <option value="">Keine Vorlage verwenden...</option>
                                    {templates.filter(t => t.type === formData.type).map(t => (<option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Gültig ab</label>
                                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-4 py-4 outline-none text-xs font-black uppercase" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Gültig bis</label>
                                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 rounded-2xl px-4 py-4 outline-none text-xs font-black uppercase" />
                                </div>
                            </div>
                        </div>

                        {driver && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800/30 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">{driver.firstName[0]}{driver.lastName[0]}</div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{driver.firstName} {driver.lastName}</p>
                                        <p className="text-[9px] font-bold text-blue-400">{driver.email || "Keine E-Mail"}</p>
                                    </div>
                                </div>
                                <div className="pt-3 grid grid-cols-2 gap-4 border-t border-blue-100/50">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-blue-300 uppercase">SSN / GISA</p>
                                        <p className="text-[10px] font-bold text-blue-700">{driver.ssn || driver.gisaNumber || "N/A"}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[8px] font-black text-blue-300 uppercase">Telefon</p>
                                        <p className="text-[10px] font-bold text-blue-700">{driver.phone || "N/A"}</p>
                                    </div>
                                </div>
                                {id && (
                                    <button type="button" onClick={() => sendContractEmail(id)} className="w-full mt-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-blue-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2">
                                        <Mail size={12} /> Per E-Mail zum Signieren senden
                                    </button>
                                )}
                            </motion.div>
                        )}

                        <div className="pt-6 border-t border-slate-50 space-y-4">
                             <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white rounded-[2rem] py-8 font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-4 active:scale-95">
                                {saving ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                                {id ? "Vertrag aktualisieren" : "Vertrag speichern"}
                            </button>
                             <button type="button" onClick={() => window.print()} className="w-full bg-white border-2 border-slate-100 text-slate-400 rounded-[2rem] py-6 font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition flex items-center justify-center gap-4">
                                <Printer size={20} /> Drucken / PDF export
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm self-start">
                        <button type="button" onClick={() => setActiveTab("EDIT")} className={cn("px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition flex items-center gap-3", activeTab === "EDIT" ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}><Edit3 size={16} /> Bearbeiten</button>
                        <button type="button" onClick={() => setActiveTab("PREVIEW")} className={cn("px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition flex items-center gap-3", activeTab === "PREVIEW" ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}><Eye size={16} /> Vorschau</button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "EDIT" ? (
                            <motion.div key="edit" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                <div className="bg-white dark:bg-slate-900 rounded-[4rem] p-16 border border-slate-100 dark:border-slate-800 shadow-2xl relative">
                                    <div className="mb-12">
                                        <input placeholder="Vertragstitel (z.B. Rahmenvertrag 2024)" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full text-5xl font-black text-slate-900 dark:text-white bg-transparent outline-none border-b-8 border-slate-50 focus:border-blue-600/10 pb-6 transition tracking-tight uppercase italic" />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center ml-6">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic"><FileText size={16} /> Vertragstext (Inhalt)</label>
                                            {isManuallyEdited && (
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1 border border-orange-100 bg-orange-50 px-3 py-1 rounded-full animate-pulse shadow-sm"><Wand2 size={10} /> Manueller Modus aktiv</span>
                                                    {formData.templateId && (
                                                        <button type="button" onClick={() => { const t = templates.find(temp => temp.id === formData.templateId); if (t) setFormData(prev => ({ ...prev, content: fillPlaceholders(t.content, formData.driverId, formData.startDate) })); setIsManuallyEdited(false); }} className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-1"><Sparkles size={10} /> Zurücksetzen</button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <textarea value={formData.content} onChange={(e) => { setFormData({ ...formData, content: e.target.value }); setIsManuallyEdited(true); }} className="w-full min-h-[900px] bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] p-12 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-300 outline-none border-4 border-transparent focus:border-blue-600/5 transition shadow-inner" placeholder="Geben Sie hier den Inhalt ein oder wählen Sie eine Vorlage..." />
                                    </div>
                                    <ScrollText className="absolute bottom-[-100px] right-[-100px] text-slate-50 opacity-10 pointer-events-none" size={600} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center">
                                <div className="bg-white text-slate-900 border border-slate-200 shadow-[0_30px_100px_rgba(0,0,0,0.15)] w-full max-w-[800px] p-[80px] min-h-[1130px] rounded-[1rem] relative overflow-hidden" id="contract-preview">
                                    <header className="flex justify-between items-start mb-20 border-b-2 border-slate-100 pb-12">
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-blue-600">FastRoute GmbH</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Achstraße 42, 6922 Wolfurt • Österreich</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 justify-end mb-1 text-[10px] font-black text-slate-300 uppercase italic">Dokumenten-ID</div>
                                            <div className="font-mono text-xs">{id || "ENTWURF"}</div>
                                        </div>
                                    </header>
                                    <div className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-justify mb-20 text-slate-800">
                                        {renderPreview()}
                                    </div>
                                    <footer className="mt-auto pt-20 flex justify-between gap-20 border-t-2 border-slate-50 border-dashed">
                                        <div className="flex-1 space-y-12">
                                            <div className="h-px w-full bg-slate-200" />
                                            <div className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest">FastRoute GmbH (Auftraggeber)</div>
                                        </div>
                                        <div className="flex-1 space-y-12">
                                            <div className="flex flex-col items-center gap-2">
                                                {formData.isSigned && formData.signatureImageUrl ? (
                                                    <img src={formData.signatureImageUrl} alt="Unterschrift" className="max-h-[100px] object-contain animate-in fade-in zoom-in duration-1000" />
                                                ) : (
                                                    <div className="h-[100px] flex items-center justify-center text-slate-100 dark:text-slate-800"><Edit3 size={40} /></div>
                                                )}
                                                <div className="h-px w-full bg-slate-200" />
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest">
                                                Auftragnehmer ({driver ? `${driver.firstName} ${driver.lastName}` : 'Unterschrift'})
                                                {formData.isSigned && <span className="block text-[8px] text-green-500 mt-1"><CheckCircle2 size={10} className="inline mr-1" /> Digital signiert</span>}
                                            </div>
                                        </div>
                                    </footer>
                                    <div className="absolute top-0 right-0 p-8">
                                        <Sparkles className="text-blue-50" size={100} />
                                    </div>
                                </div>
                                <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-[0.5em] flex items-center gap-3">
                                    <Download size={14} /> PDF-Export bereit
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
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2 ml-1">Intelligentes Dokumenten-Management</p>
                </div>
            </header>
            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <ContractEditorForm />
            </Suspense>
        </div>
    );
}
