"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { MapPin, Navigation, User, Radio, ShieldAlert } from 'lucide-react'

interface DriverLocation {
    id: string
    driverName: string
    lat: number | null
    lng: number | null
    startTime: string
}

export default function TrackingPage() {
    const [locations, setLocations] = useState<DriverLocation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLocations()
        const interval = setInterval(fetchLocations, 30000) // Poll every 30s
        return () => clearInterval(interval)
    }, [])

    const fetchLocations = async () => {
        try {
            const { data } = await api.get('/time-entries/locations')
            setLocations(data)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans h-[calc(100vh-80px)] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live-Tracking</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Echtzeit-Positionen Ihrer aktiven Fahrer.</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase tracking-widest animate-pulse border border-green-100">
                    <Radio size={14} /> Live System Aktiv
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
                {/* Driver List */}
                <div className="w-full lg:w-80 flex flex-col shrink-0 gap-4 overflow-y-auto pr-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest px-2">Aktive Fahrer ({locations.length})</h3>
                    {locations.length === 0 && (
                        <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 italic text-slate-400 text-sm">
                            Keine aktiven Schichten momentan.
                        </div>
                    )}
                    {locations.map(loc => (
                        <div key={loc.id} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:border-blue-200 transition group cursor-pointer">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 leading-tight">{loc.driverName}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Start: {new Date(loc.startTime).toLocaleTimeString()}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                                <span className="flex items-center gap-1"><Navigation size={12} className="text-blue-400" /> {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}</span>
                                <span className="text-blue-600">Details</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Map Placeholder */}
                <div className="flex-1 bg-slate-100 rounded-[40px] border-4 border-white shadow-inner relative overflow-hidden group">
                    {/* This would be the Google Map component. For now, a premium placeholder. */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 border border-white/20 shadow-2xl">
                            <ShieldAlert size={40} className="text-white" />
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter mb-4">Google Maps Integration bereit</h3>
                        <p className="max-w-md opacity-80 font-medium mb-8">Setzen Sie Ihren API Key in den Environment Variables (`NEXT_PUBLIC_GOOGLE_MAPS_KEY`) ein, um die Live-Karte zu aktivieren.</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                            {locations.map(loc => (
                                <div key={loc.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 animate-bounce" style={{ animationDelay: `${Math.random()}s` }}>
                                    <MapPin size={20} className="text-blue-400 mx-auto mb-2" />
                                    <div className="text-[10px] font-black uppercase text-white truncate">{loc.driverName}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
