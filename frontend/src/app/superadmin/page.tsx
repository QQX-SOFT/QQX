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
                // Fetch all tenants for the overview
                const { data } = await api.get("/tenants");
                setTenants(data);

                // Simulated global stats for now
                setStats({
                    totalTenants: data.length,
                    activeNodes: 4,
                    uptime: "99.99%",
                    latency: "12ms",
                    revenue: data.length * 149.90, // Example 149.90€ per tenant
                });
            } catch (e) {
                console.error("Failed to fetch superadmin stats", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const indicators = [
        { label: "Gesamte Mandanten", value: stats?.totalTenants || 0, trend: "+2", icon: Globe, color: "indigo" },
        { label: "Plattform-Umsatz", value: `€${stats?.revenue?.toFixed(2) || "0.00"}`, trend: "+12.5%", icon: TrendingUp, color: "purple" },
        { label: "Aktive Signale", value: tenants.reduce((acc, t) => acc + (t._count?.users || 0), 0), trend: "Live", icon: Zap, color: "blue" },
        { label: "System-Uptime", value: stats?.uptime || "100%", trend: "Normal", icon: ShieldCheck, color: "green" },
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Plattform Cockpit</h1>
                    <p className="text-slate-500 font-medium">Zentrale Überwachung aller QQX-Mandanten und Systemknoten.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition drop-shadow-sm">Cluster-Logs</button>
                    <button className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 flex items-center gap-2">
                        System-Check
                    </button>
                </div>
            </header>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {indicators.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-[#131720] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn(
                                    "p-4 rounded-2xl transition duration-500 group-hover:scale-110",
                                    stat.color === "indigo" && "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                                    stat.color === "purple" && "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
                                    stat.color === "blue" && "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                    stat.color === "green" && "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                                )}>
                                    <Icon size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10">
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                            <Icon className="absolute bottom-[-20px] right-[-20px] text-indigo-900/5 dark:text-white/5 group-hover:scale-150 transition duration-1000" size={160} />
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Active Tenants List */}
                <div className="xl:col-span-2 bg-white dark:bg-[#131720] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm p-10">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Globe className="text-indigo-500" />
                            Aktive Mandanten
                        </h3>
                        <button className="text-xs font-black text-indigo-500 uppercase tracking-widest hover:underline">Alle ansehen</button>
                    </div>

                    <div className="space-y-2">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-16 bg-slate-50 dark:bg-white/5 animate-pulse rounded-2xl" />
                            ))
                        ) : tenants.length === 0 ? (
                            <p className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">Keine Mandanten gefunden</p>
                        ) : tenants.map((tenant) => (
                            <div key={tenant.id} className="group p-5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-[2rem] border border-transparent hover:border-slate-100 dark:hover:border-white/10 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg transition group-hover:scale-110">
                                        {tenant.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition">{tenant.name}</h4>
                                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{tenant.subdomain}.qqx.de</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-12">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Benutzer</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{tenant._count?.users || 0}</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Fahrzeuge</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{tenant._count?.vehicles || 0}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition duration-300">
                                            <ExternalLink size={18} />
                                        </button>
                                        <button className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition duration-300">
                                            <Settings size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Infrastructure Cards */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-[#131720] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm p-10">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                            <Server className="text-indigo-500" />
                            Cluster Status
                        </h3>
                        <div className="space-y-8">
                            {[
                                { node: "Frankfurt-01", load: 24, status: "Healthy", type: "Main" },
                                { node: "Frankfurt-02", load: 18, status: "Healthy", type: "Mirror" },
                                { node: "Zurich-LB", load: 45, status: "Optimal", type: "Gateway" },
                            ].map((s, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-slate-900 dark:text-white">{s.node}</span>
                                        </div>
                                        <span className="text-indigo-500">{s.load}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.load}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[3rem] shadow-2xl shadow-indigo-200 dark:shadow-none p-10 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                    <Activity size={18} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">System Monitoring</span>
                            </div>
                            <h4 className="text-2xl font-black text-white mb-2">Realtime Pulse</h4>
                            <p className="text-sm font-bold text-indigo-100 leading-relaxed max-w-[200px]">Alle Dienste antworten innerhalb der SLA-Parameter.</p>

                            <div className="mt-8 flex gap-4">
                                <button className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition">Dashboard</button>
                            </div>
                        </div>
                        <Activity
                            size={200}
                            className="absolute bottom-[-60px] right-[-60px] text-white/10 group-hover:scale-125 transition duration-[2s]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
