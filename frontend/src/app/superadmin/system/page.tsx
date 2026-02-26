"use client";

import { Server, Activity, Cpu, Database, Globe, Zap } from "lucide-react";

export default function SuperAdminSystem() {
    return (
        <div className="space-y-12 pb-20">
            <header>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">System-Gesundheit</h1>
                <p className="text-slate-500 font-medium font-sans">Überwachung der globalen Infrastruktur und Services.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "API Cluster", status: "Online", icon: Server, color: "text-green-500" },
                    { label: "Database", status: "Healthy", icon: Database, color: "text-blue-500" },
                    { label: "Global CDN", status: "Optimal", icon: Globe, color: "text-indigo-500" },
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-[#131720] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
                        <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 ${s.color} mb-6 w-fit`}>
                            <s.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{s.status}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-[#131720] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-8">
                    <Activity size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Infrastructure Monitoring</h2>
                <p className="text-slate-500 max-w-md mx-auto font-medium font-sans">Detaillierte Echtzeit-Metriken und Log-Analysen werden hier bald verfügbar sein.</p>
            </div>
        </div>
    );
}
