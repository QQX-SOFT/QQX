import { useState, useEffect } from "react";
import api from "@/lib/api";
import { BarChart3, TrendingUp, Users, DollarSign, Download, Filter, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsData {
    totalTenants: number;
    inactiveTenants: number;
    totalUsers: number;
    totalVehicles: number;
    activeSupscriptions: number;
    mrr: string;
    arr: string;
    uptime: string;
    latency: string;
}

export default function ReportsPage() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/superadmin/stats");
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch reports stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const kpis = [
        { label: "MRR (Live)", value: stats?.mrr || "€0", change: "+0%", trending: "up", icon: DollarSign, color: "blue" },
        { label: "Active Tenants", value: (stats?.totalTenants || 0).toString(), change: "+0", trending: "up", icon: Users, color: "indigo" },
        { label: "Active Subs", value: (stats?.activeSupscriptions || 0).toString(), change: "+0", trending: "up", icon: ArrowUpRight, color: "emerald" },
        { label: "System Uptime", value: stats?.uptime || "100%", change: "stable", trending: "up", icon: TrendingUp, color: "purple" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase italic">
                        Analytics <span className="text-indigo-500 not-italic">&</span> Insights
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Systemweite Leistungsmetriken und finanzielle Auswertungen.
                    </p>
                </div>
            </div>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#0f111a] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm transition-all duration-500 hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                                <stat.icon size={22} />
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</h3>
                        <p className={`text-3xl font-black text-slate-900 dark:text-white tracking-tight ${loading ? 'animate-pulse bg-slate-100 rounded' : ''}`}>
                            {loading ? "..." : stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Main Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-[#0f111a] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Umsatzentwicklung (MRR)</h3>
                            <p className="text-xs font-bold text-slate-400">Monatlicher wiederkehrender Umsatz über Zeit</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-white/10"></div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-3 px-4">
                        {[40, 60, 45, 75, 55, 90, 80, 100, 85, 110, 95, 120].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-indigo-500/10 hover:bg-indigo-500 group relative rounded-t-xl transition-all duration-500"
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                                    €{(h * 400).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 px-4">
                        {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map(m => (
                            <span key={m} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f111a] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Tarif-Verteilung</h3>

                    <div className="space-y-8">
                        {[
                            { name: "Pro Plan", count: 84, color: "bg-indigo-500" },
                            { name: "Basic Plan", count: 32, color: "bg-blue-400" },
                            { name: "Enterprise", count: 12, color: "bg-emerald-400" },
                        ].map((plan, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm font-bold mb-3">
                                    <span className="text-slate-700 dark:text-slate-300 uppercase tracking-tight">{plan.name}</span>
                                    <span className="text-slate-400">{plan.count} Tenants</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${plan.color} rounded-full`} style={{ width: `${(plan.count / 128) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
                        <button className="text-indigo-500 font-black text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">
                            Alle Berichte ansehen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
