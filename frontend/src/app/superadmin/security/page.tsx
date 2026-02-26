"use client";

import { ShieldCheck, Lock, ShieldAlert } from "lucide-react";

export default function SuperAdminSecurity() {
    return (
        <div className="space-y-12 pb-20">
            <header>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Benutzer-Sicherheit</h1>
                <p className="text-slate-500 font-medium font-sans">Sicherheitsrichtlinien ve Authentifizierungs-Management.</p>
            </header>

            <div className="bg-white dark:bg-[#131720] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-8">
                    <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Sicherheits-Cockpit</h2>
                <p className="text-slate-500 max-w-md mx-auto font-medium font-sans">Dieses Modul befindet sich derzeit in der Entwicklung. Hier können Sie demnächst globale Sicherheitsrichtlinien festlegen.</p>
            </div>
        </div>
    );
}
