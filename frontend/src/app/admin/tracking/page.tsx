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
import dynamic from "next/dynamic";

const MapNoSSR = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 rounded-[3rem] animate-pulse">Lade Karte...</div> });

type Location = {
    id: string; // TimeEntry ID
    driverId: string;
    driverName: string;
    lat: number;
    lng: number;
    lastUpdate: string;
    status: string;
    phone?: string;
    speed?: number;
    vehicle?: string;
    order?: string;
};

export default function TrackingPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminLocation, setAdminLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setAdminLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                },
                (err) => console.error("Admin location error:", err)
            );
        }
    }, []);

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
                lastUpdate: new Date(entry.updatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
                status: 'ACTIVE',
                phone: entry.driver.phone,
                speed: undefined, // calculated on device if needed later
                vehicle: entry.vehicle?.licensePlate || undefined,
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
                <div className="lg:col-span-3 bg-slate-100 rounded-[3rem] p-4 shadow-sm relative overflow-hidden flex flex-col border border-slate-200">
                    <div className="absolute inset-0 z-0">
                        <MapNoSSR
                            locations={[
                                ...locations.map(loc => ({
                                    id: loc.id,
                                    lat: loc.lat,
                                    lng: loc.lng,
                                    name: loc.driverName,
                                    status: loc.status,
                                    phone: loc.phone,
                                    lastUpdate: loc.lastUpdate,
                                    speed: loc.speed,
                                    vehicle: loc.vehicle,
                                    order: loc.order
                                })),
                                ...(adminLocation ? [{
                                    id: 'admin',
                                    lat: adminLocation.lat,
                                    lng: adminLocation.lng,
                                    name: 'Admin (Sie)',
                                    status: 'online'
                                }] : [])
                            ]}
                        />
                    </div>

                    {locations.length === 0 && !loading && !adminLocation && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10 bg-white/50 backdrop-blur-sm rounded-[3rem]">
                            <WifiOff size={64} className="mb-6 opacity-20" />
                            <h3 className="text-xl font-black text-slate-700">Keine aktiven Einheiten</h3>
                            <p className="text-sm font-medium mt-2 max-w-sm text-center">Aktuell werden keine Telemetriedaten empfangen. Warten auf Fahrer-Logins.</p>
                        </div>
                    )}
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
        </div >
    );
}
