"use client";

import { useState, useEffect } from "react";
import {
    Play,
    Square,
    Pause,
    MapPin,
    Clock,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Navigation,
    Zap,
    ChevronDown,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";
import { GoogleMap, Circle, Marker, useJsApiLoader } from "@react-google-maps/api";

const MapNoSSR = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 rounded-[2.5rem] animate-pulse">Lade Karte...</div> });

const libraries: ("places" | "geometry")[] = ["geometry"];

export default function TrackingPage() {
    const [driverId, setDriverId] = useState<string | null>(null);
    const [status, setStatus] = useState<"IDLE" | "RUNNING" | "PAUSED">("IDLE");
    const [seconds, setSeconds] = useState(0);
    const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    
    const [assignedShifts, setAssignedShifts] = useState<any[]>([]);
    const [selectedShiftId, setSelectedShiftId] = useState<string>("");

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    useEffect(() => {
        const fetchDriverId = async () => {
            try {
                const { data } = await api.get("/drivers/me");
                setDriverId(data.id);
                fetchAssignedShifts(data.id);
            } catch (e) {
                console.error(e);
            }
        };
        fetchDriverId();
    }, []);

    const fetchAssignedShifts = async (id: string) => {
        try {
            const { data } = await api.get(`/shifts/assigned/${id}`);
            // Filter only for today
            const today = new Date().toISOString().split('T')[0];
            const todays = data.filter((s: any) => s.shift.startTime.startsWith(today));
            setAssignedShifts(todays);
            if (todays.length === 1) setSelectedShiftId(todays[0].shift.id);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const checkActiveSession = async () => {
            if (!driverId) return;
            try {
                const { data } = await api.get(`/time-entries/active/${driverId}`);
                if (data) {
                    setActiveEntryId(data.id);
                    setStatus(data.status);
                    const start = new Date(data.startTime).getTime();
                    setSeconds(Math.floor((Date.now() - start) / 1000));
                }
            } catch (e) { console.error(e); }
        };
        checkActiveSession();
    }, [driverId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let watchId: number;

        if (status === "RUNNING") {
            interval = setInterval(() => { setSeconds((s) => s + 1); }, 1000);
            if (navigator.geolocation && activeEntryId) {
                watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation({ lat: latitude, lng: longitude });
                        try {
                            await api.patch(`/time-entries/location/${activeEntryId}`, { lat: latitude, lng: longitude });
                        } catch (e) { console.error(e); }
                    },
                    (error) => console.error(error),
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
            }
        }
        return () => {
            if (interval) clearInterval(interval);
            if (watchId && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
        };
    }, [status, activeEntryId]);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleStart = async () => {
        if (!selectedShiftId && assignedShifts.length > 0) {
            alert("Bitte wählen Sie eine Schicht aus.");
            return;
        }

        setLoading(true);
        let startLat = 0, startLng = 0;

        try {
            if (navigator.geolocation) {
                await new Promise<void>((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            startLat = pos.coords.latitude;
                            startLng = pos.coords.longitude;
                            setLocation({ lat: startLat, lng: startLng });
                            resolve();
                        },
                        () => resolve(),
                        { timeout: 5000 }
                    );
                });
            }

            const { data } = await api.post("/time-entries/start", {
                driverId: driverId,
                lat: startLat,
                lng: startLng,
                shiftId: selectedShiftId
            });
            setActiveEntryId(data.id);
            setStatus("RUNNING");
        } catch (e: any) {
            alert(e.response?.data?.message || e.response?.data?.error || "Fehler beim Starten der Schicht.");
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        if (!activeEntryId || !confirm("Schicht wirklich beenden?")) return;
        setLoading(true);
        try {
            await api.patch(`/time-entries/stop/${activeEntryId}`, { lat: location?.lat || 0, lng: location?.lng || 0 });
            setStatus("IDLE");
            setSeconds(0);
            setActiveEntryId(null);
        } catch (e) { alert("Fehler"); } finally { setLoading(false); }
    };

    const selectedShift = assignedShifts.find(s => s.shift.id === selectedShiftId)?.shift;

    return (
        <div className="p-6 max-w-lg mx-auto space-y-8 animate-in fade-in duration-700 font-sans pb-10">
            <header className="flex items-center gap-4">
                <Link href="/driver" className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-400 shadow-sm"><ArrowLeft size={20} /></Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Schichtdienst</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivierung & Geofencing</p>
                </div>
            </header>

            {status === "IDLE" && assignedShifts.length > 0 && (
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Zugeordnete Schichten für heute</label>
                    <div className="relative">
                        <select 
                            className="w-full bg-white p-6 rounded-[2rem] border-2 border-slate-100 outline-none focus:border-blue-500 font-black text-slate-800 appearance-none shadow-xl shadow-slate-200/20"
                            value={selectedShiftId}
                            onChange={(e) => setSelectedShiftId(e.target.value)}
                        >
                            {assignedShifts.length > 1 && <option value="">Schicht auswählen...</option>}
                            {assignedShifts.map((s: any) => {
                                const start = new Date(s.shift.startTime);
                                return (
                                    <option key={s.shift.id} value={s.shift.id}>
                                        {s.shift.area.name} ({start.getHours()}:00 - {new Date(s.shift.endTime).getHours()}:00)
                                    </option>
                                );
                            })}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Geofence Preview Map */}
            {status === "IDLE" && selectedShift?.area?.latitude && isLoaded && (
                <div className="bg-white p-2 rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden relative group">
                    <div className="h-64 rounded-[3rem] overflow-hidden">
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={{ lat: selectedShift.area.latitude, lng: selectedShift.area.longitude }}
                            zoom={15}
                            options={{ disableDefaultUI: true, styles: [{ featureType: "all", elementType: "labels.icon", stylers: [{ visibility: "off" }] }] }}
                        >
                            <Circle 
                                center={{ lat: selectedShift.area.latitude, lng: selectedShift.area.longitude }} 
                                radius={selectedShift.area.radius || 500} 
                                options={{ fillColor: '#2563eb', fillOpacity: 0.2, strokeColor: '#2563eb', strokeWeight: 2 }} 
                            />
                            {location && <Marker position={location} icon={{ path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 5, fillColor: "#2563eb", fillOpacity: 1, strokeWeight: 2, strokeColor: "white" }} />}
                        </GoogleMap>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/90 backdrop-blur-md rounded-3xl border border-white shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><Navigation size={20} /></div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase">{selectedShift.area.name}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Radius: {selectedShift.area.radius || 500}m</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl relative overflow-hidden text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className={cn("w-3 h-3 rounded-full", status === "RUNNING" ? "bg-green-500 shadow-lg animate-pulse" : "bg-slate-300")}></div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{status === "RUNNING" ? "Dienst läuft" : "Dienst bereit"}</span>
                </div>
                <div className="text-7xl font-black text-slate-900 tracking-tighter mb-4 tabular-nums">{formatTime(seconds)}</div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Aktive Schichtzeit</p>
                <Clock className="absolute bottom-[-50px] right-[-50px] text-slate-50 opacity-10 pointer-events-none" size={250} />
            </div>

            <AnimatePresence mode="wait">
                {status === "IDLE" ? (
                    <motion.button
                        key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        onClick={handleStart} disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-[3rem] py-10 flex flex-col items-center justify-center gap-4 shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all group"
                    >
                        {loading ? <Loader2 className="animate-spin" size={40} /> : <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition"><Play size={32} className="fill-white" /></div>}
                        <span className="text-xl font-black uppercase tracking-[0.2em]">{loading ? "Laden..." : "Dienst Starten"}</span>
                    </motion.button>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        <motion.button key="pause" className="bg-amber-500 text-white rounded-[2.5rem] py-8 flex flex-col items-center justify-center gap-3 shadow-xl"><Pause size={24} className="fill-white" /><span className="text-[10px] font-black uppercase tracking-widest">Pause</span></motion.button>
                        <motion.button key="stop" onClick={handleStop} className="bg-rose-600 text-white rounded-[2.5rem] py-8 flex flex-col items-center justify-center gap-3 shadow-xl"><Square size={24} className="fill-white" /><span className="text-[10px] font-black uppercase tracking-widest">Beenden</span></motion.button>
                    </div>
                )}
            </AnimatePresence>

            <div className="bg-slate-50 p-8 rounded-[3.5rem] border border-white shadow-inner space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><Zap size={20} /></div>
                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase">Live Geofencing</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Dein Standort wird automatisch mit dem Einsatzgebiet abgeglichen.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
