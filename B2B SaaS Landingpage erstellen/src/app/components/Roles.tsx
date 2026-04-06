import { Shield, Building, Users, Smartphone } from 'lucide-react';

const roles = [
  {
    icon: Shield,
    title: 'Super-Admin',
    description: 'Plattform-weite Verwaltung aller Mandanten, Systemkonfiguration und globale Einstellungen',
    color: '#EC4899',
    features: ['Mandantenverwaltung', 'Systemkonfiguration', 'Globale Analytics']
  },
  {
    icon: Building,
    title: 'Tenant-Admin',
    description: 'Vollständige Kontrolle über das eigene Unternehmen inkl. Fahrzeuge, Mitarbeiter und Einstellungen',
    color: '#8B5CF6',
    features: ['Fahrzeugverwaltung', 'Nutzerverwaltung', 'Unternehmens-Analytics']
  },
  {
    icon: Users,
    title: 'Disponent',
    description: 'Tourenplanung, Fahrzeug-Zuweisung und Echtzeit-Überwachung der aktiven Flotte',
    color: '#3B82F6',
    features: ['Tourenplanung', 'Live-Tracking', 'Fahrer-Koordination']
  },
  {
    icon: Smartphone,
    title: 'Fahrer-App',
    description: 'Mobile App für Zeiterfassung, GPS-Tracking, Tourenverwaltung und Kommunikation',
    color: '#10B981',
    features: ['GPS-Tracking', 'Zeiterfassung', 'Tourenliste']
  }
];

export function Roles() {
  return (
    <section id="loesungen" className="relative py-20 px-6">
      {/* Background Elements */}
      <div className="absolute top-40 left-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-40 right-0 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full mb-6">
            <span className="text-sm text-[#8B5CF6] font-medium">Rollen & Berechtigungen</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Für jede Ebene die richtige Lösung
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Granulare Berechtigungskonzepte vom Super-Admin bis zur Fahrer-App – sicher und übersichtlich
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Connection Line (hidden on mobile) */}
                {index < roles.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[calc(100%+0.75rem)] w-6 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                )}

                <div className="relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 h-full">
                  {/* Glow Effect */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                    style={{ background: `${role.color}20` }}
                  />

                  <div className="relative">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${role.color}20` }}
                    >
                      <Icon size={28} style={{ color: role.color }} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3">
                      {role.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      {role.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      {role.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-center gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: role.color }}
                          />
                          <span className="text-sm text-gray-500">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Flow Diagram */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 p-8">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Hierarchie & Datenfluss
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#EC4899]/20 rounded-full flex items-center justify-center mb-3">
                <Shield size={32} className="text-[#EC4899]" />
              </div>
              <span className="text-white font-medium">Super-Admin</span>
              <span className="text-xs text-gray-500">Plattform-Ebene</span>
            </div>

            <div className="hidden md:block text-gray-600">→</div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center mb-3">
                <Building size={32} className="text-[#8B5CF6]" />
              </div>
              <span className="text-white font-medium">Tenant-Admin</span>
              <span className="text-xs text-gray-500">Unternehmens-Ebene</span>
            </div>

            <div className="hidden md:block text-gray-600">→</div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#3B82F6]/20 rounded-full flex items-center justify-center mb-3">
                <Users size={32} className="text-[#3B82F6]" />
              </div>
              <span className="text-white font-medium">Disponent</span>
              <span className="text-xs text-gray-500">Operations-Ebene</span>
            </div>

            <div className="hidden md:block text-gray-600">→</div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center mb-3">
                <Smartphone size={32} className="text-[#10B981]" />
              </div>
              <span className="text-white font-medium">Fahrer</span>
              <span className="text-xs text-gray-500">Ausführungs-Ebene</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-gray-400">Datenisolation</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">DSGVO</div>
              <div className="text-sm text-gray-400">Konform</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">Custom</div>
              <div className="text-sm text-gray-400">Subdomains</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
