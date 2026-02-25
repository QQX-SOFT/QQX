"use client";

import { motion } from "framer-motion";
import { Truck, Rocket, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <header className="relative z-10 text-center space-y-8 max-w-3xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 rotate-12 mb-12"
        >
          <Truck className="text-white" size={40} />
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <Rocket size={14} className="animate-bounce" />
            Next Gen Fleet Architecture
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]"
          >
            QQX <br /> <span className="text-slate-500">COMING SOON.</span>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto"
        >
          Die Zukunft des intelligenten Flottenmanagements wird gerade geschmiedet.
          Wir transformieren Logistik in ein datengesteuertes Erlebnis.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-12 flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 group hover:border-blue-500/50 transition duration-500">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-300">Phase 1: Backend Architecture Complete</span>
          </div>
        </motion.div>
      </header>

      {/* Footer / Links for testing during development */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 left-0 right-0 text-center hover:opacity-100 transition duration-500"
      >
        <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <a href="/admin" className="hover:text-blue-500 flex items-center gap-1">Admin Dashboard <ChevronRight size={10} /></a>
          <a href="/driver/login" className="hover:text-blue-500 flex items-center gap-1">Driver Login <ChevronRight size={10} /></a>
          <a href="/super-admin" className="hover:text-blue-500 flex items-center gap-1">Super Admin <ChevronRight size={10} /></a>
        </div>
      </motion.footer>
    </div>
  );
}
