"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { CreditCard, CheckCircle2, Clock, Search, ExternalLink, ShieldCheck, XCircle } from "lucide-react";

interface Subscription {
    id: string;
    tenant: { name: string, subdomain: string };
    status: string;
    renewalDate: string;
    createdAt: string;
}

export default function SuperAdminBilling() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const { data } = await api.get("/superadmin/subscriptions");
                setSubscriptions(data);
            } catch (error) {
                console.error("Failed to fetch subscriptions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase italic">Abonnement <span className="text-indigo-500 not-italic">&</span> Billing</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium font-sans">Verwalten Sie Preismodelle und Abrechnungen der Mandanten systemweit.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0f111a] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Aktive Abos</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">{subscriptions.filter(s => s.status === 'ACTIVE').length}</h3>
                </div>
                <div className="bg-white dark:bg-[#0f111a] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Gekündigte Abos</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">{subscriptions.filter(s => s.status !== 'ACTIVE').length}</h3>
                </div>
                <div className="bg-white dark:bg-[#0f111a] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Letzte Buchung</p>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {subscriptions[0] ? new Date(subscriptions[0].createdAt).toLocaleDateString('de-DE') : 'Keine'}
                    </h3>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0f111a] rounded-[3rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Transaktions-Übersicht</h3>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Mandant suchen..."
                            className="bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/5">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mandant</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Verlängerung</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="p-10 bg-slate-50/50 dark:bg-white/5" />
                                    </tr>
                                ))
                            ) : subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Keine Abonnements gefunden</td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition group">
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{sub.tenant.name}</span>
                                                <span className="text-xs font-bold text-slate-400">{sub.tenant.subdomain}.qqxsoft.com</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {sub.status === 'ACTIVE' ? <ShieldCheck size={12} /> : <XCircle size={12} />}
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                                            {new Date(sub.renewalDate).toLocaleDateString('de-DE')}
                                        </td>
                                        <td className="p-6">
                                            <button className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-indigo-500 transition">
                                                <ExternalLink size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
