import { useState, useEffect } from "react";
import api from "@/lib/api";
import { LifeBuoy, Search, Filter, MessageSquare, Clock, AlertCircle, CheckCircle, ChevronRight, User } from "lucide-react";

interface TicketData {
    id: string;
    tenant: { name: string };
    title: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const { data } = await api.get("/superadmin/tickets");
                setTickets(data);
            } catch (error) {
                console.error("Failed to fetch tickets", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    return (
        <div className="space-y-8 animate-in mt-in duration-1000">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase">
                        Supportanfragen
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Verwalten Sie Helpdesk-Tickets und SLA-Metriken.
                    </p>
                </div>
            </div>

            {/* Ticket List */}
            <div className="space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-slate-50 dark:bg-white/5 animate-pulse rounded-[2rem]" />
                    ))
                ) : tickets.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#0f111a] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
                        <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Keine aktiven Tickets</h3>
                        <p className="text-slate-500">Ihre Support-Warteschlange ist leer.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket.id} className="bg-white dark:bg-[#0f111a] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group cursor-pointer">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                <div className="flex items-center gap-4 lg:w-48 shrink-0">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ticket.status === 'OPEN' ? 'bg-rose-500/10 text-rose-500' :
                                        ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                        <AlertCircle size={22} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{ticket.id.slice(0, 8)}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ticket.status}</p>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{ticket.tenant?.name}</span>
                                        <span className="text-[10px] font-black text-slate-300">•</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition line-clamp-1">
                                        {ticket.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2 text-slate-500 font-medium">
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${ticket.priority === 'HIGH' ? 'border-rose-500/20 text-rose-500' :
                                            ticket.priority === 'MEDIUM' ? 'border-amber-500/20 text-amber-500' :
                                                'border-slate-200 text-slate-400'
                                            }`}>
                                            {ticket.priority} Priority
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 justify-end">
                                    <button className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
