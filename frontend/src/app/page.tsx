"use client";

import { motion } from "framer-motion";
import { Truck, Rocket, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

      <header className="relative z-10 text-center space-y-12 max-w-3xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/5 mb-8"
        >
          <Truck className="text-white" size={48} />
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-slate-50 border border-slate-100 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <Rocket size={14} />
            Next Gen Fleet Architecture
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.85]"
          >
            QQX <br /> <span className="text-slate-200">COMING SOON.</span>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 text-lg md:text-2xl font-medium leading-relaxed max-w-xl mx-auto"
        >
          Die Zukunft des intelligenten Flottenmanagements.
          Minimalistisch, effizient und radikal einfach.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <div className="px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 group">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-bold text-slate-400">Phase 1: Architecture Optimized</span>
          </div>
        </motion.div>
      </header>

      {/* Navigation for Dev Access */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-12 left-0 right-0 text-center"
      >
        <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-300">
          <a href="/admin" className="hover:text-blue-600 transition flex items-center gap-1">Admin Panel <ChevronRight size={10} /></a>
          <a href="/driver/login" className="hover:text-blue-600 transition flex items-center gap-1">Driver App <ChevronRight size={10} /></a>
        </div>
      </motion.footer>
    </div>
  );
}
