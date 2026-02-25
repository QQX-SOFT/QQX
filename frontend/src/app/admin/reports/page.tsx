"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { FileDown, Calendar, User, Clock, ChevronDown, CheckCircle2 } from 'lucide-react'

interface ReportSummary {
    totalHours: string
    totalDays: number
    period: string
}

interface ReportEntry {
    date: string
    startTime: string
    endTime: string
    durationMinutes: number
    pauseMinutes: number
}

export default function ReportsPage() {
    const [drivers, setDrivers] = useState<any[]>([])
    const [selectedDriver, setSelectedDriver] = useState('')
    const [report, setReport] = useState<{ summary: ReportSummary, entries: ReportEntry[] } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchDrivers()
    }, [])

    const fetchDrivers = async () => {
        const { data } = await api.get('/drivers')
        setDrivers(data)
    }

    const generateReport = async () => {
        if (!selectedDriver) return
        setLoading(true)
        try {
            // Hardcoded period for demo: Current Month
            const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
            const end = new Date().toISOString()

            const { data } = await api.get(`/reports/driver/${selectedDriver}?start=${start}&end=${end}`)
            setReport(data)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Berichte & Auswertung</h2>
                    <p className="text-slate-500">Analysieren Sie die Arbeitszeiten Ihrer Fahrer.</p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="">Fahrer auswählen...</option>
                        {drivers.map(d => (
                            <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                        ))}
                    </select>
                    <button
                        onClick={generateReport}
                        disabled={!selectedDriver || loading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Lade...' : <><Calendar size={18} /> Monat anzeigen</>}
                    </button>
                </div>
            </div>

            {report ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <Clock size={160} />
                            </div>
                            <h3 className="text-blue-100 font-bold uppercase text-xs tracking-widest mb-2">Gesamtstunden</h3>
                            <div className="text-5xl font-black tracking-tighter mb-1">{report.summary.totalHours}</div>
                            <div className="text-sm font-medium opacity-80">Stunden im Zeitraum</div>
                        </div>

                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2">Arbeitstage</h3>
                            <div className="text-5xl font-black text-slate-800 tracking-tighter mb-1">{report.summary.totalDays}</div>
                            <div className="text-sm font-medium text-slate-400 italic">Einsätze dokumentiert</div>
                        </div>

                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-center">
                            <button className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition">
                                <FileDown size={20} /> PDF EXPORT
                            </button>
                            <button className="w-full text-sm font-bold text-slate-400 mt-4 hover:text-blue-600 transition">DATEN ALS EXCEL (.XLSX)</button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                                    <th className="px-8 py-5">Datum</th>
                                    <th className="px-8 py-5">Beginn</th>
                                    <th className="px-8 py-5">Ende</th>
                                    <th className="px-8 py-5">Pause</th>
                                    <th className="px-8 py-5 text-right">Netto-Kernzeit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {report.entries.map((entry, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition">
                                        <td className="px-8 py-5 font-bold text-slate-900">{entry.date}</td>
                                        <td className="px-8 py-5 text-slate-500 font-medium">{entry.startTime}</td>
                                        <td className="px-8 py-5 text-slate-500 font-medium">{entry.endTime}</td>
                                        <td className="px-8 py-5">
                                            <span className="text-slate-400 text-sm">{entry.pauseMinutes} Min.</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-black">
                                                <CheckCircle2 size={14} /> {(entry.durationMinutes / 60).toFixed(2)} h
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-[32px] border border-slate-100 italic text-slate-400 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <User size={32} />
                    </div>
                    Wählen Sie einen Fahrer und einen Zeitraum aus, um Berichte zu generieren.
                </div>
            )}
        </div>
    )
}
