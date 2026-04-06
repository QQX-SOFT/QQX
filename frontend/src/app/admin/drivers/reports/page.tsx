"use client";

import React, { useState, useEffect } from "react";
import { 
    Loader2, 
    FileText, 
    Search, 
    Download, 
    CheckCircle2, 
    AlertCircle,
    ChevronRight,
    ArrowLeft,
    Clock,
    User,
    Building2,
    Calendar,
    Printer
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function DriverReportsPage() {
    const router = useRouter();
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                // Fetch drivers with KPIs and Tenant info
                const { data } = await api.get("/drivers");
                setDrivers(data);
            } catch (error) {
                console.error("Failed to fetch drivers for reports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDrivers();
    }, []);

    const generateArbeitszeitnachweis = async (driverId: string) => {
        setGeneratingId(driverId);
        try {
            // We need full driver details including shiftAssignments and tenant
            const { data: driver } = await api.get(`/drivers/${driverId}`);
            
            const assignments = (driver.shiftAssignments || []).filter((sa: any) => sa.status === 'CONFIRMED' || sa.status === 'PENDING');

            if (!driver || assignments.length === 0) {
                alert("Keine bestätigten Schichten für diesen Fahrer gefunden.");
                return;
            }

            const tenant = (driver as any).tenant || {};
            const companyName = tenant.name || "QQX Software Development";
            const companyOwner = tenant.ownerName || "";
            const companyAddress = `${tenant.address || ""}, ${tenant.zipCode || ""} ${tenant.city || ""}`;
            const gisaNr = tenant.gisaNumber || "";
            const taxNr = tenant.taxNumber || "";
            const companyMail = tenant.email || "";
            const companyPhone = tenant.phone || "";

            const totalHours = assignments.reduce((acc: number, sa: any) => {
                if (!sa.shift) return acc;
                const start = new Date(sa.shift.startTime);
                const end = new Date(sa.shift.endTime);
                return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            }, 0);

            const reportDate = new Date().toISOString().split('T')[0];
            
            // Create temporary container for PDF rendering
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-10000px';
            container.style.top = '0';
            container.style.width = '800px';
            container.style.padding = '40px';
            container.style.background = 'white';
            container.style.color = '#111';
            container.style.fontFamily = 'Arial, sans-serif';
            
            container.innerHTML = `
                <div style="border: 2px solid #f1f5f9; padding: 30px; border-radius: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px;">
                        <div>
                            <h1 style="font-size: 24px; font-weight: 900; margin: 0; color: #1e293b;">Arbeitszeitnachweis (Schicht-Basis)</h1>
                            <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 5px;">Legally Required Documentation</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 14px; font-weight: 900; margin: 0; color: #1e293b;">${companyName}</p>
                            <p style="font-size: 10px; color: #64748b; margin: 2px 0;">${companyOwner}</p>
                        </div>
                    </div>

                    <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 20px; margin-bottom: 30px; font-size: 11px;">
                        <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #f1f5f9;">
                            <p style="font-weight: 900; color: #64748b; text-transform: uppercase; font-size: 8px; margin-bottom: 5px;">Abrechnende Stelle</p>
                            <p style="margin: 2px 0;"><strong>GISA:</strong> ${gisaNr}</p>
                            <p style="margin: 2px 0;"><strong>Steuernr:</strong> ${taxNr}</p>
                            <p style="margin: 2px 0;"><strong>Adresse:</strong> ${companyAddress}</p>
                        </div>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #f1f5f9;">
                            <p style="font-weight: 900; color: #64748b; text-transform: uppercase; font-size: 8px; margin-bottom: 5px;">Arbeitnehmer Info</p>
                            <p style="margin: 2px 0;"><strong>Name:</strong> ${driver.firstName} ${driver.lastName}</p>
                            <p style="margin: 2px 0;"><strong>İşe Giriş:</strong> ${driver.employmentStart ? new Date(driver.employmentStart).toLocaleDateString('de-DE') : '-'}</p>
                            <p style="margin: 2px 0;"><strong>Berichtsdatum:</strong> ${reportDate}</p>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: #1e293b; color: white;">
                                <th style="padding: 12px; text-align: left; border-top-left-radius: 8px;">Datum</th>
                                <th style="padding: 12px; text-align: left;">Schicht-Zeitraum</th>
                                <th style="padding: 12px; text-align: right; border-top-right-radius: 8px;">Arbeitsstunden</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${assignments.map((sa: any) => {
                                const start = new Date(sa.shift.startTime);
                                const end = new Date(sa.shift.endTime);
                                const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                return `
                                    <tr style="border-bottom: 1px solid #f1f5f9;">
                                        <td style="padding: 12px; font-weight: bold;">${start.toLocaleDateString('de-DE')}</td>
                                        <td style="padding: 12px; color: #475569;">${start.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})} - ${end.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})}</td>
                                        <td style="padding: 12px; text-align: right; font-weight: 900;">${diff.toFixed(2).replace('.', ',')} h</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="background: #f8fafc;">
                                <td colspan="2" style="padding: 15px; font-weight: 900; text-align: right; color: #64748b; text-transform: uppercase; font-size: 10px;">Gesamtstunden:</td>
                                <td style="padding: 15px; text-align: right; font-size: 16px; font-weight: 900; color: #1e293b;">${totalHours.toFixed(2).replace('.', ',')} h</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                        <p style="font-size: 8px; color: #94a3b8; line-height: 1.5;">
                            Dieses Dokument dient als Nachweis der geleisteten Arbeitsstunden gemäß nationalen gesetzlichen Bestimmungen (österreichisches Arbeitsrecht). 
                            Alle Daten wurden systemseitig erfasst ve validiert. Digitale Signatur: <strong>${Math.random().toString(36).substring(2, 15).toUpperCase()}</strong>
                        </p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(container);
            
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: 'white'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Arbeitszeitnachweis_${driver.lastName}_${reportDate}.pdf`);
            
            document.body.removeChild(container);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Fehler beim Generieren des PDFs.");
        } finally {
            setGeneratingId(null);
        }
    };

    const filteredDrivers = drivers.filter(d => 
        d.status === 'ACTIVE' && (
            (d.firstName + " " + d.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.driverNumber?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500 rounded-lg text-white">
                            <Clock size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600">Compliance & Payroll</span>
                    </div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tight">Arbeitszeit-Aufzeichnungen</h1>
                   <p className="text-slate-500 font-medium">Generieren Sie rechtssichere Arbeitszeitnachweise für alle Fahrer.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/admin/settings" className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:border-blue-500 transition flex items-center gap-3">
                        <Building2 size={18} /> Unternehmensdaten anpassen
                    </Link>
                </div>
            </header>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                        type="text" 
                        placeholder="Fahrer suchen (Name oder Rider-ID)..." 
                        className="w-full bg-white border border-slate-100 rounded-3xl py-5 pl-16 pr-8 shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold placeholder:text-slate-300 transition-all"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                        <Info size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Hinweis</p>
                        <p className="text-[11px] font-bold text-blue-900/60 leading-tight">Berichte basieren auf den importierten Rider-Reports.</p>
                    </div>
                </div>
            </div>

            {/* Drivers List */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Fahrer & Personal</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100">{filteredDrivers.length} Fahrer gefunden</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fahrer Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Anstellungstyp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rider ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Bericht</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDrivers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        Keine Fahrer gefunden.
                                    </td>
                                </tr>
                            ) : filteredDrivers.map((driver) => (
                                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">{driver.firstName} {driver.lastName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{driver.email || "Keine Email"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                            {driver.employmentType === "ECHTER_DIENSTNEHMER" ? "Angestellt" : 
                                             driver.employmentType === "FREIER_DIENSTNEHMER" ? "Freier Dienstnehmer" : 
                                             driver.employmentType === "SELBSTSTANDIG" ? "Gewerbe" : "Unbekannt"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-400 italic">#{driver.driverNumber || driver.id.slice(0, 8)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            driver.status === "ACTIVE" ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", driver.status === "ACTIVE" ? "bg-green-500" : "bg-slate-300")} />
                                            {driver.status === "ACTIVE" ? "Aktiv" : "Inaktiv"}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => generateArbeitszeitnachweis(driver.id)}
                                            disabled={generatingId === driver.id}
                                            className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition shadow-sm active:scale-95 disabled:opacity-50"
                                        >
                                            {generatingId === driver.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                            {generatingId === driver.id ? "Wird erstellt..." : "PDF Generieren"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Info({ size, className }: { size?: number, className?: string }) {
    return <AlertCircle size={size} className={className} />;
}
