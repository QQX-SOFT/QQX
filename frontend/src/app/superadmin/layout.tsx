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
    LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

const navigationLinks = [
    {
        group: "Plattform Management",
        links: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/superadmin" },
            { name: "Firmenverwaltung", icon: Globe, href: "/superadmin/tenants" },
            { name: "Standortverwaltung", icon: MapPin, href: "/superadmin/locations" },
        ]
    },
    {
        group: "Produkt & Features",
        links: [
            { name: "Tarifverwaltung", icon: CreditCard, href: "/superadmin/plans" },
            { name: "Funktionsverwaltung", icon: Zap, href: "/superadmin/features" },
        ]
    },
    {
        group: "Finanzen & Analyse",
        links: [
            { name: "Berichte & Analysen", icon: BarChart3, href: "/superadmin/reports" },
            { name: "Abonnementverwaltung", icon: TrendingUp, href: "/superadmin/billing" },
        ]
    },
    {
        group: "Kommunikation & Support",
        links: [
            { name: "Benachrichtigungen", icon: Bell, href: "/superadmin/notifications" },
            { name: "Supportanfragen", icon: LifeBuoy, href: "/superadmin/support" },
        ]
    },
    {
        group: "System",
        links: [
            { name: "Systemeinstellungen", icon: Settings, href: "/superadmin/settings" },
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
        <div className="flex min-h-screen bg-[#fcfcfd] dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 transition-colors duration-500">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-72 bg-[#0f111a] text-white flex flex-col z-[60] lg:relative lg:flex transition-transform duration-500 ease-in-out border-r border-white/5",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-8 pb-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
                            <Zap size={20} fill="white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight leading-none mb-1">QQX CLOUD</span>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Super Control</span>
                        </div>
                    </div>
                    <button
                        className="lg:hidden p-2 text-white/40 hover:text-white transition"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-10 overflow-y-auto scrollbar-hide pt-4">
                    {navigationLinks.map((group) => (
                        <div key={group.group}>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">{group.group}</div>
                            <div className="space-y-1.5">
                                {group.links.map((link) => (
                                    <SidebarLink key={link.href} link={link} isActive={pathname === link.href} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-6 mt-auto">
                    <div className="bg-indigo-500/5 rounded-3xl p-6 border border-indigo-500/10 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Server size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Node Status</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 mb-3">Alle Cluster laufen stabil.</p>
                        <div className="flex gap-1 h-1">
                            {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.8, 1].map((v, i) => (
                                <div key={i} className="flex-1 rounded-full bg-indigo-500" style={{ opacity: v }} />
                            ))}
                        </div>
                    </div>
                    <button className="w-full py-4 flex items-center gap-4 px-4 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition duration-500 font-bold group">
                        <LogOut size={20} className="group-hover:-translate-x-1 transition" />
                        <span>Abmelden</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white/5 dark:bg-[#0b0e14] backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-3 bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-5 py-2.5 rounded-2xl w-96 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Globale Suche..."
                            className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-slate-500"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <div className="relative">
                            <button className="p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all text-slate-500">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 border-2 border-white dark:border-[#0b0e14] rounded-full"></span>
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-200 dark:bg-white/5 mx-2"></div>

                        <div className="flex items-center gap-3 text-left group cursor-pointer">
                            <div className="w-11 h-11 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition duration-500">
                                SA
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">Super User</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Root Access</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SidebarLink({ link, isActive, key }: { link: any, isActive: boolean, key?: string }) {
    return (
        <Link
            href={link.href}
            className={cn(
                "flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group relative",
                isActive
                    ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
        >
            <div className="flex items-center gap-4">
                <link.icon size={20} className={cn("transition-all", isActive ? "scale-110" : "opacity-70 group-hover:opacity-100")} />
                <span className="font-black text-[14px] uppercase tracking-[0.05em]">{link.name}</span>
            </div>
            {isActive && (
                <motion.div
                    layoutId="sidebar-pill"
                    className="absolute right-0 w-1 h-5 bg-white rounded-full mr-2"
                />
            )}
        </Link>
    );
}

// Dummy motion component to avoid error if framer-motion is not used here but could be added later
const motion = {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>
};
