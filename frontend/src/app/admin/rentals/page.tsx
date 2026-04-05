"use client";

import { useState, useEffect, useMemo } from "react";
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
    AlertTriangle,
    Check,
    ChevronLeft,
    Layers,
    Info,
    MapPin,
    ArrowRight,
    Camera,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWithinInterval, startOfDay, endOfDay, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";

type Vehicle = {
    id: string;
    make: string;
    model: string;
    licensePlate: string;
    milage: number;
    dailyRate: number;
    imageUrl: string | null;
    status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "SERVICE";
    nextMaintenance: string | null;
    availableFrom: string | null;
    rentals?: Rental[];
};

type Rental = {
    id: string;
    vehicle: Vehicle;
    driver: { firstName: string; lastName: string; id: string; phoneNumber?: string; lastLatitude?: number; lastLongitude?: number };
    startDate: string;
    expectedEndDate: string | null;
    actualEndDate: string | null;
    dailyRate: number;
    totalAmount: number | null;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED";
    notes: string | null;
};

export default function AdminRentalsPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"ACTIVE" | "VEHICLES" | "CALENDAR" | "HISTORY">("ACTIVE");
    
    // UI states
    const [viewDate, setViewDate] = useState(new Date());
    const [showRentModal, setShowRentModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [rentForm, setRentForm] = useState({
        vehicleId: "", driverId: "", startDate: format(new Date(), "yyyy-MM-dd"), dailyRate: 35, notes: ""
    });

    const [vehicleForm, setVehicleForm] = useState({
        licensePlate: "", make: "", model: "", milage: 0, dailyRate: 35, nextMaintenance: "", imageUrl: ""
    });

    const [statusForm, setStatusForm] = useState({
        status: "AVAILABLE", availableFrom: ""
    });

    const daysInMonth = useMemo(() => eachDayOfInterval({ start: startOfMonth(viewDate), end: endOfMonth(viewDate) }), [viewDate]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vRes, rRes, dRes] = await Promise.all([
                api.get("/vehicles"),
                api.get("/rentals"),
                api.get("/drivers")
            ]);
            setVehicles(vRes.data);
            setRentals(rRes.data);
            setDrivers(dRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRental = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/rentals", rentForm);
            setShowRentModal(false);
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.error || "Fehler");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/vehicles", vehicleForm);
            setShowVehicleModal(false);
            setVehicleForm({ licensePlate: "", make: "", model: "", milage: 0, dailyRate: 35, nextMaintenance: "", imageUrl: "" });
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.error || "Fehler");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEndRental = async (id: string) => {
        if (!confirm("Mietvertrag wirklich beenden?")) return;
        try {
            await api.patch(`/rentals/${id}/end`);
            fetchData();
            setShowDetailModal(null);
        } catch (e) { console.error(e); }
    };

    const handleUpdateStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showStatusModal) return;
        setSubmitting(true);
        try {
            await api.patch(`/vehicles/${showStatusModal}/status`, statusForm);
            setShowStatusModal(null);
            fetchData();
        } catch (e) { console.error(e); } finally { setSubmitting(false); }
    };

    const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
        AVAILABLE: { label: "Verfügbar", color: "bg-green-50 text-green-600 border-green-100", icon: CheckCircle2 },
        IN_USE: { label: "Vermietet", color: "bg-blue-50 text-blue-600 border-blue-100", icon: Car },
        MAINTENANCE: { label: "In Reparatur", color: "bg-red-50 text-red-600 border-red-100", icon: AlertTriangle },
        SERVICE: { label: "Service", color: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
        ACTIVE: { label: "Aktiv", color: "bg-green-50 text-green-600 border-green-100", icon: Check },
        COMPLETED: { label: "Beendet", color: "bg-slate-50 text-slate-400 border-slate-100", icon: XCircle },
    };

    const activeRentals = rentals.filter(r => r.status === "ACTIVE");
    const historyRentals = rentals.filter(r => r.status !== "ACTIVE");
    const currentDetailVehicle = vehicles.find(v => v.id === showDetailModal);
    const activeRentalForDetail = rentals.find(r => r.vehicle.id === showDetailModal && r.status === "ACTIVE");

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
                            <Key size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Betrieb</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Fahrzeugvermietung</h1>
                    <p className="text-slate-500 font-medium">Fuhrparkmanagement und interne Fahrzeugvermietung für Fahrer.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowVehicleModal(true)} className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition flex items-center gap-3"><Car size={18} />Neues Fahrzeug</button>
                    <button onClick={() => setShowRentModal(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-xl shadow-slate-200 flex items-center gap-3"><Plus size={18} />Auto vermieten</button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-[2rem] w-full max-w-2xl">
                {[
                    { id: "ACTIVE", label: "Aktive Mieten", count: activeRentals.length },
                    { id: "VEHICLES", label: "Fuhrpark", count: vehicles.length },
                    { id: "CALENDAR", label: "Belegungsplan", count: 0 },
                    { id: "HISTORY", label: "Historie", count: historyRentals.length }
                ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn("flex-1 py-4 rounded-[1.75rem] text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-3", activeTab === tab.id ? "bg-white text-blue-600 shadow-xl shadow-blue-100" : "text-slate-400 hover:text-slate-600")}>
                        {tab.label}
                        {tab.count > 0 && <span className={cn("px-2 py-0.5 rounded-full text-[9px]", activeTab === tab.id ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500")}>{tab.count}</span>}
                    </button>
                ))}
            </div>

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={48} /></div>
                ) : (
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        
                        {activeTab === "ACTIVE" && (
                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="grid grid-cols-6 p-8 border-b border-slate-50 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    <div className="col-span-2">Fahrer & Fahrzeug</div>
                                    <div>Beginn</div>
                                    <div>Tagesrate</div>
                                    <div>Status</div>
                                    <div className="text-right">Aktion</div>
                                </div>
                                {activeRentals.length === 0 ? (
                                    <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Keine aktiven Mietverträge</div>
                                ) : activeRentals.map(r => (
                                    <div key={r.id} onClick={() => setShowDetailModal(r.vehicle.id)} className="grid grid-cols-6 p-8 border-b border-slate-50 items-center hover:bg-slate-50/50 transition duration-300 cursor-pointer group">
                                        <div className="col-span-2 flex items-center gap-5">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">{r.driver.firstName} {r.driver.lastName}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.vehicle.make} {r.vehicle.model} • {r.vehicle.licensePlate}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs font-black text-slate-600">{format(new Date(r.startDate), "dd.MM.yyyy")}</div>
                                        <div className="text-xs font-black text-blue-600">€{r.dailyRate.toFixed(2)}</div>
                                        <div><span className={cn("px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border", statusLabels.ACTIVE.color)}>Aktiv</span></div>
                                        <div className="text-right"><ChevronRight className="inline text-slate-200 group-hover:text-blue-600 transition" /></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "VEHICLES" && (
                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="grid grid-cols-6 p-8 border-b border-slate-50 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    <div className="col-span-2">Fahrzeug</div>
                                    <div>Status</div>
                                    <div>Kilometer</div>
                                    <div>Tagesrate</div>
                                    <div className="text-right">Details</div>
                                </div>
                                {vehicles.map(v => {
                                    const status = statusLabels[v.status] || statusLabels.AVAILABLE;
                                    return (
                                        <div key={v.id} onClick={() => setShowDetailModal(v.id)} className="grid grid-cols-6 p-8 border-b border-slate-50 items-center hover:bg-slate-50/50 transition cursor-pointer group">
                                            <div className="col-span-2 flex items-center gap-5">
                                                <div className="w-16 h-12 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center">
                                                    {v.imageUrl ? <img src={v.imageUrl} className="w-full h-full object-cover" /> : <Car size={24} className="text-slate-200" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-xs">{v.make} {v.model}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.licensePlate}</p>
                                                </div>
                                            </div>
                                            <div><span className={cn("px-4 py-2 rounded-full text-[9px] font-black uppercase border", status.color)}>{status.label}</span></div>
                                            <div className="text-xs font-black text-slate-600">{v.milage.toLocaleString()} km</div>
                                            <div className="text-xs font-black text-blue-600">€{v.dailyRate}</div>
                                            <div className="text-right text-slate-300 group-hover:text-blue-600 transition"><Info size={20} className="inline" /></div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === "CALENDAR" && (
                             <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-slate-50/30">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm"><ChevronLeft size={20} /></button>
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight w-48 text-center">{format(viewDate, "MMMM yyyy", { locale: de })}</h2>
                                        <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm"><ChevronRight size={20} /></button>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><div className="w-3 h-3 bg-blue-600 rounded-full" /> Mietvertrag</div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><div className="w-3 h-3 bg-red-500 rounded-full" /> In Reparatur</div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <div className="min-w-[1200px]">
                                        <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: `250px repeat(${daysInMonth.length}, 1fr)` }}>
                                            <div className="p-6 text-[10px] font-black text-slate-300 uppercase tracking-widest border-r border-slate-50">Fuhrpark</div>
                                            {daysInMonth.map(day => (<div key={day.toISOString()} className={cn("p-6 text-center text-[10px] font-black uppercase border-r border-slate-50 last:border-0", (day.getDay() === 0 || day.getDay() === 6) ? "bg-slate-50 text-slate-400" : "text-slate-500")}>{format(day, "d")}<div className="opacity-40">{format(day, "EE", { locale: de })}</div></div>))}
                                        </div>
                                        {vehicles.map(v => (
                                            <div key={v.id} className="grid border-b border-slate-100 hover:bg-slate-50/50 transition-colors" style={{ gridTemplateColumns: `250px repeat(${daysInMonth.length}, 1fr)` }}>
                                                <div className="p-6 border-r border-slate-50"><h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{v.make} {v.model}</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{v.licensePlate}</p></div>
                                                {daysInMonth.map(day => {
                                                    const rental = rentals.find(r => r.vehicle.id === v.id && r.status === "ACTIVE" && isWithinInterval(startOfDay(day), { start: startOfDay(new Date(r.startDate)), end: endOfDay(new Date(r.expectedEndDate || Date.now() + 8640000000000)) }));
                                                    const isRepair = v.status === "MAINTENANCE" && v.availableFrom && isWithinInterval(startOfDay(day), { start: startOfDay(new Date()), end: endOfDay(new Date(v.availableFrom)) });
                                                    return (<div key={day.toISOString()} className="h-20 border-r border-slate-50 last:border-0 relative flex items-center justify-center">
                                                        {rental && <div className="absolute inset-y-4 inset-x-0 bg-blue-600 rounded-sm shadow-lg shadow-blue-200/50 z-10 flex items-center justify-center overflow-hidden"><div className="text-[7px] text-white font-black rotate-90">{rental.driver.firstName[0]}{rental.driver.lastName[0]}</div></div>}
                                                        {isRepair && <div className="absolute inset-y-4 inset-x-0 bg-red-500 rounded-sm shadow-lg shadow-red-200/50 z-10 flex items-center justify-center"><Clock size={12} className="text-white" /></div>}
                                                    </div>);
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "HISTORY" && (
                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="grid grid-cols-6 p-8 border-b border-slate-50 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    <div className="col-span-2">Fahrer & Fahrzeug</div>
                                    <div>Zeitraum</div>
                                    <div>Tage</div>
                                    <div>Gesamt</div>
                                    <div className="text-right">Status</div>
                                </div>
                                {historyRentals.map(r => {
                                    const start = new Date(r.startDate), end = r.actualEndDate ? new Date(r.actualEndDate) : new Date();
                                    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <div key={r.id} className="grid grid-cols-6 p-8 border-b border-slate-50 items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-500">
                                            <div className="col-span-2 flex items-center gap-5"><div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500"><User size={20} /></div><div><h4 className="font-bold text-slate-700 text-xs">{r.driver.firstName} {r.driver.lastName}</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.vehicle.licensePlate}</p></div></div>
                                            <div className="text-[10px] font-black text-slate-400">{format(start, "dd.MM.yy")} - {r.actualEndDate ? format(new Date(r.actualEndDate), "dd.MM.yy") : "-"}</div>
                                            <div className="text-xs font-black text-slate-600">{days} Tage</div>
                                            <div className="text-xs font-black text-green-600">€{r.totalAmount?.toFixed(2) || "0.00"}</div>
                                            <div className="text-right"><span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{r.status}</span></div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Vehicle Detail Sidebar/Modal */}
            <AnimatePresence>
                {showDetailModal && currentDetailVehicle && (
                    <div className="fixed inset-0 z-[60] flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDetailModal(null)} />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto">
                            <div className="p-12 space-y-10">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Fahrzeugdetails</h2>
                                    <button onClick={() => setShowDetailModal(null)} className="p-4 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition"><X size={24} /></button>
                                </div>

                                <div className="w-full h-64 bg-slate-100 rounded-[2.5rem] overflow-hidden relative shadow-lg">
                                    {currentDetailVehicle.imageUrl ? (
                                        <img src={currentDetailVehicle.imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                            <Car size={80} />
                                            <p className="text-xs font-black uppercase tracking-widest mt-4">Kein Bild vorhanden</p>
                                        </div>
                                    )}
                                    <div className="absolute top-6 left-6 px-6 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg">
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{currentDetailVehicle.licensePlate}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <div className="flex items-center gap-3 mb-2 text-slate-400"><Car size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Fahrzeug</span></div>
                                        <h4 className="text-lg font-black text-slate-900 uppercase">{currentDetailVehicle.make} {currentDetailVehicle.model}</h4>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <div className="flex items-center gap-3 mb-2 text-slate-400"><Clock size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Kilometer</span></div>
                                        <h4 className="text-lg font-black text-slate-900">{currentDetailVehicle.milage.toLocaleString()} km</h4>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Aktueller Status</h3>
                                    {activeRentalForDetail ? (
                                        <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><User size={28} /></div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 uppercase">{activeRentalForDetail.driver.firstName} {activeRentalForDetail.driver.lastName}</h4>
                                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">In Miete seit {format(new Date(activeRentalForDetail.startDate), "dd. MMM yyyy", { locale: de })}</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-100"><CheckCircle2 size={24} /></div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-5 bg-white/50 rounded-2xl backdrop-blur-sm">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Mietdauer</p>
                                                    <p className="text-md font-black text-slate-900">{differenceInDays(new Date(), new Date(activeRentalForDetail.startDate))} Tage</p>
                                                </div>
                                                <div className="p-5 bg-white/50 rounded-2xl backdrop-blur-sm">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Aktuelle Kosten</p>
                                                    <p className="text-md font-black text-blue-600">€{(differenceInDays(new Date(), new Date(activeRentalForDetail.startDate)) * activeRentalForDetail.dailyRate).toFixed(2)}</p>
                                                </div>
                                            </div>

                                            {activeRentalForDetail.driver.lastLatitude && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 text-slate-400"><MapPin size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Letzter Standort</span></div>
                                                    <div className="w-full h-40 bg-slate-200 rounded-[2rem] overflow-hidden">
                                                        <iframe 
                                                            width="100%" h-full
                                                            src={`https://maps.google.com/maps?q=${activeRentalForDetail.driver.lastLatitude},${activeRentalForDetail.driver.lastLongitude}&z=15&output=embed`}
                                                            className="grayscale opacity-80"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <button 
                                                onClick={() => handleEndRental(activeRentalForDetail.id)}
                                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition flex items-center justify-center gap-3"
                                            >
                                                Mietvertrag Beenden & Abrechnen
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center space-y-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300"><Key size={32} /></div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fahrzeug ist zurzeit frei</p>
                                            <button 
                                                onClick={() => { setShowRentModal(true); setRentForm({...rentForm, vehicleId: currentDetailVehicle.id, dailyRate: currentDetailVehicle.dailyRate}); setShowDetailModal(null); }}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition"
                                            >
                                                Jetzt Vermieten
                                            </button>
                                        </div>
                                    )}

                                    <div className="pt-10 border-t border-slate-50">
                                        <button 
                                            onClick={() => { setShowStatusModal(currentDetailVehicle.id); setShowDetailModal(null); }}
                                            className="w-full py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition flex items-center justify-center gap-3"
                                        >
                                            <AlertTriangle size={18} />
                                            Status / Reparatur ändern
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rent Modal */}
            <AnimatePresence>
                {showRentModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowRentModal(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-12 space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Auto vermieten</h2>
                                    <button onClick={() => setShowRentModal(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition"><X size={24} /></button>
                                </div>
                                <form onSubmit={handleCreateRental} className="grid grid-cols-2 gap-8">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Fahrzeug wählen *</label>
                                        <select required className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-6 focus:border-blue-500 outline-none font-bold text-slate-900 appearance-none shadow-inner" value={rentForm.vehicleId} onChange={e => { const v = vehicles.find(v => v.id === e.target.value); setRentForm({...rentForm, vehicleId: e.target.value, dailyRate: v?.dailyRate || 35}); }}>
                                            <option value="">Fahrzeug auswählen...</option>
                                            {vehicles.filter(v => v.status === "AVAILABLE").map(v => (<option key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate}) - €{v.dailyRate}/Tag</option>))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Fahrer Zuweisung *</label>
                                        <select required className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-6 focus:border-blue-500 outline-none font-bold text-slate-900 appearance-none shadow-inner" value={rentForm.driverId} onChange={e => setRentForm({...rentForm, driverId: e.target.value})}>
                                            <option value="">Fahrer auswählen...</option>
                                            {drivers.map(d => (<option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>))}
                                        </select>
                                    </div>
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Beginn</label><input type="date" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-6 focus:border-blue-500 outline-none font-bold text-slate-900" value={rentForm.startDate} onChange={e => setRentForm({...rentForm, startDate: e.target.value})} /></div>
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Tagesrate (€)</label><div className="relative"><Euro className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} /><input type="number" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl pl-16 pr-8 py-6 focus:border-blue-500 outline-none font-black text-2xl text-blue-600" value={rentForm.dailyRate} onChange={e => setRentForm({...rentForm, dailyRate: parseFloat(e.target.value)})} /></div></div>
                                    <div className="col-span-2 pt-6"><button disabled={submitting} className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition shadow-2xl shadow-blue-200 flex items-center justify-center gap-4">{submitting ? <Loader2 className="animate-spin" size={24} /> : <Key size={24} />}Mietvertrag aktivieren</button></div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Neues Fahrzeug Modal */}
            <AnimatePresence>
                {showVehicleModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowVehicleModal(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-12 space-y-10">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Neues Fahrzeug hinzufügen</h2>
                                    <button onClick={() => setShowVehicleModal(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition"><X size={24} /></button>
                                </div>
                                <form onSubmit={handleCreateVehicle} className="grid grid-cols-2 gap-8">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Fahrzeugbild URL</label>
                                        <div className="relative">
                                            <Camera className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                            <input placeholder="https://..." className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl pl-16 pr-8 py-5 focus:border-blue-500 outline-none font-medium" value={vehicleForm.imageUrl} onChange={e => setVehicleForm({...vehicleForm, imageUrl: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Kennzeichen *</label>
                                        <input required placeholder="W-12345X" className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-5 focus:border-blue-500 outline-none font-black text-slate-900 uppercase" value={vehicleForm.licensePlate} onChange={e => setVehicleForm({...vehicleForm, licensePlate: e.target.value.toUpperCase()})} />
                                    </div>
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Marke *</label><input required placeholder="Toyota" className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-5 focus:border-blue-500 outline-none font-bold" value={vehicleForm.make} onChange={e => setVehicleForm({...vehicleForm, make: e.target.value})} /></div>
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Modell *</label><input required placeholder="Corolla" className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-5 focus:border-blue-500 outline-none font-bold" value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} /></div>
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Kilometerstand *</label><input type="number" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-5 focus:border-blue-500 outline-none font-black text-blue-600" value={vehicleForm.milage} onChange={e => setVehicleForm({...vehicleForm, milage: parseInt(e.target.value) || 0})} /></div>
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Tagesrate (€)</label><input type="number" required className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-8 py-5 focus:border-blue-500 outline-none font-black text-blue-600" value={vehicleForm.dailyRate} onChange={e => setVehicleForm({...vehicleForm, dailyRate: parseFloat(e.target.value) || 0})} /></div>
                                    <div className="col-span-2 pt-6"><button disabled={submitting} className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-black transition flex items-center justify-center gap-4">{submitting ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}Fahrzeug speichern</button></div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Status Modal */}
            <AnimatePresence>
                {showStatusModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowStatusModal(null)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-12 space-y-8">
                                <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-slate-900 uppercase">Fahrzeugstatus</h2><button onClick={() => setShowStatusModal(null)} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition"><X size={24} /></button></div>
                                <form onSubmit={handleUpdateStatus} className="space-y-6">
                                    <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Status</label><select className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] px-8 py-6 focus:border-blue-500 outline-none font-bold text-slate-900 appearance-none shadow-inner" value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value})}><option value="AVAILABLE">Verfügbar</option><option value="MAINTENANCE">In Reparatur</option><option value="SERVICE">Service</option></select></div>
                                    {(statusForm.status === "MAINTENANCE" || statusForm.status === "SERVICE") && (<div className="animate-in slide-in-from-top-4"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Wieder verfügbar ab (geschätzt)</label><input type="date" className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] px-8 py-6 focus:border-blue-500 outline-none font-bold text-slate-900" value={statusForm.availableFrom} onChange={e => setStatusForm({...statusForm, availableFrom: e.target.value})} /></div>)}
                                    <div className="pt-6"><button disabled={submitting} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-black transition shadow-2xl">Status aktualisieren</button></div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
