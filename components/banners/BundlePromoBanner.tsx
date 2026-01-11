// Banner Promozionale Bundle Corsi
// Mostra le offerte pacchetto 5 corsi e 10 corsi

import Link from "next/link"
import { Gift, Sparkles, Package, Zap } from "lucide-react"

export default function BundlePromoBanner() {
    return (
        <section className="py-12 px-4 bg-gradient-to-r from-accent via-orange-500 to-amber-500 relative overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="flex flex-col items-center text-center text-white mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-6 h-6 text-yellow-200 animate-pulse" />
                        <span className="text-sm font-semibold text-yellow-200 uppercase tracking-wider">Offerta Speciale</span>
                        <Sparkles className="w-6 h-6 text-yellow-200 animate-pulse" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-extrabold mb-2">
                        Risparmia fino a €92 con i Bundle!
                    </h2>
                    <p className="text-white/80 text-lg max-w-xl">
                        Più impari, più risparmi. E non pagherai mai più di €298 per tutti i corsi!
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Bundle 5 Corsi */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-white/70">5 Corsi a scelta</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold">€149</span>
                                    <span className="text-white/50 line-through text-lg">€195</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                            <Gift className="w-4 h-4" />
                            Risparmi €46
                        </div>
                    </div>

                    {/* Bundle 10 Corsi */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-300/50 hover:bg-white/20 transition-all relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-yellow-300 text-orange-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                Più Popolare
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-yellow-300/30 rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-yellow-200" />
                            </div>
                            <div>
                                <p className="text-sm text-white/70">Tutti i 10 Corsi</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold">€298</span>
                                    <span className="text-white/50 line-through text-lg">€390</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                            <Gift className="w-4 h-4" />
                            Risparmi €92
                        </div>
                    </div>
                </div>

                {/* Garanzia */}
                <div className="text-center mt-8">
                    <p className="text-white/80 text-sm mb-4">
                        💡 <strong>Garanzia prezzo massimo:</strong> anche comprando un corso alla volta,
                        il sistema ti fa pagare al massimo €298 per averli tutti!
                    </p>
                    <Link
                        href="/catalogo"
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-xl text-lg font-bold hover:bg-yellow-300 hover:text-orange-700 transition-all shadow-2xl hover:shadow-yellow-300/30 hover:scale-105"
                    >
                        Scopri Tutti i Corsi
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </section>
    )
}
