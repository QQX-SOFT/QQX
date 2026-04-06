import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#10B981]/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">Multi-Tenant Flottenmanagement</span>
          </div>

          {/* Headlines */}
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Ihre gesamte Flotte in{' '}
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#10B981] bg-clip-text text-transparent">
              einer Plattform
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            Sicheres Multi-Tenant Flottenmanagement mit Echtzeit-Tracking, automatisierter Abrechnung und digitaler Zeiterfassung.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button className="group px-8 py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl transition-all font-medium text-lg flex items-center gap-2 shadow-lg shadow-[#3B82F6]/50">
              Jetzt kostenlos testen
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium text-lg border border-white/10">
              Mehr erfahren
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#10B981] rounded-full" />
              </div>
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#10B981] rounded-full" />
              </div>
              <span>ISO 27001 zertifiziert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#10B981] rounded-full" />
              </div>
              <span>Made in Österreich</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}