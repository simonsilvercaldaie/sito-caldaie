// Dati centralizzati per tutti i corsi video
// Struttura aggiornata: 27 corsi definitivi divisi in 3 livelli

export interface Course {
    id: string
    title: string
    shortDescription: string
    fullDescription: string
    youtubeId: string
    freeDuration: string
    premiumDuration: string
    level: "Base" | "Intermedio" | "Avanzato" | "Laboratorio"
    price: string
    learnings: string[]
    premiumContent: string[]
    featured?: boolean
    coverImage?: string
    premiumVideoUrl?: string
}

export const courses: Course[] = [
    // --- LIVELLO BASE (9 Video) ---
    {
        id: "01-caldaia-decisioni",
        title: "1. La caldaia non è stupida: come prende decisioni",
        shortDescription: "Come ragiona una caldaia moderna. Catena dei consensi, logica prima dei componenti.",
        fullDescription: "Come ragiona una caldaia moderna. Catena dei consensi, logica prima dei componenti. Qui il tecnico capisce che non deve “cercare il guasto”, ma capire perché la macchina dice no.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Base",
        price: "29.00",
        learnings: [
            "Logica decisionale della scheda",
            "Catena dei consensi",
            "Perché la caldaia 'dice no'",
            "Smettere di cambiare pezzi a caso"
        ],
        premiumContent: [
            "Analisi dettagliata della catena di sicurezza",
            "Flowchart decisionale universale",
            "Esempi pratici di 'rifiuto' all'avvio"
        ],
        featured: true,
        coverImage: "/images/courses/01-caldaia-decisioni.webp",
        premiumVideoUrl: "/videos/test.mp4" // PLACEHOLDER: Carica il tuo video qui
    },
    {
        id: "02-check-iniziale",
        title: "2. Cosa guardare nei primi 3 minuti davanti a una caldaia",
        shortDescription: "Check mentale iniziale: cosa osservi subito, cosa ignori, cosa rimandi.",
        fullDescription: "Check mentale iniziale: cosa osservi subito, cosa ignori, cosa rimandi. Questo video accorcia il tempo di diagnosi più di qualsiasi strumento.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Base",
        price: "29.00",
        learnings: ["Osservazione preliminare", "Rumori e odori", "Pressioni e temperature a vista", "Errori da non commettere appena arrivati"],
        premiumContent: ["Checklist dei 3 minuti da stampare", "Come interrogare il cliente mentre osservi", "Segnali visivi spesso ignorati"],
        coverImage: "/images/courses/02-check-iniziale.webp"
    },
    {
        id: "03-schema-funzionale",
        title: "3. Schema funzionale: leggere la caldaia senza guardare i pezzi",
        shortDescription: "Lo schema non come disegno, ma come mappa mentale.",
        fullDescription: "Lo schema non come disegno, ma come mappa mentale. Come seguire il flusso logico e capire dove il processo si interrompe.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Base",
        price: "29.00",
        learnings: ["Schema idraulico vs elettrico", "Seguire il flusso logico", "Individuare il punto di rottura", "Mappa mentale del funzionamento"],
        premiumContent: ["Analisi schemi reali (Vaillant, Ariston, ecc.)", "Simulazione guasto su carta", "Dal sintomo al blocco nello schema"],
        coverImage: "/images/courses/03-schema-funzionale.webp"
    },
    {
        id: "04-acs-riscaldamento",
        title: "4. ACS e riscaldamento: quando si rubano il problema",
        shortDescription: "Perché un difetto sanitario sembra riscaldamento (e viceversa).",
        fullDescription: "Perché un difetto sanitario sembra riscaldamento (e viceversa). Errori tipici dei principianti e segnali che li smascherano.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Base",
        price: "29.00",
        learnings: ["Interazione tra i due circuiti", "Il ruolo della valvola deviatrice", "Scambio termico indesiderato", "Diagnosi differenziale"],
        premiumContent: ["Test pratici per isolare il circuito", "Problemi di trafilamento", "Caso studio: radiatori caldi in estate"],
        coverImage: "/images/courses/04-acs-riscaldamento.webp"
    },
    {
        id: "05-sicurezze",
        title: "5. Le sicurezze: quando proteggono e quando ti bloccano",
        shortDescription: "Pressostati, sensori, consensi. Non cosa sono, ma quando intervengono.",
        fullDescription: "Pressostati, sensori, consensi. Non cosa sono, ma quando intervengono e cosa significa davvero quando scattano.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Base",
        price: "29.00",
        learnings: ["Sicurezza sovratemperatura", "Mancanza acqua", "Mancanza tiraggio", "Distinguere guasto sonda da intervento sicurezza"],
        premiumContent: ["Testare le sicurezze senza rischi", "Bypassare per test (con cautela)", "Gerarchia degli interventi"],
        coverImage: "/images/courses/05-sicurezze.webp"
    },
    {
        id: "06-falsi-colpevoli",
        title: "6. I falsi colpevoli più comuni",
        shortDescription: "Componenti spesso accusati e raramente colpevoli.",
        fullDescription: "Componenti spesso accusati e raramente colpevoli. Questo video fa risparmiare soldi, tempo e figuracce.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Base",
        price: "29.00",
        learnings: ["La scheda elettronica (l'accusata n.1)", "La valvola gas", "Lo scambiatore", "Come scagionare i componenti innocenti"],
        premiumContent: ["Statistica reale dei guasti", "Casi in cui sembrava lui ma non era", "Risparmiare ricambi inutili"],
        coverImage: "/images/courses/06-falsi-colpevoli.webp"
    },
    {
        id: "07-manutenzione-vera",
        title: "7. Manutenzione vera vs manutenzione da libretto",
        shortDescription: "Cosa serve davvero controllare, cosa è fumo.",
        fullDescription: "Cosa serve davvero controllare, cosa è fumo. Come una manutenzione fatta bene previene i guasti “strani”.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Base",
        price: "29.00",
        learnings: ["Pulizia vs Controllo", "Punti critici da verificare sempre", "Prevenzione attiva", "Valore aggiunto per il cliente"],
        premiumContent: ["Checklist manutenzione 'Premium'", "Pulizia scambiatori condensazione", "Controllo vaso espansione obbligatorio"],
        coverImage: "/images/courses/07-manutenzione-vera.webp"
    },
    {
        id: "08-segnali-deboli",
        title: "8. Segnali deboli che anticipano il guasto",
        shortDescription: "Rumori, comportamenti anomali, tempi strani.",
        fullDescription: "Rumori, comportamenti anomali, tempi strani. Qui insegni a vedere prima che si rompa.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Base",
        price: "29.00",
        learnings: ["Ascolto della pompa", "Rumori di ebollizione", "Tempi di accensione ritardati", "Piccole oscillazioni di pressione"],
        premiumContent: ["Diagnostica acustica", "Interpretare i log (se presenti)", "Prevedere la rottura per fidelizzare il cliente"],
        coverImage: "/images/courses/08-segnali-deboli.webp"
    },
    {
        id: "09-quando-non-intervenire",
        title: "9. Quando NON intervenire",
        shortDescription: "Il primo video da tecnico maturo. Quando fermarsi.",
        fullDescription: "Il primo video da tecnico maturo. Quando fermarsi, quando rimandare, quando dire “non conviene”.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Base",
        price: "29.00",
        learnings: ["Valutazione costi/benefici", "Sicurezza impianto non a norma", "Caldaie a fine vita", "Etica professionale"],
        premiumContent: ["Come dire di no al cliente", "Responsabilità legale", "Proporre la sostituzione in modo etico"],
        coverImage: "/images/courses/09-quando-non-intervenire.webp"
    },

    // --- LIVELLO INTERMEDIO (9 Video) ---
    {
        id: "10-blocchi-prevedibili",
        title: "10. La caldaia parte ma sai già che si fermerà",
        shortDescription: "Analisi dei blocchi prevedibili. Segnali iniziali.",
        fullDescription: "Analisi dei blocchi prevedibili. Segnali iniziali che dicono “questa non arriva a fine ciclo”.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Ciclo di accensione interrotto", "Fiamma che non tiene", "Salita temperatura troppo rapida", "Caduta di pressione immediata"],
        premiumContent: ["Analisi curve di temperatura", "Problemi di ionizzazione a caldo", "Diagnosi predittiva durante l'accensione"],
        coverImage: "/images/courses/10-blocchi-prevedibili.webp"
    },
    {
        id: "11-problema-impianto",
        title: "11. Quando il problema non è la caldaia ma l’impianto",
        shortDescription: "Pompe, distribuzione, aria, circolazione.",
        fullDescription: "Pompe, distribuzione, aria, circolazione. Come capirlo senza smontare mezza macchina.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Mancanza di circolazione", "Aria nell'impianto", "Sporcizia e fanghi esterni", "Dimensionamento tubi errato"],
        premiumContent: ["Test a 'caldaia chiusa'", "Verifica prevalenza pompa", "Bilanciamento impianto base"],
        coverImage: "/images/courses/11-problema-impianto.webp"
    },
    {
        id: "12-scambiatori-colpevoli",
        title: "12. Scambiatori: quando sono colpevoli e quando no",
        shortDescription: "Primario, sanitario, incrostazioni. Come distingui.",
        fullDescription: "Primario, sanitario, incrostazioni. Come distingui uno scambiatore sporco da un problema di flusso o controllo.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Scambio termico inefficiente", "Sintomi calcare lato acqua", "Intasamento lato fumi", "Sostituire o lavare?"],
        premiumContent: ["Lavaggio chimico sicuro", "Calcolo delta T per diagnosi", "Casi reali di scambiatori 'finti guasti'"],
        coverImage: "/images/courses/12-scambiatori-colpevoli.webp"
    },
    {
        id: "13-valvola-tre-vie",
        title: "13. Valvola a tre vie: il componente che inganna",
        shortDescription: "Sintomi tipici, falsi segnali, errori di diagnosi.",
        fullDescription: "Sintomi tipici, falsi segnali, errori di diagnosi. Quando è davvero lei e quando la stai accusando a torto.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Trafilamento interno", "Blocco meccanico", "Motore vs Corpo valvola", "Diagnosi certa al 100%"],
        premiumContent: ["Revisione cartuccia", "Test motore elettrico", "Bypassare temporaneamente per diagnosi"],
        coverImage: "/images/courses/13-valvola-tre-vie.webp"
    },
    {
        id: "14-sensori-ntc",
        title: "14. Sensori, NTC e pressostati: leggere i numeri senza farsi fregare",
        shortDescription: "Non misurare, ma interpretare. Quando il valore è corretto ma la decisione è sbagliata.",
        fullDescription: "Non misurare, ma interpretare. Quando il valore è corretto ma la decisione è sbagliata.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Deriva termica NTC", "Isteresi pressostati", " falsi contatti", "Leggere col multimetro vs leggere dalla scheda"],
        premiumContent: ["Tabella valori Ohm/Temp universale", "Costruire un simulatore di sensori", "Casi di sensori 'bugiardi'"],
        coverImage: "/images/courses/14-sensori-ntc.webp"
    },
    {
        id: "15-scheda-elettronica",
        title: "15. Scheda elettronica: quando dice la verità e quando mente",
        shortDescription: "Codici errore, blocchi logici, limiti della diagnostica.",
        fullDescription: "Codici errore, blocchi logici, limiti della diagnostica. Quando NON toccare la scheda.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Codici generici vs specifici", "La scheda come 'vittima' di altri guasti", "Reset software vs Guasto hardware", "Quando sostituirla davvero"],
        premiumContent: ["Verifica alimentazioni a bordo", "Relè incollati", "Tracce bruciate o saldature fredde"],
        coverImage: "/images/courses/15-scheda-elettronica.webp"
    },
    {
        id: "16-calcare-magnetite",
        title: "16. Calcare, magnetite e sporco: il nemico silenzioso",
        shortDescription: "Guasti lenti, sintomi confusi, errori ripetuti.",
        fullDescription: "Guasti lenti, sintomi confusi, errori ripetuti. Qui dai un vantaggio enorme al tecnico medio.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Differenza Calcare vs Magnetite", "Danni alle pompe modulanti", "Surriscaldamenti localizzati", "Prevenzione efficace"],
        premiumContent: ["Analisi acqua impianto", "Installazione filtri defangatori", "Lavaggio risanante: quando e come"],
        coverImage: "/images/courses/16-calcare-magnetite.webp"
    },
    {
        id: "17-errori-installazione",
        title: "17. Errori di installazione che paghi anni dopo",
        shortDescription: "Errori nascosti che emergono nel tempo.",
        fullDescription: "Errori nascosti che emergono nel tempo. Come riconoscerli e come spiegarli al cliente senza passare per incapace.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Scarichi fumi non a norma", "Mancanza prese d'aria", "Diametri gas insufficienti", "Assenza vasi espansione sanitari"],
        premiumContent: ["Gestire l'errore altrui col cliente", "Normative UNI essenziali", "Correggere senza rifare tutto"],
        coverImage: "/images/courses/17-errori-installazione.webp"
    },
    {
        id: "18-riparare-senza-cambiare",
        title: "18. Riparare senza cambiare pezzi",
        shortDescription: "Metodo di esclusione. Arrivare alla soluzione togliendo opzioni.",
        fullDescription: "Metodo di esclusione. Come arrivare alla soluzione togliendo opzioni, non aggiungendo ricambi.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Sbloccare pompe e valvole", "Pulire contatti ed elettrodi", "Ricaricare vasi", "Tarare anziché sostituire"],
        premiumContent: ["Kit di sopravvivenza (paglietta, spray, ecc.)", "Interventi 'Mondo Reale'", "Quando la pulizia vale più del ricambio"],
        coverImage: "/images/courses/18-riparare-senza-cambiare.webp"
    },

    // --- LIVELLO AVANZATO (9 Video) ---
    {
        id: "19-combustione-falsa",
        title: "19. La combustione che sembra giusta ma non lo è",
        shortDescription: "Valvola gas, modulazione, fiamma “bella” ma sbagliata.",
        fullDescription: "Valvola gas, modulazione, fiamma “bella” ma sbagliata. Qui separi il tecnico esperto dal cambiaparti.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Analisi fumi avanzata", "Eccesso d'aria nascosto", "CO2 instabile", "Punti di rugiada"],
        premiumContent: ["Tarare valvole gas elettroniche", "Lettura critica scontrino analizzatore", "Combustione condensazione vs premiscelata"],
        coverImage: "/images/courses/19-combustione-falsa.webp"
    },
    {
        id: "20-guasti-intermittenti",
        title: "20. Guasti intermittenti: il vero inferno",
        shortDescription: "Come ragionarli senza impazzire.",
        fullDescription: "Come ragionarli senza impazzire. Quando tornare, cosa osservare, cosa NON fare.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Strategia di monitoraggio", "Replicare le condizioni del guasto", "Fattori ambientali (vento, tensione)", "Pazienza metodica"],
        premiumContent: ["Strumenti di logging", "Intervistare il cliente come un detective", "Il metodo 'Trappola'"],
        coverImage: "/images/courses/20-guasti-intermittenti.webp"
    },
    {
        id: "21-cinque-domande",
        title: "21. Le 5 domande che risolvono metà del guasto",
        shortDescription: "Domande al cliente che valgono più di una misura.",
        fullDescription: "Domande al cliente che valgono più di una misura. Qui formalizzi il tuo “istinto”.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["L'anamnesi tecnica", "Cosa è cambiato da ieri?", "Lo fa sempre o solo quando...?", "Chi l'ha toccata per ultimo?"],
        premiumContent: ["Script di intervista completo", "Decodificare le risposte dei clienti", "Trovare la bugia innocente"],
        coverImage: "/images/courses/21-cinque-domande.webp"
    },
    {
        id: "22-parametri-corretti-guasto",
        title: "22. Quando i parametri sono corretti ma la caldaia non funziona",
        shortDescription: "Il paradosso della normalità apparente. Logica avanzata di esclusione.",
        fullDescription: "Il paradosso della normalità apparente. Logica avanzata di esclusione.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Conflitti software", "Problemi di messa a terra/neutro", "Interferenze elettromagnetiche", "Bug del firmware"],
        premiumContent: ["Uso dell'oscilloscopio (base)", "Verifica terra e polarità avanzata", "Reset di fabbrica e riconfigurazione"],
        coverImage: "/images/courses/22-parametri-corretti-guasto.webp"
    },
    {
        id: "23-perdite-invisibili",
        title: "23. Perdite invisibili e vasi che mentono",
        shortDescription: "Pressione che cala, blocchi strani, rabbocchi continui.",
        fullDescription: "Pressione che cala, blocchi strani, rabbocchi continui. Diagnosi senza vedere l’acqua.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Perdite nello scambiatore primario (evaporano)", "Valvole sicurezza che gocciolano solo a caldo", "Vaso scarico ma non rotto", "Perdite sottotraccia"],
        premiumContent: ["Tecniche di ricerca perdite", "Isolare caldaia vs impianto", "Gestione del vaso espansione problematica"],
        coverImage: "/images/courses/23-perdite-invisibili.webp"
    },
    {
        id: "24-problema-insieme",
        title: "24. Quando il problema è l’insieme, non il pezzo",
        shortDescription: "Guasti sistemici. Impianto, caldaia e utilizzo.",
        fullDescription: "Guasti sistemici. Impianto, caldaia e utilizzo che insieme creano il difetto.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Compatibilità caldaia/impianto", "Pendolamenti dovuti ai termostati", "Portate minime non rispettate", "Problemi idraulici complessi"],
        premiumContent: ["Analisi sistemica", "Risolvere senza cambiare caldaia", "Modifiche impiantistiche correttive"],
        coverImage: "/images/courses/24-problema-insieme.webp"
    },
    {
        id: "25-decisione-finale",
        title: "25. Decisione finale: riparo, rimando o fermo",
        shortDescription: "Responsabilità tecnica. Quando dire basta è la scelta migliore.",
        fullDescription: "Responsabilità tecnica. Quando dire basta è la scelta migliore.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Valutazione del rischio", "Preventivazione onesta", "Responsabilità civile e penale", "Dormire sonni tranquilli"],
        premiumContent: ["Procedure di messa fuori servizio", "Documentazione da lasciare", "Gestire il cliente arrabbiato"],
        coverImage: "/images/courses/25-decisione-finale.webp"
    },
    {
        id: "26-gestire-cliente",
        title: "26. Gestire il cliente senza perdere autorità",
        shortDescription: "Cosa spiegare, cosa no. Come guidare la decisione.",
        fullDescription: "Cosa spiegare, cosa no. Come guidare la decisione senza entrare in conflitto.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Comunicazione assertiva", "Spiegare il guasto in parole semplici", "Giustificare il prezzo", "Farsi rispettare come professionista"],
        premiumContent: ["Frasi da dire e da non dire", "Gestire l'obiezione 'è troppo caro'", "Costruire fiducia immediata"],
        coverImage: "/images/courses/26-gestire-cliente.webp"
    },
    {
        id: "27-pensare-primario",
        title: "27. Pensare come un primario",
        shortDescription: "Sintesi finale. Come guardare una caldaia, non come smontarla.",
        fullDescription: "Sintesi finale. Come guardare una caldaia, non come smontarla. Questo video chiude il cerchio.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "30 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Visione d'insieme", "Mindset diagnostico superiore", "L'esperienza codificata", "Diventare un riferimento"],
        premiumContent: ["Il manifesto del tecnico evoluto", "Next steps per la carriera", "Saluti finali e augurio"],
        coverImage: "/images/courses/27-pensare-primario.webp"
    }
]

// --- PERCORSI TEMATICI ---
export interface PercorsoTematico {
    id: string
    number: number
    title: string
    description: string
    courseIds: string[]
}

export const percorsiTematici: PercorsoTematico[] = [
    {
        id: "percorso-1",
        number: 1,
        title: "Smetti di Cambiare Pezzi",
        description: "Impara a ragionare prima di smontare. Dalla logica della caldaia alla diagnosi senza ricambi inutili.",
        courseIds: ["01-caldaia-decisioni", "04-acs-riscaldamento", "06-falsi-colpevoli", "13-valvola-tre-vie", "15-scheda-elettronica"]
    },
    {
        id: "percorso-2",
        number: 2,
        title: "Il Tecnico che Fidelizza",
        description: "Gestisci il cliente, previeni i problemi e costruisci fiducia. Il lato professionale che nessuno insegna.",
        courseIds: ["10-blocchi-prevedibili", "12-scambiatori-colpevoli", "16-calcare-magnetite", "17-errori-installazione", "26-gestire-cliente"]
    },
    {
        id: "percorso-3",
        number: 3,
        title: "Proteggi Te Stesso",
        description: "Responsabilità, decisioni difficili e quando dire di no. Il mindset del tecnico maturo.",
        courseIds: ["09-quando-non-intervenire", "19-combustione-falsa", "21-cinque-domande", "25-decisione-finale"]
    }
]

export const getPercorsoById = (id: string) => percorsiTematici.find(p => p.id === id)

export const getCoursesForPercorso = (percorso: PercorsoTematico): Course[] =>
    percorso.courseIds.map(id => courses.find(c => c.id === id)).filter((c): c is Course => c !== undefined)

// Corsi in evidenza per la homepage (uno per livello)
export const getFeaturedCourses = () => [
    courses.find(c => c.id === "01-caldaia-decisioni")!,
    courses.find(c => c.id === "10-blocchi-prevedibili")!,
    courses.find(c => c.id === "27-pensare-primario")!
]

// Trova un corso per slug
export const getCourseBySlug = (slug: string) => courses.find(c => c.id === slug)

// Tutti i corsi per il catalogo
export const getAllCourses = () => courses
