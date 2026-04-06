import { Truck, Users, Wrench, TrendingUp, MapPin, Clock } from 'lucide-react';

export function DashboardPreview() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Alles im Blick – in Echtzeit
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Übersichtliches Dashboard mit allen wichtigen KPIs und Live-Tracking Ihrer gesamten Flotte
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#3B82F6]/20 to-[#10B981]/20 rounded-3xl blur-3xl" />
          
          <div className="relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Dashboard Header */}
            <div className="bg-[#0F172A]/80 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">F</span>
                </div>
                <div>
                  <div className="text-white font-medium">FastRoute</div>
                  <div className="text-xs text-gray-500">fastroute.qqxsoft.com</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">Live</span>
              </div>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div className="hidden md:block w-64 bg-[#0F172A]/50 border-r border-white/10 p-4">
                <nav className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#3B82F6]/20 text-[#3B82F6] rounded-xl">
                    <MapPin size={20} />
                    <span className="font-medium">Live-Tracking</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <Truck size={20} />
                    <span>Fahrzeuge</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <Users size={20} />
                    <span>Fahrer</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <Clock size={20} />
                    <span>Zeiterfassung</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <Wrench size={20} />
                    <span>Wartungen</span>
                  </div>
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-[#3B82F6]/10 to-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Aktive Fahrer</span>
                      <Users size={20} className="text-[#3B82F6]" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">24</div>
                    <div className="flex items-center gap-1 text-xs text-[#10B981]">
                      <TrendingUp size={14} />
                      <span>+12% vs. letzte Woche</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Anstehende Wartungen</span>
                      <Wrench size={20} className="text-[#F59E0B]" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">7</div>
                    <div className="text-xs text-gray-500">
                      In den nächsten 14 Tagen
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 border border-[#10B981]/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Umsatz (MTD)</span>
                      <TrendingUp size={20} className="text-[#10B981]" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">€45.2k</div>
                    <div className="text-xs text-gray-500">
                      Ziel: €60k
                    </div>
                  </div>
                </div>

                {/* Map Area */}
                <div className="bg-[#1E293B] rounded-xl border border-white/10 p-4 h-80 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E293B]" />
                  
                  {/* Mock Map Grid */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className="border border-white/10" />
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Markers */}
                  <div className="relative h-full flex items-center justify-center">
                    <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center shadow-lg shadow-[#10B981]/50 animate-pulse">
                        <Truck size={16} className="text-white" />
                      </div>
                      <span className="mt-1 text-xs text-white bg-[#0F172A]/80 px-2 py-1 rounded">LKW-042</span>
                    </div>

                    <div className="absolute top-1/3 right-1/3 flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-lg shadow-[#3B82F6]/50 animate-pulse">
                        <Truck size={16} className="text-white" />
                      </div>
                      <span className="mt-1 text-xs text-white bg-[#0F172A]/80 px-2 py-1 rounded">LKW-018</span>
                    </div>

                    <div className="absolute bottom-1/3 left-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center shadow-lg shadow-[#10B981]/50 animate-pulse">
                        <Truck size={16} className="text-white" />
                      </div>
                      <span className="mt-1 text-xs text-white bg-[#0F172A]/80 px-2 py-1 rounded">LKW-091</span>
                    </div>

                    <div className="absolute top-2/3 right-1/4 flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#F59E0B] rounded-full flex items-center justify-center shadow-lg shadow-[#F59E0B]/50">
                        <Truck size={16} className="text-white" />
                      </div>
                      <span className="mt-1 text-xs text-white bg-[#0F172A]/80 px-2 py-1 rounded">LKW-055</span>
                    </div>
                  </div>

                  {/* Map Legend */}
                  <div className="absolute bottom-4 left-4 bg-[#0F172A]/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#10B981] rounded-full" />
                      <span className="text-xs text-gray-400">Aktiv (18)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#3B82F6] rounded-full" />
                      <span className="text-xs text-gray-400">Pause (6)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#F59E0B] rounded-full" />
                      <span className="text-xs text-gray-400">Offline (3)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
