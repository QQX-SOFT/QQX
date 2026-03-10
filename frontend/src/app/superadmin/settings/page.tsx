"use client";

import { useState } from "react";
import {
    Settings,
    Globe,
    Bell,
    Shield,
    Zap,
    Save,
    Server,
    Database,
    Mail,
    MessageSquare,
    Lock,
    Eye,
    EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SuperAdminSettings() {
    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
    };

    const tabs = [
        { id: "general", label: "Allgemein", icon: Globe },
        { id: "api", label: "API & Integration", icon: Zap },
        { id: "comms", label: "Kommunikation", icon: MessageSquare },
        { id: "security", label: "Sicherheit", icon: Shield },
    ];

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase italic">
                        System <span className="text-indigo-500 not-italic">Konfiguration</span>
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Mandantenübergreifende Plattform-Konfigurationen.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                >
                    {saving ? <Server className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? "Speichert..." : "Änderungen Speichern"}
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar Navigation */}
                <aside className="lg:w-72 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 translate-x-2"
                                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Main Settings Area */}
                <main className="flex-1 space-y-8">
                    {activeTab === "general" && (
                        <div className="bg-white dark:bg-[#0f111a] rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 shadow-sm space-y-10">
                            <section>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 italic uppercase tracking-tight underline decoration-indigo-500 decoration-4">Plattform Branding</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Plattform Name</label>
                                        <input
                                            type="text"
                                            defaultValue="QQX Logistics OS"
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hauptdomain</label>
                                        <input
                                            type="text"
                                            defaultValue="qqxsoft.com"
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 italic uppercase tracking-tight underline decoration-blue-500 decoration-4">Regional & Legal</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Standard Währung</label>
                                        <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition">
                                            <option value="EUR">Euro (€)</option>
                                            <option value="USD">US Dollar ($)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primäre Sprache</label>
                                        <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition">
                                            <option value="de">Deutsch</option>
                                            <option value="en">English</option>
                                            <option value="tr">Türkçe</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "api" && (
                        <div className="bg-white dark:bg-[#0f111a] rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 shadow-sm space-y-10">
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight underline decoration-amber-500 decoration-4">Google Maps (Cloud Console)</h3>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Verbunden</span>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Master-API-Schlüssel</label>
                                    <div className="relative group">
                                        <input
                                            type={showApiKey ? "text" : "password"}
                                            defaultValue="AIzaSyBusnALj0LNVzcmmdbgMh7Ec0-BUJWJsTg"
                                            readOnly
                                            className="w-full bg-slate-900 text-amber-500 border border-white/5 rounded-2xl px-6 py-5 font-mono text-sm outline-none tracking-widest"
                                        />
                                        <button
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition"
                                        >
                                            {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold px-1 italic">Dieser Schlüssel wird als Fallback für alle Mandanten ohne eigenen Schlüssel verwendet.</p>
                                </div>
                            </section>

                            <section className="pt-8 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 italic uppercase tracking-tight underline decoration-indigo-500 decoration-4">Datenbankpersistenz</h3>
                                <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                                    <div className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">PostgreSQL Cluster</h4>
                                        <p className="text-xs text-slate-500 font-medium">Status: Optimal (4-Knoten-Cluster)</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-xs">Live</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "comms" && (
                        <div className="bg-white dark:bg-[#0f111a] rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 shadow-sm space-y-10">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 italic uppercase tracking-tight underline decoration-purple-500 decoration-4">Provider-Konfiguration</h3>

                            <div className="space-y-6">
                                <div className="p-8 border border-slate-100 dark:border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/30 transition duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white">Amazon SES</h4>
                                            <p className="text-xs text-slate-500">E-Mail-Transaktionsservice</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg">Aktiv</span>
                                        <button className="text-xs font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition">Konfigurieren</button>
                                    </div>
                                </div>

                                <div className="p-8 border border-slate-100 dark:border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/30 transition duration-500 opacity-50 grayscale">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                                            <Bell size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white">Twilio SMS</h4>
                                            <p className="text-xs text-slate-500">Global SMS Gateway</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">Inaktiv</span>
                                        <button className="text-xs font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition">Einrichten</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl space-y-10 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-8 italic uppercase tracking-tight flex items-center gap-4">
                                    <Lock className="text-indigo-400" />
                                    Plattform- <span className="text-indigo-400">Sicherheitsschild</span>
                                </h3>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition">
                                        <div className="flex items-center gap-4">
                                            <Shield className="text-indigo-400" />
                                            <div>
                                                <p className="font-black text-sm uppercase mb-0.5">Automatisierte Backups</p>
                                                <p className="text-[10px] text-slate-400">Täglich um 03:00 UTC</p>
                                            </div>
                                        </div>
                                        <div className="h-6 w-12 bg-indigo-600 rounded-full relative">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition">
                                        <div className="flex items-center gap-4">
                                            <Shield className="text-indigo-400" />
                                            <div>
                                                <p className="font-black text-sm uppercase mb-0.5">Audit-Protokollierung</p>
                                                <p className="text-[10px] text-slate-400">Vollständige Compliance-Protokollierung</p>
                                            </div>
                                        </div>
                                        <div className="h-6 w-12 bg-indigo-600 rounded-full relative">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Shield size={300} className="absolute bottom-[-100px] right-[-100px] text-white/5 rotate-12" />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
