"use client";

import { useState, useEffect } from "react";
import {
    Package,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    LogOut,
    Plus,
    User,
    ChevronRight,
    MapPin,
    ArrowRight,
    Bell,
    Settings,
    LayoutDashboard,
    ClipboardList,
    Search,
    MessageSquare,
    Phone,
    HelpCircle,
    ShoppingBag,
    Compass
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navLinks = [
        { name: "Übersicht", icon: LayoutDashboard, href: "/customer" },
        { name: "Neue Bestellung", icon: ShoppingBag, href: "/customer/new-order" },
        { name: "Verlauf", icon: ClipboardList, href: "/customer/history" },
        { name: "Tracking", icon: Compass, href: "/customer/tracking" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="h-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/20 group-hover:scale-105 transition duration-300">Q</div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight leading-none mb-1 uppercase">QQX Portal</span>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Customer Access</span>
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition duration-300",
                                    pathname === link.href
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                                        : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <link.icon size={16} strokeWidth={pathname === link.href ? 3 : 2} />
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-3">
                        <ThemeToggle />
                        <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-blue-600 transition">
                            <Bell size={20} />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">Max Mustermann</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Standard Konto</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-[1.25rem] flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                            MM
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-8 lg:p-12">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-around items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex flex-col items-center gap-1.5 transition duration-300",
                            pathname === link.href ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <div className={cn(
                            "p-2.5 rounded-xl transition-all duration-300",
                            pathname === link.href ? "bg-blue-50 dark:bg-blue-900/20 shadow-inner" : ""
                        )}>
                            <link.icon size={20} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">{link.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Support Float */}
            <button className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 hidden lg:flex group overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition duration-300" />
                <MessageSquare size={24} className="group-hover:rotate-12 transition duration-500" />
            </button>
        </div>
    );
}
