import Link from "next/link";
import { Wrench, PhoneCall, ShieldCheck, MapPin, CheckCircle2, Flame, Clock } from "lucide-react";

export default function LocalServiceSection() {
    return (
        <section className="py-20 px-4 md:px-8 bg-slate-900 text-white relative overflow-hidden">
            {/* Ambient Lighting Background */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-accent/10 text-accent font-bold rounded-full text-xs sm:text-sm uppercase tracking-wider border border-accent/20">
                        <MapPin className="w-4 h-4 text-accent" />
                        Servizio Tecnico in Provincia di Varese
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                        Assistenza, Riparazione e <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-orange-400 to-amber-300">
                            Manutenzione Caldaie a Varese
                        </span>
                    </h2>
                    <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                        Interventi rapidi di diagnosi e manutenzione caldaie a gas e condensazione a Varese, Casciago, Gallarate, Busto Arsizio e in tutta la provincia. Operiamo con attrezzatura diagnostica avanzata e massima trasparenza.
                    </p>
                </div>

                {/* Main Feature Cards Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/80 hover:border-accent/50 transition-all duration-300 shadow-xl flex flex-col justify-between group">
                        <div>
                            <div className="w-14 h-14 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Wrench className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Riparazione & Pronto Intervento</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                Caldaia in blocco, acqua fredda o perdita d'acqua? Diagnosi accurata delle cause ed eliminazione del guasto senza cambio pezzi inutili.
                            </p>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-700/50">
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Diagnosi guasti con strumenti ufficiali</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Risoluzione blocchi e codici errore</li>
                        </ul>
                    </div>

                    <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/80 hover:border-accent/50 transition-all duration-300 shadow-xl flex flex-col justify-between group">
                        <div>
                            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Flame className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Manutenzione & Controllo Fumi</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                Pulizia bruciatore, scambiatore, verifica pressione vaso espansione, prova di combustione e rilascio rapporto di efficienza termica (Bollino).
                            </p>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-700/50">
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Controllo di sicurezza dell'impianto</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Analisi combustione e fumi</li>
                        </ul>
                    </div>

                    <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/80 hover:border-accent/50 transition-all duration-300 shadow-xl flex flex-col justify-between group">
                        <div>
                            <div className="w-14 h-14 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Esperienza & Competenza E-E-A-T</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                Assistenza tecnica erogata da Simon Silver, tecnico caldaista qualificato con pluriennale esperienza sul campo ed oltre 200.000 visualizzazioni nei corsi tecnici.
                            </p>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-700/50">
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Abilitazione D.M. 37/08 impianti</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Sede a Casciago (Varese)</li>
                        </ul>
                    </div>
                </div>

                {/* Call To Action Box */}
                <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-800/90 border border-slate-700 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-accent font-semibold text-sm">
                            <Clock className="w-4 h-4" />
                            Disponibile per Varese e Provincia
                        </div>
                        <h4 className="text-2xl sm:text-3xl font-extrabold text-white">Hai problemi con la caldaia a Varese?</h4>
                        <p className="text-slate-300 text-sm max-w-xl">
                            Contattaci direttamente al telefono o via mail per richiedere un intervento di assistenza tecnica, riparazione o manutenzione periodica.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <a
                            href="tel:+393493852854"
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-accent hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 text-center"
                        >
                            <PhoneCall className="w-5 h-5" />
                            Chiama 349 385 2854
                        </a>
                        <Link
                            href="/assistenza-caldaie-varese"
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all text-center border border-slate-600"
                        >
                            Scopri i Servizi Varese
                        </Link>
                    </div>
                </div>

                {/* Coverage Towns Tags */}
                <div className="mt-12 text-center text-xs text-slate-400">
                    <p className="font-semibold text-slate-300 mb-2">Comuni serviti in provincia di Varese:</p>
                    <p className="leading-relaxed max-w-4xl mx-auto">
                        Varese • Casciago • Gallarate • Busto Arsizio • Saronno • Tradate • Somma Lombardo • Luino • Gavirate • Malnate • Azzate • Vedano Olona • Induno Olona • Laveno-Mombello • Porto Ceresio • Arcisate
                    </p>
                </div>
            </div>
        </section>
    );
}
