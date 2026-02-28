"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    Save,
    ArrowLeft,
    ClipboardList,
    Plus,
    Building2,
    User,
    MapPin,
    Truck
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";

function OrderEditorForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    const [drivers, setDrivers] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        customerId: "",
        senderName: "",
        senderAddress: "",
        recipientName: "",
        recipientAddress: "",
        packageInfo: "",
        serviceType: "standard",
        priority: "normal",
        amount: "",
        driverId: "",
        notes: ""
    });

    useEffect(() => {
        fetchDrivers();
        fetchCustomers();
        if (id) {
            fetchOrder(id);
        }
    }, [id]);

    const fetchDrivers = async () => {
        try {
            const { data } = await api.get("/drivers");
            setDrivers(data);
        } catch (e) {
            console.error("Failed to fetch drivers", e);
        }
    };

    const fetchCustomers = async () => {
        try {
            const { data } = await api.get("/customers");
            setCustomers(data);
        } catch (e) {
            console.error("Failed to fetch customers", e);
        }
    };

    const fetchOrder = async (orderId: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/orders/${orderId}`);
            setFormData({
                customerId: data.customerId || "",
                senderName: data.senderName || "",
                senderAddress: data.senderAddress || "",
                recipientName: data.recipientName || data.customerName || "",
                recipientAddress: data.recipientAddress || data.address || "",
                packageInfo: data.packageInfo || "",
                serviceType: data.serviceType || "standard",
                priority: data.priority || "normal",
                amount: data.amount ? data.amount.toString() : "",
                driverId: data.driverId || "",
                notes: data.notes || ""
            });
        } catch (error) {
            console.error("Failed to load order", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount),
                customerName: formData.recipientName,
                address: formData.recipientAddress,
                source: "DIRECT"
            };

            if (id) {
                await api.patch(`/orders/${id}`, payload);
            } else {
                await api.post("/orders", payload);
            }
            router.push("/admin/orders");
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.error || "Fehler beim Speichern des Auftrags");
            console.error("Save error", error);
        } finally {
            setSaving(false);
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
        <form onSubmit={handleSave} className="space-y-10">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 font-sans">

                <div className="p-8 mb-10 bg-blue-50/30 border border-blue-100 rounded-[2.5rem] relative overflow-hidden group transition-all hover:bg-blue-50/50">
                    <div className="absolute top-0 right-0 p-8 text-blue-100/50 group-hover:text-blue-500/10 transition-colors">
                        <Building2 size={80} />
                    </div>
                    <div className="relative z-10">
                        <label className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 ml-1">Kunden-Zuweisung *</label>
                        <select
                            required
                            className="w-full bg-white border border-blue-100 rounded-3xl px-8 py-5 focus:border-blue-500 outline-none font-black text-slate-900 transition-all shadow-sm appearance-none cursor-pointer"
                            value={formData.customerId}
                            onChange={e => {
                                const cust = customers.find(c => c.id === e.target.value);
                                setFormData({
                                    ...formData,
                                    customerId: e.target.value,
                                    recipientName: cust?.contactPerson || cust?.name || formData.recipientName,
                                    recipientAddress: cust?.address || formData.recipientAddress
                                });
                            }}
                        >
                            <option value="">Bitte Kunden wählen...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <p className="mt-3 ml-1 text-xs font-medium text-slate-400 group-hover:text-blue-400 transition-colors">Wählen Sie einen registrierten Kunden aus der Datenbank.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left Column: People */}
                    <div className="space-y-8">
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <MapPin size={16} />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Absender (Sender)</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Name des Absenders"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm"
                                        value={formData.senderName}
                                        onChange={e => setFormData({ ...formData, senderName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adresse</label>
                                    <input
                                        type="text"
                                        placeholder="Straße, Hausnummer..."
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm"
                                        value={formData.senderAddress}
                                        onChange={e => setFormData({ ...formData, senderAddress: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <User size={16} />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Empfänger (Recipient)</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Name des Empfängers"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm"
                                        value={formData.recipientName}
                                        onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adresse *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Straße, Hausnummer..."
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm"
                                        value={formData.recipientAddress}
                                        onChange={e => setFormData({ ...formData, recipientAddress: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Delivery Info */}
                    <div className="space-y-8">
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                    <Truck size={16} />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Paket & Service</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Service-Typ</label>
                                        <select
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm appearance-none"
                                            value={formData.serviceType}
                                            onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                                        >
                                            <option value="standard">Standard</option>
                                            <option value="essen">Essen Lieferung</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Priorität</label>
                                        <select
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm appearance-none"
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="express">Express</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Preis (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0,00"
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fahrer zuweisen</label>
                                        <select
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm appearance-none"
                                            value={formData.driverId}
                                            onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                                        >
                                            <option value="">Kein Fahrer</option>
                                            {drivers.map(d => (
                                                <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Paket Information</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Größe, Gewicht, Inhalt..."
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm resize-none"
                                        value={formData.packageInfo}
                                        onChange={e => setFormData({ ...formData, packageInfo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notiz</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Zusätzliche Informationen..."
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none font-bold transition shadow-sm resize-none"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex gap-4 border-t border-slate-50 dark:border-slate-800 mt-8">
                    <Link href="/admin/orders" className="flex-1 py-5 rounded-2xl bg-slate-50 font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition shadow-sm text-center flex items-center justify-center">Abbrechen</Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : (id ? "Auftrag Speichern" : "Auftrag Erstellen")}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function OrderEditorPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/orders" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-200 transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                            <ClipboardList size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Auftragseditor</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Auftrag bearbeiten</h1>
                    <p className="text-slate-500 font-medium mt-1">Geben Sie die Details für Lieferung ein.</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <OrderEditorForm />
            </Suspense>
        </div>
    );
}
