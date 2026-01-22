'use client'
import { Lock, MonitorPlay, ShieldCheck, Users } from "lucide-react"
import Link from "next/link"
import { LEGAL_TEXT_HOMEPAGE } from "@/lib/legalTexts"

export default function ProductShowcase() {

    // LevelCard component definition (copied from Catalogo logic)
    const LevelCard = ({ title, description, level, link, colorClass, badgeClass, icon, footerText = "Esplora i 9 Corsi" }: { title: string, description: string, level: string, link: string, colorClass: string, badgeClass: string, icon: any, footerText?: string }) => (
        <Link href={link} className="block group">
            <div className={`rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col ${colorClass} bg-white hover:bg-gray-50`}>
                <div className="flex items-center justify-between mb-6">
                    <span className={`px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider border shadow-sm ${badgeClass}`}>
                        {level}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                    {title}
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed flex-grow">
                    {description}
                </p>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-gray-900 flex items-center gap-2">
                        {footerText}
                    </span>
                    <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
                </div>
            </div>
        </Link>
    )

    return (
        <section className="py-20 px-4 md:px-8 bg-slate-50">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-primary">
                        Scegli il tuo <span className="text-accent">Livello</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Un percorso strutturato step-by-step per portarti da principiante a esperto.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <LevelCard
                        title="FONDAMENTA"
                        description="Smetti di andare a caso. Capisci la logica, lo schema e le decisioni della caldaia."
                        level="Base"
                        link="/catalogo/base"
                        colorClass="border-blue-200 hover:border-blue-400"
                        badgeClass="bg-blue-100 text-blue-800 border-blue-200"
                        icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
                    />

                    <LevelCard
                        title="RIPARARE SUL SERIO"
                        description="Risolvi guasti reali con metodo. Scambiatori, valvole, sensori e scheda."
                        level="Intermedio"
                        link="/catalogo/intermedio"
                        colorClass="border-green-200 hover:border-green-400"
                        badgeClass="bg-green-100 text-green-800 border-green-200"
                        icon={<MonitorPlay className="w-6 h-6 text-green-600" />}
                    />

                    <LevelCard
                        title="TECNICO CHE DECIDE"
                        description="Diagnosi avanzata e mindset. Gestione del cliente e guasti impossibili."
                        level="Avanzato"
                        link="/catalogo/avanzato"
                        colorClass="border-red-200 hover:border-red-400"
                        badgeClass="bg-red-100 text-red-800 border-red-200"
                        icon={<ShieldCheck className="w-6 h-6 text-red-600" />}
                    />
                </div>



                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-primary">
                        Vai <span className="text-accent">Oltre</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Contenuti fuori schema per tecnici curiosi.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto mb-20">
                    <LevelCard
                        title="LABORATORIO"
                        description="Casi studio reali, video extra e approfondimenti. Contenuti fuori schema per tecnici curiosi."
                        level="Extra"
                        link="/catalogo/laboratorio"
                        colorClass="border-yellow-200 hover:border-yellow-400"
                        badgeClass="bg-yellow-100 text-yellow-800 border-yellow-200"
                        icon={<MonitorPlay className="w-6 h-6 text-yellow-600" />}
                        footerText="Esplora il Laboratorio"
                    />
                </div>

                {/* SEZIONE TEAM */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-4">
                            Sei un <span className="text-indigo-600">Team</span>?
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                            Risparmia fino al 40% con le licenze aziendali. Accesso completo a tutti i livelli per i tuoi collaboratori.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-3xl p-8 shadow-xl">
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
                                <h3 className="text-indigo-900 font-bold text-lg mb-1">Team 5</h3>
                                <p className="text-gray-500 text-sm mb-3">Fino a 5 Tecnici</p>
                                <div className="text-2xl font-extrabold text-primary">€ 1.500</div>
                            </div>
                            <div className="p-4 bg-indigo-600 text-white rounded-xl shadow-md transform scale-105">
                                <h3 className="font-bold text-lg mb-1">Team 10</h3>
                                <p className="text-indigo-100 text-sm mb-3">Fino a 10 Tecnici</p>
                                <div className="text-2xl font-extrabold">€ 2.000</div>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
                                <h3 className="text-indigo-900 font-bold text-lg mb-1">Team 25</h3>
                                <p className="text-gray-500 text-sm mb-3">Fino a 25 Tecnici</p>
                                <div className="text-2xl font-extrabold text-primary">€ 3.000</div>
                            </div>
                        </div>
                        <div className="mt-8 text-center">
                            <p className="text-gray-600 mb-6 font-medium">
                                Ogni tecnico ha il suo accesso personale. Monitoraggio completamento per il responsabile.
                            </p>
                            <Link href="/catalogo/base" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                <Users className="w-5 h-5" />
                                Vedi dettagli nei corsi
                            </Link>
                        </div>
                    </div>
                </div>

                {/* FAQ SECTION */}
                <div className="max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl font-bold text-primary text-center mb-10">Domande Frequenti</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800 mb-2">Come accedo ai corsi?</h3>
                            <p className="text-slate-600">
                                Esclusivamente tramite il tuo account Google. Non serve ricordare nuove password.
                                È il metodo più sicuro e veloce.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800 mb-2">Posso guardare i video dal telefono?</h3>
                            <p className="text-slate-600">
                                Sì. Puoi collegare fino a <strong>2 dispositivi</strong> (es. PC e Telefono).
                                Puoi resettare i dispositivi associati una volta ogni 30 giorni dalla tua dashboard.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800 mb-2">Posso condividere l'account con un collega?</h3>
                            <p className="text-slate-600">
                                <strong>No.</strong> La licenza è strettamente personale. Il sistema permette una sola sessione attiva:
                                se accedi da un altro dispositivo, il precedente viene disconnesso. Per i team, esistono le licenze dedicate.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800 mb-2">Come funzionano le licenze Team?</h3>
                            <p className="text-slate-600">
                                Acquistando un pacchetto Team (5, 10 o 25), ricevi un link per invitare i tuoi tecnici.
                                Ognuno entrerà con il proprio account Google personale, occupando uno "slot" della licenza aziendale.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800 mb-2">Ricevo la fattura?</h3>
                            <p className="text-slate-600">
                                Certamente. In fase di primo accesso ti verranno chiesti i dati di fatturazione (P.IVA e SDI).
                                La fattura viene emessa elettronicamente entro i termini di legge.
                            </p>
                        </div>
                    </div>
                </div>


            </div>

            <div className="max-w-4xl mx-auto mt-20">
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-slate-500" />
                        Accesso ai corsi e condizioni di utilizzo
                    </h3>
                    <div className="prose prose-sm text-slate-600 max-w-none">
                        <p className="whitespace-pre-line leading-relaxed">
                            {LEGAL_TEXT_HOMEPAGE}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

