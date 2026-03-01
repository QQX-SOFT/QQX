"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Globe,
    ShieldCheck,
    CreditCard,
    Settings,
    LogOut,
    Search,
    Bell,
    Menu,
    ChevronRight,
    Activity,
    Users,
    X,
    Server,
    Zap,
    MapPin,
    BarChart3,
    TrendingUp,
    LifeBuoy,
    Terminal,
    UserCircle,
    Boxes
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const navigationLinks = [
    {
        group: "Plattform",
        links: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/superadmin" },
            { name: "Şirketler", icon: Globe, href: "/superadmin/tenants" },
            { name: "Kullanıcılar", icon: Users, href: "/superadmin/users" },
        ]
    },
    {
        group: "Ürün & Gelir",
        links: [
            { name: "Paketler", icon: CreditCard, href: "/superadmin/plans" },
            { name: "Özellikler", icon: Zap, href: "/superadmin/features" },
            { name: "Abonelikler", icon: TrendingUp, href: "/superadmin/billing" },
        ]
    },
    {
        group: "Altyapı",
        links: [
            { name: "Maps Tanılama", icon: MapPin, href: "/superadmin/debug-maps" },
            { name: "Sistem Logları", icon: Terminal, href: "/superadmin/logs" },
            { name: "Sistem Ayarları", icon: Settings, href: "/superadmin/settings" },
        ]
    },
    {
        group: "Destek",
        links: [
            { name: "Biletler", icon: LifeBuoy, href: "/superadmin/support" },
            { name: "Duyurular", icon: Bell, href: "/superadmin/notifications" },
        ]
    }
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#07080d] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[50] lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-80 bg-[#0c0e14] text-white flex flex-col z-[60] lg:relative lg:flex transition-all duration-500 ease-in-out border-r border-white/5 shadow-2xl shadow-black/50",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Sidebar Header */}
                <div className="p-8 pb-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.25rem] flex items-center justify-center text-white font-black shadow-xl shadow-indigo-500/20 group relative overflow-hidden">
                            <Boxes size={24} />
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter leading-none mb-1 uppercase italic">QQX <span className="text-indigo-400 not-italic">OS</span></span>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">Global Control</span>
                        </div>
                    </div>
                    <button
                        className="lg:hidden p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition active:scale-95"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mx-8 mb-4" />

                {/* Sidebar Nav */}
                <nav className="flex-1 px-4 space-y-10 overflow-y-auto scrollbar-hide pt-6 pb-12">
                    {navigationLinks.map((group) => (
                        <div key={group.group} className="space-y-4">
                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] px-5 flex items-center gap-2">
                                {group.group}
                                <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <div className="space-y-1">
                                {group.links.map((link) => (
                                    <SidebarLink key={link.href} link={link} isActive={pathname === link.href} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-6 mt-auto">
                    <div className="bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] p-6 border border-white/5 mb-6 group cursor-pointer hover:border-indigo-500/30 transition-all duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors duration-500">
                                <UserCircle size={22} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-white uppercase tracking-tight">Super Admin</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">V1.4.2 stable</p>
                            </div>
                        </div>
                        <button className="w-full py-4 flex items-center justify-center gap-3 px-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest border border-red-500/10 active:scale-95 shadow-lg shadow-red-500/0 hover:shadow-red-500/20">
                            <LogOut size={16} />
                            Oturumu Kapat
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-24 bg-white/60 dark:bg-[#07080d]/60 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/5 px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
                    <div className="flex items-center gap-6">
                        <button
                            className="lg:hidden p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition active:scale-95"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-4 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 px-6 py-3 rounded-2xl w-96 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-500 group">
                            <Search size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Komut veya veri ara..."
                                className="bg-transparent border-none outline-none text-sm font-bold w-full placeholder:text-slate-400 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2 text-emerald-500 px-4 py-2 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                            <Activity size={14} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Network: High</span>
                        </div>

                        <ThemeToggle />

                        <div className="relative group">
                            <button className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-all text-slate-500 dark:text-slate-400 relative">
                                <Bell size={20} />
                                <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-indigo-500 border-2 border-white dark:border-[#07080d] rounded-full"></span>
                            </button>
                        </div>

                        <div className="h-10 w-px bg-slate-200 dark:bg-white/5 mx-2"></div>

                        <div className="flex items-center gap-4 text-left group cursor-pointer">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">Super Admin</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Root Access</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-500/20 group-hover:scale-105 group-hover:rotate-3 transition duration-500">
                                SA
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 lg:p-16 scrollbar-hide">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

function SidebarLink({ link, isActive }: { link: any, isActive: boolean }) {
    return (
        <Link
            href={link.href}
            className={cn(
                "flex items-center justify-between px-5 py-4 rounded-[1.5rem] transition-all duration-300 group relative overflow-hidden",
                isActive
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-600/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
        >
            <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500",
                    isActive ? "bg-white/20" : "bg-transparent group-hover:bg-white/5"
                )}>
                    <link.icon size={18} className={cn("transition-all duration-500", isActive ? "scale-110" : "opacity-70 group-hover:opacity-100 group-hover:scale-110")} />
                </div>
                <span className="font-bold text-[13px] uppercase tracking-wide">{link.name}</span>
            </div>

            {isActive && (
                <motion.div
                    layoutId="sidebar-selection"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-white/5 to-white/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            <ChevronRight size={14} className={cn(
                "transition-all duration-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                isActive ? "text-white/40" : "text-slate-600"
            )} />
        </Link>
    );
}
