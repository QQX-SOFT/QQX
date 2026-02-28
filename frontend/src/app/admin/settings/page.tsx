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
    Shield,
    CheckCircle2,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type TenantSettings = {
    name: string;
    subdomain: string;
    createdAt: string;
    notificationsEnabled: boolean;
    autoAssignDrivers: boolean;
    currency: string;
    timezone: string;
};

type ActiveTab = "PROFILE" | "SECURITY" | "NOTIFICATIONS" | "LOCALIZATION";

export default function SettingsPage() {
    const [settings, setSettings] = useState<TenantSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>("PROFILE");

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

    const handleSave = async (explicitData?: any) => {
        setSaving(true);
        const dataToSave = explicitData || formData;
        try {
            await api.patch("/settings", dataToSave);
            setSettings((prev: any) => ({ ...prev, ...dataToSave }));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update settings", error);
            alert("Fehler beim Speichern");
        } finally {
            setSaving(false);
        }
    };

    // Auto-save toggle helper
    const handleToggle = async (key: 'notificationsEnabled' | 'autoAssignDrivers') => {
        const newValue = !formData[key];
        const newFormData = { ...formData, [key]: newValue };
        setFormData(newFormData);
        // We auto-save for UX
        await handleSave(newFormData);
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20 font-sans">
            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-sm"
                    >
                        <CheckCircle2 size={20} />
                        Einstellungen erfolgreich gespeichert!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-800 rounded-lg text-white">
                            <Settings size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-800">System</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Einstellungen</h1>
                    <p className="text-slate-500 font-medium">Verwalten Sie Ihr Unternehmen und System-Präferenzen.</p>
                </div>
                <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center gap-2 group"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} className="group-hover:scale-110 transition" /> Speichern</>}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation Sidebar */}
                <div className="space-y-2">
                    {[
                        { id: "PROFILE", name: "Unternehmensprofil", icon: Building2 },
                        { id: "SECURITY", name: "Sicherheit & Login", icon: Lock },
                        { id: "NOTIFICATIONS", name: "Benachrichtigungen", icon: Bell },
                        { id: "LOCALIZATION", name: "Lokalisierung", icon: Globe },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as ActiveTab)}
                            className={cn(
                                "flex items-center justify-between w-full p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                                activeTab === item.id
                                    ? "bg-white border border-slate-200 text-blue-600 shadow-xl shadow-blue-100/10"
                                    : "text-slate-400 hover:bg-slate-50 border border-transparent hover:text-slate-600"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} />
                                {item.name}
                            </div>
                            {activeTab === item.id && <ChevronRight size={14} className="text-blue-200" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-2 space-y-8">
                    {activeTab === "PROFILE" ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="space-y-8">
                                {/* Organization Info */}
                                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                            <Building2 size={20} />
                                        </div>
                                        Unternehmensprofil
                                    </h3>
                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Anzeigename</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="z.B. QQX Logistik GmbH"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Workplace (Subdomain)</label>
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    disabled
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-s-[1.5rem] px-6 py-5 outline-none text-slate-400 font-bold cursor-not-allowed"
                                                    value={settings?.subdomain}
                                                />
                                                <span className="bg-slate-100 px-6 py-5 text-slate-400 font-black uppercase rounded-e-[1.5rem] border-y-2 border-r-2 border-slate-100">.qqx.app</span>
                                            </div>
                                            <p className="flex items-center gap-2 text-[10px] text-slate-400 mt-4 font-black uppercase tracking-wider px-2">
                                                <AlertCircle size={14} className="text-amber-500" />
                                                Subdomain kann nur vom Support geändert werden.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Settings */}
                                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                                            <Shield size={20} />
                                        </div>
                                        Betriebliche Abläufe
                                    </h3>
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => handleToggle('autoAssignDrivers')}
                                            className="w-full flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/10 transition group text-left"
                                        >
                                            <div>
                                                <h4 className="font-black text-slate-900 mb-1">Automatische Fahrerzuweisung</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aufträge automatisch an freie Fahrer verteilen.</p>
                                            </div>
                                            <div className={cn(
                                                "w-14 h-8 rounded-full flex items-center p-1.5 transition-all duration-300",
                                                formData.autoAssignDrivers ? "bg-blue-600 justify-end shadow-lg shadow-blue-100" : "bg-slate-200 justify-start"
                                            )}>
                                                <div className="w-5 h-5 rounded-full bg-white shadow-xl" />
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleToggle('notificationsEnabled')}
                                            className="w-full flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/10 transition group text-left"
                                        >
                                            <div>
                                                <h4 className="font-black text-slate-900 mb-1">Systembenachrichtigungen</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reports und Alarme via E-Mail & Push erhalten.</p>
                                            </div>
                                            <div className={cn(
                                                "w-14 h-8 rounded-full flex items-center p-1.5 transition-all duration-300",
                                                formData.notificationsEnabled ? "bg-blue-600 justify-end shadow-lg shadow-blue-100" : "bg-slate-200 justify-start"
                                            )}>
                                                <div className="w-5 h-5 rounded-full bg-white shadow-xl" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[3rem] p-20 border border-slate-100 border-dashed text-center flex flex-col items-center justify-center min-h-[400px]"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                                <Settings size={40} className="animate-pulse" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Modul bald verfügbar</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Wir arbeiten an erweiterten Einstellungen für diesen Bereich.</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
