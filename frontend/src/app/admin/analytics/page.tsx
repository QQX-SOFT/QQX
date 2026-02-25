"use client";

import { useEffect, useState } from "react";
import {
    LineChart as LineChartIcon,
    TrendingUp,
    TrendingDown,
    Clock,
    Truck,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Download,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function AnalyticsPage() {
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get("/dashboard/stats");
                setStatsData(data);
            } catch (e) {
                console.error("Failed to fetch dashboard stats", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    const stats = [
        { label: "Umsatz Heute", value: "€3.240", trend: "+12.5%", isPositive: true },
        { label: "Bestellungen", value: statsData?.ordersToday || "0", trend: "+5.4%", isPositive: true },
        { label: "Durchschn. Lieferzeit", value: "24m", trend: "-2.1%", isPositive: true },
        { label: "Aktive Fahrer", value: statsData?.activeDrivers || "0", trend: "0%", isPositive: true }
    ];

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <LineChartIcon size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600">Performance</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">KPI Dashboard</h1>
                    <p className="text-slate-500 font-medium">Analysieren Sie Ihre operativen Metriken und Trends in Echtzeit.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => alert("Datumsfilter angewendet")}
                        className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
                    >
                        <Calendar size={18} />
                        Letzte 30 Tage
                    </button>
                    <button
                        onClick={() => alert("Report wird heruntergeladen...")}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 flex items-center gap-2"
                    >
                        <Download size={18} />
                        Report Exportieren
                    </button>
                </div>
            </header>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 mb-4">{stat.value}</h3>
                        <div className={cn(
                            "inline-flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full",
                            stat.isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                        )}>
                            {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Simulated Chart Container 1 */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6">Bestellvolumen (7 Tage)</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-4 group">
                                <div className="w-full bg-slate-100 rounded-full h-full relative overflow-hidden">
                                    <div
                                        className="absolute bottom-0 w-full bg-indigo-500 rounded-full group-hover:bg-indigo-400 transition-colors"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Tag {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Simulated Performance Metrics */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6">Operative Ziele</h3>
                    <div className="space-y-6">
                        {[
                            { label: "Pünktliche Lieferungen", val: 92, target: 95 },
                            { label: "Fahrer Auslastung", val: 78, target: 80 },
                            { label: "Kundenzufriedenheit", val: 98, target: 90 },
                        ].map((m, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700">{m.label}</span>
                                    <span className="text-sm font-black text-slate-900">{m.val}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            m.val >= m.target ? "bg-green-500" : "bg-amber-500"
                                        )}
                                        style={{ width: `${m.val}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
