"use client";

import { useEffect, useState } from "react";
import {
    ScrollText,
    Plus,
    Search,
    Loader2,
    FileText,
    MoreVertical,
    X,
    Save,
    Trash2,
    Type
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type ContractType = "GENERAL" | "CUSTOMER" | "DRIVER" | "VEHICLE";

interface ContractTemplate {
    id: string;
    name: string;
    description: string | null;
    type: ContractType;
    driverType: string | null;
    content: string;
    createdAt: string;
}

export default function ContractTemplatesPage() {
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);

    // Form states
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "GENERAL" as ContractType,
        driverType: "",
        content: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/contract-templates");
            setTemplates(data);
        } catch (error) {
            console.error("Failed to load templates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (template?: ContractTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                name: template.name,
                description: template.description || "",
                type: template.type,
                driverType: template.driverType || "",
                content: template.content
            });
        } else {
            setEditingTemplate(null);
            setFormData({
                name: "",
                description: "",
                type: "GENERAL",
                driverType: "",
                content: ""
            });
        }
        setIsFormOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                driverType: formData.type === "DRIVER" ? formData.driverType : null
            };

            if (editingTemplate) {
                await api.patch(`/contract-templates/${editingTemplate.id}`, payload);
            } else {
                await api.post("/contract-templates", payload);
            }

            await fetchData();
            setIsFormOpen(false);
        } catch (error) {
            console.error("Save error", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Vorlage wirklich löschen?")) return;
        try {
            await api.delete(`/contract-templates/${id}`);
            fetchData();
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    const filteredTemplates = templates.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
                            <FileText size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Vorlagen</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Vertragsvorlagen</h1>
                    <p className="text-slate-500 font-medium">Erstellen und verwalten Sie Vertrags- und Dokumentvorlagen.</p>
                </div>
                <div className="flex items-center gap-4">
                    <a
                        href="/admin/contracts"
                        className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                        Zu den Verträgen
                    </a>
                    <button
                        onClick={() => handleOpenForm()}
                        className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={20} />
                        Neue Vorlage
                    </button>
                </div>
            </header>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Vorlagen suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={template.id}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition duration-300 group flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="px-3 py-1.5 rounded-xl border bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                                {template.type}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenForm(template)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition"
                                >
                                    <MoreVertical size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-black text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">
                                {template.name}
                            </h3>
                            {template.driverType && (
                                <div className="text-xs font-bold text-slate-500 mt-1">
                                    Fahrertyp: {template.driverType}
                                </div>
                            )}
                        </div>

                        {template.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 flex-grow">
                                {template.description}
                            </p>
                        )}

                        <div className="mt-auto space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                Platzhalter vorhanden: {template.content.includes("{{") ? "Ja" : "Nein"}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredTemplates.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                            <Type size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Keine Vorlagen gefunden</h3>
                        <p className="text-slate-500 font-medium">Erstellen Sie eine neue Vertragsvorlage.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                        {editingTemplate ? "Vorlage bearbeiten" : "Neue Vorlage"}
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Vertragstext und Platzhalter definieren</p>
                                </div>
                                <button
                                    onClick={() => setIsFormOpen(false)}
                                    className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8">
                                <form id="templateForm" onSubmit={handleSave} className="space-y-6">
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
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-blue-500/20 transition font-medium min-h-[300px] font-mono text-sm"
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
                                </form>
                            </div>

                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-[3rem]">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    form="templateForm"
                                    disabled={saving}
                                    className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-500/20"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    Speichern
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
