"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, Database, CheckCircle, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

export default function SetupPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const runSetup = async () => {
        setStatus("loading");
        setMessage("Verbindung zum Backend wird aufgebaut...");

        try {
            // Create the missing tenant for the Vercel subdomain
            const response = await api.post("/tenants", {
                name: "QQX Production Tenant",
                subdomain: "qqx-blond"
            });

            setStatus("success");
            setMessage(`Erfolg! Mandant "${response.data.name}" wurde in der Datenbank erstellt.`);
        } catch (error: any) {
            console.error("Setup error:", error);

            if (error.response?.status === 400 && error.response?.data?.error === "Subdomain already taken") {
                setStatus("success");
                setMessage("Information: Der Mandant 'qqx-blond' existiert bereits in der Datenbank.");
            } else {
                setStatus("error");
                setMessage(error.response?.data?.error || error.message || "Unbekannter Fehler beim Setup.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-100 border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-tight">System Setup</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Database Initialization</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                        Klicken Sie auf den Button unten, um den Mandanten <strong>'qqx-blond'</strong> in Ihrer Datenbank zu registrieren. Dies ist notwendig, damit das Frontend auf Vercel autorisiert wird.
                    </p>

                    {status !== "idle" && (
                        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${status === "loading" ? "bg-blue-50 border-blue-100 text-blue-700" :
                                status === "success" ? "bg-green-50 border-green-100 text-green-700" :
                                    "bg-red-50 border-red-100 text-red-700"
                            }`}>
                            {status === "loading" ? <Loader2 className="animate-spin shrink-0" size={18} /> :
                                status === "success" ? <CheckCircle className="shrink-0" size={18} /> :
                                    <AlertTriangle className="shrink-0" size={18} />}
                            <p className="text-xs font-bold leading-normal uppercase tracking-wider">{message}</p>
                        </div>
                    )}

                    <button
                        onClick={runSetup}
                        disabled={status === "loading"}
                        className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50"
                    >
                        {status === "loading" ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                        Datenbank Initialisieren
                    </button>

                    <div className="pt-4 border-t border-slate-50 flex justify-center italic">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                            Nach erfolgreichem Setup können Sie <br /> zum Dashboard zurückkehren.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
