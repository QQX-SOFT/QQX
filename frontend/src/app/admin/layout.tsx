"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart3,
    Users,
    Car,
    MapPin,
    Receipt,
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react'

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/fleet', label: 'Fuhrpark', icon: Car },
    { href: '/admin/drivers', label: 'Fahrer', icon: Users },
    { href: '/admin/reports', label: 'Berichte', icon: BarChart3 },
    { href: '/admin/accounting', label: 'Buchhaltung', icon: Receipt },
    { href: '/admin/tracking', label: 'Live-Tracking', icon: MapPin },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen z-[60]">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">Q</div>
                        <div>
                            <div className="font-black text-xl tracking-tighter text-slate-900 leading-none">QQX SYSTEM</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise Console</div>
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center justify-between group px-5 py-4 rounded-2xl transition duration-300 ${isActive
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className={`font-bold transition-all ${isActive ? 'translate-x-1' : ''}`}>{item.label}</span>
                                    </div>
                                    {isActive && <ChevronRight size={16} className="opacity-50" />}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-50">
                    <div className="bg-slate-50 p-6 rounded-[24px] mb-6">
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Tenant Context</div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs italic">C</div>
                            <div className="font-bold text-slate-900 text-sm truncate">Premium Logistic GmbH</div>
                        </div>
                    </div>

                    <button className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition duration-300 font-bold">
                        <LogOut size={20} />
                        <span>Abmelden</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
