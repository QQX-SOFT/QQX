"use client";

import { useEffect, useState } from "react";
import {
    ScrollText,
    Plus,
    Search,
    Loader2,
    Calendar,
    Filter,
    FileText,
    MoreVertical,
    User,
    Building2,
    Car,
    Clock,
    X,
    Save,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Type
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

type ContractType = "GENERAL" | "CUSTOMER" | "DRIVER" | "VEHICLE";
type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";

interface Contract {
    id: string;
    title: string;
    description: string | null;
    type: ContractType;
    status: ContractStatus;
    startDate: string | null;
    endDate: string | null;
    fileUrl: string | null;
    driverId: string | null;
    customerId: string | null;
    driver?: any;
    customer?: any;
    createdAt: string;
}

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("ALL");

    const [drivers, setDrivers] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [contractsRes, driversRes, customersRes, templatesRes] = await Promise.all([
                api.get("/contracts"),
                api.get("/drivers"),
                api.get("/customers"),
                api.get("/contract-templates")
            ]);
            setContracts(contractsRes.data);
            setDrivers(driversRes.data);
            setCustomers(customersRes.data);
            setTemplates(templatesRes.data);
        } catch (error) {
            console.error("Failed to load contracts data", error);
        } finally {
            setLoading(false);
        }
    };

    // Form handle is now in the editor page

    const handleDelete = async (id: string) => {
        if (!confirm("Vertrag wirklich löschen?")) return;
        try {
            await api.delete(`/contracts/${id}`);
            fetchData();
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    const filteredContracts = contracts.filter((c) => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "ALL" || c.type === filterType;
        return matchesSearch && matchesType;
    });

    const getStatusColor = (status: ContractStatus) => {
        switch (status) {
            case "ACTIVE": return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200";
            case "DRAFT": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
            case "EXPIRED": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200";
            case "TERMINATED": return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200";
        }
    };

    const getTypeIcon = (type: ContractType) => {
        switch (type) {
            case "CUSTOMER": return <Building2 size={16} />;
            case "DRIVER": return <User size={16} />;
            case "VEHICLE": return <Car size={16} />;
            case "GENERAL": return <FileText size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <ScrollText size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Verwaltung</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Verträge</h1>
                    <p className="text-slate-500 font-medium">Verwalten Sie Kunden-, Fahrer- und generelle Verträge.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/contracts/templates"
                        className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                        <Type size={20} />
                        Vorlagen
                    </Link>
                    <Link
                        href="/admin/contracts/editor"
                        className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                    >
                        <Plus size={20} />
                        Neuer Vertrag
                    </Link>
                </div>
            </header>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Verträge suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                </div>
                <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
                    {["ALL", "GENERAL", "CUSTOMER", "DRIVER", "VEHICLE"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={cn(
                                "px-6 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition",
                                filterType === type
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {type === "ALL" ? "Alle" : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContracts.map((contract) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={contract.id}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition duration-300 group flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn(
                                "px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-black uppercase tracking-wider",
                                getStatusColor(contract.status)
                            )}>
                                {contract.status === "ACTIVE" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {contract.status}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/admin/contracts/editor?id=${contract.id}`}
                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition"
                                >
                                    <MoreVertical size={16} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(contract.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-black text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">
                                {contract.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                    {getTypeIcon(contract.type)}
                                    {contract.type}
                                </span>
                            </div>
                        </div>

                        {contract.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 flex-grow">
                                {contract.description}
                            </p>
                        )}

                        <div className="mt-auto space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            {contract.driver && (
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <User size={16} className="text-slate-400" />
                                    {contract.driver.firstName} {contract.driver.lastName}
                                </div>
                            )}
                            {contract.customer && (
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <Building2 size={16} className="text-slate-400" />
                                    {contract.customer.name}
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <Calendar size={14} />
                                    {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'Kein Start'} - {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Kein Ende'}
                                </div>
                                {contract.fileUrl && (
                                    <a
                                        href={contract.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <FileText size={14} /> PDF
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredContracts.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                            <ScrollText size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Keine Verträge gefunden</h3>
                        <p className="text-slate-500 font-medium">Erstellen Sie einen neuen Vertrag oder passen Sie die Filter an.</p>
                    </div>
                )}
            </div>

            {/* Modals have been replaced by the editor page */}
        </div>
    );
}
