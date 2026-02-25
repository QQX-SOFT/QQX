"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Receipt, Plus, Download, Send, CheckCircle2, Clock, Wallet, ArrowUpRight } from 'lucide-react'

interface Invoice {
    id: string
    invoiceNumber: string
    amount: number
    period: string
    status: 'PENDING' | 'PAID' | 'CANCELLED'
    createdAt: string
    driver: {
        firstName: string
        lastName: string
    }
}

export default function AccountingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [drivers, setDrivers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Create Modal State
    const [showModal, setShowModal] = useState(false)
    const [selectedDriver, setSelectedDriver] = useState('')
    const [amount, setAmount] = useState('')
    const [period, setPeriod] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [invRes, dryRes] = await Promise.all([
                api.get('/invoices'),
                api.get('/drivers')
            ])
            setInvoices(invRes.data)
            setDrivers(dryRes.data)
        } finally {
            setLoading(false)
        }
    }

    const createInvoice = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/invoices', {
                driverId: selectedDriver,
                amount: Number(amount),
                period
            })
            setShowModal(false)
            fetchData()
        } catch (err) {
            alert("Fehler beim Erstellen der Rechnung")
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Buchhaltung</h2>
                    <p className="text-slate-500 font-medium">Verwalten Sie Abrechnungen und Rechnungen für Ihre Fahrer.</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                    <Plus size={18} /> Neue Rechnung erstellen
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Wallet size={28} />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Offene Posten</div>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                            {invoices.filter(i => i.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Bezahlt (Gesamt)</div>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                            {invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <Receipt size={28} />
                    </div>
                    <div>
                        <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Anzahl Rechnungen</div>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">{invoices.length}</div>
                    </div>
                </div>
            </div>

            {/* Invoice List */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                            <th className="px-8 py-5">Rechnungsnummer</th>
                            <th className="px-8 py-5">Fahrer</th>
                            <th className="px-8 py-5">Zeitraum</th>
                            <th className="px-8 py-5">Betrag</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">Lädt Abrechnungsdaten...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">Keine Rechnungen vorhanden.</td></tr>
                        ) : invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-slate-50/50 transition group">
                                <td className="px-8 py-5 font-bold text-slate-900">{invoice.invoiceNumber}</td>
                                <td className="px-8 py-5">
                                    <div className="font-bold text-slate-800">{invoice.driver.firstName} {invoice.driver.lastName}</div>
                                    <div className="text-xs text-slate-400 font-medium">Erstellt am {new Date(invoice.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-8 py-5 text-slate-500 font-medium">{invoice.period}</td>
                                <td className="px-8 py-5 font-black text-slate-900">
                                    {invoice.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ring-1 ${invoice.status === 'PAID' ? 'bg-green-50 text-green-600 ring-green-100' :
                                            invoice.status === 'PENDING' ? 'bg-amber-50 text-amber-600 ring-amber-100' : 'bg-slate-50 text-slate-400 ring-slate-100'
                                        }`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition shadow-sm">
                                            <Download size={18} />
                                        </button>
                                        <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition shadow-sm">
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl overflow-hidden relative">
                        <h3 className="text-2xl font-black mb-6 tracking-tight">Abrechnung erstellen</h3>
                        <form onSubmit={createInvoice} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Fahrer auswählen</label>
                                <select
                                    value={selectedDriver}
                                    onChange={e => setSelectedDriver(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
                                    required
                                >
                                    <option value="">Fahrer auswählen...</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Abrechnungs-Zeitraum</label>
                                <input
                                    value={period} onChange={e => setPeriod(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
                                    placeholder="z.B. Februar 2026" required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Betrag (€)</label>
                                <input
                                    type="number" step="0.01"
                                    value={amount} onChange={e => setAmount(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition font-black text-xl"
                                    placeholder="0,00" required
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-5 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition">Abbrechen</button>
                                <button type="submit" className="flex-1 px-5 py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-100">Erstellen</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
