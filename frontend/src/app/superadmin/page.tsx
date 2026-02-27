"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Globe,
    Zap,
    TrendingUp,
    ShieldCheck,
    Server,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Code,
    Cpu,
    ExternalLink,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch aggregate stats
                const { data: statsData } = await api.get("/superadmin/stats");
                setStats(statsData);

                // Fetch all tenants for the list view
                const { data: tenantsData } = await api.get("/tenants");
                setTenants(tenantsData);
            } catch (e) {
                console.error("Failed to fetch superadmin stats", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const indicators = [
        { label: "Tenants (Aktiv / Inaktiv)", value: `${stats?.totalTenants || 0} / ${stats?.inactiveTenants || 0}`, trend: "Global", icon: Globe, color: "indigo" },
        { label: "Fahrzeuge & Benutzer", value: `${stats?.totalVehicles || 0} / ${stats?.totalUsers || 0}`, trend: "System", icon: Users, color: "blue" },
        { label: "MRR / ARR", value: `€${stats?.mrr || "0K"} / €${stats?.arr || "0K"}`, trend: "+12%", icon: TrendingUp, color: "purple" },
        { label: "Dienste-Status", value: stats?.uptime || "Optimal", trend: "Live", icon: ShieldCheck, color: "green" },
    ];

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase italic">
                        Plattform <span className="text-indigo-500 not-italic">Intelligence</span>
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Systemweite Überwachung & SaaS-Performance Cockpit.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-2xl border border-emerald-500/20">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest">Alle Systeme nominal</span>
                    </div>
                </div>
            </header>

            {/* Main KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {indicators.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-[#0f111a] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 group overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "p-4 rounded-2xl transition duration-500 group-hover:scale-110 shadow-lg",
                                    stat.color === "indigo" && "bg-indigo-500 text-white shadow-indigo-500/20",
                                    stat.color === "purple" && "bg-purple-500 text-white shadow-purple-500/20",
                                    stat.color === "blue" && "bg-blue-500 text-white shadow-blue-500/20",
                                    stat.color === "green" && "bg-emerald-500 text-white shadow-emerald-500/20"
                                )}>
                                    <Icon size={24} />
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* SaaS Performance Section */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Performance & Incidents */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* New Tenants */}
                        <div className="bg-white dark:bg-[#0f111a] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Neue Tenants</h3>
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Letzte 30 Tage</span>
                            </div>
                            <div className="flex items-end gap-2 h-32 mb-6">
                                {[30, 45, 25, 60, 40, 75, 50, 90, 65, 80].map((h, i) => (
                                    <div key={i} className="flex-1 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-t-lg group relative hover:bg-indigo-500 transition-all duration-300" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-slate-900 text-white px-2 py-1 rounded">+{Math.floor(h / 5)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-white/5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Neu</p>
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">+24</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Wachstum</p>
                                    <h4 className="text-2xl font-black text-emerald-500">+12.4%</h4>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Status */}
                        <div className="bg-white dark:bg-[#0f111a] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Abonnement-Status</h3>
                            <div className="space-y-6">
                                {[
                                    { label: "Aktive Abos", count: 112, color: "bg-indigo-500" },
                                    { label: "Auslaufend (30d)", count: 14, color: "bg-amber-500" },
                                    { label: "Testphase", count: 28, color: "bg-blue-400" },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                            <span className="text-slate-500">{item.label}</span>
                                            <span className="text-slate-900 dark:text-white">{item.count}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count / 154) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Active Tenants List Overlay */}
                    <div className="bg-white dark:bg-[#0f111a] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm p-10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 italic">
                                RECENT <span className="text-indigo-500 not-italic">ACTIVITY</span>
                            </h3>
                            <button className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">Show All Tenants</button>
                        </div>

                        <div className="space-y-2">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-20 bg-slate-50 dark:bg-white/5 animate-pulse rounded-3xl" />
                                ))
                            ) : tenants.length === 0 ? (
                                <p className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">Keine Mandanten gefunden</p>
                            ) : tenants.slice(0, 5).map((tenant) => (
                                <div key={tenant.id} className="group p-6 hover:bg-slate-50 dark:hover:bg-white/5 rounded-[2.5rem] border border-transparent hover:border-slate-100 dark:hover:border-white/10 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center font-black text-xl transition group-hover:scale-110 shadow-lg">
                                            {tenant.name[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition tracking-tight">{tenant.name}</h4>
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full tracking-tighter">Pro Plan</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-tight">{tenant.subdomain}.qqxsoft.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-12 text-right">
                                        <div className="hidden md:block">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 leading-none">Fleet Size</p>
                                            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{tenant._count?.vehicles || 0}</p>
                                        </div>
                                        <button className="p-4 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-indigo-500 hover:text-white rounded-2xl transition duration-500 shadow-sm">
                                            <ExternalLink size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Section: System & Incidents */}
                <div className="space-y-8">
                    {/* Incident Status */}
                    <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-lg font-black uppercase tracking-tight">System Status</h3>
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            </div>

                            <div className="space-y-6">
                                {[
                                    { service: "Core API", status: "Operational", color: "text-emerald-400" },
                                    { service: "Auth & SSO", status: "Operational", color: "text-emerald-400" },
                                    { service: "Billing Engine", status: "Operational", color: "text-emerald-400" },
                                    { service: "CDN / Assets", status: "Degraded", color: "text-amber-400" },
                                ].map((s, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-400 tracking-tight">{s.service}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.status}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/5 text-center">
                                <button className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-white transition-all">Open Service Matrix</button>
                            </div>
                        </div>
                        <Activity size={200} className="absolute bottom-[-60px] right-[-60px] text-white/5 group-hover:scale-110 transition duration-[2s]" />
                    </div>

                    {/* System Notifications / Incident Feed */}
                    <div className="bg-white dark:bg-[#0f111a] rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 shadow-sm relative overflow-hidden group">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Systemmeldungen</h3>
                        <div className="space-y-6">
                            {[
                                { title: "Downtime Warnung", text: "Geplante Wartung am 02.03. 02:00 UTC", type: "WARN" },
                                { title: "Neuer SuperAdmin", text: "Konto 'admin_fk' wurde erstellt", type: "INFO" },
                                { title: "Backup Komplett", text: "System-Snapshot 'daily_prod' erfolgreich", type: "SUCCESS" },
                            ].map((msg, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className={`w-1 h-12 rounded-full shrink-0 ${msg.type === 'WARN' ? 'bg-amber-500' :
                                        msg.type === 'INFO' ? 'bg-indigo-500' :
                                            'bg-emerald-500'
                                        }`} />
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{msg.title}</h4>
                                        <p className="text-xs font-medium text-slate-400 leading-relaxed mt-1">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
