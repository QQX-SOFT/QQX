"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
    ChevronRight,
    ClipboardList,
    Wallet,
    AlertCircle,
    FileText,
    MapPin,
    Calendar,
    X,
    MessageSquare,
    Key,
    Building2,
    Banknote,
    ScrollText,
    UserPlus,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

import ThemeToggle from "@/components/ThemeToggle";

const mainLinks = [
    { name: "Übersicht", icon: LayoutDashboard, href: "/admin" },
    { name: "Live Tracking", icon: MapPin, href: "/admin/tracking" },
];

const operationsLinks = [
    { name: "Aufträge", icon: ClipboardList, href: "/admin/orders" },
    { name: "Kunden", icon: Building2, href: "/admin/customers" },
    { name: "Vermietung", icon: Key, href: "/admin/rentals" },
    { name: "Fahrer", icon: Users, href: "/admin/drivers" },
    { name: "Rider Analyse (KPI)", icon: LineChart, href: "/admin/drivers/kpi" },
    { name: "Bewerbungen", icon: UserPlus, href: "/admin/drivers/applications" },
    { name: "Schichten", icon: Calendar, href: "/admin/shifts" },
    { name: "Arbeitszeit-Aufz.", icon: Clock, href: "/admin/drivers/reports" },
    { name: "Verträge", icon: ScrollText, href: "/admin/contracts" },
    { name: "Dokumente", icon: FileText, href: "/admin/documents" },
];

const financeLinks = [
    { name: "Buchhaltung", icon: Wallet, href: "/admin/accounting" },
    { name: "Auszahlungen", icon: Calendar, href: "/admin/payouts" },
    { name: "Preise", icon: Banknote, href: "/admin/pricing" },
];

const communicationLinks = [
    { name: "Nachrichten", icon: MessageSquare, href: "/admin/messages" },
];

const analyticLinks = [
    { name: "KPI Dashboard", icon: LineChart, href: "/admin/analytics" },
    { name: "Reklamationen", icon: AlertCircle, href: "/admin/complaints" },
    { name: "Unternehmensdaten", icon: Building2, href: "/admin/settings" },
    { name: "Einstellungen", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [companyName, setCompanyName] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [userInitials, setUserInitials] = useState<string>("AD");

    // Load user data from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            if (stored) {
                const user = JSON.parse(stored);
                // Company name from tenant
                if (user.tenant?.name) {
                    setCompanyName(user.tenant.name);
                }
                // User display name: use email
                if (user.email) {
                    setUserName(user.email);
                    // Generate initials from email (before @)
                    const localPart = user.email.split("@")[0];
                    const parts = localPart.split(/[._-]/);
                    if (parts.length >= 2) {
                        setUserInitials((parts[0][0] + parts[1][0]).toUpperCase());
                    } else {
                        setUserInitials(localPart.substring(0, 2).toUpperCase());
                    }
                }
            }
        } catch (e) {
            // ignore parse errors
        }
    }, []);

    const handleLogout = () => {
        // Clear cookie
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
        // Clear all storage
        localStorage.clear();
        // Force full reload to reset all states
        window.location.href = "/login";
    };

    // Close sidebar when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-72 bg-card border-r border-slate-200 dark:border-slate-800 flex flex-col z-[60] lg:relative lg:flex transition-transform duration-300 ease-in-out",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-8 pb-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-400/20">Q</div>
                        <span className="text-xl font-black tracking-tight text-foreground">QQX CONTROL</span>
                    </div>
                    <button
                        className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide">
                    <div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mb-3">Hauptmenü</div>
                        <div className="space-y-1">
                            {mainLinks.map((link) => (
                                <SidebarLink key={link.href} link={link} isActive={pathname === link.href} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mb-3">Operationen</div>
                        <div className="space-y-1">
                            {operationsLinks.map((link) => (
                                <SidebarLink key={link.href} link={link} isActive={pathname === link.href} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mb-3">Finanzen</div>
                        <div className="space-y-1">
                            {financeLinks.map((link) => (
                                <SidebarLink key={link.href} link={link} isActive={pathname === link.href} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mb-3">Kommunikation</div>
                        <div className="space-y-1">
                            {communicationLinks.map((link) => (
                                <SidebarLink key={link.href} link={link} isActive={pathname === link.href} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mb-3">Analyse & Support</div>
                        <div className="space-y-1">
                            {analyticLinks.map((link) => (
                                <SidebarLink key={link.href} link={link} isActive={pathname === link.href} />
                            ))}
                        </div>
                    </div>
                </nav>

                <div className="p-6 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full py-4 flex items-center gap-4 px-4 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition duration-300 font-bold group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition" />
                        <span>Abmelden</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-card/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition lg:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        {companyName && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/20">
                                    {companyName.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{companyName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Firma</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-2.5 rounded-2xl w-96 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Suche..."
                            className="bg-transparent border-none outline-none text-sm font-medium w-full text-foreground placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <button className="relative p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-colors text-slate-500">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

                        <div className="flex items-center gap-3 text-left group cursor-pointer">
                            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition duration-300">{userInitials}</div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{userName || "Admin Benutzer"}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Admin</p>
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

function SidebarLink({ link, isActive }: { link: any, isActive: boolean }) {
    return (
        <Link
            href={link.href}
            className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            )}
        >
            <div className="flex items-center gap-4">
                <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-bold text-[15px]">{link.name}</span>
            </div>
            {isActive && <ChevronRight size={16} className="opacity-50" />}
        </Link>
    );
}
