"use client";

import { useState } from "react";
import {
    MapPin,
    Truck,
    ArrowLeft,
    ShoppingBag,
    ChevronRight,
    Clock,
    ShieldCheck,
    Wallet,
    CheckCircle2,
    Loader2,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState({
        address: "",
        details: "",
        weight: "SMALL",
        urgency: "NORMAL",
        amount: 25.00
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // In a real app we'd call api.post("/orders")
            // For now, simulated success
            await new Promise(r => setTimeout(r, 2000));
            setStep(3);
        } catch (e) {
            alert("Fehler beim Erstellen der Bestellung.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 font-sans pb-24">
            {/* Header */}
            <header className="flex items-center gap-6">
                <Link href="/customer" className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-slate-400 hover:text-blue-600 transition shadow-sm active:scale-95">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none mb-1">Neue Bestellung</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step === 3 ? "Abgeschlossen" : `Schritt ${step} von 2`}</p>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-10"
                    >
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Lieferziel / Adresse</label>
                                <div className="relative group/input">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-600 transition" size={20} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Straße, Hausnummer, PLZ Stadt"
                                        className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700/50 rounded-[2rem] font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/5 transition shadow-sm"
                                        value={orderData.address}
                                        onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bestell-Details (Optional)</label>
                                <textarea
                                    rows={4}
                                    placeholder="Besondere Anweisungen oder Informationen zum Paket..."
                                    className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700/50 rounded-[2rem] font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/5 transition shadow-sm resize-none"
                                    value={orderData.details}
                                    onChange={(e) => setOrderData({ ...orderData, details: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={!orderData.address}
                            onClick={() => setStep(2)}
                            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300 disabled:grayscale disabled:opacity-50"
                        >
                            Weiter zur Auswahl
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-10"
                    >
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Paket-Größe</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: "SMALL", name: "Klein", desc: "Bis 2kg", price: "€25,00", icon: ShoppingBag },
                                        { id: "LARGE", name: "Groß", desc: "Ab 2kg", price: "€45,00", icon: Truck },
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setOrderData({ ...orderData, weight: cat.id, amount: cat.id === 'SMALL' ? 25 : 45 })}
                                            className={cn(
                                                "p-6 rounded-[2rem] border-2 transition-all duration-300 text-left relative overflow-hidden group/cat focus:outline-none",
                                                orderData.weight === cat.id
                                                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20"
                                                    : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white hover:border-slate-300"
                                            )}
                                        >
                                            <cat.icon size={24} className={cn("mb-4", orderData.weight === cat.id ? "text-white" : "text-blue-600")} />
                                            <h4 className="font-black uppercase tracking-widest text-sm leading-none mb-1">{cat.name}</h4>
                                            <p className={cn("text-[10px] font-bold uppercase tracking-widest leading-none mb-4", orderData.weight === cat.id ? "text-blue-100" : "text-slate-400")}>{cat.desc}</p>
                                            <p className="text-xl font-black tabular-nums">{cat.price}</p>

                                            <div className={cn(
                                                "absolute bottom-[-10px] right-[-10px] z-0 opacity-5 transition-transform duration-1000 group-hover/cat:scale-150",
                                                orderData.weight === cat.id ? "scale-110" : ""
                                            )}>
                                                <cat.icon size={100} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-300 border border-blue-100 dark:border-blue-900/20">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm relative overflow-hidden">
                                        <Clock size={24} />
                                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition duration-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">Express Versand?</h4>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ €15,00 Zuschlag</p>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-900 flex items-center justify-center transition focus:ring-0">
                                    <div className="w-3 h-3 bg-blue-200 dark:bg-blue-900 rounded-full group-hover:scale-125 transition" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center">
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Betrag</p>
                                        <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tabular-nums tracking-tighter shadow-sm">€{orderData.amount.toFixed(2)}</h4>
                                    </div>
                                </div>
                                <ShieldCheck size={32} className="text-slate-100 dark:text-slate-800" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setStep(1)} className="py-6 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:text-slate-600 transition active:scale-95">Zurück</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>Kostenpflichtig buchen <ArrowRight size={16} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 py-10"
                    >
                        <div className="w-32 h-32 bg-green-500 text-white rounded-[3rem] shadow-2xl shadow-green-500/40 flex items-center justify-center mx-auto mb-10 group relative">
                            <CheckCircle2 size={64} className="group-hover:scale-110 transition duration-500" />
                            {/* Floating Success Particles Mock */}
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute -inset-4 border-2 border-dashed border-green-200 dark:border-green-900 rounded-full opacity-30" />
                        </div>

                        <div className="space-y-4 max-w-sm mx-auto">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Wunderbar! 🎉</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Ihre Bestellung wurde erfolgreich übermittelt. Ein QQX Administrator wird den Auftrag in Kürze prüfen und freigeben.</p>
                        </div>

                        <div className="flex flex-col gap-4 max-w-sm mx-auto mt-12 pt-10 border-t border-slate-100 dark:border-white/5">
                            <button onClick={() => router.push("/customer")} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300">Zum Dashboard</button>
                            <button onClick={() => setStep(1)} className="w-full py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:text-slate-600 transition">Weitere Bestellung</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
