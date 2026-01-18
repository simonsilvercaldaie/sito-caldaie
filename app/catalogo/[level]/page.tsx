'use client'
import { useParams, useRouter } from "next/navigation"
import { getAllCourses, Course } from "@/lib/coursesData"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { PlayCircle, MonitorPlay, ShieldCheck, ArrowLeft } from "lucide-react"

export default function LivelloPage() {
    const params = useParams()
    const router = useRouter()
    const levelSlug = params.level as string // "base", "intermedio", "avanzato"

    // Mappa slug -> Titolo "ufficiale"
    const levelMap: Record<string, { title: string, dbLevel: "Base" | "Intermedio" | "Avanzato", description: string, color: string }> = {
        "base": {
            title: "FONDAMENTA",
            dbLevel: "Base",
            description: "Per chi viene dall’idraulica o è alle prime armi. Capire cosa si sta guardando.",
            color: "bg-blue-100 text-blue-800 border-blue-200"
        },
        "intermedio": {
            title: "RIPARARE SUL SERIO",
            dbLevel: "Intermedio",
            description: "Qui entri nel lavoro vero. Smetti di andare a tentativi.",
            color: "bg-green-100 text-green-800 border-green-200"
        },
        "avanzato": {
            title: "TECNICO CHE DECIDE",
            dbLevel: "Avanzato",
            description: "Diagnosi avanzata, elettronica e mindset. Il livello che ti differenzia.",
            color: "bg-red-100 text-red-800 border-red-200"
        }
    }

    const levelInfo = levelMap[levelSlug.toLowerCase()]

    // Se il livello non esiste, reindirizza al catalogo generale
    if (!levelInfo) {
        return (
            <div className="min-h-screen flex flex-col font-sans bg-gray-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Livello non trovato</h1>
                        <Link href="/catalogo" className="text-primary hover:underline">Torna al Catalogo</Link>
                    </div>
                </main>
            </div>
        )
    }

    const courses = getAllCourses().filter(c => c.level === levelInfo.dbLevel)

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">

                    <Link href="/catalogo" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Torna ai Livelli
                    </Link>

                    <div className="text-center mb-16">
                        <span className={`inline-block py-1 px-3 font-bold rounded-full text-sm uppercase tracking-wider border mb-4 ${levelInfo.color}`}>
                            Livello {levelInfo.dbLevel}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6">
                            {levelInfo.title}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            {levelInfo.description}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/corso/${course.id}`}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group flex flex-col h-full"
                            >
                                <div className="relative aspect-video bg-slate-100">
                                    {course.coverImage ? (
                                        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700">
                                            <img
                                                src={course.coverImage}
                                                alt={course.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Overlay gradiente per leggibilità badge se serve */}
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-primary group-hover:to-slate-800 transition-colors duration-500">
                                            <PlayCircle className="w-12 h-12 text-white/50 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                                        </div>
                                    )}

                                    {/* Badge Durata */}
                                    <div className="absolute bottom-3 left-3 flex gap-2 z-10">
                                        <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-white text-xs font-medium flex items-center gap-1 border border-white/10">
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
                </div>
            </footer>
        </div>
    )
}
