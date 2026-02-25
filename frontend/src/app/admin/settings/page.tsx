"use client";

import { useEffect, useState } from "react";
import {
    Settings,
    Bell,
    Lock,
    Globe,
    User,
    Building2,
    Save,
    Loader2,
    Shield
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

type TenantSettings = {
    name: string;
    subdomain: string;
    createdAt: string;
    notificationsEnabled: boolean;
    autoAssignDrivers: boolean;
    currency: string;
    timezone: string;
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<TenantSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        notificationsEnabled: false,
        autoAssignDrivers: false
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get("/settings");
                setSettings(data);
                setFormData({
                    name: data.name,
                    notificationsEnabled: data.notificationsEnabled,
                    autoAssignDrivers: data.autoAssignDrivers
                });
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Wait, we only made an endpoint for name in PATCH /settings!
            await api.patch("/settings", { name: formData.name });
            setSettings((prev: any) => ({ ...prev, name: formData.name }));
        } catch (error) {
            console.error("Failed to update settings", error);
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
        <div className="space-y-10 max-w-5xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-800 rounded-lg text-white">
                            <Settings size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-800">Präferenzen</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Einstellungen</h1>
                    <p className="text-slate-500 font-medium">Verwalten Sie Ihr Unternehmensprofil, Sicherheit und globale Präferenzen.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center gap-2"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Speichern</>}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation Sidebar */}
                <div className="space-y-2">
                    {[
                        { name: "Unternehmensprofil", icon: Building2, active: true },
                        { name: "Sicherheit & Login", icon: Lock, active: false },
                        { name: "Benachrichtigungen", icon: Bell, active: false },
                        { name: "Lokalisierung", icon: Globe, active: false },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={cn(
                                "flex items-center gap-3 w-full p-4 rounded-2xl font-bold text-sm transition-all",
                                item.active ? "bg-white border border-slate-200 text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 border border-transparent"
                            )}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </button>
                    ))}
                </div>

                {/* Form Area */}
                <div className="md:col-span-2 space-y-8">
                    {/* Organization Settings */}
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <Building2 className="text-blue-500" /> Profil
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Unternehmensname</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/10 transition text-slate-900 font-bold"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Arbeitsbereich (Subdomain)</label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full bg-slate-100 border border-slate-200 rounded-s-2xl px-5 py-4 outline-none text-slate-500 font-bold"
                                        value={settings?.subdomain}
                                    />
                                    <span className="bg-slate-200 px-5 py-4 text-slate-600 font-bold uppercase rounded-e-2xl border-y border-r border-slate-200">.localhost</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 font-medium">Die Subdomain kann aus Sicherheitsgründen nicht geändert werden.</p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Settings */}
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <Shield className="text-blue-500" /> Automatisierung
                        </h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Automatische Fahrerzuweisung</h4>
                                    <p className="text-xs font-medium text-slate-500">Wenn aktiviert, werden Aufträge automatisch dem nächsten freien Fahrer zugewiesen.</p>
                                </div>
                                <div className={cn("w-12 h-6 rounded-full flex items-center p-1 transition-colors", formData.autoAssignDrivers ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start")}>
                                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Systembenachrichtigungen</h4>
                                    <p className="text-xs font-medium text-slate-500">Erhalt von täglichen Reports und Alarmmeldungen via E-Mail.</p>
                                </div>
                                <div className={cn("w-12 h-6 rounded-full flex items-center p-1 transition-colors", formData.notificationsEnabled ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start")}>
                                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                </div>
                            </label>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
