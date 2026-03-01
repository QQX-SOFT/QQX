"use client";

import { useState, useEffect } from "react";
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
    ArrowRight,
    Package,
    Navigation,
    Route
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import AddressPicker from "@/components/AddressPicker";

export default function NewOrderPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);

    const [orderData, setOrderData] = useState({
        senderName: "",
        senderAddress: "",
        recipientName: "",
        recipientAddress: "",
        details: "",
        weight: "SMALL",
        urgency: "NORMAL",
        amount: 0,
        distanceKm: 0,
        durationMin: 0
    });

    // Calculate price whenever distance or weight changes
    useEffect(() => {
        if (orderData.distanceKm > 0) {
            const basePrice = orderData.weight === "SMALL" ? 12.00 : 18.00;
            const perKm = orderData.weight === "SMALL" ? 0.70 : 1.10;
            const expressMarkup = orderData.urgency === "EXPRESS" ? 15.00 : 0;

            const total = basePrice + (orderData.distanceKm * perKm) + expressMarkup;
            setOrderData(prev => ({ ...prev, amount: Math.max(15.00, Math.ceil(total)) }));
        }
    }, [orderData.distanceKm, orderData.weight, orderData.urgency]);

    const fetchQuote = async () => {
        if (!orderData.senderAddress || !orderData.recipientAddress) return;

        setCalculating(true);
        try {
            const { data } = await api.get("/orders/quote", {
                params: {
                    origin: orderData.senderAddress,
                    destination: orderData.recipientAddress
                }
            });
            setOrderData(prev => ({
                ...prev,
                distanceKm: data.distanceKm,
                durationMin: data.durationMin
            }));
            setStep(2);
        } catch (e) {
            alert("Mesafe hesaplanamadı. Lütfen adresleri kontrol edin.");
        } finally {
            setCalculating(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post("/orders", {
                ...orderData,
                customerName: orderData.recipientName,
                address: orderData.recipientAddress,
                amount: orderData.amount,
                source: "DIRECT"
            });
            setStep(3);
        } catch (e) {
            alert("Bestellung konnte nicht erstellt werden.");
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
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none mb-1">Yeni Gönderi</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step === 3 ? "Tamamlandı" : `Adım ${step} / 2`}</p>
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
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
                            {/* Sender Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                                        <Navigation size={16} />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Gönderici Bilgileri</h3>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">İsim / Firma</label>
                                    <input
                                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700/50 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/5 transition shadow-sm"
                                        placeholder="Kimin adına?"
                                        value={orderData.senderName}
                                        onChange={e => setOrderData({ ...orderData, senderName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Çıkış Adresi (Suchen)</label>
                                    <AddressPicker
                                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700/50 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/5 transition shadow-sm"
                                        onAddressSelect={(addr) => setOrderData({ ...orderData, senderAddress: addr.fullAddress })}
                                        placeholder="Nereden alınacak?"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-white/5" />

                            {/* Recipient Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                                        <MapPin size={16} />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Alıcı Bilgileri</h3>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Teslim Edilecek Kişi</label>
                                    <input
                                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700/50 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/5 transition shadow-sm"
                                        placeholder="Kime gidiyor?"
                                        value={orderData.recipientName}
                                        onChange={e => setOrderData({ ...orderData, recipientName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Varış Adresi (Suchen)</label>
                                    <AddressPicker
                                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700/50 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/5 transition shadow-sm"
                                        onAddressSelect={(addr) => setOrderData({ ...orderData, recipientAddress: addr.fullAddress })}
                                        placeholder="Nereye teslim edilecek?"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={!orderData.senderAddress || !orderData.recipientAddress || calculating}
                            onClick={fetchQuote}
                            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            {calculating ? <Loader2 className="animate-spin" size={20} /> : <Route size={20} />}
                            {calculating ? "Mesafe Hesaplanıyor..." : "Mesafe ve Fiyatı Hesapla"}
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
                            {/* Route Info */}
                            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Tahmini Mesafe</p>
                                        <p className="font-black text-slate-900 dark:text-white">{orderData.distanceKm.toFixed(1)} km</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Tahmini Süre</p>
                                    <p className="font-black text-slate-900 dark:text-white">{orderData.durationMin} Dakika</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Paket Boyutu</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: "SMALL", name: "Standart", desc: "Motosiklet", icon: ShoppingBag },
                                        { id: "LARGE", name: "Büyük", desc: "Araç / Panelvan", icon: Truck },
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setOrderData({ ...orderData, weight: cat.id })}
                                            className={cn(
                                                "p-6 rounded-[2rem] border-2 transition-all duration-300 text-left relative overflow-hidden group/cat focus:outline-none",
                                                orderData.weight === cat.id
                                                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20"
                                                    : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white hover:border-slate-300"
                                            )}
                                        >
                                            <cat.icon size={24} className={cn("mb-4", orderData.weight === cat.id ? "text-white" : "text-blue-600")} />
                                            <h4 className="font-black uppercase tracking-widest text-sm leading-none mb-1">{cat.name}</h4>
                                            <p className={cn("text-[10px] font-bold uppercase tracking-widest leading-none", orderData.weight === cat.id ? "text-blue-100" : "text-slate-400")}>{cat.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div
                                onClick={() => setOrderData({ ...orderData, urgency: orderData.urgency === 'EXPRESS' ? 'NORMAL' : 'EXPRESS' })}
                                className={cn(
                                    "p-8 rounded-[2rem] flex items-center justify-between group cursor-pointer transition-all duration-300 border",
                                    orderData.urgency === 'EXPRESS'
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden",
                                        orderData.urgency === 'EXPRESS' ? "bg-white/20 text-white" : "bg-white dark:bg-slate-800 text-blue-600"
                                    )}>
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className={cn("font-black text-sm uppercase tracking-tight", orderData.urgency === 'EXPRESS' ? "text-white" : "text-slate-900 dark:text-white")}>Express Teslimat?</h4>
                                        <p className={cn("text-[10px] font-black uppercase tracking-widest", orderData.urgency === 'EXPRESS' ? "text-blue-100" : "text-blue-600")}>+ €15,00 Sabit Ücret</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-12 h-12 rounded-full border-2 flex items-center justify-center transition",
                                    orderData.urgency === 'EXPRESS' ? "border-white bg-white/10" : "border-blue-200 dark:border-blue-900"
                                )}>
                                    <div className={cn(
                                        "w-3 h-3 rounded-full transition",
                                        orderData.urgency === 'EXPRESS' ? "bg-white scale-125" : "bg-blue-200 dark:bg-blue-900"
                                    )} />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center">
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Tutar</p>
                                        <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tabular-nums tracking-tighter shadow-sm">€{orderData.amount.toFixed(2)}</h4>
                                    </div>
                                </div>
                                <ShieldCheck size={32} className="text-slate-100 dark:text-slate-800" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setStep(1)} className="py-6 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:text-slate-600 transition active:scale-95">Geri</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>Siparişi Onayla <ArrowRight size={16} /></>
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
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute -inset-4 border-2 border-dashed border-green-200 dark:border-green-900 rounded-full opacity-30" />
                        </div>

                        <div className="space-y-4 max-w-sm mx-auto">
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Harika! 🎉</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Siparişiniz başarıyla oluşturuldu ve en yakın kuryeye yönlendirildi.</p>
                        </div>

                        <div className="flex flex-col gap-4 max-w-sm mx-auto mt-12 pt-10 border-t border-slate-100 dark:border-white/5">
                            <button onClick={() => router.push("/customer")} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300">Panele Dön</button>
                            <button onClick={() => setStep(1)} className="w-full py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:text-slate-600 transition">Yeni Gönderi</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
