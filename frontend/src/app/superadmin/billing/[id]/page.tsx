"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { CreditCard, CheckCircle2, Clock, Search, ArrowLeft, ShieldCheck, XCircle, Settings, FileText } from "lucide-react";

interface SubscriptionDetails {
    id: string;
    status: string;
    renewalDate: string;
    createdAt: string;
    tenant: {
        id: string;
        name: string;
        subdomain: string;
        address?: string;
    };
    plan?: {
        name: string;
        price: number;
    };
}

export default function SubscriptionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [sub, setSub] = useState<SubscriptionDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoInvoice, setAutoInvoice] = useState(false); // Mock or saved
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await api.get(`/superadmin/subscriptions/${params.id}`);
                setSub(data);
                if (data.autoInvoice !== undefined) setAutoInvoice(data.autoInvoice);
            } catch (error) {
                console.error("Failed to fetch subscription details", error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchDetails();
    }, [params.id]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            // Placeholder: Backend updates
            alert("Einstellungen gespeichert!");
        } catch (error) {
            alert("Fehler beim Speichern");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Lädt...</div>;
    if (!sub) return <div className="p-10 text-center font-bold text-red-500">Abonnement nicht gefunden</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-3 bg-white dark:bg-[#0f111a] rounded-2xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 transition">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{sub.tenant.name}</h1>
                    <p className="text-sm font-bold text-indigo-500">{sub.tenant.subdomain}.qqxsoft.com</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Abo Information */}
                <div className="bg-white dark:bg-[#0f111a] rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><CreditCard size={20} className="text-indigo-500" /> Abonnement</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                            <p className="mt-1">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {sub.status === 'ACTIVE' ? 'Aktiv' : sub.status}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarif</label>
                            <p className="text-lg font-black">{sub.plan?.name || "Pro"}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vertragsstart</label>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(sub.createdAt).toLocaleDateString('de-DE')}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abrechnung</label>
                            <p className="text-sm font-bold text-indigo-500">Monatlich (149.90 €)</p>
                        </div>
                    </div>
                </div>

                {/* Einstellungen */}
                <div className="bg-white dark:bg-[#0f111a] rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><Settings size={20} className="text-indigo-500" /> Abrechnungseinstellungen</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                            <div>
                                <p className="text-sm font-bold">Automatische Rechungserstellung</p>
                                <p className="text-xs text-slate-400">Soll am Fälligkeitstag automatisch eine Rechnung erstellt werden?</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={autoInvoice} onChange={(e) => setAutoInvoice(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                            </label>
                        </div>

                        <button onClick={handleSaveSettings} disabled={saving} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                            {saving ? "Speichert..." : "Einstellungen speichern"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Rechnungshistorie */}
            <div className="bg-white dark:bg-[#0f111a] rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><FileText size={20} className="text-indigo-500" /> Rechnungshistorie</h3>
                
                <div className="space-y-3">
                    {/* Placeholder Invoices for demonstration */}
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex justify-between items-center border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition">
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">RE-2026-03</p>
                            <p className="text-xs text-slate-400">01.03.2026</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-black">149.90 €</span>
                            <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Bezahlt</span>
                            <button className="p-2 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:text-indigo-500 transition">
                                <FileText size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex justify-between items-center border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition">
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">RE-2026-02</p>
                            <p className="text-xs text-slate-400">01.02.2026</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-black">149.90 €</span>
                            <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Offen</span>
                            <button className="px-3 py-1 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-bold hover:bg-emerald-500 hover:text-white hover:border-transparent transition">
                                Als bezahlt markieren
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
