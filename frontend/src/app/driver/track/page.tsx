"use client";

import { useState, useEffect } from "react";
import { Play, Square, Pause, MapPin, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function TrackingPage() {
    const [status, setStatus] = useState<"IDLE" | "RUNNING" | "PAUSED">("IDLE");
    const [seconds, setSeconds] = useState(0);
    const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Hardcoded driver for demo (In real app, get from auth context)
    const DRIVER_ID = "demo-driver-1";

    useEffect(() => {
        // Check for active session on load
        const checkActiveSession = async () => {
            try {
                const { data } = await api.get(`/time-entries/active/${DRIVER_ID}`);
                if (data) {
                    setActiveEntryId(data.id);
                    setStatus(data.status);
                    // Calculate elapsed time
                    const start = new Date(data.startTime).getTime();
                    setSeconds(Math.floor((Date.now() - start) / 1000));
                }
            } catch (e) {
                console.error("Session check failed", e);
            }
        };
        checkActiveSession();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === "RUNNING") {
            interval = setInterval(() => {
                setSeconds((s) => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleStart = async () => {
        setLoading(true);
        try {
            // Mocking GPS for now
            const { data } = await api.post("/time-entries/start", {
                driverId: DRIVER_ID,
                lat: 52.5200,
                lng: 13.4050
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
                lat: 52.5200,
                lng: 13.4050
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
        <div className="p-6 max-w-lg mx-auto space-y-8">
            {/* Status Header */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Aktueller Status</p>
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className={cn(
                            "w-3 h-3 rounded-full animate-pulse",
                            status === "RUNNING" ? "bg-green-500" : status === "PAUSED" ? "bg-yellow-500" : "bg-slate-300"
                        )}></div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">
                            {status === "RUNNING" ? "Schicht aktiv" : status === "PAUSED" ? "Pause" : "Nicht im Dienst"}
                        </span>
                    </div>

                    <div className="text-6xl font-black text-center text-slate-900 tracking-tighter mb-2 tabular-nums">
                        {formatTime(seconds)}
                    </div>
                    <p className="text-center text-slate-400 text-sm font-medium">Verbrachte Arbeitszeit heute</p>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: "0%" }}
                        animate={{ width: status === "RUNNING" ? "100%" : "0%" }}
                        transition={{ duration: 1 }}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="wait">
                    {status === "IDLE" ? (
                        <motion.button
                            key="start"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={handleStart}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white rounded-[2rem] py-10 flex flex-col items-center justify-center gap-4 shadow-2xl shadow-blue-200 hover:bg-blue-700 transition group"
                        >
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-500">
                                <Play size={32} className="fill-white" />
                            </div>
                            <span className="text-xl font-black uppercase tracking-widest">Schicht Starten</span>
                        </motion.button>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <motion.button
                                key="stop"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleStop}
                                disabled={loading}
                                className="w-full bg-slate-900 text-white rounded-[2rem] py-8 flex items-center justify-center gap-4 shadow-xl hover:bg-black transition"
                            >
                                <Square size={24} className="fill-white" />
                                <span className="text-lg font-black uppercase tracking-widest">Schicht Beenden</span>
                            </motion.button>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col items-center gap-2 text-slate-600 hover:bg-slate-50 transition">
                                    <Pause size={20} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Pause</span>
                                </button>
                                <button className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col items-center gap-2 text-slate-600 hover:bg-slate-50 transition">
                                    <MapPin size={20} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Standort</span>
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 transition hover:bg-blue-50/50">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 leading-none mb-1">Pausen-Compliance</h4>
                        <p className="text-xs text-slate-500 font-medium">Alle vorgeschriebenen Pausen eingehalten.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 leading-none mb-1">Nächste Prüfung</h4>
                        <p className="text-xs text-slate-500 font-medium">Fahrzeugprüfung in 3 Tagen fällig.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
