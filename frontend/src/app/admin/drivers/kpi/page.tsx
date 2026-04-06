"use client";

import React, { useState, useEffect } from "react";
import { 
    Loader2, 
    Upload, 
    FileText, 
    TrendingUp, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    Download,
    Search,
    Filter,
    ArrowUpRight,
    Coins,
    BarChart3,
    Trash2,
    Settings2,
    X
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Reorder, AnimatePresence } from "framer-motion";
import { 
    Tabs, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { DateRange } from "react-day-picker";

export default function AdminKpiPage() {
    const [kpis, setKpis] = useState<any[]>([]);
    const [uploads, setUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [visibleColumns, setVisibleColumns] = useState<string[]>([
        "rider_id", 
        "city_name", 
        "created_date_local", 
        "completed_orders", 
        "hours_worked", 
        "rider_name"
    ]);
    const [filterType, setFilterType] = useState<"week" | "month" | "range">("month");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    const allColumnOptions = [
        { id: "rider_id", label: "Fahrer-ID" },
        { id: "city_name", label: "Stadtname" },
        { id: "created_date_local", label: "Erstellungsdatum lokal" },
        { id: "completed_orders", label: "Abgeschlossene Bestellungen" },
        { id: "cancellations_", label: "Stornierungsquote %" },
        { id: "cancelled_deliveries", label: "Stornierte Lieferungen" },
        { id: "cancelled_deliveries_after_pickup", label: "Stornierungen nach Abholung" },
        { id: "utr", label: "Auslastungsrate" },
        { id: "idle_time_", label: "Leerlaufzeit %" },
        { id: "avg_delivery_time_mins", label: "Ø Lieferzeit (min)" },
        { id: "avg_to_vendor_time_mins", label: "Ø Fahrzeit Händler (min)" },
        { id: "avg_at_vendor_time_mins", label: "Ø Wartezeit Händler (min)" },
        { id: "avg_to_customer_time_mins", label: "Ø Fahrzeit Kunde (min)" },
        { id: "avg_at_customer_time_mins", label: "Ø Zeit Kunde (min)" },
        { id: "avg_pickup_distance_in_meters", label: "Ø Abholentfernung (m)" },
        { id: "avg_dropoff_distance_in_meters", label: "Ø Lieferentfernung (m)" },
        { id: "acceptance_rate_", label: "Annahmequote %" },
        { id: "undisp_aft_acc", label: "Nicht disp. n. Annahme" },
        { id: "plannedvsactual_", label: "Geplant vs. Tatsächlich %" },
        { id: "hours_worked", label: "Gearbeitete Std" },
        { id: "shifts_done", label: "Abgeschl. Schichten" },
        { id: "late_shifts_5min", label: "Verspätete Schichten > 5m" },
        { id: "late_shifts_5min_", label: "Verspätungsquote > 5m %" },
        { id: "no_shows", label: "Nichterscheinen" },
        { id: "unexcused_no_shows", label: "Unentschuldigtes Nichtersch." },
        { id: "break_mins", label: "Pausenminuten" },
        { id: "temp_not_working_mins", label: "Vorübergehende Ausfallzeit" },
        { id: "weekend_shifts", label: "Wochenendschichten" },
        { id: "manual_undispatched", label: "Manuell nicht disp." },
        { id: "contract_name", label: "Vertragsname" },
        { id: "rider_name", label: "Fahrername" },
        { id: "notified_orders", label: "Benachrichtigte Best." },
        { id: "accepted_orders", label: "Angenommene Best." },
        { id: "comp_notified_rate", label: "Abschl. Benachr.-Rate" },
        { id: "count_over_25kmh", label: "Anzahl > 25 km/h" },
        { id: "count_under_25kmh", label: "Anzahl < 25 km/h" },
        { id: "kmh_avg", label: "Ø KM/H" },
        { id: "count_dispatch_contact", label: "Disponenten-Kontakte" },
        { id: "undispatch_request_accident_after_accepted", label: "Disp.-Aufhebung (Unfall)" },
        { id: "undispatch_request_equipment_issue_after_accepted", label: "Disp.-Aufhebung (Gerät)" },
        { id: "unable_to_find_cancellations", label: "Storn. (Adr. nicht gef.)" },
        { id: "order_hijacked_cancellations", label: "Storn. (Übernommen)" },
        { id: "courier_accident_cancellations", label: "Storn. (Unfall)" },
        { id: "spilled_order_cancellations", label: "Storn. (Verschüttet)" },
        { id: "never_delivered_cancellations", label: "Storn. (Nie geliefert)" },
        { id: "isoweek", label: "ISO-Woche (KW)" }
    ];

    const toggleColumn = (id: string) => {
        setVisibleColumns(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const fetchKpis = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filterType === "week" && selectedWeek) {
                params.append("week", selectedWeek);
            } else if (filterType === "month" && selectedMonth && selectedYear) {
                params.append("month", selectedMonth);
                params.append("year", selectedYear);
            } else if (filterType === "range" && dateRange?.from && dateRange?.to) {
                params.append("startDate", dateRange.from.toISOString());
                params.append("endDate", dateRange.to.toISOString());
            }
            
            const { data } = await api.get(`/kpis?${params.toString()}`);
            setKpis(data);
            
            const { data: uploadData } = await api.get('/kpis/uploads');
            setUploads(uploadData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKpis();
    }, [selectedWeek, selectedMonth, selectedYear, filterType, dateRange]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const { data } = await api.post("/kpis/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert(`Erfolgreich importiert: ${data.recordCount} Datensätze für Woche ${data.isoweek}`);
            fetchKpis();
        } catch (e: any) {
            const errorMsg = e.response?.data?.error || "Fehler beim Hochladen";
            alert(errorMsg);
            console.error("Upload error", e);
        } finally {
            setUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    const handleDeleteUpload = async (id: string) => {
        if (!confirm("Möchten Sie diesen Upload und ALLE damit verbundenen Daten wirklich löschen?")) return;
        try {
            await api.delete(`/kpis/uploads/${id}`);
            fetchKpis();
        } catch (e) {
            alert("Löschvorgang fehlgeschlagen.");
        }
    };
    const filteredKpis = kpis.filter(k => 
        k.riderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.riderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.driver?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.driver?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedKpis = React.useMemo(() => {
        if (filterType === "week" && selectedWeek) {
            return filteredKpis;
        } else {
            const map = new Map<string, any>();
            filteredKpis.forEach(k => {
                const key = k.riderId || k.riderName || k.id;
                if (!map.has(key)) {
                    // Deep copy
                    const clone = { ...k, metrics: { ...(k.metrics || {}) } };
                    map.set(key, clone);
                } else {
                    const existing = map.get(key);
                    
                    // aggregate fields
                    // aggregate numeric fields
                    Object.keys(k).forEach(field => {
                        if (typeof k[field] === 'number' && field !== 'id') {
                            existing[field] = (existing[field] || 0) + k[field];
                        }
                    });
                    
                    if (k.metrics) {
                        Object.keys(k.metrics).forEach(field => {
                            if (typeof k.metrics[field] === 'number') {
                                existing.metrics[field] = (existing.metrics[field] || 0) + k.metrics[field];
                            }
                        });
                    }

                    // Ensure non-numeric fields from DB (Prisma camelCase) are also accessible via snake_case
                    existing.rider_id = existing.riderId;
                    existing.city_name = existing.cityName;
                    existing.created_date_local = existing.dateLocal;
                    existing.completed_orders = existing.deliveredOrders;
                    existing.hours_worked = existing.hoursWorked;
                    existing.rider_name = existing.riderName;
                }
            });
            return Array.from(map.values());
        }
    }, [filteredKpis, selectedWeek]);

    const totalOrders = groupedKpis.reduce((acc, curr) => acc + (curr.deliveredOrders || curr.completed_orders || curr.metrics?.completed_orders || 0), 0);
    const totalHours = groupedKpis.reduce((acc, curr) => acc + (curr.hoursWorked || curr.hours_worked || curr.metrics?.hours_worked || 0), 0);
    const avgUtr = groupedKpis.length ? (groupedKpis.reduce((acc, curr) => acc + (curr.utr || curr.metrics?.utr || 0), 0) / groupedKpis.length).toFixed(2) : 0;

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Fahrer-KPI & Analyse</h1>
                    <p className="text-slate-500 font-medium font-sans">Importieren und analysieren Sie Rider-Reports für Gehaltsabrechnungen.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/admin/drivers/kpi/validation" className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:border-blue-600 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-100/10">
                        <BarChart3 size={16} />
                        DEBUG & VALIDIERUNG
                    </Link>
                    <label className="cursor-pointer">
                        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} disabled={uploading} />
                        <div className={cn(
                            "px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10",
                            uploading && "opacity-50 pointer-events-none"
                        )}>
                            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                            {uploading ? "WIRD IMPORTIERT..." : "REPORT HOCHLADEN"}
                        </div>
                    </label>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={<CheckCircle2 className="text-green-500" />} label="GELIEFERTE BESTELLUNGEN" value={totalOrders} color="green" />
                <StatCard icon={<Clock className="text-blue-500" />} label="GESAMTSTUNDEN (ONLINE)" value={totalHours.toFixed(1)} color="blue" />
                <StatCard icon={<TrendingUp className="text-purple-500" />} label="Ø UTR (BESTELLUNGEN/H)" value={avgUtr} color="purple" />
                <StatCard icon={<Coins className="text-amber-500" />} label="BEREITS GEZAHLT (WALLET)" value="0.00 €" color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filter */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Analyse-Modus</label>
                            <Tabs value={filterType} onValueChange={(v: any) => setFilterType(v)} className="w-full">
                                <TabsList className="grid grid-cols-3 bg-slate-50 p-1 rounded-xl">
                                    <TabsTrigger value="week" className="text-[10px] font-bold">Woche</TabsTrigger>
                                    <TabsTrigger value="month" className="text-[10px] font-bold">Monat</TabsTrigger>
                                    <TabsTrigger value="range" className="text-[10px] font-bold">Bereich</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {filterType === "month" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monat wählen</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <select 
                                        className="bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                        value={selectedMonth}
                                        onChange={e => setSelectedMonth(e.target.value)}
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString('de-DE', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                    <select 
                                        className="bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                        value={selectedYear}
                                        onChange={e => setSelectedYear(e.target.value)}
                                    >
                                        {[2024, 2025, 2026].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {filterType === "week" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Woche wählen</label>
                                <select 
                                    className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold"
                                    value={selectedWeek}
                                    onChange={e => setSelectedWeek(e.target.value)}
                                >
                                    <option value="">Woche auswählen</option>
                                    {[...new Set(uploads.map(u => u.isoweek))].filter(Boolean).sort((a: any, b: any) => b - a).map(w => (
                                        <option key={w} value={w}>KW {w}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {filterType === "range" && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Individueller Bereich</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-bold bg-slate-50 border-slate-100 h-14 rounded-2xl",
                                                !dateRange && "text-slate-400"
                                            )}
                                        >
                                            <Clock className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, "dd.MM.yy")} -{" "}
                                                        {format(dateRange.to, "dd.MM.yy")}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "dd.MM.yy")
                                                )
                                            ) : (
                                                <span>Datum wählen</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={1}
                                            locale={de}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-2">Letzte Uploads</h4>
                            <div className="space-y-3">
                                {uploads.slice(0, 10).map(u => (
                                    <div key={u.id} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-[10px] font-bold text-slate-900 truncate flex-1">{u.filename}</p>
                                            <button 
                                                onClick={() => handleDeleteUpload(u.id)}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">Woche {u.isoweek}</span>
                                            <span className="text-[8px] font-medium text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={async () => {
                                if (confirm("ACHTUNG: ALLE KPI-Daten für diesen Mandanten werden unwiderruflich gelöscht. Fortfahren?")) {
                                    await api.delete('/kpis/clear');
                                    fetchKpis();
                                }
                            }}
                            className="w-full mt-6 py-4 border-2 border-dashed border-red-100 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:border-red-200 transition-all"
                        >
                            DATEN ZURÜCKSETZEN
                        </button>
                    </div>
                </aside>

                {/* Main Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Rider Performance Liste</h3>
                            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                {/* Column Selector */}
                                <button 
                                    onClick={() => setIsColumnModalOpen(true)}
                                    className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all mr-4 shadow-sm"
                                >
                                    <Settings2 size={16} />
                                    SPALTEN ANPASSEN
                                </button>
                                <div className="relative flex-1 md:flex-initial">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input 
                                        placeholder="Name veya Rider ID..." 
                                        className="pl-12 pr-6 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:border-blue-500 font-bold text-sm w-full md:w-[300px]" 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        list="rider-suggestions"
                                    />
                                    <datalist id="rider-suggestions">
                                        {[...new Set(kpis.map(k => k.riderName))].map(name => (
                                            <option key={name} value={name} />
                                        ))}
                                        {[...new Set(kpis.map(k => k.riderId))].map(id => (
                                            <option key={id} value={id} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        {visibleColumns.map(colId => (
                                            <th key={colId} className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                {allColumnOptions.find(c => c.id === colId)?.label}
                                            </th>
                                        ))}
                                        <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right border-b border-slate-100">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={visibleColumns.length + 1} className="py-20 text-center">
                                                <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                                            </td>
                                        </tr>
                                    ) : groupedKpis.length === 0 ? (
                                        <tr>
                                            <td colSpan={visibleColumns.length + 1} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                Keine passenden Daten gefunden.
                                            </td>
                                        </tr>
                                    ) : groupedKpis.map((k) => (
                                        <tr key={k.id || Math.random()} className="hover:bg-slate-50/50 transition-colors group">
                                            {visibleColumns.map(colId => {
                                                const prismaFields: any = {
                                                    "rider_id": "riderId",
                                                    "city_name": "cityName",
                                                    "created_date_local": "dateLocal",
                                                    "completed_orders": "deliveredOrders",
                                                    "hours_worked": "hoursWorked",
                                                    "rider_name": "riderName"
                                                };
                                                const pKey = prismaFields[colId] || colId;
                                                const val = k[pKey] ?? k[colId] ?? k.metrics?.[colId] ?? "-";
                                                
                                                // Specific formatting for certain columns
                                                if (colId === "rider_name") {
                                                    return (
                                                        <td key={colId} className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-slate-900 text-xs truncate max-w-[150px]">
                                                                    {k.driver ? `${k.driver.firstName} ${k.driver.lastName}` : (k.riderName || val)}
                                                                </span>
                                                                <span className="text-[8px] font-medium text-slate-400 italic">({k.riderName || val})</span>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                if (colId === "created_date_local") {
                                                    return (
                                                        <td key={colId} className="px-6 py-4 text-xs font-bold text-slate-400">
                                                            {val !== "-" ? new Date(val).toLocaleDateString('de-DE') : "-"}
                                                        </td>
                                                    );
                                                }

                                                const isNumeric = typeof val === 'number';

                                                return (
                                                    <td key={colId} className="px-6 py-4">
                                                        <span className={cn(
                                                            "text-xs font-bold",
                                                            isNumeric ? "text-blue-600" : "text-slate-600"
                                                        )}>
                                                            {isNumeric ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition shadow-sm group-hover:scale-110">
                                                    <Coins size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {isColumnModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Angezeigte Spalten</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">Wählen Sie die Spalten aus, die in der Tabelle angezeigt werden sollen.</p>
                            </div>
                            <button 
                                onClick={() => setIsColumnModalOpen(false)}
                                className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                            <section>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Reihenfolge anpassen (Drag & Drop)</h4>
                                <Reorder.Group axis="y" values={visibleColumns} onReorder={setVisibleColumns} className="space-y-2">
                                    {visibleColumns.map(colId => (
                                        <Reorder.Item 
                                            key={colId} 
                                            value={colId}
                                            className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl cursor-grab active:cursor-grabbing border border-white/10 shadow-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Settings2 size={14} className="text-slate-500" />
                                                <span className="text-xs font-black uppercase tracking-widest">
                                                    {allColumnOptions.find(c => c.id === colId)?.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleColumn(colId);
                                                    }}
                                                    className="p-1 hover:text-red-400"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </section>

                            <section>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Weitere Spalten hinzufügen</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {allColumnOptions.filter(col => !visibleColumns.includes(col.id)).map(col => {
                                        return (
                                            <label 
                                                key={col.id} 
                                                className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer border-2 border-slate-100 hover:border-slate-300 transition-all"
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    checked={false} 
                                                    onChange={() => toggleColumn(col.id)}
                                                    className="mt-1 accent-slate-900 w-4 h-4 rounded"
                                                />
                                                <span className="text-xs font-bold leading-tight text-slate-500">{col.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsColumnModalOpen(false)} 
                                className="px-8 py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10"
                            >
                                SCHLIESSEN & ÜBERNEHMEN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    const colorClasses: any = {
        green: "bg-green-50",
        blue: "bg-blue-50",
        purple: "bg-purple-50",
        amber: "bg-amber-50"
    };
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4 hover:scale-[1.02] transition-all cursor-default">
            <div className={cn("inline-flex p-3 rounded-2xl", colorClasses[color])}>
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{value}</span>
                </div>
            </div>
        </div>
    );
}
