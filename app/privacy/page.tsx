import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">

                    <h1 className="text-3xl font-extrabold text-primary mb-8">Informativa sulla Privacy</h1>

                    <div className="prose prose-gray max-w-none text-gray-600 space-y-6">

                        <section>
                            <h2 className="text-xl font-bold text-primary">1. Titolare del Trattamento</h2>
                            <p>
                                Il Titolare del trattamento dei dati è <strong>Simon Silver Caldaie</strong>,
                                P.IVA 03235620121, contattabile all'indirizzo email: {' '}
                                <a href="mailto:simonsilver@tiscali.it" className="text-accent hover:underline">
                                    simonsilver@tiscali.it
                                </a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">2. Dati Raccolti</h2>
                            <p>Raccogliamo i seguenti dati:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Dati di registrazione</strong>: email e password (criptata).</li>
                                <li><strong>Dati di contatto</strong>: nome, email e messaggio inviato tramite il form contatti.</li>
                                <li><strong>Dati di navigazione</strong>: indirizzo IP, browser, pagine visitate (solo cookie tecnici).</li>
                            </ul>
                            <p>
                                <strong>Non raccogliamo dati di pagamento</strong>: le transazioni sono gestite
                                interamente da PayPal, che ha una propria informativa privacy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">3. Finalità del Trattamento</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Erogazione del servizio (accesso ai corsi acquistati).</li>
                                <li>Rispondere alle richieste di assistenza.</li>
                                <li>Invio di comunicazioni relative agli acquisti.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">4. Base Giuridica</h2>
                            <p>
                                Il trattamento è basato sul consenso dell'utente (art. 6.1.a GDPR) e
                                sull'esecuzione del contratto (art. 6.1.b GDPR).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">5. Conservazione dei Dati</h2>
                            <p>
                                I dati sono conservati per il tempo necessario all'erogazione del servizio
                                e comunque non oltre 10 anni dalla cessazione del rapporto, salvo obblighi di legge.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">6. Condivisione dei Dati</h2>
                            <p>I dati possono essere condivisi con:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Supabase</strong>: per l'autenticazione e il database (server EU).</li>
                                <li><strong>Vercel</strong>: per l'hosting del sito.</li>
                                <li><strong>PayPal</strong>: per la gestione dei pagamenti.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">7. Diritti dell'Interessato</h2>
                            <p>Hai diritto a:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Accedere ai tuoi dati.</li>
                                <li>Richiedere la rettifica o cancellazione.</li>
                                <li>Opporti al trattamento.</li>
                                <li>Richiedere la portabilità dei dati.</li>
                            </ul>
                            <p>
                                Per esercitare questi diritti, contattaci a: {' '}
                                <a href="mailto:simonsilver@tiscali.it" className="text-accent hover:underline">
                                    simonsilver@tiscali.it
                                </a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">8. Cookie</h2>
                            <p>
                                Utilizziamo solo <strong>cookie tecnici</strong> necessari al funzionamento del sito
                                (autenticazione, preferenze). Non utilizziamo cookie di profilazione o di terze parti
                                per finalità pubblicitarie.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">9. Modifiche</h2>
                            <p>
                                Questa informativa può essere aggiornata. La data dell'ultimo aggiornamento è
                                indicata in fondo alla pagina.
                            </p>
                        </section>

                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-400">Ultimo aggiornamento: Gennaio 2026</p>
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
