"use client";

import { useState, useEffect } from "react";
import {
    AlertCircle,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Search,
    Loader2,
    MoreVertical,
    FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type Complaint = {
    id: string;
    title: string;
    description: string;
    explanation: string | null;
    penalty: number;
    status: string;
    createdAt: string;
    driver: {
        firstName: string;
        lastName: string;
    }
};

export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const { data } = await api.get("/complaints");
            setComplaints(data);
        } catch (e) {
            console.error("Failed to fetch complaints", e);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === "OPEN" ? "RESOLVED" : "OPEN";
        try {
            await api.patch(`/complaints/${id}/resolve`, { status: nextStatus });
            fetchComplaints();
        } catch (e) {
            console.error("Failed to update complaint status", e);
        }
    };

    const statusIcons: Record<string, any> = {
        OPEN: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50", label: "Offen" },
        RESOLVED: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", label: "Geklärt" },
        DISMISSED: { icon: XCircle, color: "text-slate-500", bg: "bg-slate-100", label: "Verworfen" },
    };

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500 rounded-lg text-white">
                            <AlertCircle size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-red-500">Qualitätssicherung</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reklamationen</h1>
                    <p className="text-slate-500 font-medium">Beschwerdemanagement, Vorfälle und Fahrer-Stellungnahmen.</p>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-red-500 p-8 rounded-[2.5rem] shadow-xl shadow-red-200 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-red-100 uppercase tracking-widest mb-2">Offene Vorfälle</p>
                        <h3 className="text-4xl font-black">
                            {complaints.filter(c => c.status === 'OPEN').length}
                        </h3>
                    </div>
                    <AlertCircle className="absolute bottom-[-20px] right-[-20px] text-white/20 group-hover:scale-125 transition duration-700" size={140} />
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Geklärte Fälle (Monat)</p>
                        <h3 className="text-4xl font-black text-slate-900">
                            {complaints.filter(c => c.status === 'RESOLVED').length}
                        </h3>
                    </div>
                    <CheckCircle2 className="absolute bottom-[-20px] right-[-20px] text-green-50 opacity-50 group-hover:scale-125 transition duration-700" size={140} />
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Erwartete Stellungnahmen</p>
                        <h3 className="text-4xl font-black text-slate-900">
                            {complaints.filter(c => c.status === 'OPEN' && !c.explanation).length}
                        </h3>
                    </div>
                    <MessageSquare className="absolute bottom-[-20px] right-[-20px] text-blue-50 opacity-50 group-hover:scale-125 transition duration-700" size={140} />
                </div>
            </div>

            {/* Complaints List */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <h3 className="text-xl font-black text-slate-900">Gemeldete Vorfälle</h3>
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Suchen..."
                            className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fahrer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest w-1/4">Vorfall</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest w-1/4">Stellungnahme</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Punkte</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
                                    </td>
                                </tr>
                            ) : complaints.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                                        Keine Vorfälle
                                    </td>
                                </tr>
                            ) : complaints.map((complaint, i) => {
                                const status = statusIcons[complaint.status] || statusIcons.OPEN;
                                const StatusIcon = status.icon;

                                return (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={complaint.id}
                                        className="hover:bg-slate-50/50 transition group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{complaint.driver.firstName} {complaint.driver.lastName}</span>
                                                <span className="text-[10px] font-medium text-slate-400">{new Date(complaint.createdAt).toLocaleDateString("de-DE")}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 w-1/4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 text-sm mb-1">{complaint.title}</span>
                                                <span className="text-xs font-medium text-slate-500 line-clamp-2">{complaint.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 w-1/4">
                                            {complaint.explanation ? (
                                                <div className="flex items-start gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <MessageSquare size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2">{complaint.explanation}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50">Warter auf Stellungnahme</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "font-black",
                                                complaint.penalty > 0 ? "text-red-500" : "text-slate-400"
                                            )}>
                                                {complaint.penalty > 0 ? `-${complaint.penalty}` : "0"} Pkt
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => handleResolve(complaint.id, complaint.status)}
                                                className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition hover:scale-105 active:scale-95",
                                                    status.bg,
                                                    status.color
                                                )}
                                            >
                                                <StatusIcon size={12} />
                                                {status.label}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                                                <button className="p-2 text-slate-400 hover:text-blue-600 transition">
                                                    <FileText size={18} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-blue-600 transition">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
