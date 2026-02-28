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
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapNoSSR = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 rounded-[2.5rem] animate-pulse">Lade Karte...</div> });

export default function TrackingPage() {
    const [driverId, setDriverId] = useState<string | null>(null);
    const [status, setStatus] = useState<"IDLE" | "RUNNING" | "PAUSED">("IDLE");
    const [seconds, setSeconds] = useState(0);
    const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        const id = localStorage.getItem("driverId");
        if (id) {
            setDriverId(id);
        } else {
            setDriverId("demo-driver-1");
        }
    }, []);

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
            } catch (e) {
                console.error("Session check failed", e);
            }
        };
        checkActiveSession();
    }, [driverId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let watchId: number;

        if (status === "RUNNING") {
            interval = setInterval(() => {
                setSeconds((s) => s + 1);
            }, 1000);

            if (navigator.geolocation && activeEntryId) {
                watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation({ lat: latitude, lng: longitude });

                        try {
                            await api.patch(`/time-entries/location/${activeEntryId}`, {
                                lat: latitude,
                                lng: longitude
                            });
                        } catch (e) {
                            console.error("Location update failed", e);
                        }
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
        setLoading(true);
        let startLat = 52.5200;
        let startLng = 13.4050;

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
                        () => resolve(), // Fallback on error
                        { timeout: 3000 }
                    );
                });
            }

            const { data } = await api.post("/time-entries/start", {
                driverId: driverId,
                lat: startLat,
                lng: startLng
            });
            setActiveEntryId(data.id);
            setStatus("RUNNING");
        } catch (e) {
            alert("Fehler beim Starten der Schicht.");
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        if (!activeEntryId) return;
        setLoading(true);
        try {
            await api.patch(`/time-entries/stop/${activeEntryId}`, {
                lat: location?.lat || 52.5200,
                lng: location?.lng || 13.4050
            });
            setStatus("IDLE");
            setSeconds(0);
            setActiveEntryId(null);
        } catch (e) {
            alert("Fehler beim Beenden der Schicht.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 font-sans">
            {/* Nav Header */}
            <header className="flex items-center gap-4">
                <Link href="/driver" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Schicht Tracking</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Arbeitszeit & GPS</p>
                </div>
            </header>

            {/* Status Visualizer */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group">
                <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <div className={cn(
                            "w-4 h-4 rounded-full",
                            status === "RUNNING" ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse" :
                                status === "PAUSED" ? "bg-yellow-500 animate-pulse" : "bg-slate-300"
                        )}></div>
                        <span className="text-xl font-black text-slate-900 tracking-tight uppercase">
                            {status === "RUNNING" ? "Schicht läuft" : status === "PAUSED" ? "Pause" : "Nicht im Dienst"}
                        </span>
                    </div>

                    <div className="text-7xl font-black text-slate-900 tracking-tighter mb-4 tabular-nums py-4">
                        {formatTime(seconds)}
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Aktive Arbeitszeit</p>
                </div>

                {/* Progress Bar Top */}
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-50">
                    <motion.div
                        className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        initial={{ width: "0%" }}
                        animate={{ width: status === "RUNNING" ? "100%" : "0%" }}
                        transition={{ duration: 1 }}
                    />
                </div>

                <Clock className="absolute bottom-[-30px] left-[-30px] text-slate-50 opacity-5 group-hover:scale-110 transition duration-1000" size={200} />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="wait">
                    {status === "IDLE" ? (
                        <motion.button
                            key="start"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={handleStart}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white rounded-[2.5rem] py-12 flex flex-col items-center justify-center gap-6 shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all duration-300 group active:scale-95"
                        >
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition duration-500 shadow-xl">
                                <Play size={40} className="fill-white" />
                            </div>
                            <span className="text-2xl font-black uppercase tracking-[0.2em]">Starten</span>
                        </motion.button>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <motion.button
                                key="stop"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleStop}
                                disabled={loading}
                                className="w-full bg-slate-950 text-white rounded-[2.5rem] py-10 flex items-center justify-center gap-4 shadow-xl hover:bg-black transition-all duration-300 active:scale-95 border-b-4 border-slate-800"
                            >
                                <Square size={28} className="fill-white" />
                                <span className="text-xl font-black uppercase tracking-widest">Beenden</span>
                            </motion.button>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="bg-white border border-slate-200 p-8 rounded-[2rem] flex flex-col items-center gap-3 text-slate-600 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-600 transition-all duration-300 shadow-sm active:scale-95">
                                    <Pause size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Pause</span>
                                </button>
                                <button className="bg-white border border-slate-200 p-8 rounded-[2rem] flex flex-col items-center gap-3 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300 shadow-sm active:scale-95">
                                    <Navigation size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">GPS Fix</span>
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Live Map Display */}
            {status === "RUNNING" && location && (
                <div className="bg-slate-100 rounded-[2.5rem] p-2 shadow-inner border border-slate-200 h-64 overflow-hidden relative">
                    <MapNoSSR locations={[{ id: "me", lat: location.lat, lng: location.lng, name: "Meine Position", status: status }]} singleMarker={true} />
                </div>
            )}

            {/* Monitoring Cards */}
            <div className="grid grid-cols-1 gap-4 pt-4">
                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 transition hover:shadow-lg duration-500">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-500">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 leading-none mb-2">Live Reporting</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deine Position wird live an Admin übertragen.</p>
                    </div>
                </div>

                <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 leading-none mb-2">System Status</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hardware OK • Verbindung Stabil</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
