"use client";

import { motion } from "framer-motion";
import { Terminal, Search, Trash2, Filter, ChevronRight, Activity, Server, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

const LOGS = [
    { id: 1, type: "SUCCESS", message: "Tenant 'Müller Logistik' created successfully", timestamp: "2024-03-01 17:45", user: "Root Admin" },
    { id: 2, type: "ERROR", message: "Failed login attempt on subdomain 'birlik'", timestamp: "2024-03-01 17:40", user: "System" },
    { id: 3, type: "WARNING", message: "Prisma connection latency exceeds 500ms", timestamp: "2024-03-01 17:35", user: "System Monitor" },
];

export default function SuperAdminLogsPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">SYSTEM<span className="text-indigo-500 not-italic">LOGS</span></h1>
                    <p className="text-slate-500 font-medium mt-2">Umfassende Verfolgung aller Systemaktivitäten und Fehlerereignisse.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center gap-3 active:scale-95">
                        <Trash2 size={20} />
                        Clear Logs
                    </button>
                    <button className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95">
                        <Filter size={20} />
                        Filter
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 text-center space-y-2">
                    <Activity size={24} className="mx-auto text-indigo-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Events/Min</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">1,248</p>
                </div>
                <div className="bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 text-center space-y-2">
                    <Server size={24} className="mx-auto text-emerald-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">99.9%</p>
                </div>
                <div className="bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 text-center space-y-2">
                    <AlertTriangle size={24} className="mx-auto text-amber-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warnings</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">24</p>
                </div>
                <div className="bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 text-center space-y-2">
                    <ShieldCheck size={24} className="mx-auto text-purple-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Threats</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">0</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Terminal className="text-indigo-500" size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Audit <span className="text-indigo-500 not-italic">Trail</span></h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Typ</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktion/Nachricht</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zeitstempel</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Benutzer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                            {LOGS.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition group">
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                            log.type === "SUCCESS" ? "bg-emerald-500/10 text-emerald-500" :
                                                log.type === "ERROR" ? "bg-red-500/10 text-red-500" :
                                                    "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{log.message}</p>
                                    </td>
                                    <td className="px-8 py-6 text-xs text-slate-500 font-bold">{log.timestamp}</td>
                                    <td className="px-8 py-6 text-xs text-indigo-400 font-black tracking-widest uppercase">{log.user}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
