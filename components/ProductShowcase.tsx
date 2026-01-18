'use client'
import { Lock, MonitorPlay, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function ProductShowcase() {

    // LevelCard component definition (copied from Catalogo logic)
    const LevelCard = ({ title, description, level, link, colorClass, icon }: { title: string, description: string, level: string, link: string, colorClass: string, icon: any }) => (
        <Link href={link} className="block group">
            <div className={`rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col ${colorClass} bg-white hover:bg-gray-50`}>
                <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider bg-white border shadow-sm">
                        {level}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                    {title}
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed flex-grow">
                    {description}
                </p>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-gray-900 flex items-center gap-2">
                        Esplora i 9 Corsi
                    </span>
                    <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
                </div>
            </div>
        </Link>
    )

    return (
        <section className="py-20 px-4 md:px-8 bg-slate-50">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-primary">
                        Scegli il tuo <span className="text-accent">Livello</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Un percorso strutturato step-by-step per portarti da principiante a esperto.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <LevelCard
                        title="FONDAMENTA"
                        description="Smetti di andare a caso. Capisci la logica, lo schema e le decisioni della caldaia."
                        level="Base"
                        link="/catalogo/base"
                        colorClass="border-green-200 hover:border-green-400"
                        icon={<ShieldCheck className="w-6 h-6 text-green-600" />}
                    />

                    <LevelCard
                        title="RIPARARE SUL SERIO"
                        description="Risolvi guasti reali con metodo. Scambiatori, valvole, sensori e scheda."
                        level="Intermedio"
                        link="/catalogo/intermedio"
                        colorClass="border-yellow-200 hover:border-yellow-400"
                        icon={<MonitorPlay className="w-6 h-6 text-yellow-600" />}
                    />

                    <LevelCard
                        title="TECNICO CHE DECIDE"
                        description="Diagnosi avanzata e mindset. Gestione del cliente e guasti impossibili."
                        level="Avanzato"
                        link="/catalogo/avanzato"
                        colorClass="border-red-200 hover:border-red-400"
                        icon={<ShieldCheck className="w-6 h-6 text-red-600" />}
                    />
                </div>


            </div>
        </section>
    )
}
