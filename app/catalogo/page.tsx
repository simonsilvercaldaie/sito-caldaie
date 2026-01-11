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

    const CourseGrid = ({ title, description, level, items }: { title: string, description: string, level: string, items: typeof courses }) => (
        <section className="mb-20 last:mb-0">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 border-b pb-4">
                <div className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider border w-fit ${levelColors[level]}`}>
                    {level}
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                    <p className="text-gray-500 mt-1">{description}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((course) => (
                    <Link
                        key={course.id}
                        href={`/corso/${course.id}`}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group flex flex-col h-full"
                    >
                        <div className="relative aspect-video bg-slate-100">
                            {/* Placeholder o Immagine */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-primary group-hover:to-slate-800 transition-colors duration-500">
                                <PlayCircle className="w-12 h-12 text-white/50 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                            </div>

                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary font-bold px-3 py-1 rounded-lg text-sm shadow-sm">
                                € {course.price}
                            </div>
                            <div className="absolute bottom-3 left-3 flex gap-2">
                                <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-white text-xs font-medium flex items-center gap-1">
                                    <MonitorPlay className="w-3 h-3" /> {course.freeDuration}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
                                {course.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                                {course.shortDescription}
                            </p>

                            <div className="pt-4 mt-auto border-t border-gray-50 flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-400 group-hover:text-primary transition-colors">Vedi Dettagli</span>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                    →
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">

                    <div className="text-center mb-16">
                        <span className="inline-block py-1 px-3 bg-primary/10 text-primary font-bold rounded-full text-sm uppercase tracking-wider border border-primary/20 mb-4">
                            Percorso Completo
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6">
                            Scuola Tecnico Caldaie <span className="text-accent">A–Z</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Un percorso strutturato in 3 livelli per portarti da "cambio pezzi a caso" a tecnico specializzato che diagnostica e risolve.
                        </p>
                    </div>

                    <CourseGrid
                        title="FONDAMENTA"
                        description="Per chi viene dall’idraulica o è alle prime armi. Capire cosa si sta guardando."
                        level="Base"
                        items={baseCourses}
                    />

                    <CourseGrid
                        title="RIPARARE SUL SERIO"
                        description="Qui entri nel lavoro vero. Smetti di andare a tentativi."
                        level="Intermedio"
                        items={intermedioCourses}
                    />

                    <CourseGrid
                        title="TECNICO CHE DECIDE"
                        description="Diagnosi avanzata, elettronica e mindset. Il livello che ti differenzia."
                        level="Avanzato"
                        items={avanzatoCourses}
                    />

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
