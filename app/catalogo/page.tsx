'use client'
import { Lock, MonitorPlay, ShieldCheck, PlayCircle } from "lucide-react"
import { getAllCourses } from "@/lib/coursesData"
import Link from "next/link"
import Navbar from "@/components/Navbar"

export default function CatalogoPage() {
    const courses = getAllCourses()

    const levelColors: Record<string, string> = {
        "Base": "bg-green-100 text-green-800",
        "Intermedio": "bg-yellow-100 text-yellow-800",
        "Avanzato": "bg-red-100 text-red-800"
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">

                    <div className="text-center mb-12">
                        <span className="inline-block py-1 px-3 bg-primary/10 text-primary font-bold rounded-full text-sm uppercase tracking-wider border border-primary/20 mb-4">
                            Catalogo Completo
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
                            Tutti i <span className="text-accent">Corsi Disponibili</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Guarda l'anteprima gratuita su YouTube, poi acquista il video premium completo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/corso/${course.id}`}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:border-accent/30 transition-all group flex flex-col"
                            >
                                <div className="relative aspect-video bg-gradient-to-br from-primary to-slate-700">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
                                            <PlayCircle className="w-10 h-10 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-accent text-white font-bold px-3 py-1 rounded-full text-sm shadow-md">
                                        € {course.price}
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${levelColors[course.level]}`}>
                                            {course.level}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold text-primary leading-tight group-hover:text-accent transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 flex-grow">
                                        {course.shortDescription}
                                    </p>
                                    <div className="flex flex-col gap-1 text-sm text-gray-500 pt-2 border-t border-gray-100">
                                        <span className="flex items-center gap-1">
                                            <MonitorPlay className="w-4 h-4 text-red-500" />
                                            <strong>{course.freeDuration} gratis</strong> + {course.premiumDuration} premium
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ShieldCheck className="w-4 h-4" />
                                            {course.level}
                                        </span>
                                    </div>
                                    <div className="pt-2">
                                        <span className="w-full py-3 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 group-hover:bg-accent group-hover:text-white">
                                            Scopri di più →
                                        </span>
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
