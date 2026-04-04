"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Terminal, Globe, Shield, Activity, RefreshCw, AlertTriangle } from "lucide-react";

export default function DebugPage() {
    const [apiUrl, setApiUrl] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // NEXT_PUBLIC_API_URL'i göster
        setApiUrl(process.env.NEXT_PUBLIC_API_URL || "AYARLANMAMIŞ (Varsayılan: localhost:3001/api)");
    }, []);

    const addLog = (service: string, status: "success" | "error" | "pending", message: string, details?: any) => {
        setResults(prev => [{
            id: Date.now(),
            service,
            status,
            message,
            details,
            time: new Date().toLocaleTimeString()
        }, ...prev]);
    };

    const runTests = async () => {
        setLoading(true);
        setResults([]);
        
        const testUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const cleanUrl = testUrl.endsWith("/") ? testUrl.slice(0, -1) : testUrl;

        addLog("SYSTEM", "pending", `Test başlatılıyor: ${cleanUrl}`);

        // 1. HEALTH CHECK
        try {
            addLog("API", "pending", "/health kontrol ediliyor...");
            const res = await axios.get(`${cleanUrl}/health`, { timeout: 5000 });
            addLog("API", "success", "/health bağlantısı başarılı!", res.data);
        } catch (err: any) {
            addLog("API", "error", "/health bağlantısı başarısız!", {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message,
                hint: err.message === 'Network Error' ? "CORS engeline takılmış olabilir veya URL yanlış." : "Backend'e ulaşıldı ama hata döndü."
            });
        }

        // 2. AUTH ROUTE CHECK (POST)
        try {
            addLog("AUTH", "pending", "/auth/login (OPTIONS/POST) kontrol ediliyor...");
            await axios.post(`${cleanUrl}/auth/login`, { email: "test@test.com", password: "123" }, { timeout: 5000 });
            // Not: 401 dönmesi bile bağlantının başarılı olduğunu kanıtlar
        } catch (err: any) {
            if (err.response) {
                addLog("AUTH", "success", `Auth servisine ulaşıldı (HTTP ${err.response.status})`, err.response.data);
            } else {
                addLog("AUTH", "error", "Auth servisine bağlanılamadı!", {
                    message: err.message,
                    hint: "CORS veya Yanlış URL."
                });
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-mono">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Terminal className="text-blue-500" size={32} />
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">QQX DIAGNOSTIC TOOL</h1>
                        <p className="text-slate-500 text-sm">Backend Bağlantı ve CORS Test Paneli</p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8 shadow-2xl shadow-blue-500/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 text-sm">
                            < Globe size={18} className="text-slate-500" />
                            <span className="text-slate-400">Aktif API URL:</span>
                            <span className="text-blue-400 font-bold">{apiUrl}</span>
                        </div>
                        <button 
                            onClick={runTests}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Activity size={20} />}
                            Testi Başlat
                        </button>
                    </div>

                    <div className="space-y-4">
                        {results.length === 0 && (
                            <div className="py-12 text-center text-slate-600 italic">
                                Henüz taranmadı. Başlat butonuna basın.
                            </div>
                        )}
                        {results.map((res) => (
                            <div 
                                key={res.id} 
                                className={`border-l-4 p-4 rounded-r-2xl bg-slate-800/50 ${
                                    res.status === 'success' ? 'border-emerald-500' : 
                                    res.status === 'error' ? 'border-red-500' : 'border-blue-500 animate-pulse'
                                }`}
                            >
                                <div className="flex justify-between mb-1 text-xs">
                                    <span className="font-bold uppercase tracking-widest">{res.service}</span>
                                    <span className="text-slate-500">{res.time}</span>
                                </div>
                                <div className="text-sm font-bold text-white mb-2">{res.message}</div>
                                {res.details && (
                                    <pre className="text-[11px] p-4 bg-slate-950 rounded-xl overflow-x-auto text-blue-300 border border-white/5">
                                        {JSON.stringify(res.details, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex gap-4 text-amber-200 text-sm">
                    <AlertTriangle className="shrink-0" />
                    <div>
                        <p className="font-bold mb-1">CORS İpucu:</p>
                        <p className="text-amber-200/70">Eğer test "Network Error" veriyorsa, bu genellikle FRONTEND'in ayarlarındaki API adresinin (`NEXT_PUBLIC_API_URL`) Vercel'deki Backend projesinin linkiyle uyuşmadığını gösterir. Vercel Dashboard'da bu değişkenin sonuna <strong>/api</strong> eklediğinizden emin olun.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
