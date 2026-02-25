"use client";

import { useState } from "react";
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Star,
    FileText,
    Download,
    Mail,
    Phone,
    ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const mockDrivers = [
    {
        id: "1",
        name: "Marco Reus",
        email: "marco.r@logistic.de",
        status: "Active",
        rating: 4.8,
        totalHours: 164,
        deliveries: 412,
        avatar: "MR"
    },
    {
        id: "2",
        name: "Sarah Meyer",
        email: "s.meyer@logistic.de",
        status: "Active",
        rating: 4.9,
        totalHours: 152,
        deliveries: 389,
        avatar: "SM"
    },
    {
        id: "3",
        name: "Thomas Müller",
        email: "t.mueller@logistic.de",
        status: "Inactive",
        rating: 4.5,
        totalHours: 120,
        deliveries: 245,
        avatar: "TM"
    },
    {
        id: "4",
        name: "Lena Fischer",
        email: "l.fischer@logistic.de",
        status: "Active",
        rating: 4.7,
        totalHours: 178,
        deliveries: 456,
        avatar: "LF"
    },
];

export default function DriversPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Fahrer-Management</h1>
                    <p className="text-slate-500 font-medium">Verwalten Sie Ihre Fahrer, prüfen Sie Bewertungen und erstellen Sie Berichte.</p>
                </div>
                <button className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200">
                    <Plus size={20} />
                    Neuen Fahrer hinzufügen
                </button>
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white border border-slate-200 p-2 rounded-2xl flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                    <div className="p-3">
                        <Search size={20} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Fahrer suchen..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 py-2 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 font-bold text-slate-600 hover:bg-slate-50 transition">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {/* Drivers List */}
            <div className="grid grid-cols-1 gap-6">
                {mockDrivers.map((driver, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={driver.id}
                        className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500 flex flex-col lg:flex-row lg:items-center gap-8"
                    >
                        {/* Profile Info */}
                        <div className="flex items-center gap-6 min-w-[300px]">
                            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                                {driver.avatar}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition">{driver.name}</h3>
                                <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", driver.status === "Active" ? "bg-green-500" : "bg-slate-300")} />
                                        {driver.status}
                                    </span>
                                    <span>•</span>
                                    <span>{driver.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 flex-1">
                            <div className="text-center lg:text-left">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bewertung</p>
                                <div className="flex items-center justify-center lg:justify-start gap-1 text-yellow-500 font-black">
                                    <Star size={16} className="fill-current" />
                                    <span>{driver.rating}</span>
                                </div>
                            </div>
                            <div className="text-center lg:text-left">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stunden</p>
                                <p className="font-black text-slate-900">{driver.totalHours}h</p>
                            </div>
                            <div className="text-center lg:text-left">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lieferungen</p>
                                <p className="font-black text-slate-900">{driver.deliveries}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 justify-end">
                            <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Bericht erstellen">
                                <FileText size={20} />
                            </button>
                            <button className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition" title="Export PDF">
                                <Download size={20} />
                            </button>
                            <div className="h-8 w-px bg-slate-100 mx-2" />
                            <button className="px-6 py-3 bg-slate-50 text-slate-900 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-900 hover:text-white transition">
                                Profil
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
