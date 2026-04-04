"use client";

import React, { useState, useEffect } from "react";
import { 
    Loader2, 
    Calendar, 
    MapPin, 
    Plus, 
    Clock, 
    Users, 
    Trash2, 
    ChevronRight,
    Search,
    Filter,
    PlusCircle,
    CheckCircle2,
    XCircle,
    LayoutGrid,
    List
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminShiftsPage() {
    const [activeTab, setActiveTab] = useState<"PLAN" | "AREAS">("PLAN");
    const [shifts, setShifts] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAreaModal, setShowAreaModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);

    const [newArea, setNewArea] = useState({ name: "", city: "", zipCodes: "", latitude: "", longitude: "", radius: 500 });
    const [newShift, setNewShift] = useState({ 
        areaId: "", 
        date: new Date().toISOString().split('T')[0], 
        startTime: "08:00", 
        endTime: "16:00", 
        maxDrivers: 1 
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sData, aData, dData] = await Promise.all([
                api.get("/shifts"),
                api.get("/shifts/areas"),
                api.get("/drivers")
            ]);
            setShifts(sData.data);
            setAreas(aData.data);
            setDrivers(dData.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const createArea = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/shifts/areas", {
                ...newArea,
                latitude: newArea.latitude ? parseFloat(newArea.latitude) : null,
                longitude: newArea.longitude ? parseFloat(newArea.longitude) : null,
                radius: parseInt(newArea.radius.toString())
            });
            setShowAreaModal(false);
            setNewArea({ name: "", city: "", zipCodes: "", latitude: "", longitude: "", radius: 500 });
            fetchData();
        } catch (e) { alert("Fehler"); }
    };

    const createShift = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const startStr = `${newShift.date}T${newShift.startTime}:00`;
            const endStr = `${newShift.date}T${newShift.endTime}:00`;
            await api.post("/shifts", {
                areaId: newShift.areaId,
                startTime: new Date(startStr).toISOString(),
                endTime: new Date(endStr).toISOString(),
                maxDrivers: newShift.maxDrivers
            });
            setShowShiftModal(false);
            fetchData();
        } catch (e) { alert("Fehler"); }
    };

    const deleteShift = async (id: string) => {
        if (!confirm("Möchten Sie diese Schicht wirklich löschen?")) return;
        try {
            await api.delete(`/shifts/${id}`);
            fetchData();
        } catch (e) { alert("Fehler"); }
    };

    // Quick assignment (Simplified)
    const assignDriver = async (shiftId: string, driverId: string) => {
        try {
            await api.post(`/shifts/${shiftId}/assign`, { driverId });
            fetchData();
        } catch (e) { alert("Fehler beim Zuweisen"); }
    };

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight">Schichtmanagement</h1>
                   <p className="text-slate-500 font-medium tracking-tight uppercase text-[10px] tracking-widest mt-1">Verwaltung von Schichten und Gebieten</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                        onClick={() => setActiveTab("PLAN")}
                        className={cn("px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all", activeTab === "PLAN" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                    >
                        Schichtplan
                    </button>
                    <button 
                        onClick={() => setActiveTab("AREAS")}
                        className={cn("px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all", activeTab === "AREAS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                    >
                        Gebiete
                    </button>
                </div>
            </header>

            {activeTab === "PLAN" ? (
                <div className="space-y-8">
                    <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 group cursor-pointer">
                                <Calendar size={18} className="text-slate-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition">Diese Woche</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200" />
                            <div className="flex items-center gap-2 group cursor-pointer">
                                <Filter size={18} className="text-slate-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition">Filter</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowShiftModal(true)}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition shadow-2xl"
                        >
                            Neue Schicht erstellen
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {shifts.map(shift => {
                            const startTime = new Date(shift.startTime);
                            const endTime = new Date(shift.endTime);
                            const isFull = shift.assignments.length >= shift.maxDrivers;

                            return (
                                <div key={shift.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg p-8 space-y-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-blue-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{shift.area.name}</span>
                                            </div>
                                            <h3 className="font-black text-slate-900 text-lg">
                                                {startTime.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                                            </h3>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            isFull ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                                        )}>
                                            {isFull ? "Voll Belegt" : `${shift.maxDrivers - shift.assignments.length} Frei`}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-slate-300" />
                                            <span className="text-sm font-black text-slate-700">
                                                {startTime.getHours().toString().padStart(2, '0')}:{startTime.getMinutes().toString().padStart(2, '0')} - {endTime.getHours().toString().padStart(2, '0')}:{endTime.getMinutes().toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Fahrerzuweisungen</div>
                                        <div className="flex flex-wrap gap-2">
                                            {shift.assignments.map((as: any) => (
                                                <div key={as.id} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl group transition hover:bg-slate-100 border border-slate-100">
                                                    <div className="w-5 h-5 bg-slate-900 rounded-lg flex items-center justify-center text-[10px] text-white font-black">{as.driver.firstName[0]}</div>
                                                    <span className="text-[10px] font-black text-slate-700">{as.driver.lastName}</span>
                                                </div>
                                            ))}
                                            {!isFull && (
                                                <div className="relative group/assign">
                                                    <button className="p-2 bg-white border border-dashed border-slate-200 rounded-xl text-slate-300 hover:text-blue-600 hover:border-blue-600 transition">
                                                        <Plus size={16} />
                                                    </button>
                                                    <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-2xl border border-slate-100 p-2 z-10 w-48 hidden group-hover/assign:block animate-in fade-in zoom-in-95">
                                                        <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-2 py-1">Schnellzuweisung</div>
                                                        {drivers.filter(d => !shift.assignments.some((a: any) => a.driverId === d.id)).slice(0, 5).map(driver => (
                                                            <button 
                                                                key={driver.id}
                                                                onClick={() => assignDriver(shift.id, driver.id)}
                                                                className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-700 transition"
                                                            >
                                                                {driver.firstName} {driver.lastName}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => deleteShift(shift.id)}
                                        className="w-full pt-4 border-t border-slate-50 flex items-center justify-center gap-2 text-red-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Löschen</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-xl"><MapPin size={18} className="text-white" /></div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Neues Gebiet anlegen</h3>
                        </div>
                        <form onSubmit={createArea} className="space-y-6 text-black">
                            <input 
                                placeholder="Gebietsname (z.B. Wien Mitte)" 
                                className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                value={newArea.name}
                                onChange={e => setNewArea({...newArea, name: e.target.value})}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    placeholder="Latitude (z.B. 48.2082)" 
                                    type="number"
                                    step="0.000001"
                                    className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                    value={newArea.latitude}
                                    onChange={e => setNewArea({...newArea, latitude: e.target.value})}
                                />
                                <input 
                                    placeholder="Longitude (z.B. 16.3738)" 
                                    type="number"
                                    step="0.000001"
                                    className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                    value={newArea.longitude}
                                    onChange={e => setNewArea({...newArea, longitude: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Radius in Metern (für Startbeschränkung)</label>
                                <input 
                                    placeholder="Radius (Standard 500m)" 
                                    type="number"
                                    className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                    value={newArea.radius}
                                    onChange={e => setNewArea({...newArea, radius: parseInt(e.target.value)})}
                                />
                            </div>
                            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition shadow-xl">
                                Gebiet speichern
                            </button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Vorhandene Gebiete</div>
                        {areas.map(area => (
                            <div key={area.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition group-hover:scale-110">
                                        <MapPin size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900">{area.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{area.city || 'N/A'}</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-[10px] font-bold text-slate-400">{area.zipCodes || 'Keine PLZ'}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-200 group-hover:text-blue-500 transition group-hover:translate-x-1" size={20} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Shift Modal */}
            {showShiftModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3.5rem] p-12 max-w-lg w-full shadow-2xl border border-slate-100 space-y-10 animate-in zoom-in-95 duration-500 text-black">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl"><PlusCircle size={18} className="text-white" /></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Neue Schicht</h3>
                            </div>
                            <button onClick={() => setShowShiftModal(false)} className="text-slate-300 hover:text-slate-900 transition"><XCircle size={24} /></button>
                        </div>

                        <form onSubmit={createShift} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Gebiet auswählen</label>
                                <select 
                                    className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold appearance-none"
                                    value={newShift.areaId}
                                    onChange={e => setNewShift({...newShift, areaId: e.target.value})}
                                    required
                                >
                                    <option value="">Bitte Wählen</option>
                                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Datum</label>
                                <input 
                                    type="date"
                                    className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                    value={newShift.date}
                                    onChange={e => setNewShift({...newShift, date: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Start</label>
                                    <input 
                                        type="time"
                                        className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                        value={newShift.startTime}
                                        onChange={e => setNewShift({...newShift, startTime: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ende</label>
                                    <input 
                                        type="time"
                                        className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                        value={newShift.endTime}
                                        onChange={e => setNewShift({...newShift, endTime: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Max. Fahrer</label>
                                <input 
                                    type="number"
                                    min="1"
                                    className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                    value={newShift.maxDrivers}
                                    onChange={e => setNewShift({...newShift, maxDrivers: parseInt(e.target.value)})}
                                    required
                                />
                            </div>

                            <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-500/20 transition-all">
                                Schicht erstellen
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
