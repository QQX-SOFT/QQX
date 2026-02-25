"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Car,
    Users,
    LineChart,
    Settings,
    LogOut,
    Search,
    Bell,
    Menu,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
    { name: "Übersicht", icon: LayoutDashboard, href: "/admin" },
    { name: "Fahrzeuge", icon: Car, href: "/admin/vehicles" },
    { name: "Fahrer", icon: Users, href: "/admin/drivers" },
    { name: "Analysen", icon: LineChart, href: "/admin/analytics" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
                <div className="p-8 pb-12 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">Q</div>
                    <span className="text-xl font-black tracking-tight text-slate-900">QQX CONTROL</span>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-3">Hauptmenü</div>
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="font-bold text-[15px]">{link.name}</span>
                                </div>
                                {isActive && <ChevronRight size={16} className="opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition duration-700"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Aktueller Plan</p>
                        <h4 className="font-black text-xl mb-4">Enterprise Plus</h4>
                        <button className="w-full py-3 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-white/5">Upgrade</button>
                    </div>

                    <button className="w-full mt-6 py-4 flex items-center gap-4 px-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition duration-300 font-bold group">
                        <LogOut size={20} className="group-hover:-translate-x-1 transition" />
                        <span>Abmelden</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button className="p-2 hover:bg-slate-100 rounded-xl transition">
                            <Menu size={24} />
                        </button>
                        <span className="font-black text-xl">QQX</span>
                    </div>

                    <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-2xl w-96 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Suche..."
                            className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-600 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2.5 hover:bg-slate-100 rounded-2xl transition text-slate-500">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className="h-10 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3 text-left group cursor-pointer">
                            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-100 group-hover:scale-105 transition">AD</div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-black text-slate-900 leading-none mb-1">Admin Benutzer</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Master</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
