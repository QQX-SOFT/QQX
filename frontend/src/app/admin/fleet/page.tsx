"use client";

import { useState, useEffect } from "react";
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
    ChevronRight,
    Loader2,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function FleetPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({
        licensePlate: "",
        make: "",
        model: "",
        milage: 0,
        nextMaintenance: ""
    });
    const [creating, setCreating] = useState(false);

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

    const handleCreateVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post("/vehicles", {
                ...newVehicle,
                milage: Number(newVehicle.milage)
            });
            setShowAddModal(false);
            setNewVehicle({ licensePlate: "", make: "", model: "", milage: 0, nextMaintenance: "" });
            fetchVehicles();
        } catch (e: any) {
            alert(e.response?.data?.error || "Fehler beim Erstellen des Fahrzeugs");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Fuhrpark & Wartung</h1>
                    <p className="text-slate-500 font-medium">Überwachen Sie Ihre Fahrzeuge, Kilometerstände und anstehende Inspektionen.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200"
                >
                    <Plus size={20} />
                    Neues Fahrzeug hinzufügen
                </button>
            </header>

            {/* Fleet Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Gesamt Fuhrpark", value: vehicles.length.toString(), icon: Car, color: "blue" },
                    { label: "In Wartung", value: "0", icon: Wrench, color: "red" },
                    { label: "Verfügbar", value: vehicles.length.toString(), icon: CheckCircle, color: "green" },
                    { label: "Durchschn. Alter", value: "1.2 J.", icon: Calendar, color: "slate" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                            stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                                stat.color === "red" ? "bg-red-50 text-red-600" :
                                    stat.color === "green" ? "bg-green-50 text-green-600" :
                                        "bg-slate-50 text-slate-600"
                        )}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <Car className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 font-bold uppercase tracking-widest">Keine Fahrzeuge im Bestand</p>
                    </div>
                ) : vehicles.map((vehicle, i) => (
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
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{vehicle.make} {vehicle.model}</h3>
                                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">{vehicle.licensePlate}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600"
                            )}>
                                Verfügbar
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
                            <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Fuel size={14} /> Kilometerstand
                                </p>
                                <p className="text-xl font-black text-slate-900">{vehicle.milage.toLocaleString()} km</p>
                            </div>
                            <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Wrench size={14} /> Nächster Service
                                </p>
                                <p className="text-xl font-black text-slate-900">
                                    {vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toLocaleDateString('de-DE') : "Nicht geplant"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">Fahrzeug-Zustand</span>
                                <span className="text-green-600">95%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "95%" }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full rounded-full bg-green-500"
                                />
                            </div>
                        </div>

                        <Car className="absolute bottom-[-40px] right-[-40px] text-slate-50 opacity-[0.03] group-hover:scale-150 transition duration-1000" size={240} />

                        <button className="absolute top-8 right-8 p-3 text-slate-300 hover:text-slate-900 transition">
                            <MoreVertical size={20} />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Add Vehicle Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative"
                        >
                            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>
                            <h2 className="text-3xl font-black text-slate-900 mb-8">Fahrzeug hinzufügen</h2>
                            <form onSubmit={handleCreateVehicle} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Marke</label>
                                        <input
                                            type="text" required
                                            placeholder="z.B. Mercedes-Benz"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                                            value={newVehicle.make}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Modell</label>
                                        <input
                                            type="text" required
                                            placeholder="z.B. Sprinter"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                                            value={newVehicle.model}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Kennzeichen</label>
                                        <input
                                            type="text" required
                                            placeholder="B-QX 123"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                                            value={newVehicle.licensePlate}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Kilometerstand</label>
                                        <input
                                            type="number" required
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                                            value={newVehicle.milage}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, milage: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nächste Wartung</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition"
                                        value={newVehicle.nextMaintenance}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, nextMaintenance: e.target.value })}
                                    />
                                </div>
                                <div className="pt-6 flex gap-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition">Abbrechen</button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                    >
                                        {creating ? <Loader2 className="animate-spin" size={20} /> : "Fahrzeug Hinzufügen"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
