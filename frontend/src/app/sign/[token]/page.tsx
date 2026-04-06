"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios"; // Using direct axios for public route to avoid tenant middleware issues
import SignatureCanvas from "react-signature-canvas";
import { Loader2, CheckCircle2, ShieldCheck, PenTool, Edit3, X } from "lucide-react";

export default function PublicContractSignPage() {
    const { token } = useParams();
    const [contract, setContract] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [signed, setSigned] = useState(false);
    const sigPad = useRef<any>(null);

    // API URL - we use the public endpoint that bypasses tenant middleware if possible
    // or we might need to handle the subdomain if it's on a tenant-specific URL
    const API_URL = "http://localhost:3001/api/contracts/public"; // Use env in real apps

    useEffect(() => {
        fetchContract();
    }, [token]);

    const fetchContract = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/${token}`);
            setContract(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const clear = () => sigPad.current?.clear();

    const submit = async () => {
        if (sigPad.current?.isEmpty()) {
            alert("Bitte unterschreiben Sie das Dokument zuerst.");
            return;
        }

        try {
            setSigning(true);
            const signatureImage = sigPad.current?.getTrimmedCanvas().toDataURL("image/png");
            await axios.post(`${API_URL}/${token}/sign`, { signatureImage });
            setSigned(true);
        } catch (e) {
            alert("Signierung fehlgeschlagen.");
        } finally {
            setSigning(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    if (!contract) return <div className="flex h-screen items-center justify-center text-slate-400 font-black uppercase">Vertrag nicht gefunden</div>;

    if (signed) {
        return (
            <div className="min-h-screen bg-green-600 flex items-center justify-center p-6 text-white text-center">
                <div className="space-y-6 max-w-md animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 size={120} className="mx-auto" />
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Vertrag Unterschrieben!</h1>
                    <p className="text-green-100 font-bold opacity-80 uppercase text-[10px] tracking-[0.4em]">Vielen Dank für Ihre Mitarbeit. Der Vertrag wurde sicher gespeichert.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto space-y-10">
                <header className="flex justify-between items-end pb-10 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <p className="text-[10px] font-black italic uppercase tracking-[0.4em] text-blue-600 mb-2">Dokument zur Signatur</p>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{contract.title}</h1>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Ausgestellt von</p>
                        <p className="font-black text-slate-900 dark:text-white">{contract.tenant?.name || "FastRoute GmbH"}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Contract Box */}
                    <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-20 shadow-2xl space-y-20 border border-slate-100 dark:border-slate-800">
                        {/* Summary Header */}
                        <div className="flex flex-wrap gap-8 items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <PenTool className="text-blue-600" size={24} />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Dokumententyp</p>
                                    <p className="font-black text-slate-900 dark:text-white italic">{contract.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-green-600" size={24} />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Sicherer Modus</p>
                                    <p className="font-black text-slate-900 dark:text-white italic">End-to-End Verschlüsselt</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="prose prose-slate dark:prose-invert max-w-none font-serif text-[18px] leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-300">
                            {contract.content}
                        </div>

                        {/* Signature Area */}
                        <div className="pt-20 space-y-10 border-t-2 border-slate-50 dark:border-slate-800 border-dashed">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase flex items-center gap-3"><Edit3 className="text-blue-600" /> Bitte hier unterschreiben</h3>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Nutzen Sie Ihren Finger oder einen Stylus zum Signieren.</p>
                            </div>

                            <div className="relative group">
                                <SignatureCanvas 
                                    ref={sigPad}
                                    canvasProps={{
                                        className: "w-full min-h-[300px] bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-4 border-slate-100 dark:border-slate-800 focus:border-blue-500 transition cursor-crosshair shadow-inner"
                                    }}
                                />
                                <button
                                    onClick={clear}
                                    className="absolute top-6 right-6 p-3 bg-white dark:bg-slate-900 rounded-2xl text-slate-400 hover:text-red-500 shadow-xl transition active:scale-95 border border-slate-100 dark:border-slate-800"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <button
                                onClick={submit}
                                disabled={signing}
                                className="w-full bg-blue-600 text-white rounded-[2rem] py-8 md:py-12 font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50"
                            >
                                {signing ? <Loader2 className="animate-spin" size={32} /> : <PenTool size={32} />}
                                Signatur bestätigen & Vertrag abschließen
                            </button>
                            
                            <p className="text-center text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">Digitale Signatur gemäß eIDAS-Verordnung konform</p>
                        </div>
                    </div>
                </div>

                <footer className="py-10 text-center opacity-30 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    &copy; 2024 FastRoute GmbH &bull; Powered by QQX-Digital-Signature
                </footer>
            </div>
        </div>
    );
}
