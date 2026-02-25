"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Plus, User, Phone, Mail, ChevronRight, Search, Star } from 'lucide-react'

interface Driver {
    id: string
    firstName: string
    lastName: string
    phone: string | null
    user: {
        email: string
    }
    status: string
}

export default function DriverManagement() {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [ratingTarget, setRatingTarget] = useState<Driver | null>(null)

    // Form State
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')

    // Rating State
    const [stars, setStars] = useState(5)
    const [comment, setComment] = useState('')

    useEffect(() => {
        fetchDrivers()
    }, [])

    const fetchDrivers = async () => {
        try {
            const { data } = await api.get('/drivers')
            setDrivers(data)
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false)
        }
    }

    const createDriver = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/drivers', { firstName, lastName, phone })
            setShowModal(false)
            setFirstName('')
            setLastName('')
            setPhone('')
            fetchDrivers()
        } catch (err: any) {
            alert(err.response?.data?.error || "Fehler beim Erstellen")
        }
    }

    const submitRating = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!ratingTarget) return
        try {
            await api.post('/ratings', { driverId: ratingTarget.id, stars: Number(stars), comment })
            setShowRatingModal(false)
            setStars(5)
            setComment('')
            alert("Bewertung gespeichert!")
        } catch (err) {
            alert("Fehler beim Bewerten")
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fahrer-Verwaltung</h2>
                    <p className="text-slate-500 font-medium">Verwalten Sie Ihre Fahrer und deren Zugänge.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Suche..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        <Plus size={18} /> Fahrer hinzufügen
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                            <th className="px-8 py-5">Fahrer</th>
                            <th className="px-8 py-5">Kontakt</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">Lädt...</td></tr>
                        ) : drivers.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">Keine Fahrer gefunden.</td></tr>
                        ) : drivers.map((driver) => (
                            <tr key={driver.id} className="hover:bg-slate-50/50 transition group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition duration-300">
                                            {driver.firstName[0]}{driver.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900 tracking-tight">{driver.firstName} {driver.lastName}</div>
                                            <div className="text-xs font-bold text-slate-400">ID: {driver.id.slice(0, 8)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                            <Mail size={14} className="text-blue-500" /> {driver.user.email}
                                        </div>
                                        {driver.phone && (
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                <Phone size={14} className="text-blue-500" /> {driver.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 rounded-full text-xs font-black bg-green-50 text-green-600 ring-1 ring-green-100 uppercase tracking-widest">
                                        {driver.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => { setRatingTarget(driver); setShowRatingModal(true); }}
                                            className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition shadow-sm"
                                        >
                                            <Star size={18} fill="currentColor" />
                                        </button>
                                        <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition group-hover:translate-x-1 duration-300">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Existing Driver Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl overflow-hidden relative">
                        <h3 className="text-2xl font-black mb-6 tracking-tight">Neuen Fahrer anlegen</h3>
                        <form onSubmit={createDriver} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Vorname</label>
                                    <input
                                        value={firstName} onChange={e => setFirstName(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
                                        placeholder="Max" required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Nachname</label>
                                    <input
                                        value={lastName} onChange={e => setLastName(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
                                        placeholder="Mustermann" required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Telefon</label>
                                <input
                                    value={phone} onChange={e => setPhone(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
                                    placeholder="+49 123 456789"
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

            {/* Rating Modal */}
            {showRatingModal && ratingTarget && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Star size={120} fill="currentColor" />
                        </div>
                        <h3 className="text-2xl font-black mb-1 tracking-tight">Fahrer bewerten</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8">Wie zufrieden sind Sie mit <span className="text-slate-900 font-bold">{ratingTarget.firstName} {ratingTarget.lastName}</span>?</p>

                        <form onSubmit={submitRating} className="space-y-6">
                            <div className="flex justify-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setStars(num)}
                                        className={`p-3 rounded-2xl transition ${stars >= num ? 'bg-amber-100 text-amber-500' : 'bg-slate-50 text-slate-200'}`}
                                    >
                                        <Star size={32} fill={stars >= num ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Feedback / Kommentar</label>
                                <textarea
                                    value={comment} onChange={e => setComment(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition font-medium min-h-[120px]"
                                    placeholder="Optional: Was lief besonders gut oder schlecht?"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowRatingModal(false)} className="flex-1 px-5 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition">Abbrechen</button>
                                <button type="submit" className="flex-1 px-5 py-4 rounded-2xl font-bold bg-amber-500 text-white hover:bg-amber-600 transition shadow-lg shadow-amber-100">Bewerten</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
