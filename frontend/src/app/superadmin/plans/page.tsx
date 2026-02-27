import { useState, useEffect } from "react";
import api from "@/lib/api";
import { CreditCard, Plus, Check, Shield, Zap, Star, ShieldCheck } from "lucide-react";

interface PlanData {
    id: string;
    name: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    maxVehicles: number;
    maxUsers: number;
    maxLocations: number;
    _count?: { tenants: number };
}

export default function PlansPage() {
    const [plans, setPlans] = useState<PlanData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data } = await api.get("/superadmin/plans");
                setPlans(data);
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    return (
        <div className="space-y-8 animate-in mt-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase">
                        Tarifverwaltung
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Erstellen und bearbeiten Sie Abonnements und Preismodelle.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-indigo-500/20 active:scale-95">
                    <Plus size={20} />
                    <span>Neuen Tarif erstellen</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-white/5 animate-pulse h-96 rounded-[2.5rem]" />
                    ))
                ) : plans.length === 0 ? (
                    <div className="lg:col-span-3 text-center py-20 bg-white dark:bg-[#0f111a] rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                        <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Keine Tarife gefunden</h3>
                        <p className="text-slate-500 mb-8">Erstellen Sie Ihren ersten Abo-Tarif, um Mandanten zu verwalten.</p>
                        <button className="bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Tarif erstellen</button>
                    </div>
                ) : (
                    plans.map((plan: PlanData) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white dark:bg-[#0f111a] rounded-[2.5rem] border ${plan.name === 'Pro' ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'border-slate-200 dark:border-white/5 shadow-sm'} p-10 flex flex-col transition-all duration-500 hover:-translate-y-2`}
                        >
                            <div className="mb-8 text-center lg:text-left">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 justify-center lg:justify-start font-black">
                                    <span className="text-4xl text-slate-900 dark:text-white">€{plan.priceMonthly.toFixed(2)}</span>
                                    <span className="text-slate-500 text-sm">/ Monat</span>
                                </div>
                                <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                                    {plan._count?.tenants || 0} aktive Mandanten in diesem Tarif.
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {[
                                    `${plan.maxVehicles === -1 ? 'Unendlich' : plan.maxVehicles} Fahrzeuge`,
                                    `${plan.maxUsers === -1 ? 'Unendlich' : plan.maxUsers} Benutzer`,
                                    `${plan.maxLocations === -1 ? 'Unendlich' : plan.maxLocations} Standorte`,
                                    "Basis Berichte",
                                    "Email Support"
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${plan.name === 'Pro' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition duration-300 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10">
                                Tarif bearbeiten
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
