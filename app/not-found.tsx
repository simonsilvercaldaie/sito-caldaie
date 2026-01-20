import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            <div className="text-center max-w-lg">
                {/* 404 Grande */}
                <div className="relative mb-8">
                    <h1 className="text-[150px] md:text-[200px] font-black text-white/5 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <Search className="w-16 h-16 text-accent mx-auto mb-4 animate-pulse" />
                            <p className="text-2xl md:text-3xl font-bold text-white">
                                Pagina non trovata
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    La pagina che stai cercando non esiste o è stata spostata.
                    <br />
                    Niente panico, capita anche ai migliori tecnici! 🔧
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-accent/20"
                    >
                        <Home className="w-5 h-5" />
                        Torna alla Home
                    </Link>
                    <Link
                        href="/catalogo/base"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Vai ai Corsi
                    </Link>
                </div>

                <p className="mt-12 text-slate-500 text-sm">
                    Se pensi ci sia un errore, contattaci a{' '}
                    <a href="mailto:simonsilvercaldaie@gmail.com" className="text-accent hover:underline">
                        simonsilvercaldaie@gmail.com
                    </a>
                </p>
            </div>
        </div>
    )
}
