"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Plus, Users, Car, Globe, CheckCircle } from 'lucide-react'

interface Tenant {
    id: string
    name: string
    subdomain: string
    createdAt: string
    _count: { users: number, vehicles: number }
}

export default function SuperAdminTenants() {
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    // Form State
    const [name, setName] = useState('')
    const [subdomain, setSubdomain] = useState('')

    useEffect(() => {
        fetchTenants()
    }, [])

    const fetchTenants = async () => {
        try {
            const { data } = await api.get('/tenants')
            setTenants(data)
        } finally {
            setLoading(false)
        }
    }

    const createTenant = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/tenants', { name, subdomain })
            setShowModal(false)
            setName('')
            setSubdomain('')
            fetchTenants()
        } catch (err: any) {
            alert(err.response?.data?.error || "Fehler beim Erstellen")
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Kundenverwaltung</h2>
                    <p className="text-slate-500">Erstellen und verwalten Sie Multi-Tenant Instanzen.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                    <Plus size={18} /> Neuer Kunde
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p>Lade Kunden...</p>
                ) : tenants.map((tenant) => (
                    <div key={tenant.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <Globe size={24} />
                            </div>
                            <span className="text-xs font-semibold bg-green-50 text-green-600 px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle size={12} /> Aktiv
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{tenant.name}</h3>
                        <p className="text-sm text-slate-400 mb-6">{tenant.subdomain}.driverflow.app</p>

                        <div className="flex gap-4 border-t pt-4">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Users size={16} />
                                <span className="text-sm font-medium">{tenant._count.users} Fahrer</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Car size={16} />
                                <span className="text-sm font-medium">{tenant._count.vehicles} Fahrzeuge</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Basic Modal Implementation */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-bold mb-6">Neuen Mandanten anlegen</h3>
                        <form onSubmit={createTenant} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Firmenname</label>
                                <input
                                    value={name} onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="z.B. Logistik GmbH" required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Subdomain</label>
                                <div className="flex items-center">
                                    <input
                                        value={subdomain} onChange={e => setSubdomain(e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-l-xl border border-slate-200 border-r-0 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="logistik-gmbh" required
                                    />
                                    <span className="bg-slate-50 px-4 py-3 border border-slate-200 rounded-r-xl text-slate-500 text-sm">.driverflow.app</span>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition">Abbrechen</button>
                                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition">Erstellen</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
