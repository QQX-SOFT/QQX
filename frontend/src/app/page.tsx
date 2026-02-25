"use client";

import { motion } from "framer-motion";
import { Truck, Shield, Calendar, BarChart3, ChevronRight, Globe, Lock, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black animate-pulse">Q</div>
          <span className="text-2xl font-black tracking-tighter text-white">QQX</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-blue-500 transition">Funktionen</a>
          <a href="#solutions" className="hover:text-blue-500 transition">Lösungen</a>
          <a href="#about" className="hover:text-blue-500 transition">Über uns</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-5 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition font-semibold text-sm">Anmelden</Link>
          <Link href="/demo" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition font-semibold text-sm shadow-lg shadow-blue-900/40">Demo anfordern</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Zap size={14} className="fill-blue-400" />
            Die Zukunft der Logistik gestalten
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-8xl font-black text-white tracking-tight mb-8 leading-[1.1]"
          >
            Optimieren Sie Ihre Flotte <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">mit QQX Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Die umfassende SaaS-Plattform für Hochleistungs-Flottenmanagement.
            Echtzeit-Tracking, automatisierte Planung und tiefgehende prädiktive Analysen an einem Ort.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup" className="px-8 py-4 rounded-2xl bg-white text-slate-950 font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition group shadow-xl shadow-white/10">
              Jetzt starten
              <ChevronRight size={20} className="group-hover:translate-x-1 transition" />
            </Link>
            <Link href="/pricing" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black flex items-center justify-center gap-2 hover:bg-white/10 transition">
              Preise ansehen
            </Link>
          </motion.div>
        </div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-24 max-w-5xl mx-auto relative"
        >
          <div className="aspect-video rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl p-4">
            <div className="w-full h-full bg-slate-900 rounded-2xl relative overflow-hidden flex flex-col">
              {/* Mock Dashboard Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-slate-500 font-mono tracking-wider">DASHBOARD-STAGING-V4</div>
              </div>
              {/* Mock Dashboard Content */}
              <div className="flex-1 p-8 grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div className="h-32 bg-blue-600/10 rounded-2xl border border-blue-500/10 flex items-center p-8 gap-6 animate-pulse">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl"></div>
                    <div className="space-y-3 flex-1">
                      <div className="h-4 bg-white/10 rounded-full w-1/3"></div>
                      <div className="h-2 bg-white/5 rounded-full w-full"></div>
                      <div className="h-2 bg-white/5 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-40 bg-white/5 rounded-2xl p-6 space-y-4">
                      <div className="h-2.5 bg-white/10 rounded-full w-1/2"></div>
                      <div className="h-12 bg-white/5 rounded-xl"></div>
                      <div className="flex gap-2">
                        <div className="h-1.5 bg-green-500/20 rounded-full w-12"></div>
                        <div className="h-1.5 bg-green-500/20 rounded-full w-8"></div>
                      </div>
                    </div>
                    <div className="h-40 bg-white/5 rounded-2xl p-6 space-y-4">
                      <div className="h-2.5 bg-white/10 rounded-full w-1/2"></div>
                      <div className="h-12 bg-white/5 rounded-xl"></div>
                      <div className="flex gap-2">
                        <div className="h-1.5 bg-blue-500/20 rounded-full w-12"></div>
                        <div className="h-1.5 bg-blue-500/20 rounded-full w-8"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 space-y-6 border border-white/5">
                  <div className="h-2.5 bg-white/10 rounded-full w-2/3"></div>
                  <div className="space-y-4">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5"></div>
                        <div className="space-y-1.5 flex-1">
                          <div className="h-1.5 bg-white/5 rounded-full w-1/2"></div>
                          <div className="h-1.5 bg-white/5 rounded-full w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/2">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { value: "12.000+", label: "Verwaltete Fahrzeuge" },
            { value: "99,99%", label: "Uptime SLA" },
            { value: "35%", label: "Durchschn. Effizienzsteigerung" },
            { value: "250M€+", label: "Verfolgter Frachtwert" }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Infrastruktur</h2>
            <p className="text-4xl md:text-5xl font-black text-white leading-tight">Alles was Sie brauchen, um <br /> Ihre Abläufe zu skalieren.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: "Echtzeit-Tracking", desc: "Präzises GPS-Tracking mit sekundenschnellen Updates und historischer Routenwiedergabe." },
              { icon: Calendar, title: "Intelligente Disposition", desc: "KI-gestützte Planung, die Routen basierend auf Verkehr, Last und Fahrerzeiten optimiert." },
              { icon: Shield, title: "Compliance Automatisierung", desc: "Tachographen-Management und ELD-Compliance direkt in Ihren Workflow integriert." },
              { icon: BarChart3, title: "Erweiterte Analysen", desc: "Tiefe betriebliche Einblicke und prädiktive Wartungswarnungen, bevor Probleme entstehen." },
              { icon: Lock, title: "Enterprise Sicherheit", desc: "Rollenbasierte Zugriffskontrolle, SSO und Audit-Logs für Ihr gesamtes Unternehmen." },
              { icon: Globe, title: "Internationale Unterstützung", desc: "Meistern Sie grenzüberschreitende Logistik mit Mehrwährungs- und Mehrsprachen-Support." },
            ].map((feature, i) => (
              <div key={i} className="group p-10 rounded-[2.5rem] bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition duration-500">
                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition duration-500 shadow-lg shadow-blue-900/0 group-hover:shadow-blue-600/40">
                  <feature.icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-20 px-6 border-t border-white/5 bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">Q</div>
            <span className="text-xl font-black tracking-tighter text-white">QQX</span>
          </div>
          <div className="flex gap-12 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition">AGB</a>
            <a href="#" className="hover:text-white transition">Datenschutz</a>
            <a href="#" className="hover:text-white transition">Status</a>
            <a href="#" className="hover:text-white transition">Support</a>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            © 2026 QQX-Soft Intelligence. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
