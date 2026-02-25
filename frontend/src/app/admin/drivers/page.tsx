"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Plus, User, Phone, Mail, ChevronRight, Search } from 'lucide-react'

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

    // Form State
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')

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

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Fahrer-Verwaltung</h2>
                    <p className="text-slate-500">Verwalten Sie Ihre Fahrer und deren Zugänge.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            placeholder="Suche..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
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

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm font-semibold">
                            <th className="px-6 py-4">Fahrer</th>
                            <th className="px-6 py-4">Kontakt</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Lädt...</td></tr>
                        ) : drivers.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Keine Fahrer gefunden.</td></tr>
                        ) : drivers.map((driver) => (
                            <tr key={driver.id} className="hover:bg-slate-50/50 transition cursor-pointer group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                                            {driver.firstName[0]}{driver.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{driver.firstName} {driver.lastName}</div>
                                            <div className="text-xs text-slate-400">ID: {driver.id.slice(0, 8)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Mail size={14} className="text-slate-400" /> {driver.user.email}
                                        </div>
                                        {driver.phone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone size={14} className="text-slate-400" /> {driver.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 ring-1 ring-green-100 uppercase">
                                        {driver.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition">
                                        <ChevronRight size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-bold mb-6">Neuen Fahrer anlegen</h3>
                        <form onSubmit={createDriver} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Vorname</label>
                                    <input
                                        value={firstName} onChange={e => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="Max" required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-slate-700">Nachname</label>
                                    <input
                                        value={lastName} onChange={e => setLastName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="Mustermann" required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-slate-700">Telefon (Optional)</label>
                                <input
                                    value={phone} onChange={e => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="+49 123 456789"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition border border-slate-100">Abbrechen</button>
                                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-100">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
