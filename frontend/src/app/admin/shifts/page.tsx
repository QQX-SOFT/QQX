"use client";

import React, { useState, useEffect, useRef } from "react";
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
    List,
    X,
    Navigation,
    Compass
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { GoogleMap, Autocomplete, Circle, useJsApiLoader, Marker } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";

const libraries: ("places" | "drawing" | "geometry")[] = ["places"];

export default function AdminShiftsPage() {
    const [activeTab, setActiveTab] = useState<"PLAN" | "AREAS">("PLAN");
    const [shifts, setShifts] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAreaModal, setShowAreaModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);

    const [newArea, setNewArea] = useState({ name: "", city: "", zipCodes: "", latitude: 48.2082, longitude: 16.3738, radius: 500 });
    const [newShift, setNewShift] = useState({ 
        areaId: "", 
        date: new Date().toISOString().split('T')[0], 
        startTime: "08:00", 
        endTime: "16:00", 
        maxDrivers: 1 
    });

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries
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

    useEffect(() => { fetchData(); }, []);

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setNewArea({
                    ...newArea,
                    name: place.name || "",
                    city: place.address_components?.find(c => c.types.includes("locality"))?.long_name || "",
                    latitude: lat,
                    longitude: lng
                });
                mapRef.current?.panTo({ lat, lng });
            }
        }
    };

    const createArea = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/shifts/areas", {
                ...newArea,
                latitude: parseFloat(newArea.latitude.toString()),
                longitude: parseFloat(newArea.longitude.toString()),
                radius: parseInt(newArea.radius.toString())
            });
            setShowAreaModal(false);
            setNewArea({ name: "", city: "", zipCodes: "", latitude: 48.2082, longitude: 16.3738, radius: 500 });
            fetchData();
        } catch (e) { alert("Fehler beim Erstellen des Gebiets"); }
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
        } catch (e) { alert("Fehler beim Erstellen der Schicht"); }
    };

    const deleteShift = async (id: string) => {
        if (!confirm("Möchten Sie diese Schicht wirklich löschen?")) return;
        try {
            await api.delete(`/shifts/${id}`);
            fetchData();
        } catch (e) { alert("Fehler"); }
    };

    const assignDriver = async (shiftId: string, driverId: string) => {
        try {
            await api.post(`/shifts/${shiftId}/assign`, { driverId });
            fetchData();
        } catch (e) { alert("Fehler beim Zuweisen"); }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={64} /></div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg"><Clock size={20} /></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Personal & Planung</span>
                    </div>
                   <h1 className="text-5xl font-black text-slate-900 tracking-tight">Schichtmanagement</h1>
                   <p className="text-slate-500 font-medium text-sm mt-1">Geofencing-basierte Schichtplanung und Gebietsverwaltung.</p>
                </div>
                <div className="flex bg-slate-100 p-2 rounded-[2rem] border border-slate-200/50 shadow-inner">
                    <button onClick={() => setActiveTab("PLAN")} className={cn("px-10 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center gap-3", activeTab === "PLAN" ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}><Calendar size={18} />Schichtplan</button>
                    <button onClick={() => setActiveTab("AREAS")} className={cn("px-10 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center gap-3", activeTab === "AREAS" ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}><MapPin size={18} />Gebiete</button>
                </div>
            </header>

            {activeTab === "PLAN" ? (
                <div className="space-y-10">
                    <div className="flex justify-between items-center bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
                        <div className="flex items-center gap-10">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition shadow-sm"><Calendar size={20} /></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Zeitraum</span>
                                    <span className="text-sm font-black text-slate-900">Aktuelle Woche</span>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-slate-100" />
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition shadow-sm"><Filter size={20} /></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Filter</span>
                                    <span className="text-sm font-black text-slate-900">Alle Gebiete</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowShiftModal(true)} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition shadow-2xl shadow-blue-100 flex items-center gap-4"><Plus size={20} />Schicht erstellen</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {shifts.map(shift => {
                            const startTime = new Date(shift.startTime);
                            const endTime = new Date(shift.endTime);
                            const isFull = shift.assignments.length >= shift.maxDrivers;
                            return (
                                <div key={shift.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-8 hover:shadow-2xl transition-all duration-500 relative group overflow-hidden">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 tracking-[0.2em]">{shift.area.name}</span>
                                            </div>
                                            <h3 className="font-black text-slate-900 text-3xl tracking-tight leading-none italic uppercase">
                                                {startTime.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                                            </h3>
                                        </div>
                                        <div className={cn("px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm", isFull ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100")}>
                                            {isFull ? "Voll Belegt" : `${shift.maxDrivers - shift.assignments.length} Frei`}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 py-6 border-y border-slate-50 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-blue-600 transition"><Clock size={20} /></div>
                                            <span className="text-xl font-black text-slate-700 tabular-nums">
                                                {startTime.getHours().toString().padStart(2, '0')}:{startTime.getMinutes().toString().padStart(2, '0')} - {endTime.getHours().toString().padStart(2, '0')}:{endTime.getMinutes().toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Team</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{shift.assignments.length} / {shift.maxDrivers}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {shift.assignments.map((as: any) => (
                                                <div key={as.id} className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-slate-200 transition duration-300 group/item">
                                                    <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-xs text-white font-black">{as.driver.firstName[0]}</div>
                                                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{as.driver.lastName}</span>
                                                </div>
                                            ))}
                                            {!isFull && (
                                                <div className="relative group/assign">
                                                    <button className="w-12 h-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition flex items-center justify-center">
                                                        <Plus size={24} />
                                                    </button>
                                                    <div className="absolute top-full left-0 mt-4 bg-white shadow-2xl rounded-[2rem] border border-slate-100 p-4 z-[50] w-64 hidden group-hover/assign:block animate-in fade-in zoom-in-95 backdrop-blur-xl">
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 mb-2 border-b border-slate-50">Fahrer wählen</div>
                                                        <div className="max-h-60 overflow-y-auto space-y-1">
                                                            {drivers.filter(d => !shift.assignments.some((a: any) => a.driverId === d.id)).map(driver => (
                                                                <button key={driver.id} onClick={() => assignDriver(shift.id, driver.id)} className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl text-xs font-black text-slate-700 transition flex items-center gap-3">
                                                                    <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-bold">{driver.firstName[0]}</div>
                                                                    {driver.firstName} {driver.lastName}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => deleteShift(shift.id)} className="absolute top-4 right-4 p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-2xl transition opacity-0 group-hover:opacity-100 z-20"><Trash2 size={18} /></button>
                                    <MapPin className="absolute bottom-[-40px] right-[-40px] text-slate-50 opacity-10 group-hover:scale-110 group-hover:text-blue-50 transition duration-1000 pointer-events-none" size={200} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl space-y-12 h-fit relative overflow-hidden">
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-4 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200"><MapPin size={24} /></div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase leading-none">Gebiet anlegen</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Geofencing & Google Autocomplete</p>
                            </div>
                        </div>

                        <form onSubmit={createArea} className="space-y-10 relative z-10">
                            {isLoaded ? (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Ortsname / Adresse (Google Search)</label>
                                    <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
                                        <input 
                                            placeholder="Suchen (z.B. Wien, 1010)" 
                                            className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 outline-none focus:border-blue-500 font-black text-slate-900 shadow-inner text-lg"
                                            required
                                        />
                                    </Autocomplete>
                                </div>
                            ) : <div className="animate-pulse bg-slate-100 h-20 rounded-3xl" />}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Name</label>
                                    <input placeholder="z.B. Wien Zentrum" className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none font-bold" value={newArea.name} onChange={e => setNewArea({...newArea, name: e.target.value})} required />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Stadt</label>
                                    <input placeholder="Wien" className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none font-bold" value={newArea.city} onChange={e => setNewArea({...newArea, city: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center px-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Erlaubter Radius: <span className="text-blue-600">{newArea.radius}m</span></label>
                                    <Compass size={16} className="text-slate-300" />
                                </div>
                                <input type="range" min="100" max="5000" step="100" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" value={newArea.radius} onChange={e => setNewArea({...newArea, radius: parseInt(e.target.value)})} />
                                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest">Fahrer müssen sich beim Starten innerhalb dieses Kreises befinden.</p>
                            </div>

                            {isLoaded && (
                                <div className="w-full h-80 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl relative group">
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={{ lat: newArea.latitude, lng: newArea.longitude }}
                                        zoom={14}
                                        onLoad={map => mapRef.current = map}
                                        options={{ disableDefaultUI: true, styles: [{ featureType: "all", elementType: "labels.icon", stylers: [{ visibility: "off" }] }] }}
                                    >
                                        <Marker position={{ lat: newArea.latitude, lng: newArea.longitude }} />
                                        <Circle 
                                            center={{ lat: newArea.latitude, lng: newArea.longitude }} 
                                            radius={newArea.radius} 
                                            options={{ fillColor: '#2563eb', fillOpacity: 0.15, strokeColor: '#2563eb', strokeWeight: 2, strokeOpacity: 0.8 }} 
                                        />
                                    </GoogleMap>
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white shadow-xl flex items-center gap-2">
                                        <Navigation size={14} className="text-blue-600" />
                                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Geofence aktiv</span>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition shadow-2xl shadow-blue-100 flex items-center justify-center gap-4">
                                <Check size={20} />
                                Gebiet speichern
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Bestehende Einsatzgebiete ({areas.length})</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {areas.map(area => (
                                <div key={area.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-2xl hover:border-blue-100 transition-all duration-500 cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-blue-50 rounded-[1.75rem] flex items-center justify-center text-blue-600 relative overflow-hidden group-hover:bg-blue-600 group-hover:text-white transition duration-500">
                                            <MapPin size={28} className="relative z-10" />
                                            <div className="absolute inset-0 bg-blue-100 opacity-0 group-hover:opacity-20 transition-opacity" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-xl tracking-tight uppercase italic">{area.name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{area.city || 'Wien'}</span>
                                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Radius {area.radius}m</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-200 group-hover:text-blue-600 group-hover:bg-blue-50 transition"><ChevronRight size={24} /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Shift Creator Modal */}
            <AnimatePresence>
                {showShiftModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[4rem] p-12 max-w-xl w-full shadow-2xl border border-slate-100 space-y-12">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><PlusCircle size={28} /></div>
                                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Neue Schicht</h3>
                                </div>
                                <button onClick={() => setShowShiftModal(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition"><X size={24} /></button>
                            </div>

                            <form onSubmit={createShift} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Einsatzgebiet</label>
                                    <select className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 outline-none focus:border-blue-500 font-black text-slate-900 appearance-none shadow-inner" value={newShift.areaId} onChange={e => setNewShift({...newShift, areaId: e.target.value})} required>
                                        <option value="">Bitte Wählen</option>
                                        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Datum</label>
                                    <input type="date" className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 outline-none focus:border-blue-500 font-black" value={newShift.date} onChange={e => setNewShift({...newShift, date: e.target.value})} required />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Start</label>
                                        <input type="time" className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 outline-none focus:border-blue-500 font-black" value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} required />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Ende</label>
                                        <input type="time" className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 outline-none focus:border-blue-500 font-black" value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} required />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Fahrer Kapazität</label>
                                    <div className="relative">
                                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                        <input type="number" min="1" className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 outline-none focus:border-blue-500 font-black pl-16" value={newShift.maxDrivers} onChange={e => setNewShift({...newShift, maxDrivers: parseInt(e.target.value)})} required />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-4">
                                    <CheckCircle2 size={24} />
                                    Schicht Scharfschalten
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
