"use client";

import { useEffect, useState } from "react";
import {
    MapPin,
    Navigation,
    Clock,
    Truck,
    Wifi,
    WifiOff,
    MoreVertical,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

type Location = {
    id: string; // TimeEntry ID
    driverId: string;
    driverName: string;
    lat: number;
    lng: number;
    lastUpdate: string;
    status: string;
};

export default function TrackingPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLocations = async () => {
        try {
            const { data } = await api.get("/time-entries");
            // Filter only running entries with location
            const activeEntries = data.filter((entry: any) =>
                entry.status === 'RUNNING' && entry.currentLat && entry.currentLng
            );

            setLocations(activeEntries.map((entry: any) => ({
                id: entry.id,
                driverId: entry.driver.id,
                driverName: `${entry.driver.firstName} ${entry.driver.lastName}`,
                lat: entry.currentLat,
                lng: entry.currentLng,
                lastUpdate: entry.updatedAt,
                status: 'ACTIVE'
            })));
        } catch (error) {
            console.error("Failed to load locations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
        // Poll every 5 seconds
        const interval = setInterval(fetchLocations, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 flex flex-col h-[calc(100vh-10rem)]">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative p-2 bg-blue-600 rounded-lg text-white">
                            <MapPin size={20} />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-blue-600"></span>
                            </span>
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Echtzeit Monitoring</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Live Tracking</h1>
                        {locations.length > 0 ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200 shadow-sm animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Signal Aktiv ({locations.length})
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                Keine Signale
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
                {/* Master Map View */}
                <div className="lg:col-span-3 bg-slate-900 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden flex flex-col border border-slate-800">
                    {/* Simulated Map Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="%234f46e5" stroke-width="2"/><circle cx="50" cy="50" r="3" fill="%234f46e5"/></svg>')`,
                        backgroundSize: '150px 150px'
                    }}></div>

                    {locations.length === 0 && !loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10">
                            <WifiOff size={64} className="mb-6 opacity-20" />
                            <h3 className="text-xl font-black text-slate-300">Keine aktiven Einheiten</h3>
                            <p className="text-sm font-medium mt-2 max-w-sm text-center">Aktuell werden keine Telemetriedaten empfangen. Warten auf Fahrer-Logins.</p>
                        </div>
                    )}

                    {/* Entities on "Map" */}
                    <AnimatePresence>
                        {locations.map((loc, i) => {
                            // Map generic coords to our div
                            // Berlin Lat/Lng rough scale logic for demo
                            const baseX = 52.52;
                            const baseY = 13.40;
                            const diffX = (loc.lat - baseX) * 2000;
                            const diffY = (loc.lng - baseY) * 2000;

                            // Keep in bounds
                            const top = Math.max(10, Math.min(90, 50 - diffX)) + "%";
                            const left = Math.max(10, Math.min(90, 50 + diffY)) + "%";

                            return (
                                <motion.div
                                    key={loc.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1, top, left }}
                                    transition={{ duration: 1 }}
                                    className="absolute z-20"
                                >
                                    <div className="relative group cursor-pointer">
                                        {/* Ping animation */}
                                        <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping pointer-events-none"></div>

                                        {/* Marker */}
                                        <div className="relative w-10 h-10 bg-white shadow-xl shadow-blue-900/50 rounded-2xl flex items-center justify-center border-2 border-blue-500 group-hover:scale-110 transition duration-300">
                                            <Truck size={20} className="text-blue-600" />
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 whitespace-nowrap bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none z-30">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                {loc.driverName}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Overlay UI Controls */}
                    <div className="mt-auto flex justify-between items-end p-4 z-20">
                        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Flottenstatus</h4>
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-2xl font-black text-white">{locations.length}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Aktiv</p>
                                </div>
                                <div className="w-px h-8 bg-slate-700"></div>
                                <div>
                                    <p className="text-2xl font-black text-white">10s</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Ping</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button className="w-12 h-12 bg-slate-800/80 backdrop-blur-md border border-slate-700 text-white rounded-2xl flex items-center justify-center hover:bg-slate-700 transition">
                                <Navigation size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Fleet List */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 flex flex-col overflow-hidden">
                    <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center justify-between">
                        Aktive Einheiten
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-xs">{locations.length}</span>
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {locations.length === 0 ? (
                            <p className="text-sm font-medium text-slate-400 text-center mt-10">Keine aktiven Fahrer</p>
                        ) : (
                            locations.map((loc) => (
                                <div key={loc.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 transition group cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600 font-black">
                                                {loc.driverName[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-slate-900 leading-none mb-1 group-hover:text-blue-700 transition">{loc.driverName}</p>
                                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    Unterwegs
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-blue-600">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 p-3 bg-white rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 font-mono">
                                            <Clock size={12} className="text-slate-400" />
                                            {new Date(loc.lastUpdate).toLocaleTimeString('de-DE')}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
