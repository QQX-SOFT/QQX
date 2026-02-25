import { Truck, Clock, Shield, MapPin } from 'lucide-react'

export default function ComingSoon() {
    return (
        <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] translate-y-1/2"></div>

            <div className="relative z-10 text-center px-4 max-w-4xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-pulse">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Next-Gen Fleet Management
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6">
                    QQ<span className="text-blue-600">X</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Die modernste SaaS-Plattform für Zeiterfassung, GPS-Tracking und Fleet-Management.
                    <span className="text-white"> Demnächst verfügbar.</span>
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {[
                        { icon: Clock, label: "Zeit" },
                        { icon: MapPin, label: "GPS" },
                        { icon: Shield, label: "Sicher" },
                        { icon: Truck, label: "Fleet" }
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-3 backdrop-blur-sm">
                            <item.icon className="text-blue-500" size={32} />
                            <span className="text-slate-300 font-semibold">{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 w-full md:w-auto">
                        <input
                            type="email"
                            placeholder="E-Mail Adresse"
                            className="bg-transparent border-none focus:ring-0 text-white px-4 py-3 w-full outline-none"
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition whitespace-nowrap">
                            Benachrichtigen
                        </button>
                    </div>
                </div>

                <div className="mt-20 text-slate-500 text-sm uppercase tracking-widest font-bold">
                    Powered by QQX-Soft
                </div>
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
    )
}
