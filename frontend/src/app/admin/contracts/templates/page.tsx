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
import { motion } from "framer-motion";
import Link from "next/link";

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

    // Form functionality moved to editor page

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
                    <Link
                        href="/admin/contracts"
                        className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                        Zu den Verträgen
                    </Link>
                    <Link
                        href="/admin/contracts/templates/editor"
                        className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={20} />
                        Neue Vorlage
                    </Link>
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
                                <Link
                                    href={`/admin/contracts/templates/editor?id=${template.id}`}
                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition"
                                >
                                    <MoreVertical size={16} />
                                </Link>
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

            {/* Modals have been removed and replaced by the new page */}
        </div>
    );
}
