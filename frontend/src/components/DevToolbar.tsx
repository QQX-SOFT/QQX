"use client";

import { useState, useEffect } from "react";
import { User, Shield, Zap } from "lucide-react";
import api from "@/lib/api";

export default function DevToolbar() {
    const [subdomain, setSubdomain] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const hostname = window.location.hostname;
            const parts = hostname.split(".");
            setSubdomain(parts[0]);
        }
        // Only show in local dev
        if (window.location.hostname === "localhost") {
            setIsVisible(true);
        }
    }, []);

    const switchTo = (sub: string) => {
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : "";
        window.location.href = `${protocol}//${sub}.localhost${port}${window.location.pathname}`;
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 shadow-2xl flex items-center gap-6">
                <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                    <Zap className="text-yellow-400" size={16} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Dev Mode</span>
                </div>

                <div className="flex items-center gap-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Tenant:</p>
                    <div className="flex gap-2">
                        {["demo", "grandhotel", "logistik"].map((s) => (
                            <button
                                key={s}
                                onClick={() => switchTo(s)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${subdomain === s
                                        ? "bg-blue-600 text-white"
                                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <button className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition" title="Simulation Starten">
                        <User size={16} />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition" title="Super Admin View">
                        <Shield size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
