"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Plus,
    Globe,
    ExternalLink,
    Database,
    Settings,
    Search,
    CheckCircle2,
    XCircle,
    Loader2,
    Users,
    Trash2,
    UserCircle,
    Power
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    isActive: boolean;
    _count?: {
        users: number;
        vehicles: number;
    };
}

interface AdminUser {
    id: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function SuperAdminPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    // Admin Management State
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [tenantAdmins, setTenantAdmins] = useState<AdminUser[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ email: "", password: "" });
    const [creatingAdmin, setCreatingAdmin] = useState(false);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const { data } = await api.get("/tenants");
            setTenants(data);
        } catch (e) {
            console.error("Failed to fetch tenants", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleTenantStatus = async (tenant: Tenant) => {
        try {
            const newStatus = !tenant.isActive;
            await api.patch(`/tenants/${tenant.id}`, { isActive: newStatus });
            setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, isActive: newStatus } : t));
        } catch (e: any) {
            alert("Status konnte nicht geändert werden");
        }
    };

    const fetchAdmins = async (tenantId: string) => {
        setLoadingAdmins(true);
        try {
            const { data } = await api.get(`/tenants/${tenantId}/admins`);
            setTenantAdmins(data);
        } catch (e) {
            console.error("Failed to fetch admins", e);
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant) return;
        setCreatingAdmin(true);
        try {
            await api.post(`/tenants/${selectedTenant.id}/admins`, newAdmin);
            setNewAdmin({ email: "", password: "" });
            fetchAdmins(selectedTenant.id);
        } catch (e: any) {
            alert(e.response?.data?.error || "Fehler beim Erstellen des Admins");
        } finally {
            setCreatingAdmin(false);
        }
    };

    const handleDeleteAdmin = async (userId: string) => {
        if (!selectedTenant || !confirm("Admin wirklich löschen?")) return;
        try {
            await api.delete(`/tenants/${selectedTenant.id}/admins/${userId}`);
            fetchAdmins(selectedTenant.id);
        } catch (e: any) {
            alert("Fehler beim Löschen");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8 lg:p-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">System Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Super Admin Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-2">Willkommen im zentralen Kontrollzentrum von QQX. Verwalten Sie alle Kunden und Systemressourcen.</p>
                </div>
                <Link
                    href="/super-admin/tenants/editor"
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-3 hover:bg-blue-700 transition shadow-2xl shadow-blue-900/20"
                >
                    <Plus size={20} />
                    Neues Kunden-Setup (Tenant)
                </Link>
            </header>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                    { label: "Aktive Mandanten", value: tenants.filter(t => t.isActive).length.toString(), icon: Globe },
                    { label: "Benutzer (Global)", value: tenants.reduce((acc, t) => acc + (t._count?.users || 0), 0).toString(), icon: Users },
                    { label: "System Status", value: "Operational", icon: CheckCircle2, color: "text-green-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <stat.icon size={18} className={stat.color || "text-slate-400"} />
                        </div>
                        <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Tenants Table */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">Kunden-Instanzen</h3>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <Search size={18} className="text-slate-500" />
                        <input type="text" placeholder="Mandant suchen..." className="bg-transparent border-none outline-none text-sm font-medium" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kunde</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subdomain</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ressourcen</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
                                    </td>
                                </tr>
                            ) : tenants.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest">
                                        Keine Mandanten gefunden
                                    </td>
                                </tr>
                            ) : tenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-white/[0.03] transition">
                                    <td className="px-8 py-6">
                                        <p className="font-black text-white leading-none">{tenant.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-2 font-mono">ID: {tenant.id}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-blue-400 font-bold">
                                            <span>{tenant.subdomain}.qqx-app.de</span>
                                            <ExternalLink size={14} />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-4 text-xs font-bold text-slate-400">
                                            <span>{tenant._count?.users || 0} User</span>
                                            <span>{tenant._count?.vehicles || 0} Fahrzeuge</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => toggleTenantStatus(tenant)}
                                            className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors",
                                                tenant.isActive
                                                    ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                                    : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                            )}
                                        >
                                            <div className={cn("w-1.5 h-1.5 rounded-full", tenant.isActive ? "bg-green-500" : "bg-red-500")} />
                                            {tenant.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedTenant(tenant);
                                                    fetchAdmins(tenant.id);
                                                }}
                                                className="p-2 hover:bg-blue-500/10 rounded-lg transition text-blue-500"
                                                title="Admins verwalten"
                                            >
                                                <Users size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400">
                                                <Settings size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Admin Management Modal */}
            <AnimatePresence>
                {selectedTenant && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setSelectedTenant(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{selectedTenant.name} Admins</h2>
                                    <p className="text-slate-500 text-sm mt-1">Hier können Sie Admin-Benutzer für diesen Mandanten verwalten.</p>
                                </div>
                                <button onClick={() => setSelectedTenant(null)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {/* Add Admin Form */}
                            <form onSubmit={handleAddAdmin} className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
                                <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Neuen Admin hinzufügen</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="email"
                                        required
                                        placeholder="Admin E-Mail"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition text-white text-sm"
                                        value={newAdmin.email}
                                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    />
                                    <input
                                        type="password"
                                        required
                                        placeholder="Passwort"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition text-white text-sm"
                                        value={newAdmin.password}
                                        onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={creatingAdmin}
                                    className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
                                >
                                    {creatingAdmin ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    Admin hinzufügen
                                </button>
                            </form>

                            {/* Admin List */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Existierende Admins</h4>
                                {loadingAdmins ? (
                                    <div className="py-10 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></div>
                                ) : tenantAdmins.length === 0 ? (
                                    <div className="py-10 text-center text-slate-500 italic text-sm">Keine Admins gefunden.</div>
                                ) : (
                                    tenantAdmins.map((admin) => (
                                        <div key={admin.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                                                    <UserCircle size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white leading-none">{admin.email}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">{admin.role}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAdmin(admin.id)}
                                                className="p-2 text-slate-600 hover:text-red-500 transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
