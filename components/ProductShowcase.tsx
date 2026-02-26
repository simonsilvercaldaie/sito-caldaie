'use client'
import { Lock, MonitorPlay, ShieldCheck, Users } from "lucide-react"
import Link from "next/link"
import { LEGAL_TEXT_HOMEPAGE } from "@/lib/legalTexts"

export default function ProductShowcase() {

    // LevelCard component definition (copied from Catalogo logic)
    const LevelCard = ({ title, description, level, link, colorClass, badgeClass, icon, footerText = "Esplora i 9 Corsi" }: { title: string, description: string, level: string, link: string, colorClass: string, badgeClass: string, icon: any, footerText?: string }) => (
        <Link href={link} className="block group">
            <div className={`rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col ${colorClass} bg-white hover:bg-gray-50`}>
                <div className="flex items-center justify-between mb-6">
                    <span className={`px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider border shadow-sm ${badgeClass}`}>
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
                        {footerText}
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
                        Un Percorso <span className="text-accent">Unico</span> nel Settore
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Il primo metodo completo per caldaisti. 27 video che cambieranno il tuo modo di lavorare.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <LevelCard
                        title="FONDAMENTA"
                        description="Smetti di andare a caso. Capisci la logica, lo schema e le decisioni della caldaia."
                        level="Base"
                        link="/catalogo/base"
                        colorClass="border-blue-200 hover:border-blue-400"
                        badgeClass="bg-blue-100 text-blue-800 border-blue-200"
                        icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
                    />

                    <LevelCard
                        title="RIPARARE SUL SERIO"
                        description="Risolvi guasti reali con metodo. Scambiatori, valvole, sensori e scheda."
                        level="Intermedio"
                        link="/catalogo/intermedio"
                        colorClass="border-green-200 hover:border-green-400"
                        badgeClass="bg-green-100 text-green-800 border-green-200"
                        icon={<MonitorPlay className="w-6 h-6 text-green-600" />}
                    />

                    <LevelCard
                        title="TECNICO CHE DECIDE"
                        description="Diagnosi avanzata e mindset. Gestione del cliente e guasti impossibili."
                        level="Avanzato"
                        link="/catalogo/avanzato"
                        colorClass="border-red-200 hover:border-red-400"
                        badgeClass="bg-red-100 text-red-800 border-red-200"
                        icon={<ShieldCheck className="w-6 h-6 text-red-600" />}
                    />
                </div>



                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-primary">
                        Vai <span className="text-accent">Oltre</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Contenuti fuori schema per tecnici curiosi.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto mb-20">
                    <LevelCard
                        title="LABORATORIO"
                        description="Casi studio reali, video extra e approfondimenti. Contenuti fuori schema per tecnici curiosi."
                        level="Extra"
                        link="/catalogo/laboratorio"
                        colorClass="border-yellow-200 hover:border-yellow-400"
                        badgeClass="bg-yellow-100 text-yellow-800 border-yellow-200"
                        icon={<MonitorPlay className="w-6 h-6 text-yellow-600" />}
                        footerText="Esplora il Laboratorio"
                    />
                </div>

                {/* SEZIONE TEAM REMOVED */}





            </div>


        </section>
    )
}

