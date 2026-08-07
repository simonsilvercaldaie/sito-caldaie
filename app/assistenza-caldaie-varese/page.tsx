import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Wrench, PhoneCall, ShieldCheck, MapPin, CheckCircle2, Flame, AlertTriangle, FileCheck, Clock, Mail } from 'lucide-react';
import { HvacLocalBusinessJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: 'Assistenza Caldaie Varese e Provincia | Manutenzione e Riparazione - Simon Silver',
    description: 'Servizio professionale di assistenza caldaie, riparazione rapida guasti e manutenzione a Varese, Casciago, Gallarate, Busto Arsizio. Diagnosi esperta e controllo fumi.',
    keywords: [
        'assistenza caldaie varese',
        'manutenzione caldaia varese',
        'riparazione caldaie varese',
        'tecnico caldaie varese',
        'caldaia in blocco varese',
        'pronto intervento caldaie varese',
        'controllo fumi caldaia varese',
        'bollino caldaia varese',
        'assistenza caldaie casciago',
        'manutenzione caldaie gallarate',
        'riparazione caldaie busto arsizio',
        'simon silver caldaie varese'
    ],
    alternates: {
        canonical: 'https://simonsilvercaldaie.it/assistenza-caldaie-varese',
    },
    openGraph: {
        title: 'Assistenza e Manutenzione Caldaie a Varese - Simon Silver',
        description: 'Interventi rapidi di diagnosi, riparazione e manutenzione caldaie in tutta la provincia di Varese.',
        url: 'https://simonsilvercaldaie.it/assistenza-caldaie-varese',
        type: 'website',
        locale: 'it_IT',
    }
};

export default function AssistenzaCaldaieVaresePage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Navbar />
            <HvacLocalBusinessJsonLd />
            <FaqJsonLd />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 px-4 md:px-8 bg-slate-900 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-accent/20 text-accent font-bold rounded-full text-xs sm:text-sm uppercase tracking-wider border border-accent/30">
                            <MapPin className="w-4 h-4 text-accent" />
                            Servizio Locale Qualificato • Varese e Provincia
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                            Assistenza e Manutenzione Caldaie <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-orange-400 to-amber-300">
                                Varese e Provincia
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                            Interventi di manutenzione ordinaria, analisi fumi e riparazione rapida su caldaie a gas e a condensazione. Sede a Casciago (VA), operativi in tutta la provincia di Varese.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <a
                                href="tel:+393493852854"
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-accent hover:bg-orange-600 text-white font-bold rounded-xl text-lg transition-all shadow-xl shadow-orange-500/25"
                            >
                                <PhoneCall className="w-6 h-6" />
                                Chiama ora: 349 385 2854
                            </a>
                            <Link
                                href="/contatti"
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-lg transition-all border border-slate-700"
                            >
                                <Mail className="w-5 h-5 text-slate-300" />
                                Richiedi Preventivo Online
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <span className="text-accent font-extrabold uppercase text-xs tracking-widest">I Nostri Servizi sul Territorio</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                            Soluzioni Tecniche per la Tua Caldaia a Varese
                        </h2>
                        <p className="text-slate-600 text-base">
                            Svolgiamo interventi strutturati basati su un metodo di diagnosi esatto, senza sostituzioni inutili e con massima chiarezza.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-orange-100 text-accent rounded-xl flex items-center justify-center mb-6">
                                <Flame className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Manutenzione Ordinaria Caldaia</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Pulizia del bruciatore e dello scambiatore primario/secondario, verifica delle pressioni idrauliche e del vaso d'espansione per garantire sicurezza e consumi ridotti.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Controllo tenuta gas e valvola di sicurezza</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Verifica rendimento energetico</li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Riparazione Caldaia in Blocco</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                La caldaia segnala un codice errore o non produce acqua calda? Interveniamo per individuare la causa radice (scheda, circolatore, valvole, NTC, pressostato).
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-red-600" /> Risoluzione immediata guasti complessi</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-red-600" /> Diagnosi strumentale della catena consensi</li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <FileCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Analisi Combustione & Controllo Fumi</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Prova di combustione con analizzatore tarato, calcolo del rendimento di combustione e trasmissione dei dati per la conformità di legge.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Rilascio rapporto di controllo di efficienza energetica</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Aggiornamento libretto d'impianto</li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                                <Wrench className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Ricerca Perdite Pressione & Acqua</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Calo continuo di pressione nel circuito riscaldamento? Identifichiamo se il problema risiede nel vaso d'espansione, nello scambiatore o nell'impianto.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Prova di tenuta idraulica</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Ripristino pressione vaso di espansione</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Company & Authoritative E-E-A-T Info */}
                <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
                    <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-4">
                            <span className="text-accent font-bold uppercase text-xs tracking-wider">Chi siamo</span>
                            <h2 className="text-3xl font-extrabold text-white">
                                SIMON SILVER ASSISTENZA CALDAIE
                            </h2>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Azienda fondata da Caroleo Simone con sede a Casciago (Varese). Operiamo nel settore dell'impiantistica e della manutenzione termica con abilitazione D.M. 37/08.
                            </p>
                            <div className="space-y-2 text-sm text-slate-300 pt-2">
                                <p><strong>Ragione Sociale:</strong> SIMON SILVER ASSISTENZA CALDAIE DI CAROLEO SIMONE</p>
                                <p><strong>Sede Legale:</strong> Via San Martino 14, 21020 Casciago (VA)</p>
                                <p><strong>P.IVA / CF:</strong> 03235620121 | REA: VA-334292</p>
                                <p><strong>Telefono:</strong> <a href="tel:+393493852854" className="text-accent hover:underline">+39 349 385 2854</a></p>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-accent" />
                                Perché scegliere Simon Silver a Varese
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                    <span><strong>Competenza Diagnostica:</strong> Formatore tecnico con corsi seguiti da centinaia di professionisti in tutta Italia.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                    <span><strong>Prossimità Locale:</strong> Sede operativa a Casciago, a pochissimi minuti dal centro di Varese.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                    <span><strong>Trasparenza Totale:</strong> Diagnosi prima di qualsiasi sostituzione di componenti.</span>
                                </li>
                            </ul>
                            <div className="pt-4">
                                <a
                                    href="tel:+393493852854"
                                    className="block text-center py-3 px-6 bg-accent hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
                                >
                                    Contatta il Tecnico al 349 385 2854
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
