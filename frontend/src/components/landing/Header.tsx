import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onOpenDemo: () => void;
}

export function Header({ onOpenDemo }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-sm border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <span className="text-2xl font-bold text-white">QQX</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#funktionen" className="text-gray-300 hover:text-white transition-colors">
              Funktionen
            </a>
            <a href="#loesungen" className="text-gray-300 hover:text-white transition-colors">
              Lösungen
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onOpenDemo}
              className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl transition-colors font-medium"
            >
              Demo anfordern
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a
              href="#funktionen"
              className="block text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Funktionen
            </a>
            <a
              href="#loesungen"
              className="block text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Lösungen
            </a>
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDemo();
                }}
                className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl transition-colors font-medium text-center"
              >
                Demo anfordern
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
