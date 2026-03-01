"use client";

import React, { useState } from "react";
import {
    Activity,
    MapPin,
    Route,
    Navigation,
    CheckCircle2,
    XCircle,
    Loader2,
    ShieldCheck,
    Zap,
    Cpu
} from "lucide-react";
import { useGoogleMaps } from "@/components/GoogleMapsProvider";
import AddressPicker from "@/components/AddressPicker";
import api from "@/lib/api";

export default function GoogleMapsDebugPage() {
    const { isLoaded } = useGoogleMaps();
    const [distanceResult, setDistanceResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<Record<string, 'pending' | 'ok' | 'fail'>>({
        maps: 'pending',
        places: 'pending',
        distance: 'pending',
        geocoding: 'pending'
    });

    const testDistanceAPI = async () => {
        setLoading(true);
        setStatus(prev => ({ ...prev, distance: 'pending' }));
        try {
            // Testing distance from Vienna to Berlin
            const { data } = await api.get("/orders/quote", {
                params: {
                    origin: "Wien, Austria",
                    destination: "Berlin, Germany"
                }
            });
            setDistanceResult(data);
            setStatus(prev => ({ ...prev, distance: 'ok' }));
        } catch (e) {
            setStatus(prev => ({ ...prev, distance: 'fail' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#08090f] p-8 md:p-16 space-y-12 font-sans overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <header className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Cpu size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                        Google <span className="text-indigo-500 not-italic">API Diagnostics</span>
                    </h1>
                </div>
                <p className="text-slate-500 font-medium tracking-tight max-w-xl">
                    Sistemdeki Google Maps entegrasyonlarını, anahtarları ve servis durumlarını anlık olarak test etmenizi sağlar.
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
                {/* 1. API Status Board */}
                <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl space-y-8">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <ShieldCheck className="text-indigo-500" /> Servis Durumları
                    </h3>
                    <div className="space-y-4">
                        {[
                            { id: 'maps', name: 'Maps JavaScript API', active: isLoaded },
                            { id: 'places', name: 'Places API (Autocomplete)', active: isLoaded },
                            { id: 'distance', name: 'Distance Matrix API', active: status.distance === 'ok' },
                            { id: 'geocoding', name: 'Geocoding API', active: status.distance === 'ok' }
                        ].map((serv) => (
                            <div key={serv.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-100 transition duration-300">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{serv.name}</span>
                                {serv.active ? (
                                    <div className="flex items-center gap-2 text-emerald-500">
                                        <CheckCircle2 size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Aktif</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Activity size={20} className="animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Bekleniyor</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Autocomplete Test */}
                <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl space-y-8">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <MapPin className="text-blue-500" /> Autocomplete Testi
                    </h3>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Adres Yazmayı Deneyin</p>
                        <AddressPicker
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700/50 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/5 transition shadow-sm"
                            onAddressSelect={(addr) => {
                                setStatus(prev => ({ ...prev, places: 'ok' }));
                                console.log("Selected:", addr);
                            }}
                            placeholder="Bir adres arayın..."
                        />
                    </div>
                    <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                            Bu alan, <span className="text-blue-500 font-bold">Places API</span>'sini test eder. Eğer yazarken öneriler geliyorsa anahtar doğru çalışıyor demektir.
                        </p>
                    </div>
                </div>

                {/* 3. Distance Matrix Test */}
                <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl space-y-8">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Route className="text-purple-500" /> Mesafe / Fiyat Testi
                    </h3>
                    <button
                        onClick={testDistanceAPI}
                        disabled={loading}
                        className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                        API'yi Sorgula (Wien ➔ Berlin)
                    </button>

                    {distanceResult && (
                        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-2">Mesafe</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{distanceResult.distanceKm} KM</p>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-2">Süre</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{distanceResult.durationMin} DK</p>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 text-center">
                                <p className="text-[10px] font-black text-emerald-100 uppercase leading-none mb-2">Hesaplanan Fiyat</p>
                                <p className="text-3xl font-black italic">€{distanceResult.price.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Footer Status */}
            <footer className="pt-12 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cihaz Konumu (Geolocation)</span>
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm uppercase">
                            <Navigation size={14} className="text-blue-500" /> Browser GPS: Aktif
                        </div>
                    </div>
                </div>
                <div className="px-6 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                    QQX Infrastructure • V1.0.4
                </div>
            </footer>
        </div>
    );
}
