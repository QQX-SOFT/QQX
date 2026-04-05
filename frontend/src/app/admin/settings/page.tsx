"use client";

import { useEffect, useState } from "react";
import {
    Settings,
    Bell,
    Lock,
    User,
    Building2,
    Save,
    Loader2,
    Shield,
    CheckCircle2,
    ChevronRight,
    AlertCircle,
    Eye,
    EyeOff,
    LogOut,
    KeyRound,
    ShieldCheck,
    Clock
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type TenantSettings = {
    name: string;
    subdomain: string;
    createdAt: string;
    address: string;
    zipCode: string;
    city: string;
    uidNumber: string;
    companyRegister: string;
    legalForm: string;
    commercialCourt: string;
    ownerName: string;
    gisaNumber: string;
    taxNumber: string;
    email: string;
    phone: string;
    autoAssignDrivers: boolean;
    pushNotificationsEnabled: boolean;
    orderAlarmsEnabled: boolean;
};

type ActiveTab = "PROFILE" | "SECURITY" | "NOTIFICATIONS";

export default function SettingsPage() {
    const [settings, setSettings] = useState<TenantSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>("PROFILE");

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        zipCode: "",
        city: "",
        uidNumber: "",
        companyRegister: "",
        legalForm: "",
        commercialCourt: "",
        ownerName: "",
        gisaNumber: "",
        taxNumber: "",
        email: "",
        phone: "",
        notificationsEnabled: false,
        autoAssignDrivers: false,
        pushNotificationsEnabled: false,
        orderAlarmsEnabled: false
    });

    // Security tab state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [pwChanging, setPwChanging] = useState(false);
    const [pwError, setPwError] = useState("");
    const [pwSuccess, setPwSuccess] = useState("");
    const [adminUser, setAdminUser] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get("/settings");
                setSettings(data);
                setFormData({
                    name: data.name || "",
                    address: data.address || "",
                    zipCode: data.zipCode || "",
                    city: data.city || "",
                    uidNumber: data.uidNumber || "",
                    companyRegister: data.companyRegister || "",
                    legalForm: data.legalForm || "",
                    commercialCourt: data.commercialCourt || "",
                    ownerName: data.ownerName || "",
                    gisaNumber: data.gisaNumber || "",
                    taxNumber: data.taxNumber || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    notificationsEnabled: data.notificationsEnabled,
                    autoAssignDrivers: data.autoAssignDrivers,
                    pushNotificationsEnabled: data.pushNotificationsEnabled,
                    orderAlarmsEnabled: data.orderAlarmsEnabled
                });
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();

        // Load admin user from localStorage
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                setAdminUser(JSON.parse(userStr));
            }
        } catch (_) {}
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
    const handleToggle = async (key: 'notificationsEnabled' | 'autoAssignDrivers' | 'pushNotificationsEnabled' | 'orderAlarmsEnabled') => {
        const newValue = !formData[key];
        const newFormData = { ...formData, [key]: newValue };
        setFormData(newFormData);
        // We auto-save for UX
        await handleSave(newFormData);
    };

    const handlePasswordChange = async () => {
        setPwError("");
        setPwSuccess("");

        if (!currentPassword) {
            setPwError("Bitte geben Sie Ihr aktuelles Passwort ein.");
            return;
        }
        if (newPassword.length < 6) {
            setPwError("Neues Passwort muss mindestens 6 Zeichen lang sein.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwError("Die Passwörter stimmen nicht überein.");
            return;
        }

        setPwChanging(true);
        try {
            await api.post("/auth/change-password", {
                currentPassword,
                newPassword
            });
            setPwSuccess("Passwort erfolgreich geändert!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPwSuccess(""), 5000);
        } catch (err: any) {
            setPwError(err.response?.data?.error || "Fehler beim Ändern des Passworts.");
        } finally {
            setPwChanging(false);
        }
    };

    const handleLogout = () => {
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
        localStorage.clear();
        window.location.href = "/login";
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

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                             <div>
                                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Firmeninhaber</label>
                                                 <input
                                                     type="text"
                                                     className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                     value={formData.ownerName}
                                                     onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                                 />
                                             </div>
                                             <div>
                                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">GISA NR</label>
                                                 <input
                                                     type="text"
                                                     className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                     value={formData.gisaNumber}
                                                     onChange={(e) => setFormData({ ...formData, gisaNumber: e.target.value })}
                                                 />
                                             </div>
                                         </div>

                                         <div>
                                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Adresse</label>
                                             <input
                                                 type="text"
                                                 className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                 value={formData.address}
                                                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                             />
                                         </div>

                                         <div className="grid grid-cols-2 gap-8">
                                             <div>
                                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">PLZ</label>
                                                 <input
                                                     type="text"
                                                     className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                     value={formData.zipCode}
                                                     onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                                 />
                                             </div>
                                             <div>
                                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Stadt</label>
                                                 <input
                                                     type="text"
                                                     className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                     value={formData.city}
                                                     onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                 />
                                             </div>
                                         </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                             <div>
                                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Steuernummer</label>
                                                 <input
                                                     type="text"
                                                     className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                     value={formData.taxNumber}
                                                     onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                                                 />
                                             </div>
                                             <div>
                                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">UID Nummer</label>
                                                 <input
                                                     type="text"
                                                     className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                     value={formData.uidNumber}
                                                     onChange={(e) => setFormData({ ...formData, uidNumber: e.target.value })}
                                                 />
                                             </div>
                                         </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                             <div>
                                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Email</label>
                                                 <input
                                                     type="email"
                                                     className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                     value={formData.email}
                                                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                 />
                                             </div>
                                             <div>
                                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Telefon</label>
                                                 <input
                                                     type="text"
                                                     className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                     value={formData.phone}
                                                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                 />
                                             </div>
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
                    ) : activeTab === "SECURITY" ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="space-y-8">
                                {/* Account Info */}
                                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                            <User size={20} />
                                        </div>
                                        Sicherheit & Login
                                    </h3>
                                    <div className="space-y-4">
                                        {/* 2FA Placeholder */}
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-50 opacity-60 cursor-not-allowed text-left bg-slate-50/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                                                    <ShieldCheck size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 mb-1 flex items-center gap-2">
                                                        Zwei-Faktor-Authentisierung (2FA)
                                                        <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Coming Soon</span>
                                                    </h4>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zusätzliche Sicherheitsebene für Ihren Account.</p>
                                                </div>
                                            </div>
                                            <div className="w-14 h-8 rounded-full bg-slate-200 flex items-center p-1.5 justify-start">
                                                <div className="w-5 h-5 rounded-full bg-white shadow-xl" />
                                            </div>
                                        </button>

                                        {/* Session Timeout */}
                                        <div className="p-6 rounded-[2rem] border-2 border-slate-50 bg-white">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                                                        <Clock size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 mb-1">Inaktivitäts-Timeout</h4>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Automatische Abmeldung nach Inaktivität.</p>
                                                    </div>
                                                </div>
                                                <select className="bg-slate-50 border-none rounded-xl px-4 py-2 font-black text-xs uppercase tracking-widest outline-none focus:ring-0">
                                                    <option>30 Minuten</option>
                                                    <option>1 Stunde</option>
                                                    <option>4 Stunden</option>
                                                    <option selected>Nie</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Password Change */}
                                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                            <Lock size={20} />
                                        </div>
                                        Passwort ändern
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-Mail Adresse</p>
                                                <p className="font-bold text-slate-900">{adminUser?.email || "—"}</p>
                                            </div>
                                            <Lock size={16} className="text-slate-300" />
                                        </div>
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rolle</p>
                                                <p className="font-bold text-slate-900">
                                                    {adminUser?.role === 'CUSTOMER_ADMIN' ? 'Administrator' : adminUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : adminUser?.role || '—'}
                                                </p>
                                            </div>
                                            <Shield size={16} className="text-slate-300" />
                                        </div>
                                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Konto erstellt am</p>
                                                <p className="font-bold text-slate-900">
                                                    {adminUser?.createdAt ? new Date(adminUser.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Password Change */}
                                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                                            <KeyRound size={20} />
                                        </div>
                                        Passwort ändern
                                    </h3>

                                    {pwError && (
                                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold mb-6">
                                            <AlertCircle size={16} />
                                            {pwError}
                                        </div>
                                    )}
                                    {pwSuccess && (
                                        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 text-sm font-bold mb-6">
                                            <CheckCircle2 size={16} />
                                            {pwSuccess}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Aktuelles Passwort</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPw ? "text" : "password"}
                                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 pr-14 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                                >
                                                    {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Neues Passwort</label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPw ? "text" : "password"}
                                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 pr-14 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Min. 6 Zeichen"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPw(!showNewPw)}
                                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                                >
                                                    {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Passwort bestätigen</label>
                                            <input
                                                type="password"
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-5 outline-none focus:border-blue-500/20 focus:bg-white transition text-slate-900 font-bold"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Neues Passwort wiederholen"
                                            />
                                        </div>
                                        <button
                                            onClick={handlePasswordChange}
                                            disabled={pwChanging}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                                        >
                                            {pwChanging ? <Loader2 className="animate-spin" size={20} /> : <><KeyRound size={18} /> Passwort ändern</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Logout / Session */}
                                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                                            <LogOut size={20} />
                                        </div>
                                        Sitzung
                                    </h3>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-between p-6 rounded-[2rem] border-2 border-red-100 hover:border-red-200 hover:bg-red-50/30 transition group text-left"
                                    >
                                        <div>
                                            <h4 className="font-black text-red-600 mb-1">Abmelden</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktuelle Sitzung beenden und zum Login zurückkehren.</p>
                                        </div>
                                        <LogOut size={20} className="text-red-400 group-hover:text-red-600 transition" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === "NOTIFICATIONS" ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                                        <Bell size={20} />
                                    </div>
                                    Benachrichtigungen
                                </h3>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => handleToggle('notificationsEnabled')}
                                        className="w-full flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/10 transition group text-left"
                                    >
                                        <div>
                                            <h4 className="font-black text-slate-900 mb-1">E-Mail Benachrichtigungen</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wichtige Updates und Reports per E-Mail erhalten.</p>
                                        </div>
                                        <div className={cn(
                                            "w-14 h-8 rounded-full flex items-center p-1.5 transition-all duration-300",
                                            formData.notificationsEnabled ? "bg-blue-600 justify-end shadow-lg shadow-blue-100" : "bg-slate-200 justify-start"
                                        )}>
                                            <div className="w-5 h-5 rounded-full bg-white shadow-xl" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleToggle('pushNotificationsEnabled')}
                                        className="w-full flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/10 transition group text-left"
                                    >
                                        <div>
                                            <h4 className="font-black text-slate-900 mb-1">Push-Benachrichtigungen</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Echtzeit Push-Benachrichtigungen im Browser.</p>
                                        </div>
                                        <div className={cn(
                                            "w-14 h-8 rounded-full flex items-center p-1.5 transition-all duration-300",
                                            formData.pushNotificationsEnabled ? "bg-blue-600 justify-end shadow-lg shadow-blue-100" : "bg-slate-200 justify-start"
                                        )}>
                                            <div className="w-5 h-5 rounded-full bg-white shadow-xl" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleToggle('orderAlarmsEnabled')}
                                        className="w-full flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/10 transition group text-left"
                                    >
                                        <div>
                                            <h4 className="font-black text-slate-900 mb-1">Bestell-Alarme</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Benachrichtigung bei neuen oder problematischen Bestellungen.</p>
                                        </div>
                                        <div className={cn(
                                            "w-14 h-8 rounded-full flex items-center p-1.5 transition-all duration-300",
                                            formData.orderAlarmsEnabled ? "bg-blue-600 justify-end shadow-lg shadow-blue-100" : "bg-slate-200 justify-start"
                                        )}>
                                            <div className="w-5 h-5 rounded-full bg-white shadow-xl" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
