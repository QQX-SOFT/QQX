"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { CreditCard, ArrowLeft, Settings, FileText, PlusCircle, XCircle } from "lucide-react";

interface SaaSInvoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    period?: string;
    createdAt: string;
}

interface SubscriptionDetails {
    id: string;
    status: string;
    renewalDate: string;
    createdAt: string;
    autoInvoice: boolean;
    tenant: {
        id: string;
        name: string;
        subdomain: string;
        saasInvoices?: SaaSInvoice[];
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
    const [autoInvoice, setAutoInvoice] = useState(false);
    const [saving, setSaving] = useState(false);

    // Create Invoice Form State
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState<number>(149.90);
    const [month, setMonth] = useState<string>("März");
    const [year, setYear] = useState<string>("2026");

    const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

    const fetchDetails = async () => {
        try {
            const { data } = await api.get(`/superadmin/subscriptions/${params.id}`);
            setSub(data);
            setAutoInvoice(data.autoInvoice || false);
        } catch (error) {
            console.error("Failed to fetch subscription details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) fetchDetails();
    }, [params.id]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await api.put(`/superadmin/subscriptions/${params.id}/settings`, { autoInvoice });
            alert("Einstellungen gespeichert!");
        } catch (error) {
            alert("Fehler beim Speichern");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateInvoice = async () => {
        try {
            await api.post(`/superadmin/subscriptions/${params.id}/invoices`, {
                amount,
                period: `${month} ${year}`
            });
            setShowModal(false);
            fetchDetails(); // Reload data
        } catch (error) {
            alert("Fehler beim Erstellen der Rechnung");
        }
    };

    const handleMarkPaid = async (invoiceId: string) => {
        try {
            await api.patch(`/superadmin/invoices/${invoiceId}`, { status: 'PAID' });
            fetchDetails(); // Reload data
        } catch (error) {
            alert("Fehler beim Aktualisieren");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Lädt...</div>;
    if (!sub) return <div className="p-10 text-center font-bold text-red-500">Abonnement nicht gefunden</div>;

    const invoices = sub.tenant.saasInvoices || [];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-white dark:bg-[#0f111a] rounded-2xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{sub.tenant.name}</h1>
                        <p className="text-sm font-bold text-indigo-500">{sub.tenant.subdomain}.qqxsoft.com</p>
                    </div>
                </div>

                <button 
                    onClick={() => setShowModal(true)} 
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-indigo-500/20"
                >
                    <PlusCircle size={18} />
                    Rechnung erstellen
                </button>
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
                    {invoices.length === 0 ? (
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-center py-6">Keine Rechnungen gefunden</p>
                    ) : (
                        invoices.map((inv) => (
                            <div key={inv.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex justify-between items-center border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition">
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{inv.invoiceNumber}</p>
                                    <p className="text-xs text-slate-400">{inv.period || new Date(inv.createdAt).toLocaleDateString('de-DE')}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-black">{inv.amount.toFixed(2)} €</span>
                                    {inv.status === 'PAID' ? (
                                        <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Bezahlt</span>
                                    ) : (
                                        <>
                                            <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Offen</span>
                                            <button 
                                                onClick={() => handleMarkPaid(inv.id)}
                                                className="px-3 py-1 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-bold hover:bg-emerald-500 hover:text-white hover:border-transparent transition"
                                            >
                                                Als bezahlt markieren
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal: Rechnung erstellen */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f111a] rounded-[2.5rem] p-8 max-w-md w-full border border-slate-200 dark:border-white/5 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Rechnung erstellen</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monat</label>
                                <select 
                                    value={month} 
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full mt-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm font-bold"
                                >
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jahr</label>
                                <select 
                                    value={year} 
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full mt-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm font-bold"
                                >
                                    {["2025", "2026", "2027"].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Betrag (€)</label>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                                    className="w-full mt-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm font-bold"
                                />
                            </div>

                            <button onClick={handleCreateInvoice} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm transition mt-6">
                                Erstellen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
