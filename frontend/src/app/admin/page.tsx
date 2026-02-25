"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Users,
    Car,
    BarChart3,
    MapPin,
    ArrowUpRight,
    Zap,
    ShieldCheck,
    Activity
} from 'lucide-react'

export default function AdminDashboard() {
    return (
        <div className="p-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">
                        <Zap size={14} fill="currentColor" /> System Ready
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Willkommen zurück!</h2>
                    <p className="text-slate-400 font-medium text-lg mt-2 italic">Alles im Fokus. Alles unter Kontrolle.</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                        System-Status
                    </button>
                    <Link href="/admin/tracking" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2">
                        Live-Karte <ArrowUpRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Grid Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                <Link href="/admin/drivers" className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-500 group">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:bg-blue-600 group-hover:text-white transition duration-500">
                        <Users size={32} />
                    </div>
                    <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Fahrer</div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-4">24</div>
                    <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
                        <Activity size={12} /> 12 im Einsatz
                    </div>
                </Link>

                <Link href="/admin/fleet" className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-500 group">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-8 group-hover:bg-orange-600 group-hover:text-white transition duration-500">
                        <Car size={32} />
                    </div>
                    <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Fuhrpark</div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-4">18</div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        Alle Fahrzeuge bereit
                    </div>
                </Link>

                <Link href="/admin/reports" className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-500 group">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-8 group-hover:bg-green-600 group-hover:text-white transition duration-500">
                        <BarChart3 size={32} />
                    </div>
                    <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Auslastung</div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-4">92%</div>
                    <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
                        +1.2% v.V.
                    </div>
                </Link>

                <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 text-white">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8">
                            <ShieldCheck size={32} />
                        </div>
                        <div className="text-sm font-black text-white/40 uppercase tracking-widest mb-2">Sicherheit</div>
                        <div className="text-2xl font-black text-white tracking-tight mb-4 leading-tight">Keine Vorfälle im Zeitraum</div>
                        <button className="text-xs font-black text-blue-400 uppercase tracking-widest group-hover:text-blue-300 transition">Protokoll ansehen &rarr;</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-black mb-8 tracking-tight">Letzte Aktivitäten</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-slate-900">Fahrer-Abrechnung erstellt #INV-928{i}</div>
                                    <div className="text-xs font-medium text-slate-400">Vor {i * 10} Minuten</div>
                                </div>
                                <div className="text-xs font-black text-slate-900">+450,00 €</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-600 p-12 rounded-[40px] shadow-2xl shadow-blue-200 relative overflow-hidden flex flex-col justify-end">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Zap size={240} className="text-white" />
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter mb-4 leading-none">Bereit für die mobile App?</h3>
                    <p className="text-blue-100 font-medium mb-8 text-lg max-w-sm">Verwalten Sie Ihre Flotte bald auch bequem von unterwegs mit unserer neuen App.</p>
                    <div>
                        <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition shadow-xl">
                            Demnächst verfügbar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
