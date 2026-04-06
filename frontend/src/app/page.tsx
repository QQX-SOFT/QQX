"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
    Truck, 
    Rocket, 
    ChevronRight, 
    BarChart3, 
    ShieldCheck, 
    Users, 
    Calendar,
    ArrowRight,
    Globe,
    Zap,
    Download,
    Banknote,
    Clock,
    Layout,
    Layers,
    Smartphone,
    MousePointer2
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[100vh] bg-gradient-to-b from-blue-900/10 via-slate-950 to-slate-900/20" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-2xl bg-black/40">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 active:scale-95 transition-transform cursor-pointer">
              <Truck size={24} className="text-white" />
            </div>
            <div className="flex flex-col -space-y-1">
                <span className="text-2xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">QQX</span>
                <span className="text-[8px] font-black tracking-[0.4em] text-blue-500 uppercase">Software</span>
            </div>
          </motion.div>

          <div className="hidden lg:flex items-center gap-12">
            {['Lösungen', 'Compliance', 'Über uns', 'Preise'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-blue-500 transition-all group-hover:w-full" />
                </a>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
             <Link href="/admin/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition">Login</Link>
             <Link href="/admin/signup" className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-2xl shadow-blue-500/10 active:scale-95">
                Kostenlos Starten
             </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-sm"
            >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                Revolution der Flottenverwaltung
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-7xl md:text-[11rem] font-black tracking-tighter leading-[0.8] uppercase italic"
            >
                Intelligent <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/10">Lieferbar.</span>
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-slate-400 text-lg md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto"
            >
                QQX ist die ultimative SaaS-Plattform für Logistik-Unternehmen. 
                Steuern Sie Ihre gesamte Flotte, automatisieren Sie Ihre Buchhaltung 
                und optimieren Sie Ihre vardiya-pläne – alles in einer radikal einfachen Oberfläche.
            </motion.p>

            <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.7 }}
                 className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10"
            >
                <Link href="/admin" className="px-12 py-6 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-3xl shadow-blue-600/30 flex items-center gap-4 group">
                    Dashboard Besuchen <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/driver/login" className="px-12 py-6 bg-slate-900 border border-white/10 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition flex items-center gap-4">
                    <Smartphone size={20} /> Fahrer-App
                </Link>
            </motion.div>
        </div>

        {/* Dashboard Preview Overlay */}
        <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1.2, ease: "circOut" }}
            className="max-w-6xl mx-auto mt-32 relative"
        >
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 rounded-[4rem] blur-[3rem] opacity-20" />
            <div className="relative rounded-[4rem] border border-white/10 p-4 bg-slate-900/50 backdrop-blur-3xl overflow-hidden shadow-2xl">
                <img 
                    src="/qqx_hero.png"
                    alt="QQX High End Interface"
                    className="w-full h-auto rounded-[3rem] shadow-black shadow-2xl"
                />
            </div>
        </motion.div>
      </section>

      {/* Stats Ticker */}
      <div className="py-12 border-y border-white/5 bg-slate-950 flex overflow-hidden">
        <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-20 whitespace-nowrap px-10 items-center"
        >
            {[1,2,3,4,5].map(i => (
                <div key={i} className="flex gap-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 flex items-center gap-4">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" /> +150.000 Lieferfarten mtl.
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 flex items-center gap-4">
                        <div className="w-1 h-1 bg-green-500 rounded-full" /> Echtzeit GISA Validierung
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 flex items-center gap-4">
                        <div className="w-1 h-1 bg-indigo-500 rounded-full" /> 100% DSGVO Konform
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 flex items-center gap-4">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" /> Multi-Tenant Altyapı
                    </span>
                </div>
            ))}
        </motion.div>
      </div>

      {/* Features Grid */}
      <section id="lösungen" className="py-40 px-6 max-w-7xl mx-auto">
        <header className="mb-32 max-w-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Der neue Standard</h2>
            <h3 className="text-6xl font-black tracking-tighter leading-none italic uppercase">
                Jedes Detail, <br />
                <span className="text-slate-500 font-medium">perfektioniert.</span>
            </h3>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
                { 
                    icon: <Download />, 
                    title: "Payroll Automatisierung", 
                    desc: "Keine manuellen Berechnungen mehr. Unsere Engine verarbeitet Excel-Reports und erstellt gesetzeskonforme Abrechnungen für alle Vertragstypen.",
                    color: "bg-blue-600"
                },
                { 
                    icon: <Calendar />, 
                    title: "Schicht-Management", 
                    desc: "Planen Sie hunderte von Fahrern in Sekunden. Geofencing-Integration stellt sicher, dass Fahrten nur in den richtigen Bereichen aktiviert werden.",
                    color: "bg-indigo-600"
                },
                { 
                    icon: <ShieldCheck />, 
                    title: "Rechtssicherheit", 
                    desc: "Integrierte Schnittstellen zur GISA- und UID-Prüfung. Automatisierte Dokumentenarchivierung für maximale Audit-Bereitschaft.",
                    color: "bg-green-600"
                },
                { 
                    icon: <Users />, 
                    title: "Fahrer-Self-Service", 
                    desc: "Über die QQX Mobile App können Fahrer ihre Schichten sehen, Arbeitszeiten erfassen ve ihre Abrechnungen direkt einsehen.",
                    color: "bg-blue-600"
                },
                { 
                    icon: <Layout />, 
                    title: "Tenant-Subdomains", 
                    desc: "Jedes Unternehmen erhält seine eigene Umgebung. Sicher getrennte Daten und individuelles Branding für jeden Mandanten.",
                    color: "bg-purple-600"
                },
                { 
                    icon: <BarChart3 />, 
                    title: "BI & Metriken", 
                    desc: "Echtzeit-Einblicke in die Performance Ihrer Flotte. Analysieren Sie KM-Kosten, Lieferzeiten ve Bruttomargen sofort.",
                    color: "bg-orange-600"
                },
            ].map((feature, i) => (
                <motion.div 
                    key={i}
                    variants={fadeIn}
                    initial="initial"
                    whileInView="whileInView"
                    className="p-12 bg-white/5 border border-white/5 rounded-[3rem] hover:bg-white/10 transition-all group flex flex-col justify-between"
                >
                    <div className="space-y-8">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform", feature.color)}>
                            {React.cloneElement(feature.icon as any, { size: 28 })}
                        </div>
                        <h4 className="text-2xl font-black italic uppercase italic">{feature.title}</h4>
                        <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
      </section>

      {/* Mobile App Showcase */}
      <section className="py-40 bg-white text-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                    <Smartphone size={32} />
                </div>
                <h3 className="text-7xl font-black tracking-tighter leading-[0.9] italic uppercase">
                    Die App <br />
                    <span className="text-blue-600 font-medium italic">für die Straße.</span>
                </h3>
                <p className="text-slate-600 text-xl font-medium leading-relaxed">
                    Einfachheit gewinnt. Unsere Fahrer-App ist so intuitiv, dass keine Schulung nötig ist. 
                    Schichtannahme met einem Klick, GPS-Präzision ve volltransparente 
                    Finanzübersichten für jeden Rider.
                </p>
                <div className="flex gap-4 pt-4">
                    <div className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 active:scale-95 transition cursor-pointer">
                        <div className="w-6 h-6 border-2 border-white/20 rounded-full flex items-center justify-center">A</div> Play Store
                    </div>
                    <div className="px-8 py-4 border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 active:scale-95 transition cursor-pointer">
                        <div className="w-6 h-6 border-2 border-slate-900/20 rounded-full flex items-center justify-center">i</div> App Store
                    </div>
                </div>
            </div>
            <div className="relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 blur-[150px] rounded-full" />
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-10"
                >
                    <img 
                        src="/qqx_mobile.png" 
                        alt="QQX Mobile App Mockup" 
                        className="w-full h-auto drop-shadow-[0_50px_50px_rgba(37,99,235,0.2)]"
                    />
                </motion.div>
            </div>
        </div>
      </section>

      {/* Compliance / Enterprise Section */}
      <section id="compliance" className="py-40 bg-slate-950 px-6">
        <div className="max-w-5xl mx-auto p-16 rounded-[4rem] bg-gradient-to-br from-slate-900 to-black border border-white/5 relative overflow-hidden text-center group">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="relative z-10 space-y-10">
                <div className="w-24 h-24 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl group-hover:rotate-12 transition-transform duration-700">
                    <ShieldCheck size={48} className="text-blue-500" />
                </div>
                <h3 className="text-4xl md:text-6xl font-black italic uppercase leading-none">
                    Austrian Business <br /> <span className="text-blue-500">Optimized.</span>
                </h3>
                <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                    Wir haben das System speziell für den österreichischen Markt entwickelt. 
                    Ob GISA-Meldungen, UID-Validierungen oder die Einhaltung der 
                    Arbeitszeitaufzeichnungs-Pflicht – QQX hält Ihnen den Rücken frei.
                </p>
                <div className="flex justify-center gap-12 pt-6 opacity-30">
                    <div className="text-xs font-black uppercase tracking-widest italic">WKO Konform</div>
                    <div className="text-xs font-black uppercase tracking-widest italic">GISA Integriert</div>
                    <div className="text-xs font-black uppercase tracking-widest italic">UID Check Ready</div>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="py-40 px-6 text-center bg-blue-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-950 transform translate-y-full rounded-t-[100%] group-hover:translate-y-0 transition-transform duration-1000 ease-in-out pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-12">
            <h3 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] uppercase italic text-white">
                Bereit für <br /> den Start?
            </h3>
            <p className="text-blue-100 text-lg md:text-2xl font-black uppercase tracking-widest">
                Skalieren Sie Ihre Flotte met QQX Soft.
            </p>
            <div className="flex justify-center pt-10">
                <Link href="/admin/signup" className="px-20 py-8 bg-white text-blue-600 rounded-[3rem] font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-4xl shadow-blue-950/20">
                    Demo Anfordern
                </Link>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 border-t border-white/5 bg-slate-950 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-20">
            <div className="col-span-1 lg:col-span-2 space-y-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <Truck size={24} className="text-white" />
                    </div>
                    <span className="text-3xl font-black uppercase italic tracking-tighter">QQX SOFT</span>
                </div>
                <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
                    Das fortschrittlichste Flottenmanagement-System für den modernen Liefermarkt. 
                    Entwickelt in Österreich, bereit für ganz Europa.
                </p>
                <div className="flex gap-6">
                    {['in', 'X', 'fb'].map(soc => (
                        <div key={soc} className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition cursor-pointer font-black grayscale hover:grayscale-0">
                            {soc}
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-10">
                <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Produkt</h5>
                <ul className="space-y-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <li className="hover:text-blue-500 cursor-pointer transition">Abrechnung</li>
                    <li className="hover:text-blue-500 cursor-pointer transition">Vardiya</li>
                    <li className="hover:text-blue-500 cursor-pointer transition">Driver App</li>
                    <li className="hover:text-blue-500 cursor-pointer transition">Analytik</li>
                </ul>
            </div>
            <div className="space-y-10">
                <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Rechtliches</h5>
                <ul className="space-y-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <li className="hover:text-blue-500 cursor-pointer transition">Datenschutz</li>
                    <li className="hover:text-blue-500 cursor-pointer transition">Impressum</li>
                    <li className="hover:text-blue-500 cursor-pointer transition">AGB</li>
                    <li className="hover:text-blue-500 cursor-pointer transition">Kontakt</li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto pt-32 mt-32 border-t border-white/5 flex flex-col md:flex-row justify-between gap-12">
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-700">© 2026 QQX SOFT DEVELOPMENT GROUP. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8 items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">System Status: Online</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
