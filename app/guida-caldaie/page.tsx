import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BookOpen, Wrench, Thermometer, Zap, Droplets, Shield, AlertTriangle, ArrowRight, Youtube, Award } from 'lucide-react'

const sections = [
    {
        id: 'come-funziona',
        icon: <BookOpen className="w-7 h-7" />,
        title: 'Come Funziona una Caldaia: La Logica Prima dei Pezzi',
        color: 'blue',
        content: `Una caldaia moderna non è una scatola che brucia gas. È un sistema che ragiona. Ogni volta che il termostato chiede calore, la scheda elettronica avvia una sequenza di controlli chiamata "catena dei consensi": verifica la pressione dell'acqua, controlla il tiraggio dei fumi, accerta che non ci siano blocchi di sicurezza attivi, e solo quando TUTTO è confermato — dà l'OK all'accensione.

Se uno qualsiasi di questi controlli fallisce, la caldaia dice "no". Non è rotta — sta facendo il suo lavoro. Il problema è che molti tecnici saltano questa logica e iniziano a cambiare pezzi a caso: prima la scheda, poi la pompa, poi il pressostato... ognuno costa, nessuno risolve.

Il primo passo per diventare un buon tecnico caldaista è capire PERCHÉ la macchina rifiuta di partire, non COSA sostituire. Questo approccio — la diagnosi logica — è quello che insegno nel Livello Base del mio corso, partendo dal Video 1: "La caldaia non è stupida: come prende decisioni".`,
        courses: [
            { id: '01-caldaia-decisioni', label: 'Video 1: Logica decisionale' },
            { id: '03-schema-funzionale', label: 'Video 3: Schema funzionale' },
            { id: '05-sicurezze', label: 'Video 5: Le sicurezze' },
        ],
    },
    {
        id: 'diagnosi-guasti',
        icon: <Wrench className="w-7 h-7" />,
        title: 'Come Diagnosticare un Guasto alla Caldaia',
        color: 'green',
        content: `La diagnosi di un guasto non inizia con il tester in mano. Inizia con gli occhi, le orecchie e tre domande al cliente. Nei primi 3 minuti davanti a una caldaia puoi già eliminare il 50% delle ipotesi: guardi la pressione, ascolti la pompa, annusi l'aria, osservi se ci sono macchie d'acqua o segni di surriscaldamento.

I "falsi colpevoli" sono il problema più costoso nel mondo delle caldaie. La scheda elettronica è la numero uno tra le accusate — ma nella maggior parte dei casi è la vittima, non la causa. Valvole gas, scambiatori, NTC: tutti vengono sostituiti inutilmente quando il vero guasto è altrove.

Il metodo corretto è per esclusione: togli opzioni, non aggiungi ricambi. Testa i componenti nella loro posizione, interpreta i codici errore con spirito critico (perché la scheda non sempre dice la verità), e arrivi alla soluzione con certezza. Questo approccio è il cuore del Livello Intermedio.`,
        courses: [
            { id: '02-check-iniziale', label: 'Video 2: Check iniziale 3 minuti' },
            { id: '06-falsi-colpevoli', label: 'Video 6: I falsi colpevoli' },
            { id: '18-riparare-senza-cambiare', label: 'Video 18: Riparare senza cambiare pezzi' },
            { id: '20-guasti-intermittenti', label: 'Video 20: Guasti intermittenti' },
        ],
    },
    {
        id: 'manutenzione',
        icon: <Thermometer className="w-7 h-7" />,
        title: 'Manutenzione Caldaia: Cosa Controllare Davvero',
        color: 'orange',
        content: `La manutenzione "da libretto" e la manutenzione vera sono due cose diverse. Il libretto ti dice di fare l'analisi fumi e pulire il bruciatore una volta l'anno. È il minimo sindacale. La manutenzione vera è quella che previene i guasti "strani" che poi ti fanno tornare tre volte.

Cosa controlla un tecnico esperto durante una manutenzione? La pressione del vaso d'espansione (non solo la pressione dell'impianto). Il delta T tra mandata e ritorno. I rumori della pompa che cambiano nel tempo. Le micro-perdite che evaporano prima che le vedi. La qualità dell'acqua — calcare e magnetite sono nemici silenziosi che rovinano gli scambiatori in 2-3 anni.

I segnali deboli sono la chiave: un rumore che non c'era il mese scorso, un tempo di accensione che si allunga di mezzo secondo, una lieve oscillazione di pressione. Questi sono i campanelli d'allarme che un tecnico formato sa riconoscere e che gli danno un vantaggio enorme.`,
        courses: [
            { id: '07-manutenzione-vera', label: 'Video 7: Manutenzione vera vs da libretto' },
            { id: '08-segnali-deboli', label: 'Video 8: Segnali deboli' },
            { id: '16-calcare-magnetite', label: 'Video 16: Calcare e magnetite' },
        ],
    },
    {
        id: 'codici-errore',
        icon: <Zap className="w-7 h-7" />,
        title: 'Codici Errore Caldaia: Come Interpretarli (Senza Farsi Fregare)',
        color: 'purple',
        content: `I codici errore della caldaia sono indizi, non sentenze. Un errore "fiamma assente" non significa sempre che l'elettrodo è sporco — potrebbe essere un problema di gas, di tiraggio, di messa a terra, o persino un bug del firmware. Un errore "sovratemperatura" non significa sempre che la sonda NTC è guasta — potrebbe essere la pompa che non circola, il calcare nello scambiatore, o l'aria nell'impianto.

La scheda elettronica ha dei limiti. Legge i sensori e prende decisioni basate su soglie predefinite. Ma non può sapere tutto: un NTC che legge 42°C quando l'acqua è a 45°C è tecnicamente "in tolleranza", ma quella differenza può causare comportamenti anomali per mesi prima che si manifesti un blocco.

Per questo il tecnico esperto non si fida ciecamente del display. Usa il codice come punto di partenza, poi verifica con i propri strumenti e con la propria esperienza. Nel Livello Intermedio dedico un video intero alla scheda elettronica: quando dice la verità e quando mente.`,
        courses: [
            { id: '15-scheda-elettronica', label: 'Video 15: Scheda elettronica' },
            { id: '14-sensori-ntc', label: 'Video 14: Sensori, NTC e pressostati' },
            { id: '22-parametri-corretti-guasto', label: 'Video 22: Parametri corretti ma guasto' },
        ],
    },
    {
        id: 'componenti',
        icon: <Droplets className="w-7 h-7" />,
        title: 'Problemi ai Componenti: Scambiatore, Valvola 3 Vie, Vaso Espansione',
        color: 'cyan',
        content: `Lo scambiatore è colpevole o innocente? Dipende. Uno scambiatore primario intasato lato fumi causa sovratemperatura. Uno intasato lato acqua causa rumore di ebollizione. Ma entrambi i sintomi possono essere causati anche da una pompa debole o da un impianto sporco. Prima di smontare (o peggio, sostituire), serve una diagnosi differenziale.

La valvola a tre vie è il componente che inganna di più. Un trafilamento interno fa sembrare un problema sanitario come fosse un problema riscaldamento, e viceversa. Il motore può bloccarsi, la cartuccia può grippare, il microswitch può dare falsi contatti. Eppure spesso il problema non è lei, ma il termostato o la scheda che la comanda.

Le perdite invisibili sono un classico del Livello Avanzato: la pressione cala lentamente, il cliente riempie ogni settimana, il tecnico non vede acqua a terra. Dove va? Potrebbe evaporare dallo scambiatore primario (micro-fessura), gocciolare dalla valvola di sicurezza solo a caldo, o perdersi sottotraccia nell'impianto.`,
        courses: [
            { id: '12-scambiatori-colpevoli', label: 'Video 12: Scambiatori' },
            { id: '13-valvola-tre-vie', label: 'Video 13: Valvola a tre vie' },
            { id: '04-acs-riscaldamento', label: 'Video 4: ACS e riscaldamento' },
            { id: '23-perdite-invisibili', label: 'Video 23: Perdite invisibili' },
        ],
    },
    {
        id: 'impianto-vs-caldaia',
        icon: <AlertTriangle className="w-7 h-7" />,
        title: 'Quando il Problema NON è la Caldaia ma l\'Impianto',
        color: 'red',
        content: `Uno degli errori più comuni è dare la colpa alla caldaia quando il vero problema è l'impianto. Aria nei radiatori, fanghi nelle tubazioni, prevalenza pompa insufficiente, diametri gas non adeguati, assenza di prese d'aria — tutti problemi che fanno impazzire la caldaia senza che sia lei la responsabile.

Gli errori di installazione sono particolarmente insidiosi perché emergono mesi o anni dopo. Un tubo gas sottodimensionato funziona bene d'estate (basso carico), ma in inverno la caldaia va in blocco a piena potenza. Una canna fumaria troppo lunga funziona quando non c'è vento, ma con la tramontana il tiraggio si inverte.

E poi ci sono i guasti sistemici: quando il problema non è un singolo pezzo, ma l'insieme — caldaia, impianto e utilizzo che interagiscono creando un difetto che nessun ricambio può risolvere. Qui serve ragionare come un medico: visione d'insieme, anamnesi completa, diagnosi differenziale.`,
        courses: [
            { id: '11-problema-impianto', label: 'Video 11: Problema impianto' },
            { id: '17-errori-installazione', label: 'Video 17: Errori di installazione' },
            { id: '24-problema-insieme', label: 'Video 24: Quando il problema è l\'insieme' },
        ],
    },
    {
        id: 'professione',
        icon: <Shield className="w-7 h-7" />,
        title: 'Diventare un Tecnico Caldaie Esperto: Mindset e Responsabilità',
        color: 'slate',
        content: `Essere un bravo tecnico caldaie non è solo saper usare il tester. È sapere quando NON intervenire. Quando dire "questa caldaia va sostituita" senza sentirsi in colpa. Quando fermare una macchina perché non è sicura, anche se il cliente si arrabbia. Quando dire "non conviene ripararla" senza paura di perdere il lavoro.

Il rapporto col cliente è metà del lavoro. Spiegare un guasto in parole semplici, giustificare un preventivo senza sembrare un ladro, gestire l'obiezione "ma è troppo caro", e costruire fiducia al primo intervento: sono competenze che nessuna scuola tecnica insegna, ma che fanno la differenza tra un tecnico che campa e uno che si fa strada.

Le 5 domande al cliente risolvono metà del guasto prima ancora di aprire la caldaia. "Quando è iniziato?", "Lo fa sempre o solo quando...?", "Chi l'ha toccata per ultimo?". Non sono domande banali — sono l'anamnesi tecnica che trasforma il "non so" in un percorso diagnostico.`,
        courses: [
            { id: '09-quando-non-intervenire', label: 'Video 9: Quando NON intervenire' },
            { id: '21-cinque-domande', label: 'Video 21: Le 5 domande' },
            { id: '25-decisione-finale', label: 'Video 25: Decisione finale' },
            { id: '26-gestire-cliente', label: 'Video 26: Gestire il cliente' },
            { id: '27-pensare-primario', label: 'Video 27: Pensare come un primario' },
        ],
    },
]

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-600', iconBg: 'bg-blue-100 text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-600', iconBg: 'bg-green-100 text-green-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-600', iconBg: 'bg-orange-100 text-orange-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-600', iconBg: 'bg-purple-100 text-purple-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800', badge: 'bg-cyan-600', iconBg: 'bg-cyan-100 text-cyan-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-600', iconBg: 'bg-red-100 text-red-600' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', badge: 'bg-slate-700', iconBg: 'bg-slate-100 text-slate-600' },
}

export default function GuidaCaldaiePage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-white">
            <Navbar />

            {/* JSON-LD Article Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": "Guida Completa alla Diagnosi e Manutenzione Caldaie",
                        "description": "La guida definitiva per tecnici caldaie: diagnosi guasti, manutenzione, codici errore, componenti, e mindset professionale.",
                        "author": {
                            "@type": "Person",
                            "name": "Simon Silver",
                            "url": "https://simonsilvercaldaie.it",
                            "jobTitle": "Tecnico Caldaista e Formatore",
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Simon Silver Caldaie",
                            "logo": { "@type": "ImageObject", "url": "https://simonsilvercaldaie.it/logo.png" },
                        },
                        "datePublished": "2026-03-31",
                        "dateModified": new Date().toISOString().split('T')[0],
                        "mainEntityOfPage": "https://simonsilvercaldaie.it/guida-caldaie",
                        "image": "https://simonsilvercaldaie.it/og-image.png",
                        "inLanguage": "it",
                    }),
                }}
            />

            <main className="flex-grow">
                {/* Hero */}
                <section className="relative py-20 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
                    </div>
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm font-bold mb-8 border border-orange-500/30">
                            <BookOpen className="w-4 h-4" />
                            GUIDA GRATUITA PER TECNICI
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                            Guida Completa alla<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Diagnosi e Manutenzione Caldaie</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                            Tutto quello che un tecnico caldaista deve sapere: dalla logica di funzionamento alla diagnosi dei guasti,
                            dalla manutenzione preventiva alla gestione del cliente.
                            <strong className="text-white"> Scritta da chi le caldaie le tocca ogni giorno.</strong>
                        </p>
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1"><Award className="w-4 h-4 text-amber-400" /> Di Simon Silver</span>
                            <span>•</span>
                            <span>27 video corsi collegati</span>
                            <span>•</span>
                            <span>Aggiornata 2026</span>
                        </div>
                    </div>
                </section>

                {/* Table of Contents */}
                <section className="py-12 px-4 bg-gray-50 border-b">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">📑 Indice della Guida</h2>
                        <nav className="grid md:grid-cols-2 gap-3">
                            {sections.map((s, i) => {
                                const c = colorMap[s.color]
                                return (
                                    <a key={s.id} href={`#${s.id}`} className={`flex items-center gap-3 ${c.bg} ${c.border} border rounded-xl p-4 hover:shadow-md transition-all group`}>
                                        <span className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center text-sm font-bold flex-shrink-0`}>{i + 1}</span>
                                        <span className={`font-semibold ${c.text} group-hover:underline text-sm md:text-base`}>{s.title}</span>
                                    </a>
                                )
                            })}
                        </nav>
                    </div>
                </section>

                {/* Content Sections */}
                <div className="max-w-4xl mx-auto px-4 py-16 space-y-20">
                    {sections.map((section, idx) => {
                        const c = colorMap[section.color]
                        return (
                            <section key={section.id} id={section.id} className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                        {section.icon}
                                    </div>
                                    <div>
                                        <span className={`inline-block text-xs font-bold uppercase tracking-wider ${c.badge} text-white px-2 py-0.5 rounded mb-2`}>Capitolo {idx + 1}</span>
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{section.title}</h2>
                                    </div>
                                </div>

                                <article className="prose prose-lg prose-gray max-w-none mb-8">
                                    {section.content.split('\n\n').map((paragraph, pi) => (
                                        <p key={pi} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
                                    ))}
                                </article>

                                {/* Course Links */}
                                <div className={`${c.bg} ${c.border} border rounded-2xl p-6`}>
                                    <h3 className={`font-bold ${c.text} mb-4 text-sm uppercase tracking-wider`}>
                                        📺 Video Corsi Collegati
                                    </h3>
                                    <div className="space-y-2">
                                        {section.courses.map((course) => (
                                            <Link
                                                key={course.id}
                                                href={`/corso/${course.id}`}
                                                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all group border border-gray-100"
                                            >
                                                <span className="font-medium text-gray-800 group-hover:text-gray-900">{course.label}</span>
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-800 group-hover:translate-x-1 transition-all" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )
                    })}
                </div>

                {/* CTA Bottom */}
                <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                            Vuoi imparare tutto questo <span className="text-amber-400">con i video?</span>
                        </h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                            27 video corsi professionali pensati per tecnici che vogliono smettere di andare a tentativi.
                            Dalla logica della caldaia alla gestione del cliente.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/catalogo/base" className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20">
                                Scopri i Corsi <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/pacchetto-completo" className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-all border border-white/20">
                                Pacchetto Completo — Risparmi €200
                            </Link>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-6 text-gray-400 text-sm">
                            <a href="https://www.youtube.com/@SimonSilverCaldaie" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                                <Youtube className="w-5 h-5 text-red-500" /> Canale YouTube
                            </a>
                            <Link href="/contatti" className="hover:text-white transition-colors">Contattaci</Link>
                            <Link href="/licenze-multidipendente" className="hover:text-white transition-colors">Licenze Aziendali</Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
