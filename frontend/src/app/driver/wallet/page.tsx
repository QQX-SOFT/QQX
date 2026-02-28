"use client";

import { useState, useEffect } from "react";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    TrendingUp,
    Star,
    ArrowLeft,
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DriverWalletPage() {
    const [payouts] = useState([
        { id: "1", amount: 450.00, date: "Gestern", status: "PAID", period: "Feb 20-27" },
        { id: "2", amount: 392.10, date: "vor 8 Tagen", status: "PAID", period: "Feb 13-20" },
        { id: "3", amount: 124.50, date: "Heute", status: "PENDING", period: "Aktuelle Woche" },
    ]);

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 bg-slate-50 min-h-screen pb-24 font-sans">
            {/* Header */}
            <header className="flex items-center gap-4 mb-6">
                <Link href="/driver" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finanzen</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auszahlungen & Verdienste</p>
                </div>
            </header>

            {/* Wallet Card */}
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-blue-900/10">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Aktuell Verfügbar</p>
                            <h3 className="text-5xl font-black tracking-tighter tabular-nums">€124,50</h3>
                        </div>
                        <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition duration-500">
                            <Wallet size={32} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-slate-900 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-white/5 active:bg-slate-50 transition"
                        >
                            Auszahlung
                        </motion.button>
                        <button className="bg-slate-800 text-white/80 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest border border-white/5 hover:bg-slate-700 transition">
                            Details
                        </button>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition duration-500">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-500">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lieferprovision</p>
                            <h4 className="text-xl font-black text-slate-900 tabular-nums">€85,20</h4>
                        </div>
                    </div>
                    <div className="text-[9px] font-black text-green-600 bg-green-50 px-2.5 py-1.5 rounded-full uppercase tracking-tighter">+15%</div>
                </div>

                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition duration-500">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition duration-500">
                            <Star size={24} className="fill-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trinkgeld (Bar/Online)</p>
                            <h4 className="text-xl font-black text-slate-900 tabular-nums">€39,30</h4>
                        </div>
                    </div>
                    <div className="text-[9px] font-black text-green-600 bg-green-50 px-2.5 py-1.5 rounded-full uppercase tracking-tighter">+5%</div>
                </div>
            </div>

            {/* Payout History */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Verlauf</h3>
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-400 bg-white border border-slate-100 rounded-xl">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {payouts.map((p) => (
                        <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:shadow-lg transition-all duration-500 relative overflow-hidden">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition duration-500 group-hover:scale-110",
                                p.status === "PAID" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                            )}>
                                {p.status === "PAID" ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-slate-900 text-lg leading-none tracking-tight">€{p.amount.toFixed(2)}</h4>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 rounded-full shrink-0",
                                        p.status === "PAID" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        {p.status === "PAID" ? "Bezahlt" : "In Prüfung"}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Auszahlung: {p.date} • {p.period}</p>
                            </div>

                            <button className="p-3 text-slate-200 group-hover:text-blue-600 group-hover:bg-blue-50 transition duration-500 rounded-2xl">
                                <Download size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Download Button Full Width */}
            <button className="w-full bg-slate-950 text-white rounded-[2rem] py-8 flex items-center justify-center gap-4 shadow-xl hover:bg-black transition-all duration-300 active:scale-[0.98]">
                <Download size={24} />
                <span className="text-lg font-black uppercase tracking-widest">Abrechnung downloaden</span>
            </button>
        </div>
    );
}
