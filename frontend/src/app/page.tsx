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
    Banknote
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[100vh] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Truck size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">QQX</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition">Features</a>
            <a href="#compliance" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition">Compliance</a>
            <a href="#about" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition">Über uns</a>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/admin/login" className="text-xs font-black uppercase tracking-widest text-white hover:text-blue-400 transition">Login</Link>
             <Link href="/admin/signup" className="px-6 py-3 bg-blue-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-500/10 active:scale-95">
                Kostenlos testen
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
                initial="initial"
                animate="animate"
                variants={fadeIn}
                className="space-y-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <Zap size={14} />
                    Next Gen Fleet Architecture
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                    Die Zukunft der <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 italic">Lieferlogistik.</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                    QQX ist das hochmoderne Betriebssystem für Ihre gesamte Flottenverwaltung. 
                    Von der automatisierten Lohnabrechnung bis zum EU-konformen GISA-Check.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                    <Link href="/admin" className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center gap-3">
                        Dashboard öffnen <ArrowRight size={18} />
                    </Link>
                    <Link href="/driver/login" className="px-10 py-5 bg-slate-900 border border-white/5 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:border-white/20 transition flex items-center gap-3">
                        Fahrer-App
                    </Link>
                </div>
                <div className="flex items-center gap-8 pt-8">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">+1.200 Fahrer bereits im System</p>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur-2xl opacity-20" />
                <div className="relative rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                    <img 
                        src="/qqx_hero.png"
                        alt="QQX Dashboard Preview"
                        className="w-full h-auto"
                    />
                </div>
                {/* Floating UI Element */}
                <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 -left-10 bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-3xl hidden md:block"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 text-green-400 rounded-2xl">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase text-slate-500">Compliance Status</p>
                            <p className="text-xs font-black">GISA: Validiert</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Ihre Performance Basis</h2>
                <h3 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase">Die QQX Core Features</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1: Accounting */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                        <div className="p-4 bg-blue-600/10 text-blue-500 w-fit rounded-3xl">
                            <BarChart3 size={32} />
                        </div>
                        <h4 className="text-3xl font-black italic uppercase">Automatisierte Lohnabrechnung</h4>
                        <p className="text-slate-500 font-medium max-w-md">
                            Laden Sie Ihre wöchentlichen Berichte hoch und QQX berechnet automatisch Löhne, 
                            KM-Geld und Provisionen für alle Anstellungsmodelle.
                        </p>
                        <ul className="space-y-3 pt-4">
                            {["Brutto/Netto Berechnungen", "PDF-Automatisierung", "KM-Geld Optimierung"].map(f => (
                                <li key={f} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="absolute bottom-0 right-0 opacity-10 blur-xl group-hover:opacity-20 transition duration-700">
                        <Banknote size={200} />
                    </div>
                </div>

                {/* Card 2: Shifts */}
                <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="p-4 bg-indigo-600/10 text-indigo-500 w-fit rounded-3xl">
                            <Calendar size={32} />
                        </div>
                        <h4 className="text-3xl font-black italic uppercase italic">Vardiya Planı</h4>
                        <p className="text-slate-500 font-medium">Bölgelere göre akıllı vardiya dağıtımı ve gerçek zamanlı takip.</p>
                    </div>
                    <Link href="/admin/shifts" className="mt-10 text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2 group">
                        Mehr erfahren <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                    </Link>
                </div>

                {/* Card 3: Drivers */}
                <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 space-y-6">
                    <div className="p-4 bg-green-600/10 text-green-500 w-fit rounded-3xl">
                        <Users size={32} />
                    </div>
                    <h4 className="text-2xl font-black italic uppercase">Rider Management</h4>
                    <p className="text-slate-500 text-sm font-medium">Zentrale Datenbank für hunderte von Fahrerprofilen incl. Dokumenten-Archiv.</p>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-green-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">85% Compliance Score erreicht</p>
                </div>

                {/* Card 4: Compliance */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 space-y-6">
                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Official Compliance Check
                        </div>
                        <h4 className="text-4xl font-black italic uppercase leading-none">Bereit für Österreich.</h4>
                        <p className="text-white/70 font-medium">Integrierte UID- und GISA-Prüfung für maximale Rechtssicherheit bei jedem neuen Mandanten.</p>
                    </div>
                    <div className="w-full md:w-fit p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 text-center">
                        <Globe size={48} className="mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest text-white/50">Standort</p>
                        <p className="text-xl font-black italic uppercase">Wien, AT</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section id="about" className="py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center italic">
            <h5 className="text-2xl md:text-4xl font-black tracking-tight leading-relaxed">
                "QQX hat unsere Abrechnungsprozesse von 3 Tagen auf 30 Minuten verkürzt. Es ist das einzige Tool, das die österreichische Gesetzgebung wirklich versteht."
            </h5>
            <div className="mt-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-800 rounded-full border border-white/10" />
                <p className="text-xs font-black uppercase tracking-widest">Markus Ebner</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fleet Operations Manager</p>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Truck size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-black uppercase italic">QQX</span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2026 QQX SOFT. ALL RIGHTS RESERVED.</p>
            </div>
            <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <a href="#" className="hover:text-white transition">Privacy</a>
                <a href="#" className="hover:text-white transition">Terms</a>
                <a href="#" className="hover:text-white transition">Impressum</a>
            </div>
            <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center hover:text-blue-500 cursor-pointer transition">
                    <span className="font-black">in</span>
                </div>
                <div className="w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center hover:text-blue-500 cursor-pointer transition">
                    <span className="font-black">X</span>
                </div>
            </div>
        </div>
      </footer>

      {/* Inject Hero Image with script to handle potential path complexity */}
      <script dangerouslySetInnerHTML={{ __html: `
        setTimeout(() => {
            const img = document.getElementById('hero-img');
            if (img) img.src = '/artifacts/qqx_hero_dashboard_1775479911103.png';
        }, 100);
      `}} />
    </div>
  );
}
