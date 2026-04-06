"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CookieBannerProps {
  onOpenSettings: () => void;
}

export function CookieBanner({ onOpenSettings }: CookieBannerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[60] animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="max-w-4xl mx-auto bg-[#1E293B] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheck className="text-blue-500" size={28} />
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h4 className="text-white font-bold">Ihre Privatsphäre ist uns wichtig</h4>
          <p className="text-sm text-gray-400">
            Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern, personalisierte Anzeigen oder Inhalte bereitzustellen und unseren Datenverkehr zu analysieren. Mit dem Klick auf "Alle akzeptieren" stimmen Sie der Verwendung von Cookies zu.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button 
            onClick={onOpenSettings}
            className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4"
          >
            Einstellungen
          </button>
          <Button onClick={handleDecline} variant="ghost" className="text-white hover:bg-white/5 border border-white/10">
            Nur Notwendige
          </Button>
          <Button onClick={handleAccept} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
            Alle akzeptieren
          </Button>
        </div>
        <button 
          onClick={handleDecline} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
