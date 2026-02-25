"use client";

import {
    Car,
    Settings,
    Wrench,
    Fuel,
    Plus,
    AlertTriangle,
    Calendar,
    CheckCircle,
    MoreVertical,
    ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const mockVehicles = [
    { id: "1", model: "Mercedes Sprinter", plate: "B-QX 102", status: "In Use", milage: "42.500 km", nextService: "15. Apr 2026", health: 95 },
    { id: "2", model: "VW Crafter", plate: "B-QX 205", status: "Maintenance", milage: "89.200 km", nextService: "In Arbeit", health: 65 },
    { id: "3", model: "Ford Transit", plate: "B-QX 312", status: "Available", milage: "12.400 km", nextService: "12. Okt 2026", health: 100 },
    { id: "4", model: "Mercedes Vito", plate: "B-QX 440", status: "In Use", milage: "64.100 km", nextService: "02. Mai 2026", health: 82 },
];

export default function FleetPage() {
    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Fuhrpark & Wartung</h1>
                    <p className="text-slate-500 font-medium">Überwachen Sie Ihre Fahrzeuge, Kilometerstände und anstehende Inspektionen.</p>
                </div>
                <button className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200">
                    <Plus size={20} />
                    Neues Fahrzeug hinzufügen
                </button>
            </header>

            {/* Fleet Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Gesamt Fuhrpark", value: "24", icon: Car, color: "blue" },
                    { label: "In Wartung", value: "3", icon: Wrench, color: "red" },
                    { label: "Verfügbar", value: "18", icon: CheckCircle, color: "green" },
                    { label: "Durchschn. Alter", value: "2.4 J.", icon: Calendar, color: "slate" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-6`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {mockVehicles.map((vehicle, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={vehicle.id}
                        className="group bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition duration-500">
                                    <Car size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{vehicle.model}</h3>
                                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">{vehicle.plate}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                vehicle.status === "In Use" ? "bg-blue-50 text-blue-600" : vehicle.status === "Maintenance" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                            )}>
                                {vehicle.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
                            <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Fuel size={14} /> Kilometerstand
                                </p>
                                <p className="text-xl font-black text-slate-900">{vehicle.milage}</p>
                            </div>
                            <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Wrench size={14} /> Nächster Service
                                </p>
                                <p className="text-xl font-black text-slate-900">{vehicle.nextService}</p>
                            </div>
                        </div>

                        {/* Vehicle Health Bar */}
                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">Fahrzeug-Zustand</span>
                                <span className={cn(
                                    vehicle.health > 90 ? "text-green-600" : vehicle.health > 75 ? "text-blue-600" : "text-red-600"
                                )}>{vehicle.health}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${vehicle.health}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className={cn(
                                        "h-full rounded-full",
                                        vehicle.health > 90 ? "bg-green-500" : vehicle.health > 75 ? "bg-blue-500" : "bg-red-500"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Decorative Background Icon */}
                        <Car className="absolute bottom-[-40px] right-[-40px] text-slate-50 opacity-[0.03] group-hover:scale-150 transition duration-1000" size={240} />

                        {/* Action Hover Overlay (Maybe simple menu instead for now) */}
                        <button className="absolute top-8 right-8 p-3 text-slate-300 hover:text-slate-900 transition">
                            <MoreVertical size={20} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
