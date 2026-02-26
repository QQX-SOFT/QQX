"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Mail,
    Phone,
    Calendar,
    ShieldCheck,
    FileText,
    Clock,
    CreditCard,
    Star,
    TrendingUp,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Eye,
    Plus
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface DriverDetails {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    birthday?: string;
    employmentType: string;
    status: string;
    walletBalance: number;
    user: {
        email: string;
    };
    documents: any[];
    ratings: any[];
}

export default function DriverProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [driver, setDriver] = useState<DriverDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDriverDetails();
    }, [params.id]);

    const fetchDriverDetails = async () => {
        try {
            const { data } = await api.get(`/drivers/${params.id}`);
            setDriver(data);
        } catch (error) {
            console.error("Failed to fetch driver details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (!driver) {
        return (
            <div className="p-12 text-center bg-white rounded-3xl m-6 border border-slate-100 shadow-sm">
                <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
                <h2 className="text-2xl font-black text-slate-900 mb-2">Fahrer nicht gefunden</h2>
                <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline">Zurück zur Liste</button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Nav Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition shadow-sm"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fahrerprofil</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {driver.id.slice(0, 8)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-blue-50/20 text-center">
                        <div className="w-24 h-24 bg-blue-600 rounded-[2rem] mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100 mb-6">
                            {driver.firstName[0]}{driver.lastName[0]}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">{driver.firstName} {driver.lastName}</h2>
                        <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={12} />
                            Status: {driver.status}
                        </div>

                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Mail className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-Mail Adresse</p>
                                    <p className="font-bold text-slate-900 text-sm">{driver.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Phone className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telefonnummer</p>
                                    <p className="font-bold text-slate-900 text-sm">{driver.phone || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Calendar className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Geburtsdatum</p>
                                    <p className="font-bold text-slate-900 text-sm">
                                        {driver.birthday ? new Date(driver.birthday).toLocaleDateString('de-DE') : "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Widget */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <TrendingUp className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-125 transition-transform duration-700" size={120} />
                        <div className="relative z-10">
                            <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-4">Guthaben (Wallet)</p>
                            <h3 className="text-4xl font-black mb-6">€ {driver.walletBalance.toFixed(2)}</h3>
                            <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition">
                                <CreditCard size={18} />
                                Auszahlung veranlassen
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Tabs */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Clock size={20} />
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Diese Woche</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Arbeitszeit</h4>
                            <p className="text-4xl font-black text-slate-900">38h 20m</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                    <Star size={20} />
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Schnitt</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Bewertung</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-4xl font-black text-slate-900">4.8</p>
                                <div className="flex text-yellow-400">
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="none" strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Dokumente & Compliance</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Prüfung der gesetzlichen Unterlagen</p>
                            </div>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 transition">
                                <Plus size={16} />
                                Neu Hochladen
                            </button>
                        </div>

                        <div className="space-y-4">
                            {driver.documents.length === 0 ? (
                                <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 font-bold text-sm">Keine Dokumente gefunden</p>
                                </div>
                            ) : (
                                driver.documents.map((doc: any) => (
                                    <div key={doc.id} className="group p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between hover:border-blue-200 hover:bg-white transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 overflow-hidden group-hover:scale-110 transition-transform">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 mb-0.5">{doc.title}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                        <CheckCircle size={10} /> {doc.status}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Typ: {doc.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {doc.expiryDate && (
                                                <div className="mr-4 text-right hidden sm:block">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gültig bis</p>
                                                    <p className="text-xs font-black text-slate-900">{new Date(doc.expiryDate).toLocaleDateString('de-DE')}</p>
                                                </div>
                                            )}
                                            <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition">
                                                <Eye size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
