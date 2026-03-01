"use client";

import React from "react";
import Link from "next/link";
import {
    ShieldCheck,
    UserRound,
    HardHat,
    LayoutDashboard,
    Settings,
    ShoppingBag,
    ArrowRight,
    Zap
} from "lucide-react";
import { motion } from "framer-motion";

const panels = [
    {
        title: "Super Admin",
        description: "Master control for all tenants and system settings.",
        href: "/super-admin",
        icon: ShieldCheck,
        color: "bg-red-500",
        shadow: "shadow-red-200"
    },
    {
        title: "Admin Panel",
        description: "Manage orders, drivers, fleet and accounting.",
        href: "/admin",
        icon: LayoutDashboard,
        color: "bg-blue-600",
        shadow: "shadow-blue-200"
    },
    {
        title: "Driver Portal",
        description: "Interface for drivers to manage deliveries and tracking.",
        href: "/driver",
        icon: HardHat,
        color: "bg-orange-500",
        shadow: "shadow-orange-200"
    },
    {
        title: "Customer Portal",
        description: "Client interface for tracking and new requests.",
        href: "/customer",
        icon: ShoppingBag,
        color: "bg-emerald-500",
        shadow: "shadow-emerald-200"
    },
    {
        title: "System Setup",
        description: "Initial configuration and tenant onboarding.",
        href: "/setup",
        icon: Settings,
        color: "bg-slate-700",
        shadow: "shadow-slate-300"
    }
];

export default function NavigationGate() {
    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-6"
                    >
                        <Zap size={14} className="fill-current" />
                        Quick Access Gate
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4"
                    >
                        Panel <span className="text-blue-600">Navigator</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-lg mx-auto"
                    >
                        Gecici yönlendirme sayfası. Tüm aktif panellere buradan hızlıca erişebilirsiniz.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {panels.map((panel, idx) => (
                        <motion.div
                            key={panel.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                        >
                            <Link
                                href={panel.href}
                                className="group relative block bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                                <div className="flex items-start gap-6 relative z-10">
                                    <div className={`${panel.color} p-4 rounded-2xl text-white shadow-lg ${panel.shadow} group-hover:scale-110 transition duration-500`}>
                                        <panel.icon size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{panel.title}</h3>
                                            <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition duration-300" />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                            {panel.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Abstract background shape */}
                                <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${panel.color} opacity-[0.03] rounded-full group-hover:scale-150 transition duration-700`} />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center text-slate-400 text-xs font-bold uppercase tracking-widest"
                >
                    &copy; 2026 QQX Control System • Temporary Gate
                </motion.div>
            </div>
        </div>
    );
}
