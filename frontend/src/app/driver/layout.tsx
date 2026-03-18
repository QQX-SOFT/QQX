"use client";

import React from "react";

import { MapPin, Clock, User, LogOut, LayoutDashboard, MessageSquare, Wallet, Package, Key, Menu, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const filter = searchParams ? searchParams.get("filter") : null;
    const [authLoading, setAuthLoading] = useState(true);
    const [locationAllowed, setLocationAllowed] = useState<boolean | 'loading'>('loading');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const role = localStorage.getItem("role") || document.cookie.split('; ').find(row => row.startsWith('role='))?.split('=')[1];

        if (!role || role !== 'DRIVER') {
            router.push('/login');
        } else {
            setAuthLoading(false);
        }
    }, [pathname, router]);

    const checkLocation = () => {
        if (typeof window === 'undefined') return;

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isMobile) {
            setLocationAllowed(true);
            return;
        }

        if (!navigator.geolocation) {
            setLocationAllowed(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationAllowed(true);
                localStorage.setItem("driver_lat", position.coords.latitude.toString());
                localStorage.setItem("driver_lng", position.coords.longitude.toString());
            },
            (error) => {
                setLocationAllowed(false);
            }
        );
    };

    useEffect(() => {
        if (!authLoading) {
            checkLocation();
        }
    }, [authLoading]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (locationAllowed === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
                <p className="text-sm font-bold text-slate-500">Standortzugriff wird geprüft...</p>
            </div>
        );
    }

    if (locationAllowed === false) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
                    <MapPin size={32} className="animate-bounce" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Standortzugriff erforderlich</h2>
                <p className="text-sm text-slate-500 mb-6">Für den Betrieb ist die Standortbestimmung zwingend erforderlich. Bitte erlauben Sie den Zugriff in den Standorteinstellungen Ihres Browsers.</p>
                <button onClick={checkLocation} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all">
                    Erneut versuchen
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
            {/* Mobile-focused Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)} 
                        className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/10 z-50 relative"
                    >
                        <div className="space-y-1">
                            <span className={cn("block w-4 h-0.5 bg-white transition-all duration-300", menuOpen && "rotate-45 translate-y-1.5")} />
                            <span className={cn("block w-4 h-0.5 bg-white transition-all duration-300", menuOpen && "opacity-0")} />
                            <span className={cn("block w-4 h-0.5 bg-white transition-all duration-300", menuOpen && "-rotate-45 -translate-y-1.5")} />
                        </div>
                    </button>
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-500/20">Q</div>
                    <span className="font-black text-slate-900 tracking-tight text-sm">QQX DRIVER</span>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/driver/profile" className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                        <User size={18} />
                    </Link>
                </div>
            </header>

            {/* Hamburger Side Drawer Overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMenuOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-40"
                        />
                        
                        {/* Menu Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="absolute top-0 left-0 w-4/5 max-w-sm h-full bg-white shadow-2xl z-50 flex flex-col p-6 pt-24"
                        >
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                                    Q
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fahrzeugführer</p>
                                    <h4 className="font-black text-slate-900 text-base">QQX Active Driver</h4>
                                </div>
                            </div>

                            <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
                                <MenuLink href="/driver" icon={<LayoutDashboard size={18} />} label="Dashboard" sublabel="Schicht & Aufträge" active={pathname === "/driver"} onClick={() => setMenuOpen(false)} />
                                <MenuLink href="/driver/orders" icon={<Package size={18} />} label="Verfügbare Aufträge" active={pathname === "/driver/orders" && !filter} onClick={() => setMenuOpen(false)} />
                                <MenuLink href="/driver/orders?filter=accepted" icon={<Package size={18} />} label="Angenommene Aufträge" active={pathname.includes("/orders") && filter === "accepted"} onClick={() => setMenuOpen(false)} />
                                <MenuLink href="/driver/orders?filter=completed" icon={<CheckCircle2 size={18} />} label="Absolvierte Aufträge" active={pathname.includes("completed") || filter === "completed"} onClick={() => setMenuOpen(false)} />
                                <MenuLink href="/driver/messages" icon={<MessageSquare size={18} />} label="Nachrichten" active={pathname === "/driver/messages"} onClick={() => setMenuOpen(false)} />
                                <MenuLink href="/driver/rentals" icon={<Key size={18} />} label="Mieten" active={pathname === "/driver/rentals"} onClick={() => setMenuOpen(false)} />
                                <MenuLink href="/driver/profile" icon={<User size={18} />} label="Profil" active={pathname === "/driver/profile"} onClick={() => setMenuOpen(false)} />
                                <MenuLink href="/driver/notifications" icon={<Package size={18} />} label="Benachrichtigungen" active={pathname === "/driver/notifications"} onClick={() => setMenuOpen(false)} />
                            </nav>

                            <button className="w-full mt-auto p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition duration-300">
                                <LogOut size={16} /> Abmelden
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 pb-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

// Helper Subcomponent Drawer Link
const MenuLink = ({ href, icon, label, sublabel, active, onClick }: { href: string; icon: React.ReactNode; label: string; sublabel?: string; active: boolean; onClick: () => void }) => (
    <Link href={href} onClick={onClick} className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border transition duration-300 group",
        active 
            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
            : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
    )}>
        <div className={cn(
            "p-2.5 rounded-xl transition duration-300",
            active ? "bg-white/10 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
        )}>
            {icon}
        </div>
        <div>
            <p className={cn("font-black text-sm tracking-tight", active ? "text-white" : "text-slate-800")}>{label}</p>
            {sublabel && <p className={cn("text-dotted text-[10px] uppercase font-bold tracking-widest", active ? "text-blue-100" : "text-slate-400")}>{sublabel}</p>}
        </div>
    </Link>
);
