'use client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { CheckCircle2, Users, Building2, GraduationCap, User, Mail } from 'lucide-react'

export default function LicenzePage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Tipi di Licenza</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Ogni licenza dà accesso completo ai contenuti acquistati, senza limiti di tempo né scadenze.
                            La differenza sta nel <strong>numero di persone autorizzate</strong> e nelle <strong>modalità d'uso consentite</strong>.
                        </p>
                    </div>

                    {/* License Cards */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">

                        {/* Licenza Personale */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-accent/30 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                    <User className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-primary">Licenza Personale</h2>
                            </div>
                            <p className="text-gray-600 mb-4">Per un singolo professionista.</p>
                            <ul className="space-y-2 text-sm text-gray-700 mb-6">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Accesso illimitato nel tempo
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Visione su un dispositivo alla volta
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Uso esclusivamente individuale
                                </li>
                            </ul>
                            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
                                <strong>Non consente:</strong> condivisione credenziali, proiezione in aula, formazione di colleghi.
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                <strong>Indicata per:</strong> tecnici autonomi, dipendenti che si aggiornano per conto proprio.
                            </p>
                        </div>

                        {/* Licenza Team */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-accent/30 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-primary">Licenza Team</h2>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">2-5 persone</span>
                            </div>
                            <p className="text-gray-600 mb-4">Per piccoli gruppi di lavoro.</p>
                            <ul className="space-y-2 text-sm text-gray-700 mb-6">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Fino a 5 account nominativi
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Ogni utente accede con le proprie credenziali
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Visione individuale, non in proiezione condivisa
                                </li>
                            </ul>
                            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
                                <strong>Non consente:</strong> uso di un singolo account da parte di più persone.
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                <strong>Indicata per:</strong> ditte con pochi collaboratori.
                            </p>
                        </div>

                        {/* Licenza Azienda */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-accent/30 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-primary">Licenza Azienda</h2>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">6-20 persone</span>
                            </div>
                            <p className="text-gray-600 mb-4">Per squadre tecniche strutturate.</p>
                            <ul className="space-y-2 text-sm text-gray-700 mb-6">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Fino a 20 account nominativi
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Pannello di gestione dedicato
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Possibilità di aggiungere o rimuovere utenti
                                </li>
                            </ul>
                            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
                                <strong>Non consente:</strong> proiezione collettiva, formazione in aula.
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                <strong>Indicata per:</strong> aziende con più tecnici operativi.
                            </p>
                        </div>

                        {/* Licenza Formatore */}
                        <div className="bg-gradient-to-br from-accent/10 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-accent/20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-accent/20 text-accent rounded-xl">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-primary">Licenza Formatore</h2>
                            </div>
                            <p className="text-gray-600 mb-4">Per centri di formazione, scuole tecniche, enti accreditati.</p>
                            <ul className="space-y-2 text-sm text-gray-700 mb-6">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Proiezione in aula autorizzata
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Uso didattico consentito
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    Preventivo personalizzato
                                </li>
                            </ul>
                            <a
                                href="mailto:simonsilver@tiscali.it?subject=Richiesta%20Licenza%20Formatore"
                                className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Mail className="w-4 h-4" />
                                Richiedi Preventivo
                            </a>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-12">
                        <h2 className="text-2xl font-bold text-primary mb-6">Quale licenza scegliere?</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Situazione</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Licenza consigliata</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4">Studio personale, aggiornamento individuale</td>
                                        <td className="py-3 px-4 font-semibold text-blue-600">Personale</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4">2-5 colleghi, ognuno studia per sé</td>
                                        <td className="py-3 px-4 font-semibold text-green-600">Team</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4">6-20 tecnici in azienda</td>
                                        <td className="py-3 px-4 font-semibold text-purple-600">Azienda</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4">Formazione in aula, corsi a terzi</td>
                                        <td className="py-3 px-4 font-semibold text-accent">Formatore</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-12">
                        <h2 className="text-2xl font-bold text-primary mb-6">Domande frequenti</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">Posso guardare i video da più dispositivi?</h3>
                                <p className="text-gray-600">Sì, puoi accedere da qualsiasi dispositivo. L'unico vincolo è che la visione può avvenire su un solo dispositivo alla volta.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">Cosa succede se cambio telefono o computer?</h3>
                                <p className="text-gray-600">Nessun problema. Non c'è limite al numero di dispositivi su cui puoi accedere, solo alla visione simultanea.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">Posso far vedere i video a un collega?</h3>
                                <p className="text-gray-600">Con la licenza personale, no. Se hai bisogno di formare più persone, scegli la licenza Team o Azienda.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">I video scadono?</h3>
                                <p className="text-gray-600">No. L'accesso è illimitato nel tempo.</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Aziende */}
                    <div className="bg-gradient-to-br from-primary to-slate-800 rounded-2xl shadow-lg p-8 text-center text-white">
                        <h2 className="text-2xl font-bold mb-4">Hai bisogno di una licenza per più persone?</h2>
                        <p className="text-white/80 mb-6 max-w-xl mx-auto">
                            Contattaci per ricevere un preventivo personalizzato per le licenze Team, Azienda o Formatore.
                        </p>
                        <a
                            href="mailto:simonsilver@tiscali.it?subject=Richiesta%20Licenza%20Aziendale"
                            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            Contattaci
                        </a>
                    </div>

                    {/* Link ToS */}
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500 mb-4">
                            Per i termini completi sull'utilizzo dei contenuti, consulta i{' '}
                            <Link href="/termini" className="text-accent hover:underline font-semibold">Termini e Condizioni</Link>.
                        </p>
                        <Link href="/" className="text-sm text-gray-400 hover:text-primary transition-colors">
                            ← Torna alla Home
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="bg-slate-900 text-slate-400 py-8 px-4 border-t border-slate-800">
                <div className="max-w-6xl mx-auto text-center text-sm">
                    &copy; {new Date().getFullYear()} Simon Silver. P.IVA 03235620121
                </div>
            </footer>
        </div>
    )
}
