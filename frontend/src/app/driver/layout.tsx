"use client";

import { MapPin, Clock, User, LogOut } from "lucide-react";
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
                    <span className="text-[10px] font-bold uppercase tracking-widest">Tracking</span>
                </Link>
                <Link href="/driver/history" className={cn(
                    "flex flex-col items-center gap-1 transition",
                    pathname === "/driver/history" ? "text-blue-600" : "text-slate-400"
                )}>
                    <div className={cn(
                        "p-2 rounded-xl transition",
                        pathname === "/driver/history" ? "bg-blue-50" : ""
                    )}>
                        <MapPin size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Verlauf</span>
                </Link>
                <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition">
                    <div className="p-2">
                        <LogOut size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                </button>
            </nav>
        </div>
    );
}
