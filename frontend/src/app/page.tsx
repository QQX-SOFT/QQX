"use client";

import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { Features } from '@/components/landing/Features';
import { Roles } from '@/components/landing/Roles';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Header />
      <Hero />
      <DashboardPreview />
      <Features />
      <Roles />
      <Footer />
    </div>
  );
}
