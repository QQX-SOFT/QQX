"use client";

import { useEffect, useState } from "react";
import {
    Save,
    Loader2,
    CheckCircle2,
    Currency,
    Banknote,
    Zap,
    Package,
    ArrowDownCircle,
    ArrowUpCircle,
    Car,
    Calculator,
    Settings2
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PricingSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        basePrice: 15.00,
        distanceMultiplier: 0.50,
        expressExtra: 10.00,
        heavyPackageExtra: 5.00,
        minPrice: 1.00,
        maxPrice: 500.00,
        essenBasePrice: 3.00,
        essenDistanceMultiplier: 0.20
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get("/settings");
                setFormData({
                    basePrice: data.basePrice ?? 15.00,
                    distanceMultiplier: data.distanceMultiplier ?? 0.50,
                    expressExtra: data.expressExtra ?? 10.00,
                    heavyPackageExtra: data.heavyPackageExtra ?? 5.00,
                    minPrice: data.minPrice ?? 1.00,
                    maxPrice: data.maxPrice ?? 500.00,
                    essenBasePrice: data.essenBasePrice ?? 3.00,
                    essenDistanceMultiplier: data.essenDistanceMultiplier ?? 0.20
                });
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await api.patch("/settings", formData);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update pricing settings", error);
            alert("Fehler beim Speichern der Preiseinstellungen");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20 font-sans">
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-sm"
                    >
                        <CheckCircle2 size={20} />
                        Preiseinstellungen erfolgreich gespeichert!
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                            <Banknote size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Finanzen</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Preiseinstellungen</h1>
                    <p className="text-slate-500 font-medium">Konfigurieren Sie hier die Preisberechnung für Lieferungen.</p>
                </div>
            </header>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-500">
                            <Settings2 size={20} />
                        </div>
                        Standard Lieferung
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2">
                                <Banknote size={14} className="text-blue-500" /> Grundpreis (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="basePrice"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition text-slate-900 dark:text-white font-bold"
                                value={formData.basePrice}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2">
                                <Car size={14} className="text-blue-500" /> Preis pro Kilometer (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="distanceMultiplier"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition text-slate-900 dark:text-white font-bold"
                                value={formData.distanceMultiplier}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2">
                                <Zap size={14} className="text-amber-500" /> Express-Zuschlag (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="expressExtra"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition text-slate-900 dark:text-white font-bold"
                                value={formData.expressExtra}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2">
                                <Package size={14} className="text-red-500" /> Schwere Pakete Zuschlag (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="heavyPackageExtra"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition text-slate-900 dark:text-white font-bold"
                                value={formData.heavyPackageExtra}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2">
                                <ArrowDownCircle size={14} className="text-green-500" /> Mindestpreis (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="minPrice"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition text-slate-900 dark:text-white font-bold"
                                value={formData.minPrice}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2">
                                <ArrowUpCircle size={14} className="text-red-500" /> Höchstpreis (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="maxPrice"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition text-slate-900 dark:text-white font-bold"
                                value={formData.maxPrice}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm mt-8">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-500">
                            <Car size={20} />
                        </div>
                        Essen Lieferung (mit PKW) Einstellungen
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2">
                                <Banknote size={14} className="text-amber-500" /> Grundpreis für Essen Lieferung (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="essenBasePrice"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition text-slate-900 dark:text-white font-bold"
                                value={formData.essenBasePrice}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-2">
                                <Car size={14} className="text-amber-500" /> Preis pro Kilometer für Essen Lieferung (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="essenDistanceMultiplier"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition text-slate-900 dark:text-white font-bold"
                                value={formData.essenDistanceMultiplier}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-[3rem] p-10 border border-blue-100 dark:border-blue-900/50">
                    <h3 className="text-xl font-black text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-3">
                        <Calculator size={24} className="text-blue-500" /> Preisformel
                    </h3>
                    <div className="text-blue-800 dark:text-blue-200 space-y-4">
                        <p><strong>Berechnungsformel:</strong><br />
                            <code className="bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg block mt-2 text-sm">
                                Preis = Grundpreis + (Entfernung × Preis pro km) + Express-Zuschlag (falls Express) + Schwere Pakete Zuschlag (falls schwer)
                            </code></p>
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <h4 className="font-bold mb-2 underline">Aktuelle Werte (Standard):</h4>
                                <ul className="space-y-1 text-sm list-disc pl-5">
                                    <li>Grundpreis: <strong>{formData.basePrice.toFixed(2)} €</strong></li>
                                    <li>Preis pro km: <strong>{formData.distanceMultiplier.toFixed(2)} €</strong></li>
                                    <li>Express-Zuschlag: <strong>{formData.expressExtra.toFixed(2)} €</strong></li>
                                    <li>Schwere Pakete: <strong>{formData.heavyPackageExtra.toFixed(2)} €</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-2 underline">Essen Lieferung (mit PKW):</h4>
                                <ul className="space-y-1 text-sm list-disc pl-5">
                                    <li>Grundpreis: <strong>{formData.essenBasePrice.toFixed(2)} €</strong></li>
                                    <li>Preis pro km: <strong>{formData.essenDistanceMultiplier.toFixed(2)} €</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-start gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200 dark:shadow-blue-900/20 flex items-center gap-2 group"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} className="group-hover:scale-110 transition" /> Speichern</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
