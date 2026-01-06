import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function TerminiPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">

                    <h1 className="text-3xl font-extrabold text-primary mb-8">Termini e Condizioni</h1>

                    <div className="prose prose-gray max-w-none text-gray-600 space-y-6">

                        <section>
                            <h2 className="text-xl font-bold text-primary">1. Oggetto del Servizio</h2>
                            <p>
                                Simon Silver Caldaie (P.IVA 03235620121) offre video corsi di formazione tecnica
                                per professionisti del settore termoidraulico. I contenuti sono erogati in formato
                                digitale e accessibili tramite l'area riservata del sito.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">2. Contenuti Digitali e Diritto di Recesso</h2>
                            <p>
                                Ai sensi dell'art. 59, comma 1, lettera o) del D.Lgs. 206/2005 (Codice del Consumo),
                                il diritto di recesso <strong>non si applica</strong> ai contratti di fornitura di
                                contenuto digitale mediante un supporto non materiale se l'esecuzione è iniziata
                                con l'accordo espresso del consumatore e con la sua accettazione del fatto che
                                perderà il diritto di recesso.
                            </p>
                            <p>
                                Registrandoti al sito e acquistando un corso, acconsenti esplicitamente
                                all'accesso immediato al contenuto digitale e riconosci che, una volta sbloccato,
                                non avrai diritto al rimborso.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">3. Licenza d'Uso</h2>
                            <p>
                                L'acquisto di un corso concede una licenza personale, non trasferibile e non esclusiva
                                per la visione dei contenuti. È vietata la condivisione, redistribuzione, download
                                non autorizzato o qualsiasi forma di pirateria.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">4. Pagamenti</h2>
                            <p>
                                I pagamenti sono gestiti tramite PayPal. L'accesso al corso viene sbloccato
                                automaticamente dopo la conferma del pagamento.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">5. Privacy e Dati Personali</h2>
                            <p>
                                I tuoi dati personali sono trattati nel rispetto del GDPR (Regolamento UE 2016/679).
                                Per maggiori informazioni, consulta la nostra informativa sulla privacy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">6. Contatti</h2>
                            <p>
                                Per qualsiasi domanda puoi contattarci all'indirizzo email: {' '}
                                <a href="mailto:simonsilver@tiscali.it" className="text-accent hover:underline">
                                    simonsilver@tiscali.it
                                </a>
                            </p>
                        </section>

                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
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
