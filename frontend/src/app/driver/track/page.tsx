"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Play, Square, MapPin, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

interface TimeEntry {
    id: string
    startTime: string
    status: 'RUNNING' | 'PAUSED' | 'COMPLETED'
}

export default function DriverTrack() {
    const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [elapsedTime, setElapsedTime] = useState('00:00:00')

    // TEMPORARY: For demo/local test, use a hardcoded driverId or fetch from list
    const [driverId, setDriverId] = useState('')

    useEffect(() => {
        // Initial fetch of drivers to select one (since no Auth yet)
        const init = async () => {
            try {
                const { data: drivers } = await api.get('/drivers');
                if (drivers.length > 0) {
                    setDriverId(drivers[0].id);
                    checkActiveEntry(drivers[0].id);
                }
            } catch (err) {
                setError("Konnte Fahrer nicht laden. Bitte im Admin-Bereich Fahrer anlegen.");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [])

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeEntry && activeEntry.status === 'RUNNING') {
            interval = setInterval(() => {
                const start = new Date(activeEntry.startTime).getTime();
                const now = new Date().getTime();
                const diff = now - start;

                const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');

                setElapsedTime(`${h}:${m}:${s}`);
            }, 1000);
        } else {
            setElapsedTime('00:00:00');
        }
        return () => clearInterval(interval);
    }, [activeEntry])

    const checkActiveEntry = async (id: string) => {
        try {
            const { data } = await api.get(`/time-entries/active/${id}`);
            setActiveEntry(data);
        } catch (err) {
            console.error("Check failed");
        }
    }

    const handleStart = () => {
        if (!navigator.geolocation) {
            setError("GPS wird von Ihrem Browser nicht unterstützt.");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { data } = await api.post('/time-entries/start', {
                    driverId,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
                setActiveEntry(data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.error || "Fehler beim Starten");
            }
        }, () => {
            setError("GPS-Zugriff wurde verweigert. Bitte erlauben Sie den Zugriff für die Zeiterfassung.");
        });
    }

    const handleStop = () => {
        if (!activeEntry) return;

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                await api.patch(`/time-entries/stop/${activeEntry.id}`, {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
                setActiveEntry(null);
                setError(null);
                alert("Schicht erfolgreich beendet!");
            } catch (err) {
                setError("Fehler beim Beenden");
            }
        });
    }

    if (loading) return <div className="p-20 text-center">Initialisiere Tracking-Terminal...</div>

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden relative">
            <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#1e40af,transparent)] blur-3xl"></div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative z-10 text-center">
                <div className="mb-8 flex justify-center">
                    {activeEntry ? (
                        <div className="p-4 bg-green-500/10 rounded-3xl text-green-400 animate-pulse border border-green-500/20">
                            <Clock size={48} />
                        </div>
                    ) : (
                        <div className="p-4 bg-blue-600/10 rounded-3xl text-blue-500 border border-blue-600/20">
                            <MapPin size={48} />
                        </div>
                    )}
                </div>

                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-500 mb-2">Zeiterfassung</h2>
                <div className="text-4xl font-black tracking-tighter mb-8 tabular-nums">
                    {elapsedTime}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <div className="space-y-4">
                    {!activeEntry ? (
                        <button
                            onClick={handleStart}
                            className="w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-xl shadow-blue-900/40"
                        >
                            <Play fill="currentColor" size={24} /> SCHICHT STARTEN
                        </button>
                    ) : (
                        <button
                            onClick={handleStop}
                            className="w-full py-6 rounded-3xl bg-white text-slate-950 font-black text-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-xl shadow-white/10"
                        >
                            <Square fill="currentColor" size={24} /> SCHICHT BEENDEN
                        </button>
                    )}
                </div>

                <div className="mt-10 flex items-center justify-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${activeEntry ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                        GPS Aktiv
                    </span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                    <span>V 1.0.4</span>
                </div>
            </div>

            {activeEntry && (
                <div className="mt-8 text-slate-400 flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 size={16} className="text-green-500" /> Schicht läuft seit {new Date(activeEntry.startTime).toLocaleTimeString('de-DE')}
                </div>
            )}
        </div>
    )
}
