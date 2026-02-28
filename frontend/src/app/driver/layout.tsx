"use client";

import { MapPin, Clock, User, LogOut, LayoutDashboard, MessageSquare, Wallet, Package, Key } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Mobile-focused Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">Q</div>
                    <span className="font-black text-slate-900 tracking-tight">QQX DRIVER</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={18} />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-24">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-3 flex items-center justify-around z-50">
                <Link href="/driver/orders" className={cn(
                    "flex flex-col items-center gap-1 transition",
                    pathname === "/driver/orders" ? "text-blue-600" : "text-slate-400"
                )}>
                    <div className={cn(
                        "p-2 rounded-xl transition",
                        pathname === "/driver/orders" ? "bg-blue-50" : ""
                    )}>
                        <Package size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Aufträge</span>
                </Link>
                <Link href="/driver/track" className={cn(
                    "flex flex-col items-center gap-1 transition",
                    pathname === "/driver/track" ? "text-blue-600" : "text-slate-400"
                )}>
                    <div className={cn(
                        "p-2 rounded-xl transition",
                        pathname === "/driver/track" ? "bg-blue-50" : ""
                    )}>
                        <Clock size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Shift</span>
                </Link>
                <Link href="/driver/messages" className={cn(
                    "flex flex-col items-center gap-1 transition",
                    pathname === "/driver/messages" ? "text-blue-600" : "text-slate-400"
                )}>
                    <div className={cn(
                        "p-2 rounded-xl transition",
                        pathname === "/driver/messages" ? "bg-blue-50" : ""
                    )}>
                        <MessageSquare size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Messages</span>
                </Link>
                <Link href="/driver/rentals" className={cn(
                    "flex flex-col items-center gap-1 transition",
                    pathname === "/driver/rentals" ? "text-blue-600" : "text-slate-400"
                )}>
                    <div className={cn(
                        "p-2 rounded-xl transition",
                        pathname === "/driver/rentals" ? "bg-blue-50" : ""
                    )}>
                        <Key size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Miete</span>
                </Link>
                <Link href="/driver/profile" className={cn(
                    "flex flex-col items-center gap-1 transition",
                    pathname === "/driver/profile" ? "text-blue-600" : "text-slate-400"
                )}>
                    <div className={cn(
                        "p-2 rounded-xl transition",
                        pathname === "/driver/profile" ? "bg-blue-50" : ""
                    )}>
                        <User size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Profil</span>
                </Link>
            </nav>
        </div>
    );
}
