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

type Vehicle = {
    id: string;
    make: string;
    model: string;
    licensePlate: string;
    milage: number;
    status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "SERVICE";
    nextMaintenance: string | null;
    createdAt: string;
};

export default function AdminRentalsPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"VEHICLES">("VEHICLES");

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const { data } = await api.get("/vehicles");
            setVehicles(data);
        } catch (e) {
            console.error("Failed to fetch vehicles", e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/vehicles/${id}/status`, { status: newStatus });
            fetchVehicles();
        } catch (e) {
            console.error("Failed to update vehicle status", e);
        }
    };

    const statusLabels: Record<string, { label: string; color: string }> = {
        AVAILABLE: { label: "Verfügbar", color: "bg-green-50 text-green-600" },
        IN_USE: { label: "In Nutzung", color: "bg-blue-50 text-blue-600" },
        MAINTENANCE: { label: "Wartung", color: "bg-red-50 text-red-600" },
        SERVICE: { label: "Service", color: "bg-amber-50 text-amber-600" },
    };

    const availableCount = vehicles.filter(v => v.status === "AVAILABLE").length;
    const inUseCount = vehicles.filter(v => v.status === "IN_USE").length;
    const maintenanceCount = vehicles.filter(v => v.status === "MAINTENANCE" || v.status === "SERVICE").length;

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
                    <p className="text-slate-500 font-medium">Verwalten Sie die verfügbaren Fahrzeuge Ihrer Flotte.</p>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verfügbar</p>
                    <h3 className="text-2xl font-black text-green-600">{availableCount}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Nutzung</p>
                    <h3 className="text-2xl font-black text-blue-600">{inUseCount}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wartung / Service</p>
                    <h3 className="text-2xl font-black text-red-600">{maintenanceCount}</h3>
                </div>
            </div>

            {/* Vehicles Grid */}
            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
                </div>
            ) : vehicles.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <Car className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest">Keine Fahrzeuge vorhanden</p>
                    <p className="text-slate-400 text-sm mt-2">Erstellen Sie Fahrzeuge in der Fahrzeugverwaltung.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vehicles.map((vehicle, i) => {
                        const statusInfo = statusLabels[vehicle.status] || statusLabels.AVAILABLE;

                        return (
                            <motion.div
                                key={vehicle.id}
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
                                        statusInfo.color
                                    )}>
                                        {statusInfo.label}
                                    </div>
                                </div>

                                <div className="relative z-10 space-y-4">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{vehicle.make} {vehicle.model}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="text-slate-900 font-black">{vehicle.licensePlate}</span>
                                        <span className="mx-2">•</span>
                                        <span>{vehicle.milage.toLocaleString('de-DE')} km</span>
                                    </div>
                                    {vehicle.nextMaintenance && (
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                            <Calendar size={12} />
                                            Nächste Wartung: {new Date(vehicle.nextMaintenance).toLocaleDateString('de-DE')}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-end relative z-10">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            Erstellt: {new Date(vehicle.createdAt).toLocaleDateString('de-DE')}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {vehicle.status === "AVAILABLE" && (
                                            <button
                                                onClick={() => handleStatusChange(vehicle.id, "IN_USE")}
                                                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition"
                                            >
                                                Vergeben
                                            </button>
                                        )}
                                        {vehicle.status === "IN_USE" && (
                                            <button
                                                onClick={() => handleStatusChange(vehicle.id, "AVAILABLE")}
                                                className="px-3 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition"
                                            >
                                                Freigeben
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <Car className="absolute bottom-[-30px] right-[-30px] text-slate-50 opacity-[0.03] group-hover:scale-110 transition duration-1000" size={180} />
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
