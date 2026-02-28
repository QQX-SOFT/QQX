"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Globe,
    Zap,
    Plus,
    Search,
    MoreHorizontal,
    LayoutDashboard,
    CheckCircle2,
    AlertCircle,
    Clock,
    Trash2,
    Settings,
    Shield,
    X,
    Server,
    Zap as ZapIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";

export default function TenantManagement() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const { data } = await api.get("/tenants");
            setTenants(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Creation moved to editor page

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Möchten Sie den Mandanten "${name}" wirklich unwiderruflich löschen?`)) return;
        try {
            await api.delete(`/tenants/${id}`);
            fetchTenants();
        } catch (e) {
            alert("Fehler beim Löschen");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/tenants/${id}`, { isActive: !currentStatus });
            fetchTenants();
        } catch (e) {
            alert("Fehler beim Aktualisieren");
        }
    };

    const handleOpenExternal = (subdomain: string) => {
        const url = `https://${subdomain}.qqxsoft.com`;
        window.open(url, "_blank");
    };

    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.subdomain.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" ? t.isActive : !t.isActive);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Mandanten-Verwaltung</h1>
                    <p className="text-slate-500 font-medium font-sans">Verwalten Sie alle registrierten Unternehmen und deren Subdomains.</p>
                </div>
                <Link
                    href="/superadmin/tenants/editor"
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center gap-2 group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition duration-300" />
                    Neuer Mandant
                </Link>
            </header>

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition" size={18} />
                    <input
                        type="text"
                        placeholder="Name oder Subdomain suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide text-xs font-black uppercase tracking-widest">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={cn("px-6 py-3 rounded-xl transition shadow-md", filterStatus === "all" ? "bg-indigo-600 text-white" : "bg-white dark:bg-[#131720] text-slate-400")}
                    >
                        Alle ({tenants.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("active")}
                        className={cn("px-6 py-3 rounded-xl transition border border-slate-100 dark:border-white/5", filterStatus === "active" ? "bg-indigo-600 text-white shadow-md" : "bg-white dark:bg-[#131720] text-slate-400")}
                    >
                        Aktiv ({tenants.filter(t => t.isActive).length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("inactive")}
                        className={cn("px-6 py-3 rounded-xl transition border border-slate-100 dark:border-white/5", filterStatus === "inactive" ? "bg-indigo-600 text-white shadow-md" : "bg-white dark:bg-[#131720] text-slate-400")}
                    >
                        Inaktiv ({tenants.filter(t => !t.isActive).length})
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white dark:bg-[#131720] rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Unternehmen</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Subdomain</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Kapazität</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-10 py-8"><div className="h-6 bg-slate-50 dark:bg-white/5 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-20 text-center">
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Keine Mandanten gefunden</p>
                                    </td>
                                </tr>
                            ) : filteredTenants.map((t) => (
                                <tr key={t.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition duration-300">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black group-hover:scale-110 transition duration-500 shadow-sm">
                                                {t.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white leading-tight">{t.name}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reg. am {new Date(t.createdAt).toLocaleDateString("de-DE")}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest">
                                            {t.subdomain}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex gap-6">
                                            <div className="text-xs">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Users</p>
                                                <p className="font-black text-slate-900 dark:text-white">{t._count?.users || 0}</p>
                                            </div>
                                            <div className="text-xs">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Fleet</p>
                                                <p className="font-black text-slate-900 dark:text-white">{t._count?.vehicles || 0}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className={cn(
                                            "flex items-center gap-2 font-black text-[10px] uppercase tracking-widest",
                                            t.isActive ? "text-green-500" : "text-slate-400"
                                        )}>
                                            <span className={cn(
                                                "w-2 h-2 rounded-full",
                                                t.isActive ? "bg-green-500 animate-pulse" : "bg-slate-400"
                                            )} />
                                            {t.isActive ? "Aktiv" : "Inaktiv"}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenExternal(t.subdomain)}
                                                className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition duration-300"
                                            >
                                                <LayoutDashboard size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(t.id, t.isActive)}
                                                title={t.isActive ? "Deaktivieren" : "Aktivieren"}
                                                className={cn(
                                                    "p-3 rounded-xl transition duration-300",
                                                    t.isActive
                                                        ? "bg-slate-50 dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-400 hover:text-amber-600"
                                                        : "bg-slate-50 dark:bg-white/5 hover:bg-green-50 dark:hover:bg-green-500/10 text-slate-400 hover:text-green-600"
                                                )}
                                            >
                                                <Settings size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id, t.name)}
                                                className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-600 rounded-xl transition duration-300"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal removed */}
        </div>
    );
}
