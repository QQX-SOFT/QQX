import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Zap, Shield, Rocket, Clock, Settings2, ToggleLeft, ToggleRight, Search, Plus } from "lucide-react";

interface FeatureData {
    id: string;
    key: string;
    name: string;
    description?: string;
}

export default function FeaturesPage() {
    const [features, setFeatures] = useState<FeatureData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchFeatures();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase">
                        Funktionsverwaltung
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Verwalten Sie Feature-Flags und Modulfreischaltungen systemweit.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-indigo-500/20 active:scale-95">
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
                        <button className="bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Feature definieren</button>
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
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{feature.key}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">System-Feature</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    ACTIVE
                                </div>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                                {feature.description || "Keine Beschreibung verfügbar."}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <Settings2 size={14} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-400">0 Overrides</span>
                                </div>
                                <button className="flex items-center gap-3 text-indigo-500">
                                    <ToggleRight size={32} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
