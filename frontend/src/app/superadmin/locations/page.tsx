"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { MapPin, Plus, Search, Filter, MoreVertical, Building2, Users, Car, Globe, Trash2, X } from "lucide-react";

interface LocationData {
    id: string;
    name: string;
    address?: string;
    tenantId?: string;
    tenant?: { name: string };
    _count?: { users: number; vehicles: number };
}

export default function LocationsPage() {
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLoc, setNewLoc] = useState({ name: "", address: "", tenantId: "" });

    const fetchLocations = async () => {
        try {
            const { data } = await api.get("/superadmin/locations");
            setLocations(data);
        } catch (error) {
            console.error("Failed to fetch locations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/superadmin/locations", newLoc);
            setIsModalOpen(false);
            setNewLoc({ name: "", address: "", tenantId: "" });
            fetchLocations();
        } catch (error) {
            alert("Fehler beim Erstellen");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Sicher löschen?")) return;
        try {
            await api.delete(`/superadmin/locations/${id}`);
            fetchLocations();
        } catch (error) {
            alert("Fehler beim Löschen");
        }
    };

    const stats = [
        { label: "Gesamtstandorte", value: locations.length.toString(), icon: MapPin, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Benutzer (Total)", value: locations.reduce((acc: number, l: LocationData) => acc + (l._count?.users || 0), 0).toString(), icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Fahrzeuge (Total)", value: locations.reduce((acc: number, l: LocationData) => acc + (l._count?.vehicles || 0), 0).toString(), icon: Car, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase">
                        Standortverwaltung
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Verwalten Sie Filialen und organisatorische Einheiten systemweit.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Standort erstellen</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#0f111a] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm group hover:border-indigo-500/50 transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Table or Placeholder */}
            <div className="bg-white dark:bg-[#0f111a] rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Standorte durchsuchen..."
                            className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="p-8 animate-pulse bg-slate-50/50 dark:bg-white/5 h-24" />
                        ))
                    ) : locations.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mx-auto mb-6">
                                <MapPin size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Noch keine Standorte definiert</h3>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold transition"
                            >
                                Ersten Standort hinzufügen
                            </button>
                        </div>
                    ) : (
                        locations.map((loc: LocationData) => (
                            <div key={loc.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/5 transition group">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{loc.name}</h4>
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-lg">{loc.tenant?.name || "Global"}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Users size={12} /> {loc._count?.users || 0} User</span>
                                            <span className="flex items-center gap-1.5"><Car size={12} /> {loc._count?.vehicles || 0} Cars</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                        onClick={() => handleDelete(loc.id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f111a] w-full max-w-lg rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Standort Erstellen</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Name</label>
                                <input
                                    required
                                    value={newLoc.name}
                                    onChange={e => setNewLoc({ ...newLoc, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 font-bold"
                                    placeholder="Filiale Berlin..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tenant ID (Optional)</label>
                                <input
                                    value={newLoc.tenantId}
                                    onChange={e => setNewLoc({ ...newLoc, tenantId: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 font-bold"
                                    placeholder="Tenant UUID..."
                                />
                            </div>
                            <button className="w-full bg-indigo-500 py-4 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-indigo-600 transition">Speichern</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
