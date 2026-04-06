import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (type: 'impressum' | 'datenschutz' | 'agb' | 'cookies') => void;
}

export function Footer({ onOpenLegal }: FooterProps) {
  return (
    <footer className="relative bg-[#0F172A] border-t border-white/10 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="text-2xl font-bold text-white">QQX</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Die führende Multi-Tenant Flottenmanagement-Plattform für Österreich und den DACH-Raum.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-bold mb-6">Produkt</h4>
            <ul className="space-y-3">
              <li>
                <a href="#funktionen" className="text-gray-400 hover:text-white transition-colors">
                  Funktionen
                </a>
              </li>
              <li>
                <a href="#loesungen" className="text-gray-400 hover:text-white transition-colors">
                  Lösungen
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  API-Dokumentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Integrationen
                </a>
              </li>
            </ul>
          </div>

          {/* Unternehmen */}
          <div>
            <h4 className="text-white font-bold mb-6">Unternehmen</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Über uns
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Karriere
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Presse
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Partner
                </a>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="text-white font-bold mb-6">Kontakt</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-[#3B82F6] mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500 mb-1">E-Mail</div>
                  <a href="mailto:office@qqxsoft.com" className="text-gray-400 hover:text-white transition-colors">
                    office@qqxsoft.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-[#3B82F6] mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500 mb-1">Telefon</div>
                  <a href="tel:+436769419393" className="text-gray-400 hover:text-white transition-colors">
                    +43 676 9419393
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#3B82F6] mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500 mb-1">Adresse</div>
                  <address className="text-gray-400 not-italic">
                    Achstrasse 42<br />
                    6922 Wolfurt<br />
                    Österreich
                  </address>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p className="mb-1">© 2026 Volkan Meral – FastRoute Kurier & Kleintransporte</p>
              <p>UID-Nummer: ATU71572719</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-6">
              <button onClick={() => onOpenLegal('impressum')} className="text-sm text-gray-500 hover:text-white transition-colors">
                Impressum
              </button>
              <button onClick={() => onOpenLegal('datenschutz')} className="text-sm text-gray-500 hover:text-white transition-colors">
                Datenschutz
              </button>
              <button onClick={() => onOpenLegal('agb')} className="text-sm text-gray-500 hover:text-white transition-colors">
                AGB
              </button>
              <button onClick={() => onOpenLegal('cookies')} className="text-sm text-gray-500 hover:text-white transition-colors">
                Cookie-Einstellungen
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#10B981]/20 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>ISO 27001 zertifiziert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#10B981]/20 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#10B981]/20 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Made in Österreich</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#10B981]/20 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>TÜV geprüft</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}