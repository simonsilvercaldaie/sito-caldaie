// Banner Promozionale CaldaieGPT 
// SALVATO PER FUTURO USO - Autunno 2026
// NON CANCELLARE - Design approvato dall'utente (viola + icone)

import Link from "next/link"
import { Bot, Sparkles } from "lucide-react"

export default function CaldaieGPTBanner() {
    return (
        <section className="py-12 px-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30 shadow-2xl">
                            <Bot className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                                <span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">Novità Esclusiva</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold">CaldaieGPT</h2>
                            <p className="text-white/80 text-lg mt-1">La prima Intelligenza Artificiale per Tecnici Caldaie</p>
                        </div>
                    </div>

                    <a
                        href="https://www.caldaiegpt.it"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 px-8 py-4 bg-white text-purple-700 rounded-xl text-lg font-bold hover:bg-yellow-300 hover:text-purple-800 transition-all shadow-2xl hover:shadow-yellow-300/30 hover:scale-105"
                    >
                        <Bot className="w-6 h-6" />
                        Scopri CaldaieGPT
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                </div>
            </div>
        </section>
    )
}

/*
COLORI USATI:
- Gradient: from-violet-600 via-purple-600 to-indigo-600
- Accenti: text-yellow-300
- Pulsante: bg-white text-purple-700 → hover:bg-yellow-300 hover:text-purple-800
- Background blur: bg-cyan-300

ICONE USATE:
- Bot (lucide-react)
- Sparkles (lucide-react)
*/
