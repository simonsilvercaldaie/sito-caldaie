'use client'
import { MonitorPlay, ShieldCheck, PlayCircle } from "lucide-react"
import { getFeaturedCourses } from "@/lib/coursesData"
import Link from "next/link"

export default function ProductShowcase() {
    const featuredCourses = getFeaturedCourses()

    const levelColors: Record<string, string> = {
        "Base": "bg-green-100 text-green-800",
        "Intermedio": "bg-yellow-100 text-yellow-800",
        "Avanzato": "bg-red-100 text-red-800"
    }

    return (
        <section className="py-20 px-4 md:px-8 bg-muted/30">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">I Nostri Percorsi Formativi</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Un metodo strutturato in 3 livelli: dalle basi fondamentali alla diagnosi avanzata.
                        Scegli il tuo punto di partenza.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {featuredCourses.map((course) => (
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
                                <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
                                    <span className="flex items-center gap-1">
                                        <MonitorPlay className="w-4 h-4 text-red-500" />
                                        <strong>{course.freeDuration} gratis</strong> + {course.premiumDuration}
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

                {/* CTA to Full Catalog */}
                <div className="text-center mt-12">
                    <Link
                        href="/catalogo"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Vedi Tutti i 27 Corsi
                        <span className="text-xl">→</span>
                    </Link>
                </div>
            </div>
        </section>
    )
}
