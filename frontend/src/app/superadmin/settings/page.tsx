"use client";

import { Settings, Globe, Bell, Shield, Zap } from "lucide-react";

export default function SuperAdminSettings() {
    return (
        <div className="space-y-12 pb-20">
            <header>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Global Settings</h1>
                <p className="text-slate-500 font-medium font-sans">Mandantenübergreifende Plattform-Konfigurationen.</p>
            </header>

            <div className="bg-white dark:bg-[#131720] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-8">
                    <Settings size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Plattform-Konfiguration</h2>
                <p className="text-slate-500 max-w-md mx-auto font-medium font-sans">Globale Branding-, API- ve System-Einstellungen werden hier konfigurierbar sein.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { label: "Benachrichtigungen", icon: Bell, desc: "E-Mail ve SMS Provider." },
                    { label: "Globale API", icon: Zap, desc: "Interne Service-Endpoints." },
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-[#131720] p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm group hover:scale-[1.02] transition duration-500">
                        <div className="flex items-center gap-5">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-indigo-500">
                                <s.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white">{s.label}</h3>
                                <p className="text-xs font-medium text-slate-400">{s.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
