"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { CreditCard, Plus, Check, Shield, Zap, Star, ShieldCheck, X, Trash2 } from "lucide-react";

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        priceMonthly: 0,
        maxVehicles: -1,
        maxUsers: -1,
        maxLocations: -1
    });

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

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await api.patch(`/superadmin/plans/${editingPlan.id}`, formData);
            } else {
                await api.post("/superadmin/plans", formData);
            }
            setIsModalOpen(false);
            setEditingPlan(null);
            fetchPlans();
        } catch (error) {
            alert("Fehler beim Speichern");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tarif wirklich löschen?")) return;
        try {
            await api.delete(`/superadmin/plans/${id}`);
            fetchPlans();
        } catch (error) {
            alert("Fehler beim Löschen");
        }
    };

    const openCreateModal = () => {
        setEditingPlan(null);
        setFormData({ name: "", priceMonthly: 0, maxVehicles: -1, maxUsers: -1, maxLocations: -1 });
        setIsModalOpen(true);
    };

    const openEditModal = (plan: PlanData) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            priceMonthly: plan.priceMonthly,
            maxVehicles: plan.maxVehicles,
            maxUsers: plan.maxUsers,
            maxLocations: plan.maxLocations
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in mt-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase italic">
                        Tarif <span className="text-indigo-500 not-italic">&</span> Price Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Erstellen und bearbeiten Sie Abonnements und Preismodelle.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-indigo-500/20 active:scale-95"
                >
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
                        <button onClick={openCreateModal} className="bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Tarif erstellen</button>
                    </div>
                ) : (
                    plans.map((plan: PlanData) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white dark:bg-[#0f111a] rounded-[2.5rem] border ${plan.name.toLowerCase().includes('pro') ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'border-slate-200 dark:border-white/5 shadow-sm'} p-10 flex flex-col transition-all duration-500 hover:-translate-y-2 group`}
                        >
                            <div className="mb-8 text-center lg:text-left">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">{plan.name}</h3>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
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
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${plan.name.toLowerCase().includes('pro') ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => openEditModal(plan)}
                                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition duration-300 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                            >
                                Tarif bearbeiten
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f111a] w-full max-w-lg rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden animate-in zoom-in duration-300 font-sans">
                        <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {editingPlan ? "Tarif bearbeiten" : "Neuer Tarif"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Name</label>
                                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Preis/Monat (€)</label>
                                    <input type="number" value={formData.priceMonthly} onChange={e => setFormData({ ...formData, priceMonthly: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold" required />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Max. Fahrzeuge</label>
                                    <input type="number" value={formData.maxVehicles} onChange={e => setFormData({ ...formData, maxVehicles: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Max. User</label>
                                    <input type="number" value={formData.maxUsers} onChange={e => setFormData({ ...formData, maxUsers: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold" required />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Max. Standorte</label>
                                    <input type="number" value={formData.maxLocations} onChange={e => setFormData({ ...formData, maxLocations: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border-none font-bold" required />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold italic">-1 steht für unbegrenzt.</p>
                            <button className="w-full bg-indigo-500 py-4 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl shadow-indigo-500/20 mt-4">
                                Tarifeinstellungen Speichern
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
