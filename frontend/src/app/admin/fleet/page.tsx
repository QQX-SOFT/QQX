"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Plus, Car, Gauge, Wrench, Calendar, Search, AlertTriangle } from 'lucide-react'

interface Vehicle {
    id: string
    licensePlate: string
    make: string
    model: string
    milage: number
    nextMaintenance: string | null
    status: string
}

export default function FleetManagement() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    // Form State
    const [licensePlate, setLicensePlate] = useState('')
    const [make, setMake] = useState('')
    const [model, setModel] = useState('')
    const [milage, setMilage] = useState(0)
    const [nextMaintenance, setNextMaintenance] = useState('')

    useEffect(() => {
        fetchVehicles()
    }, [])

    const fetchVehicles = async () => {
        try {
            const { data } = await api.get('/vehicles')
            setVehicles(data)
        } finally {
            setLoading(false)
        }
    }

    const createVehicle = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/vehicles', {
                licensePlate,
                make,
                model,
                milage: Number(milage),
                nextMaintenance: nextMaintenance || null
            })
            setShowModal(false)
            resetForm()
            fetchVehicles()
        } catch (err: any) {
            alert(err.response?.data?.error || "Fehler beim Erstellen")
        }
    }

    const resetForm = () => {
        setLicensePlate('')
        setMake('')
        setModel('')
        setMilage(0)
        setNextMaintenance('')
    }

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fuhrpark-Management</h2>
                    <p className="text-slate-500">Verwalten Sie Ihre Fahrzeuge und Wartungsintervalle.</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                    <Plus size={18} /> Fahrzeug hinzufügen
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p>Lade Fuhrpark...</p>
                ) : vehicles.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 italic text-slate-400">
                        Noch keine Fahrzeuge im Fuhrpark.
                    </div>
                ) : vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition duration-300">
                                <Car size={32} />
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${vehicle.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                }`}>
                                {vehicle.status}
                            </span>
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{vehicle.licensePlate}</h3>
                        <p className="text-sm font-medium text-slate-400 mb-6">{vehicle.make} {vehicle.model}</p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                    <Gauge size={16} className="text-blue-500" /> KM-Stand
                                </div>
                                <span className="font-bold text-slate-900">{vehicle.milage.toLocaleString()} km</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                    <Wrench size={16} className="text-blue-500" /> Nächster TÜV
                                </div>
                                <span className="font-bold text-slate-900">
                                    {vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toLocaleDateString('de-DE') : 'TBD'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl overflow-hidden relative">
                        <h3 className="text-2xl font-black mb-6 tracking-tight">Fahrzeug erfassen</h3>
                        <form onSubmit={createVehicle} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Kennzeichen</label>
                                <input
                                    value={licensePlate} onChange={e => setLicensePlate(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition uppercase font-bold"
                                    placeholder="z.B. B-QX 123" required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Marke</label>
                                    <input
                                        value={make} onChange={e => setMake(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="VW" required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Modell</label>
                                    <input
                                        value={model} onChange={e => setModel(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="Golf" required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Aktueller KM-Stand</label>
                                <input
                                    type="number"
                                    value={milage} onChange={e => setMilage(Number(e.target.value))}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Nächste Wartung / TÜV</label>
                                <input
                                    type="date"
                                    value={nextMaintenance} onChange={e => setNextMaintenance(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-5 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition">Abbrechen</button>
                                <button type="submit" className="flex-1 px-5 py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-100">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
