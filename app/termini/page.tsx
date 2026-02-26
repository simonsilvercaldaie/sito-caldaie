'use client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function TerminiPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">

                    <h1 className="text-3xl font-extrabold text-primary mb-8">Termini e Condizioni</h1>

                    <div className="prose prose-gray max-w-none text-gray-600 space-y-8">

                        {/* SEZIONE 1: DISPOSIZIONI GENERALI */}
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
                            <h2 className="text-xl font-bold text-primary">3. Pagamenti</h2>
                            <p>
                                I pagamenti sono gestiti tramite PayPal. L'accesso al corso viene sbloccato
                                automaticamente dopo la conferma del pagamento.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">4. Privacy e Dati Personali</h2>
                            <p>
                                I tuoi dati personali sono trattati nel rispetto del GDPR (Regolamento UE 2016/679).
                                Per maggiori informazioni, consulta la nostra{' '}
                                <Link href="/privacy" className="text-accent hover:underline">informativa sulla privacy</Link>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">5. Contatti</h2>
                            <p>
                                Per qualsiasi domanda puoi contattarci all'indirizzo email:{' '}
                                <a href="mailto:simonsilvercaldaie@gmail.com" className="text-accent hover:underline">
                                    simonsilvercaldaie@gmail.com
                                </a>
                            </p>
                        </section>

                        <hr className="border-gray-200 my-8" />

                        {/* SEZIONE 2: PROTEZIONE DEI CONTENUTI */}
                        <div className="bg-gray-50 -mx-8 md:-mx-12 px-8 md:px-12 py-8 border-y border-gray-100">
                            <h2 className="text-2xl font-bold text-primary mb-6">Protezione dei Contenuti</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Gli articoli seguenti regolano le modalità di utilizzo dei contenuti e le tipologie di licenza disponibili.
                            </p>
                        </div>

                        <section>
                            <h2 className="text-xl font-bold text-primary">6. Definizioni</h2>
                            <p><strong>6.1.</strong> <strong>Contenuti</strong>: i videocorsi, i materiali didattici e qualsiasi altro contenuto digitale accessibile tramite la piattaforma.</p>
                            <p><strong>6.2.</strong> <strong>Licenza</strong>: il diritto di accesso ai Contenuti, concesso all'Utente secondo le condizioni previste dal tipo di licenza acquistato.</p>
                            <p><strong>6.3.</strong> <strong>Account nominativo</strong>: un account associato a una singola persona fisica identificata, non cedibile né condivisibile.</p>
                            <p><strong>6.4.</strong> <strong>Utilizzo non conforme alla licenza</strong>: qualsiasi uso dei Contenuti che ecceda i limiti previsti dal tipo di licenza acquistato.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">7. Tipologie di Licenza</h2>
                            <p><strong>7.1.</strong> La piattaforma offre le seguenti tipologie di licenza:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li><strong>Licenza Singola</strong>: per un singolo utente, accesso a vita al livello acquistato</li>
                                <li><strong>Licenza Team 5</strong>: per fino a 5 utenti nominativi, accesso a vita a tutti i livelli. Visione individuale.</li>
                                <li><strong>Licenza Team 10</strong>: per fino a 10 utenti nominativi, accesso a vita a tutti i livelli. Visione individuale.</li>
                                <li><strong>Licenza Team 25</strong>: per fino a 25 utenti nominativi, accesso a vita a tutti i livelli. Visione individuale.</li>
                                <li><strong>Licenza Formazione</strong>: per istituti scolastici, centri di formazione professionale e laboratori tecnici. Fino a 25 utenti nominativi, accesso a vita a tutti i livelli. Consente la proiezione in aula e l'uso didattico dei contenuti.</li>
                            </ul>
                            <p className="mt-4"><strong>7.2.</strong> Ogni licenza Team prevede esclusivamente account nominativi. Ogni account è associato a una singola persona fisica e non può essere condiviso.</p>
                            <p className="mt-4">
                                Per i dettagli completi sui tipi di licenza, consulta la pagina{' '}
                                <Link href="/licenze-team" className="text-accent hover:underline font-semibold">Licenze Team</Link>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">8. Limitazioni della Licenza Personale</h2>
                            <p><strong>8.1.</strong> La Licenza Personale consente l'accesso ai Contenuti esclusivamente all'utente registrato, per scopi di studio e aggiornamento professionale individuale.</p>
                            <p className="mt-4"><strong>8.2.</strong> Con la Licenza Personale è espressamente vietato:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>condividere le credenziali di accesso con terzi;</li>
                                <li>consentire l'accesso all'account a persone diverse dall'intestatario;</li>
                                <li>proiettare i Contenuti in ambienti collettivi (sale riunioni, aule, cantieri, veicoli con più persone);</li>
                                <li>utilizzare i Contenuti per attività di formazione aziendale, interna o esterna;</li>
                                <li>registrare, scaricare, duplicare o redistribuire i Contenuti in qualsiasi forma.</li>
                            </ul>
                            <p className="mt-4"><strong>8.3.</strong> Per usi aziendali o collettivi è obbligatorio acquistare una licenza Team appropriata (Team 5, Team 10 o Team 25).</p>
                            <p className="mt-4"><strong>8.4.</strong> Per l'uso didattico, la proiezione in aula, la formazione scolastica o professionale, è obbligatorio acquistare la <strong>Licenza Formazione</strong>. Le licenze Team 5, Team 10 e Team 25 <strong>non</strong> autorizzano la proiezione collettiva né l'uso formativo.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">9. Modalità di Fruizione e Dispositivi</h2>
                            <p><strong>9.1.</strong> I Contenuti sono erogati esclusivamente in modalità streaming. Non è previsto il download dei file video.</p>
                            <p className="mt-4"><strong>9.2.</strong> L'accesso è consentito su un solo dispositivo alla volta per ciascun account. L'avvio di una nuova sessione comporta la chiusura automatica della sessione precedente.</p>
                            <p className="mt-4"><strong>9.3.</strong> Ogni account può registrare un massimo di <strong>2 dispositivi</strong> (es. PC e telefono). È possibile modificare i dispositivi associati una volta ogni <strong>30 giorni</strong> dalla propria dashboard personale.</p>
                            <p className="mt-4"><strong>9.4.</strong> I Contenuti possono riportare una filigrana digitale contenente l'indirizzo email dell'utente, a fini di tutela della proprietà intellettuale.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">10. Monitoraggio e Finalità</h2>
                            <p><strong>10.1.</strong> La piattaforma registra dati tecnici di accesso (indirizzo IP, data e ora, tipo di dispositivo) esclusivamente a fini di:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>prevenzione delle frodi;</li>
                                <li>tutela dei diritti di proprietà intellettuale;</li>
                                <li>verifica del rispetto delle condizioni di licenza.</li>
                            </ul>
                            <p className="mt-4"><strong>10.2.</strong> I dati raccolti sono trattati nel rispetto della normativa vigente in materia di protezione dei dati personali (Regolamento UE 2016/679).</p>
                            <p className="mt-4"><strong>10.3.</strong> Il monitoraggio non prevede profilazione comportamentale né cessione di dati a terzi per finalità commerciali.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">11. Utilizzo Non Conforme alla Licenza</h2>
                            <p><strong>11.1.</strong> In caso di rilevazione di un utilizzo non conforme alla licenza, il Titolare si riserva il diritto di:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>inviare una comunicazione all'utente per richiedere chiarimenti;</li>
                                <li>sospendere temporaneamente l'accesso all'account;</li>
                                <li>proporre la regolarizzazione tramite acquisto della licenza appropriata;</li>
                                <li>in caso di rifiuto o mancata risposta, revocare definitivamente l'accesso senza diritto a rimborso.</li>
                            </ul>
                            <p className="mt-4"><strong>11.2.</strong> La sospensione o revoca dell'accesso non comporta alcun obbligo di indennizzo a carico del Titolare.</p>
                            <p className="mt-4"><strong>11.3.</strong> L'utente ha sempre la possibilità di contestare la rilevazione e fornire chiarimenti prima di qualsiasi provvedimento definitivo.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">12. Proprietà Intellettuale</h2>
                            <p><strong>12.1.</strong> Tutti i Contenuti sono protetti dalle leggi italiane e internazionali sul diritto d'autore.</p>
                            <p className="mt-4"><strong>12.2.</strong> L'acquisto di una licenza non trasferisce alcun diritto di proprietà intellettuale. L'utente acquisisce esclusivamente un diritto di fruizione personale, nei limiti della licenza acquistata.</p>
                            <p className="mt-4"><strong>12.3.</strong> È vietata qualsiasi forma di riproduzione, distribuzione, comunicazione al pubblico o messa a disposizione dei Contenuti senza autorizzazione scritta del Titolare.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-primary">13. Accettazione</h2>
                            <p><strong>13.1.</strong> L'acquisto di qualsiasi licenza comporta l'accettazione integrale dei presenti Termini e Condizioni.</p>
                            <p className="mt-4"><strong>13.2.</strong> In fase di acquisto, l'utente conferma di aver letto e compreso le limitazioni della licenza selezionata.</p>
                        </section>

                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                        <Link href="/" className="text-sm text-gray-400 hover:text-primary transition-colors">
                            ← Torna alla Home
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
