"use client";

import { useState } from "react";
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { Features } from '@/components/landing/Features';
import { Roles } from '@/components/landing/Roles';
import { Footer } from '@/components/landing/Footer';
import { DemoModal } from '@/components/landing/DemoModal';
import { LegalModals } from '@/components/landing/LegalModals';
import { CookieBanner } from '@/components/landing/CookieBanner';

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [legalType, setLegalType] = useState<'impressum' | 'datenschutz' | 'agb' | 'cookies' | null>(null);

  const handleOpenDemo = () => setDemoOpen(true);
  const handleCloseDemo = () => setDemoOpen(false);

  const handleOpenLegal = (type: 'impressum' | 'datenschutz' | 'agb' | 'cookies') => {
    setLegalType(type);
  };

  const handleCloseLegal = () => setLegalType(null);

  return (
    <div className="min-h-screen bg-[#0F172A] selection:bg-blue-500/30 selection:text-white">
      <Header onOpenDemo={handleOpenDemo} />
      
      <main>
        <Hero onOpenDemo={handleOpenDemo} />
        <DashboardPreview />
        <Features onOpenDemo={handleOpenDemo} />
        <Roles />
      </main>

      <Footer onOpenLegal={handleOpenLegal} />

      {/* Modals & Banner */}
      <DemoModal isOpen={demoOpen} onClose={handleCloseDemo} />
      <LegalModals type={legalType} onClose={handleCloseLegal} />
      <CookieBanner onOpenSettings={() => handleOpenLegal('cookies')} />
    </div>
  );
}
