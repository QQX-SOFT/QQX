import { Clock, FileText, MapPin, Truck, BarChart3, Building2 } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Digitale Zeiterfassung',
    description: 'Stempeluhr mit GPS-Validierung für präzise Arbeitszeiterfassung. Automatische Erfassung von Start- und Endzeiten mit Standortnachweis.',
    color: '#3B82F6'
  },
  {
    icon: FileText,
    title: 'Automatisierte Abrechnung',
    description: 'Honorarberechnung und Rechnungsversand an Subunternehmer. Vollautomatische Fakturierung basierend auf erfassten Leistungen.',
    color: '#10B981'
  },
  {
    icon: MapPin,
    title: 'Echtzeit GPS & Geofencing',
    description: 'Live-Tracking via Websockets und Alarm bei Zonen-Verlass. Definieren Sie virtuelle Zäune und erhalten Sie Benachrichtigungen in Echtzeit.',
    color: '#8B5CF6'
  },
  {
    icon: Truck,
    title: 'Fahrzeugmanagement',
    description: 'Digitale Akte für TÜV, UVV und Kilometerstände. Automatische Erinnerungen für anstehende Inspektionen und Wartungsarbeiten.',
    color: '#F59E0B'
  },
  {
    icon: BarChart3,
    title: 'Fahrer-Reporting',
    description: 'Leistungsnachweis und Feedback-System mit detaillierten KPIs. Transparente Auswertung von Fahrzeiten, Touren und Effizienz.',
    color: '#06B6D4'
  },
  {
    icon: Building2,
    title: 'Mandantenfähigkeit',
    description: 'Isolierte Datenbereiche mit eigener Subdomain (z.B. firma.qqxsoft.com). Jedes Unternehmen erhält eine eigenständige, sichere Instanz.',
    color: '#EC4899'
  }
];

export function Features() {
  return (
    <section id="funktionen" className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full mb-6">
            <span className="text-sm text-[#3B82F6] font-medium">Funktionen</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Alles, was Sie für Ihr Flottenmanagement brauchen
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Enterprise-Grade Features für professionelles Flottenmanagement – skalierbar, sicher und benutzerfreundlich
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300 hover:translate-y-[-4px]"
              >
                {/* Glow Effect on Hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                  style={{ background: `${feature.color}20` }}
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${feature.color}20` }}
                  >
                    <Icon size={28} style={{ color: feature.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: feature.color }}>
                    <span>Mehr erfahren</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            Entdecken Sie alle Funktionen in einer persönlichen Demo
          </p>
          <button className="px-8 py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl transition-colors font-medium shadow-lg shadow-[#3B82F6]/30">
            Demo anfordern
          </button>
        </div>
      </div>
    </section>
  );
}
