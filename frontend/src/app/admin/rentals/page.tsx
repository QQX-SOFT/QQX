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
    Euro
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type RentalCar = {
    id: string;
    make: string;
    model: string;
    licensePlate: string;
    dailyPrice: number;
    status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
    image?: string;
};

type RentalRequest = {
    id: string;
    carId: string;
    carName: string;
    driverName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
};

export default function AdminRentalsPage() {
    const [cars, setCars] = useState<RentalCar[]>([
        { id: "1", make: "Toyota", model: "Corolla", licensePlate: "W-12345-X", dailyPrice: 45, status: "AVAILABLE" },
        { id: "2", make: "Mercedes", model: "Sprinter", licensePlate: "W-99887-A", dailyPrice: 85, status: "RENTED" },
        { id: "3", make: "Volkswagen", model: "Caddy", licensePlate: "W-55443-B", dailyPrice: 55, status: "AVAILABLE" },
    ]);

    const [requests, setRequests] = useState<RentalRequest[]>([
        { id: "REQ-001", carId: "1", carName: "Toyota Corolla", driverName: "Max Mustermann", startDate: "2026-03-05", endDate: "2026-03-10", totalPrice: 225, status: "PENDING", createdAt: new Date().toISOString() },
        { id: "REQ-002", carId: "3", carName: "VW Caddy", driverName: "Sabine Weber", startDate: "2026-03-01", endDate: "2026-03-03", totalPrice: 110, status: "APPROVED", createdAt: new Date().toISOString() },
    ]);

    const [loading, setLoading] = useState(false);
    const [showAddCarModal, setShowAddCarModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"REQUESTS" | "FLEET">("REQUESTS");

    const handleApprove = (id: string) => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "APPROVED" } : req));
    };

    const handleReject = (id: string) => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "REJECTED" } : req));
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <Key size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Operations</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Fahrzeugvermietung</h1>
                    <p className="text-slate-500 font-medium">Verwalten Sie Mietanfragen und den speziellen Miet-Fuhrpark.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowAddCarModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Mietwagen hinzufügen
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-100 p-1">
                <button
                    onClick={() => setActiveTab("REQUESTS")}
                    className={cn(
                        "px-6 py-4 text-sm font-black uppercase tracking-widest transition-all relative",
                        activeTab === "REQUESTS" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    Anfragen
                    {requests.filter(r => r.status === 'PENDING').length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                            {requests.filter(r => r.status === 'PENDING').length}
                        </span>
                    )}
                    {activeTab === "REQUESTS" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab("FLEET")}
                    className={cn(
                        "px-6 py-4 text-sm font-black uppercase tracking-widest transition-all relative",
                        activeTab === "FLEET" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    Miet-Fuhrpark
                    {activeTab === "FLEET" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
                </button>
            </div>

            {activeTab === "REQUESTS" ? (
                <div className="space-y-6">
                    {/* Requests List */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Antragsteller</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fahrzeug</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Zeitraum</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Gesamtpreis</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {requests.map((req, i) => (
                                    <motion.tr
                                        key={req.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-slate-50/50 transition group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                                    <User size={16} />
                                                </div>
                                                <span className="font-black text-slate-900 leading-none">{req.driverName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 leading-none mb-1">{req.carName}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">ID: {req.carId}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <Calendar size={14} className="text-slate-300" />
                                                {new Date(req.startDate).toLocaleDateString('de-DE')} - {new Date(req.endDate).toLocaleDateString('de-DE')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-slate-900">€{req.totalPrice.toFixed(2)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                                req.status === "PENDING" ? "bg-amber-50 text-amber-600" :
                                                    req.status === "APPROVED" ? "bg-green-50 text-green-600" :
                                                        "bg-red-50 text-red-600"
                                            )}>
                                                {req.status === "PENDING" ? <Clock size={12} /> :
                                                    req.status === "APPROVED" ? <CheckCircle2 size={12} /> :
                                                        <XCircle size={12} />}
                                                {req.status === "PENDING" ? "Wartend" :
                                                    req.status === "APPROVED" ? "Genehmigt" : "Abgelehnt"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {req.status === "PENDING" ? (
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={() => handleApprove(req.id)}
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req.id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="p-2 text-slate-300">
                                                    <MoreVertical size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cars.map((car, i) => (
                        <motion.div
                            key={car.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition duration-500">
                                    <Car size={32} />
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                                    car.status === "AVAILABLE" ? "bg-green-50 text-green-600" :
                                        car.status === "RENTED" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                                )}>
                                    {car.status === "AVAILABLE" ? "Verfügbar" : car.status === "RENTED" ? "Vermietet" : "Wartung"}
                                </div>
                            </div>

                            <div className="relative z-10 space-y-4">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{car.make} {car.model}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <Euro size={12} className="text-blue-600" />
                                    {car.dailyPrice} <span className="text-[10px]">/ Tag</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-slate-900 font-black">{car.licensePlate}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-end relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: {car.id.padStart(4, '0')}</span>
                                </div>
                                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <Car className="absolute bottom-[-30px] right-[-30px] text-slate-50 opacity-[0.03] group-hover:scale-110 transition duration-1000" size={180} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
