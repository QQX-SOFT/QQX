"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Loader2,
    X,
    Trash2,
    Building2,
    ExternalLink,
    ChevronRight,
    User
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";

interface Customer {
    id: string;
    name: string;
    contactPerson: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    createdAt: string;
}

export default function CustomersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data } = await api.get("/customers");
            setCustomers(data);
        } catch (e) {
            console.error("Failed to fetch customers", e);
        } finally {
            setLoading(false);
        }
    };

    // Creating logic moved to editor page

    const handleDeleteCustomer = async (id: string, name: string) => {
        if (!confirm(`Möchtest du ${name} wirklich löschen?`)) return;

        try {
            await api.delete(`/customers/${id}`);
            fetchCustomers();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Löschen");
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contactPerson?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <Building2 size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Relations</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kunden-Management</h1>
                    <p className="text-slate-500 font-medium font-sans">Verwalten Sie Ihre Geschäftskunden und Auftraggeber.</p>
                </div>
                <Link
                    href="/admin/customers/editor"
                    className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200"
                >
                    <Plus size={20} />
                    Kunde hinzufügen
                </Link>
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white border border-slate-200 p-2 rounded-2xl flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-sm">
                    <div className="p-3">
                        <Search size={20} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Firma, Kontaktperson oder E-Mail suchen..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-sans font-medium text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 py-2 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm font-sans">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {/* Customers List */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <Users className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 font-bold uppercase tracking-widest font-sans">Keine Kunden gefunden</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCustomers.map((customer, i) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                key={customer.id}
                                className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500 relative flex flex-col h-full"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500 shadow-sm">
                                        <Building2 size={28} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors">{customer.name}</h3>
                                    <div className="flex items-center gap-2 mb-6 text-slate-400 font-sans font-medium text-sm">
                                        <User size={14} className="text-blue-500" />
                                        {customer.contactPerson || "Kein Kontakt"}
                                    </div>

                                    <div className="space-y-4 font-sans text-sm">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                                                <Mail size={14} />
                                            </div>
                                            <span className="truncate">{customer.email || "-"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                                                <Phone size={14} />
                                            </div>
                                            <span>{customer.phone || "-"}</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-slate-500">
                                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                                                <MapPin size={14} />
                                            </div>
                                            <span className="leading-relaxed line-clamp-2">{customer.address || "-"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aktiv seit</span>
                                        <span className="text-xs font-bold text-slate-500 font-sans">{new Date(customer.createdAt).toLocaleDateString('de-DE')}</span>
                                    </div>
                                    <Link href={`/admin/customers/editor?id=${customer.id}`} className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-transform">
                                        Details bearbeiten
                                        <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal removed */}
        </div>
    );
}
