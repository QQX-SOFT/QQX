"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Plus,
    Globe,
    ExternalLink,
    Database,
    Settings,
    Search,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const mockTenants = [
    { id: "1", name: "Logistic Solutions GmbH", subdomain: "logistic", status: "Active", users: 24, vehicles: 12 },
    { id: "2", name: "FastTrack Delivery", subdomain: "fasttrack", status: "Active", users: 15, vehicles: 8 },
    { id: "3", name: "Berlin Flotten Service", subdomain: "berlin-fleet", status: "Inactive", users: 0, vehicles: 0 },
];

export default function SuperAdminPage() {
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8 lg:p-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">System Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Super Admin Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-2">Willkommen im zentralen Kontrollzentrum von QQX. Verwalten Sie alle Kunden und Systemressourcen.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-3 hover:bg-blue-700 transition shadow-2xl shadow-blue-900/20"
                >
                    <Plus size={20} />
                    Neues Kunden-Setup (Tenant)
                </button>
            </header>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                    { label: "Aktive Mandanten", value: "14", icon: Globe },
                    { label: "Datenbank-Last", value: "12%", icon: Database },
                    { label: "System Status", value: "Operational", icon: CheckCircle2, color: "text-green-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <stat.icon size={18} className={stat.color || "text-slate-400"} />
                        </div>
                        <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Tenants Table */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">Kunden-Instanzen</h3>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <Search size={18} className="text-slate-500" />
                        <input type="text" placeholder="Mandant suchen..." className="bg-transparent border-none outline-none text-sm font-medium" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kunde</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subdomain</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ressourcen</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockTenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-white/[0.03] transition">
                                    <td className="px-8 py-6">
                                        <p className="font-black text-white leading-none">{tenant.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-2 font-mono">ID: {tenant.id}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-blue-400 font-bold">
                                            <span>{tenant.subdomain}.qqx-app.de</span>
                                            <ExternalLink size={14} />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-4 text-xs font-bold text-slate-400">
                                            <span>{tenant.users} User</span>
                                            <span>{tenant.vehicles} Fahrzeuge</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            tenant.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", tenant.status === "Active" ? "bg-green-500" : "bg-red-500")} />
                                            {tenant.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400">
                                            <Settings size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mock Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl"
                    >
                        <h2 className="text-2xl font-black text-white mb-8">Neuen Mandanten anlegen</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Unternehmensname</label>
                                <input type="text" placeholder="z.B. Müller Logistik" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Subdomain</label>
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-blue-500 transition">
                                    <input type="text" placeholder="mueller" className="bg-transparent border-none outline-none flex-1" />
                                    <span className="text-slate-500 font-bold">.qqx-app.de</span>
                                </div>
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-2xl bg-white/5 font-black hover:bg-white/10 transition">Abbrechen</button>
                                <button className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition">Tenant Erstellen</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
