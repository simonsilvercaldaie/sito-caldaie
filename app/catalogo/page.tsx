'use client'
import { Lock, MonitorPlay, ShieldCheck, PlayCircle } from "lucide-react"
import { getAllCourses } from "@/lib/coursesData"
import Link from "next/link"
import Navbar from "@/components/Navbar"

export default function CatalogoPage() {
    const courses = getAllCourses()

    // Raggruppa corsi per livello
    const baseCourses = courses.filter(c => c.level === "Base")
    const intermedioCourses = courses.filter(c => c.level === "Intermedio")
    const avanzatoCourses = courses.filter(c => c.level === "Avanzato")

    const levelColors: Record<string, string> = {
        "Base": "bg-green-100 text-green-800 border-green-200",
        "Intermedio": "bg-yellow-100 text-yellow-800 border-yellow-200",
        "Avanzato": "bg-red-100 text-red-800 border-red-200"
    }

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
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-16 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">

                    <div className="text-center mb-16">
                        <span className="inline-block py-1 px-3 bg-primary/10 text-primary font-bold rounded-full text-sm uppercase tracking-wider border border-primary/20 mb-4">
                            Percorso Formativo Completo
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-primary mb-6">
                            Scegli il tuo <span className="text-accent">Livello</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Un percorso strutturato step-by-step per portarti da principiante a esperto.
                            Non bruciare le tappe: inizia da dove serve.
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

                    <div className="mt-20 text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-lg">
                        <h3 className="text-2xl font-bold text-primary mb-4">Non sai da dove iniziare?</h3>
                        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                            Se hai dubbi, il consiglio è sempre di partire dal <strong>Livello Base</strong>.
                            Anche per i tecnici esperti, ripassare le fondamenta logiche spesso rivela lacune insospettabili.
                        </p>
                        <Link href="/catalogo/base" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                            Inizia dalle Fondamenta
                        </Link>
                    </div>

                </div>
            </main>

            <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">Simon Silver Caldaie</span>
                    </div>
                    <div className="text-sm">
                        &copy; {new Date().getFullYear()} Simon Silver. P.IVA 03235620121
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a href="https://www.youtube.com/@SimonSilverCaldaie" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a>
                        <a href="https://www.instagram.com/simon_silver" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                        <Link href="/contatti" className="hover:text-white transition-colors">Contatti</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/termini" className="hover:text-white transition-colors">Termini</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
