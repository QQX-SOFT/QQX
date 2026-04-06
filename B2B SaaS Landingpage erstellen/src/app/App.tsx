import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DashboardPreview } from './components/DashboardPreview';
import { Features } from './components/Features';
import { Roles } from './components/Roles';
import { Footer } from './components/Footer';

export default function App() {
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