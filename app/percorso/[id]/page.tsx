'use client'
import { useParams } from "next/navigation"
import { percorsiTematici, getCoursesForPercorso, Course } from "@/lib/coursesData"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { PlayCircle, MonitorPlay, ArrowLeft, Wrench, Heart, Shield } from "lucide-react"
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd"

export default function PercorsoPage() {
    const params = useParams()
    const percorsoId = params.id as string

    const percorso = percorsiTematici.find(p => p.id === percorsoId)

    const percorsoIcons: Record<string, React.ReactNode> = {
        "percorso-1": <Wrench className="w-8 h-8 text-yellow-600" />,
        "percorso-2": <Heart className="w-8 h-8 text-yellow-600" />,
        "percorso-3": <Shield className="w-8 h-8 text-yellow-600" />
    }

    if (!percorso) {
        return (
            <div className="min-h-screen flex flex-col font-sans bg-gray-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Percorso non trovato</h1>
                        <Link href="/" className="text-primary hover:underline">Torna alla Home</Link>
                    </div>
                </main>
            </div>
        )
    }

    const courses = getCoursesForPercorso(percorso)

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <BreadcrumbJsonLd items={[
                { name: "Home", url: "/" },
                { name: "Percorsi Tematici", url: "/" },
                { name: percorso.title, url: `/percorso/${percorso.id}` }
            ]} />

            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">

                    <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Torna alla Home
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-yellow-100 border-2 border-yellow-200 flex items-center justify-center mx-auto mb-4">
                            {percorsoIcons[percorso.id]}
                        </div>
                        <span className="inline-block py-1 px-3 font-bold rounded-full text-sm uppercase tracking-wider border mb-4 bg-yellow-100 text-yellow-800 border-yellow-200">
                            Percorso {percorso.number}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
                            {percorso.title}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            {percorso.description}
                        </p>
                        <p className="text-sm text-gray-400 mt-4">
                            {courses.length} video · Segui l'ordine per ottenere il massimo
                        </p>
                    </div>

                    {/* Video in verticale con ordine */}
                    <div className="space-y-4">
                        {courses.map((course, index) => (
                            <Link
                                key={course.id}
                                href={`/corso/${course.id}`}
                                className="flex items-center gap-4 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 group"
                            >
                                {/* Numero step */}
                                <div className="flex-shrink-0 w-14 h-full flex items-center justify-center bg-yellow-50 border-r border-yellow-100">
                                    <span className="text-2xl font-extrabold text-yellow-600">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Thumbnail */}
                                <div className="relative w-28 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden my-3">
                                    {course.coverImage ? (
                                        <img
                                            src={course.coverImage}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                            <PlayCircle className="w-8 h-8 text-white/50" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-grow py-4 pr-4 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate mt-1">
                                        {course.shortDescription}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <MonitorPlay className="w-3 h-3" /> {course.freeDuration}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${course.level === "Base" ? "bg-blue-100 text-blue-700" :
                                                course.level === "Intermedio" ? "bg-green-100 text-green-700" :
                                                    "bg-red-100 text-red-700"
                                            }`}>
                                            {course.level}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex-shrink-0 pr-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-sm">
                                        →
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
