"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Zap, Shield, Rocket, Clock, Settings2, ToggleLeft, ToggleRight, Search, Plus, X, Trash2 } from "lucide-react";

interface FeatureData {
    id: string;
    key: string;
    name: string;
    description?: string;
}

export default function FeaturesPage() {
    const [features, setFeatures] = useState<FeatureData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ key: "", description: "" });

    const fetchFeatures = async () => {
        try {
            const { data } = await api.get("/superadmin/features");
            setFeatures(data);
        } catch (error) {
            console.error("Failed to fetch features", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/superadmin/features", formData);
            setIsModalOpen(false);
            setFormData({ key: "", description: "" });
            fetchFeatures();
        } catch (error) {
            alert("Fehler beim Erstellen");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Feature wirklich entfernen?")) return;
        try {
            await api.delete(`/superadmin/features/${id}`);
            fetchFeatures();
        } catch (error) {
            alert("Fehler beim Löschen");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase italic">
                        Feature <span className="text-indigo-500 not-italic">&</span> Module
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Verwalten Sie Feature-Flags und Modulfreischaltungen systemweit.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Neues Feature definieren</span>
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-white/5 animate-pulse h-64 rounded-[2.5rem]" />
                    ))
                ) : features.length === 0 ? (
                    <div className="md:col-span-2 text-center py-20 bg-white dark:bg-[#0f111a] rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                        <Zap size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Keine Features gefunden</h3>
                        <p className="text-slate-500 mb-8">Definieren Sie System-Features, um sie Mandanten zuzuweisen.</p>
                        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Feature definieren</button>
                    </div>
                ) : (
                    features.map((feature) => (
                        <div key={feature.id} className="bg-white dark:bg-[#0f111a] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm group transition-all duration-500 hover:border-indigo-500/40">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-500/10 text-indigo-500 p-4 rounded-3xl transition-transform duration-500 group-hover:scale-110">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{feature.key}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">System-Feature</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        ACTIVE
                                    </div>
                                    <button
                                        onClick={() => handleDelete(feature.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                                {feature.description || "Keine Beschreibung verfügbar."}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <Settings2 size={14} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Runtime Flag</span>
                                </div>
                                <button className="flex items-center gap-3 text-indigo-500">
                                    <ToggleRight size={32} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f111a] w-full max-w-lg rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden animate-in zoom-in duration-300 font-sans">
                        <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Neues Feature</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Feature Key (UNIQUE)</label>
                                <input
                                    value={formData.key}
                                    onChange={e => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                                    className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold uppercase"
                                    placeholder="MODULE_INVOICING"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Beschreibung</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold h-32"
                                    placeholder="Ermöglicht das Erstellen von Rechnungen..."
                                />
                            </div>
                            <button className="w-full bg-indigo-500 py-4 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl shadow-indigo-500/20 mt-4">
                                Feature Registrieren
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
