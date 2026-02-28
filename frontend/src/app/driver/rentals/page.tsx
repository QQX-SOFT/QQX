"use client";

import { useState, useEffect } from "react";
import {
    Key,
    Car,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    Plus,
    MoreVertical,
    User,
    ChevronRight,
    Loader2,
    X,
    Euro,
    ArrowLeft,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";

type RentalCar = {
    id: string;
    make: string;
    model: string;
    licensePlate: string;
    dailyPrice: number;
    status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
};

type UserRequest = {
    id: string;
    carName: string;
    startDate: string;
    endDate: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    totalPrice: number;
};

export default function DriverRentalsPage() {
    const [availableCars, setAvailableCars] = useState<RentalCar[]>([
        { id: "1", make: "Toyota", model: "Corolla", licensePlate: "W-12345-X", dailyPrice: 45, status: "AVAILABLE" },
        { id: "3", make: "Volkswagen", model: "Caddy", licensePlate: "W-55443-B", dailyPrice: 55, status: "AVAILABLE" },
        { id: "4", make: "Skoda", model: "Octavia", licensePlate: "W-11223-C", dailyPrice: 50, status: "AVAILABLE" },
    ]);

    const [myRequests, setMyRequests] = useState<UserRequest[]>([
        { id: "REQ-001", carName: "Toyota Corolla", startDate: "2026-03-05", endDate: "2026-03-10", status: "PENDING", totalPrice: 225 },
        { id: "REQ-002", carName: "VW Caddy", startDate: "2026-03-01", endDate: "2026-03-03", status: "APPROVED", totalPrice: 110 },
    ]);

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedCar, setSelectedCar] = useState<RentalCar | null>(null);
    const [requestDates, setRequestDates] = useState({ start: "", end: "" });
    const [submitting, setSubmitting] = useState(false);

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Simulated submission
            await new Promise(r => setTimeout(r, 1500));
            const newReq: UserRequest = {
                id: `REQ-${Math.floor(Math.random() * 1000)}`,
                carName: `${selectedCar?.make} ${selectedCar?.model}`,
                startDate: requestDates.start,
                endDate: requestDates.end,
                status: "PENDING",
                totalPrice: (selectedCar?.dailyPrice || 0) * 3 // Mock 3 days
            };
            setMyRequests([newReq, ...myRequests]);
            setShowRequestModal(false);
            setSelectedCar(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-slate-50 min-h-screen pb-32 font-sans">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/driver" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Mietwagen</h1>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Exklusive Flotte für Partner</p>
                    </div>
                </div>
            </header>

            {/* My Active Rentals / Requests */}
            <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2">Meine Anträge</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x">
                    {myRequests.map((req) => (
                        <div key={req.id} className="min-w-[280px] snap-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest",
                                    req.status === "PENDING" ? "bg-amber-50 text-amber-600" :
                                        req.status === "APPROVED" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                )}>
                                    {req.status === "PENDING" ? "Wartend" : req.status === "APPROVED" ? "Bestätigt" : "Abgelehnt"}
                                </div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{req.id}</p>
                            </div>
                            <h4 className="text-lg font-black text-slate-900 mb-1">{req.carName}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                <Calendar size={12} />
                                {new Date(req.startDate).toLocaleDateString('de-DE')} - {new Date(req.endDate).toLocaleDateString('de-DE')}
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                                <span className="text-lg font-black text-slate-900 tracking-tight">€{req.totalPrice.toFixed(2)}</span>
                            </div>

                            {/* Background Decor */}
                            <div className={cn(
                                "absolute -right-4 -bottom-4 opacity-5 transition duration-500 group-hover:scale-125",
                                req.status === "APPROVED" ? "text-green-600" : "text-amber-500"
                            )}>
                                {req.status === "APPROVED" ? <ShieldCheck size={100} /> : <Clock size={100} />}
                            </div>
                        </div>
                    ))}
                    {myRequests.length === 0 && (
                        <div className="w-full py-10 text-center text-slate-400 font-bold uppercase tracking-widest bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                            Keine aktiven Mietverträge
                        </div>
                    )}
                </div>
            </section>

            {/* Available Cars Grid */}
            <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2">Verfügbare Fahrzeuge</h3>
                <div className="grid grid-cols-1 gap-6">
                    {availableCars.map((car, i) => (
                        <motion.div
                            key={car.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
                        >
                            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition duration-500">
                                    <Car size={40} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{car.make} {car.model}</h4>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Miete / Tag</p>
                                            <p className="text-xl font-black text-blue-600 leading-none">€{car.dailyPrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        SOFORT VERFÜGBAR • {car.licensePlate}
                                    </p>

                                    <div className="pt-6">
                                        <button
                                            onClick={() => { setSelectedCar(car); setShowRequestModal(true); }}
                                            className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-950/20 hover:scale-105 active:scale-95 transition-all duration-300"
                                        >
                                            Jetzt Anfragen
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Background Decor */}
                            <Car className="absolute bottom-[-20px] right-[-20px] text-slate-50 opacity-[0.03] group-hover:scale-150 transition duration-1000" size={150} />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Request Modal */}
            <AnimatePresence>
                {showRequestModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="bg-white rounded-t-[3rem] sm:rounded-[3rem] p-10 w-full max-w-xl shadow-2xl relative font-sans"
                        >
                            <button onClick={() => setShowRequestModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-950 transition">
                                <X size={24} />
                            </button>
                            <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Mietanfrage</h2>
                            <p className="text-slate-400 text-sm font-medium mb-10">Legen Sie den Zeitraum für Ihren {selectedCar?.make} {selectedCar?.model} fest.</p>

                            <form onSubmit={handleRequestSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Abholung</label>
                                        <input
                                            type="date" required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-500 transition"
                                            value={requestDates.start}
                                            onChange={(e) => setRequestDates({ ...requestDates, start: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Rückgabe</label>
                                        <input
                                            type="date" required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-500 transition"
                                            value={requestDates.end}
                                            onChange={(e) => setRequestDates({ ...requestDates, end: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-[2rem] p-8 flex items-center justify-between mt-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                            <Euro size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Geschätzter Gesamtpreis</p>
                                            <h4 className="text-2xl font-black text-slate-950 tracking-tight leading-none">€{(selectedCar?.dailyPrice || 0) * 3} <span className="text-xs text-slate-400">(3 Tage)</span></h4>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-6 mt-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : "Verbindlich Anfragen"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] py-4 leading-relaxed">QQX Fleet Management Partner System • v2.0</p>
        </div>
    );
}
