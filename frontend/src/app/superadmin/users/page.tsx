"use client";

import { motion } from "framer-motion";
import { Users, Search, Plus, MoreVertical, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";

const USERS = [
    { id: 1, name: "Root Admin", email: "root@qqx.app", role: "Super Admin", status: "Active" },
    { id: 2, name: "Customer Service", email: "support@qqx.app", role: "Support Staff", status: "Active" },
];

export default function SuperAdminUsersPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">BENUTZER<span className="text-indigo-500 not-italic">VERWALTUNG</span></h1>
                    <p className="text-slate-500 font-medium mt-2">Plattformübergreifende Benutzerkonten und Berechtigungen.</p>
                </div>
                <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-3 shadow-xl shadow-indigo-500/20">
                    <Plus size={20} />
                    Teammitglied Einladen
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white dark:bg-[#131720] border border-slate-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 px-6 py-3 rounded-2xl w-full max-w-md">
                            <Search size={18} className="text-slate-400" />
                            <input type="text" placeholder="Nutzer suchen..." className="bg-transparent border-none outline-none text-sm font-bold w-full" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Benutzer</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rolle</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {USERS.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold">
                                                    {user.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{user.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="text-slate-400 hover:text-indigo-500 transition">
                                                <MoreVertical size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/20">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-black mb-2 uppercase italic tracking-tight">Access Control</h3>
                        <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">Sie verwalten hier die höchste Ebene der Systemberechtigungen. Gehen Sie vorsichtig vor.</p>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest opacity-80 mb-2">
                                <span>Root Konten</span>
                                <span>2 / 5</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[40%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
