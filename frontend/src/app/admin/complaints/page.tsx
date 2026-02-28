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
    FileText,
    Plus,
    X,
    User,
    Euro
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type Driver = {
    id: string;
    firstName: string;
    lastName: string;
};

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
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [newComplaint, setNewComplaint] = useState({
        driverId: "",
        title: "",
        description: "",
        penalty: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [compRes, driversRes] = await Promise.all([
                api.get("/complaints"),
                api.get("/drivers")
            ]);
            setComplaints(compRes.data);
            setDrivers(driversRes.data);
        } catch (e) {
            console.error("Failed to fetch data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateComplaint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComplaint.driverId) return alert("Fahrer auswählen");
        setCreating(true);
        try {
            await api.post("/complaints", newComplaint);
            setShowAddModal(false);
            setNewComplaint({ driverId: "", title: "", description: "", penalty: 0 });
            fetchData();
        } catch (error) {
            alert("Fehler beim Erstellen");
        } finally {
            setCreating(false);
        }
    };

    const handleResolve = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === "OPEN" ? "RESOLVED" : "OPEN";
        try {
            await api.patch(`/complaints/${id}/resolve`, { status: nextStatus });
            fetchData();
        } catch (e) {
            console.error("Failed to update complaint status", e);
        }
    };

    const statusIcons: Record<string, any> = {
        OPEN: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50", label: "Offen" },
        RESOLVED: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", label: "Geklärt" },
        DISMISSED: { icon: XCircle, color: "text-slate-500", bg: "bg-slate-100", label: "Verworfen" },
    };

    const filteredComplaints = complaints.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${c.driver.firstName} ${c.driver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-20 font-sans">
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
                    <p className="text-slate-500 font-medium">Beschwerdemanagement und Fahrer-Stellungnahmen.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition shadow-xl"
                >
                    <Plus size={20} />
                    Vorfall melden
                </button>
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                            ) : filteredComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                                        Keine Vorfälle
                                    </td>
                                </tr>
                            ) : filteredComplaints.map((complaint, i) => {
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
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 italic">Wartet auf Antwort</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "font-black text-sm px-2 py-1 rounded-lg",
                                                complaint.penalty > 0 ? "text-red-600 bg-red-50" : "text-slate-400 bg-slate-50"
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
                                                <button className="p-2 text-slate-400 hover:text-red-500 transition">
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

            {/* Add Complaint Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition">
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black text-slate-900 mb-8">Vorfall melden</h2>

                            <form onSubmit={handleCreateComplaint} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <User size={14} /> Betroffener Fahrer
                                    </label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                        value={newComplaint.driverId}
                                        onChange={e => setNewComplaint({ ...newComplaint, driverId: e.target.value })}
                                    >
                                        <option value="">Fahrer auswählen...</option>
                                        {drivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Titel des Vorfalls</label>
                                    <input
                                        type="text" required
                                        placeholder="z.B. Verspätete Lieferung"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                        value={newComplaint.title}
                                        onChange={e => setNewComplaint({ ...newComplaint, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Beschreibung</label>
                                    <textarea
                                        required rows={4}
                                        placeholder="Details zum Vorfall..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                        value={newComplaint.description}
                                        onChange={e => setNewComplaint({ ...newComplaint, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <AlertCircle size={14} className="text-red-500" /> Strafpunkte (optional)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold"
                                        value={newComplaint.penalty}
                                        onChange={e => setNewComplaint({ ...newComplaint, penalty: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition">Abbrechen</button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-xl shadow-red-100"
                                    >
                                        {creating ? <Loader2 className="animate-spin" size={20} /> : "Meldung speichern"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
