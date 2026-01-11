// Dati centralizzati per tutti i corsi video
// Struttura aggiornata: 27 corsi divisi in 3 livelli

export interface Course {
    id: string
    title: string
    shortDescription: string
    fullDescription: string
    youtubeId: string
    freeDuration: string
    premiumDuration: string
    level: "Base" | "Intermedio" | "Avanzato"
    price: string
    learnings: string[]
    premiumContent: string[]
    featured?: boolean
}

export const courses: Course[] = [
    // --- LIVELLO BASE (8 Video) ---
    {
        id: "01-cose-caldaia",
        title: "1. Cos’è una caldaia e come ragiona",
        shortDescription: "Funzione, differenza tra scalda e decide, blocchi e sicurezze.",
        fullDescription: "Il punto di partenza fondamentale. Capire la logica di funzionamento di una caldaia, distinguendo tra la parte che genera calore e il cervello che prende le decisioni. Analisi dei blocchi e delle sicurezze primarie.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "29.00",
        learnings: [
            "Funzione principale della caldaia",
            "Differenza tra scalda e decide",
            "Blocchi e sicurezze fondamentali",
            "Logica di base del funzionamento"
        ],
        premiumContent: [
            "Analisi approfondita del ciclo di funzionamento",
            "Come interpretare i primi segnali di malfunzionamento",
            "Logica di intervento delle sicurezze"
        ],
        featured: true
    },
    {
        id: "02-tipologie-caldaie",
        title: "2. Tipologie di caldaie",
        shortDescription: "Camera aperta, stagna, condensazione. Vecchie vs moderne.",
        fullDescription: "Panoramica completa sulle diverse tecnologie: dalle vecchie camera aperta alle moderne a condensazione. Come riconoscerle e le differenze sostanziali nel funzionamento e nella manutenzione.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "29.00",
        learnings: [
            "Camera aperta vs Stagna",
            "La tecnologia a condensazione",
            "Evoluzione storica: vecchie vs moderne",
            "Implicazioni per l'installazione"
        ],
        premiumContent: [
            "Riconoscimento visivo immediato",
            "Normative di base per ogni tipologia",
            "Pro e contro delle diverse tecnologie"
        ]
    },
    {
        id: "03-schema-funzionale",
        title: "3. Schema funzionale completo",
        shortDescription: "Acqua, gas, aria, fumi, elettrico. La mappa del tesoro.",
        fullDescription: "Analisi dettagliata di tutti i circuiti della caldaia: idraulico, gas, aeraulico (fumi) ed elettrico. Impara a leggere lo schema funzionale come una mappa per orientarti in qualsiasi guasto.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "29.00",
        learnings: [
            "Circuito Acqua",
            "Circuito Gas",
            "Circuito Aria/Fumi",
            "Schemi elettrici di base"
        ],
        premiumContent: []
    },
    {
        id: "04-impianto-riscaldamento",
        title: "4. Impianto di riscaldamento collegato",
        shortDescription: "Radiatori, pavimento, inerzialità e ritorni freddi.",
        fullDescription: "La caldaia non lavora da sola. Capire come interagisce con l'impianto: radiatori, riscaldamento a pavimento, concetti di inerzia termica e l'importanza della temperatura dei ritorni.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "29.00",
        learnings: [
            "Radiatori vs Pavimento",
            "Inerzialità termica",
            "Problemi dei ritorni freddi",
            "Bilanciamento impianto"
        ],
        premiumContent: []
    },
    {
        id: "05-acs",
        title: "5. ACS: come nasce l’acqua calda",
        shortDescription: "Scambio, priorità, limiti fisici e comfort sanitario.",
        fullDescription: "Tutto sulla produzione di Acqua Calda Sanitaria. Il concetto di priorità, come avviene lo scambio termico e quali sono i limiti fisici che determinano la portata e la temperatura.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "29.00",
        learnings: [
            "Principio di scambio termico",
            "Priorità sanitaria",
            "Limiti fisici di portata",
            "Comfort sanitario"
        ],
        premiumContent: []
    },
    {
        id: "06-componenti-panoramica",
        title: "6. Componenti principali (panoramica)",
        shortDescription: "Pompa, valvole, sensori, scambiatori. Chi fa cosa.",
        fullDescription: "Una carrellata su tutti gli attori principali all'interno della caldaia: a cosa servono la pompa, le valvole, i sensori e gli scambiatori e come interagiscono tra loro.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "29.00",
        learnings: [
            "Ruolo della Pompa",
            "Funzione delle Valvole",
            "Importanza dei Sensori",
            "Tipi di Scambiatori"
        ],
        premiumContent: []
    },
    {
        id: "07-sicurezze-base",
        title: "7. Sicurezze di base",
        shortDescription: "Pressioni, temperature, consensi. La protezione della caldaia.",
        fullDescription: "Come la caldaia si protegge da sola. Analisi dei sistemi di sicurezza che monitorano pressioni, temperature e consensi operativi per prevenire danni gravi.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "29.00",
        learnings: [
            "Monitoraggio Pressioni",
            "Controllo Temperature",
            "Consensi di sicurezza",
            "Prevenzione danni"
        ],
        premiumContent: []
    },
    {
        id: "08-errori-base",
        title: "8. Errori base del principiante",
        shortDescription: "Errori che creano guasti fantasma e perdite di tempo.",
        fullDescription: "Evita le trappole comuni. Analisi degli errori più frequenti commessi da chi è alle prime armi, che spesso portano a diagnosticare guasti inesistenti (guasti fantasma).",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "29.00",
        learnings: [
            "Guasti fantasma",
            "Diagnosi affrettate",
            "Errori di interpretazione",
            "Come evitare perdite di tempo"
        ],
        premiumContent: []
    },

    // --- LIVELLO INTERMEDIO (10 Video) ---
    {
        id: "09-pompe-circolazione",
        title: "9. Pompe e circolazione",
        shortDescription: "Fisse, elettroniche, PWM, bus. Il cuore dell'impianto.",
        fullDescription: "Dalle vecchie pompe a velocità fissa alle moderne modulanti PWM e BUS. Come diagnosticarle, sbloccarle e verificarne il corretto funzionamento.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Pompe fisse vs elettroniche", "Segnale PWM e Bus", "Diagnosi blocco circolatore", "Prevalenza e portata"],
        premiumContent: [],
        featured: true
    },
    {
        id: "10-valvola-3-vie",
        title: "10. Valvola a 3 vie (tutte)",
        shortDescription: "Pressostatica, motorizzata, cartuccia, integrate.",
        fullDescription: "Analisi completa delle valvole deviatrici: meccaniche (pressostatiche) ed elettriche (motorizzate). Come revisionarle, sostituire le cartucce e diagnosticare trafilamenti.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Funzionamento pressostatico", "Azionamento motorizzato", "Sostituzione cartuccia", "Diagnosi trafilamento"],
        premiumContent: []
    },
    {
        id: "11-sensori-ntc",
        title: "11. Sensori e NTC",
        shortDescription: "Logica, derive, diagnosi corretta.",
        fullDescription: "Come funzionano le sonde di temperatura NTC. Il concetto di 'deriva' del sensore, curve caratteristiche e come testarle correttamente col multimetro.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Curve caratteristiche NTC", "Fenomeno della deriva", "Test con multimetro", "Codici errore correlati"],
        premiumContent: []
    },
    {
        id: "12-pressostati-flussostati",
        title: "12. Pressostati e flussostati",
        shortDescription: "Aria, acqua, ACS. Consensi fondamentali.",
        fullDescription: "I guardiani dei fluidi. Pressostati aria, pressostati acqua, flussostati e flussimetri. Come verificano la presenza di fluido e movimento.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Pressostato differenziale fumi", "Trasduttore di pressione acqua", "Flussostato vs Flussimetro", "Bypass elettrico per test"],
        premiumContent: []
    },
    {
        id: "13-scambiatori",
        title: "13. Scambiatori",
        shortDescription: "Primario, secondario, condensazione. Pulizia e diagnosi.",
        fullDescription: "Il cuore dello scambio termico. Problemi di calcare, intasamento lato fumi o lato acqua. Differenze tra primario, sanitario a piastre e moduli a condensazione.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Scambiatore Primario", "Scambiatore a Piastre (Sanitario)", "Modulo Condensazione", "Sintomi intasamento"],
        premiumContent: []
    },
    {
        id: "14-gas-combustione-base",
        title: "14. Gas e combustione (base)",
        shortDescription: "Accensione, fiamma, consenso gas.",
        fullDescription: "Principi base della combustione. La sequenza di accensione, la rilevazione di fiamma e come la valvola gas apre il passaggio fondamentale.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Sequenza di accensione", "Rilevazione fiamma (ionizzazione)", "Sicurezza gas", "Colorazione fiamma"],
        premiumContent: []
    },
    {
        id: "15-schede-elettroniche",
        title: "15. Schede elettroniche",
        shortDescription: "Cosa fanno, cosa NON fanno, quando sono innocenti.",
        fullDescription: "Sfatare il mito della 'scheda guasta'. Capire input e output, logiche di gestione e perché spesso viene incolpata ingiustamente.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Input e Output", "Relè di potenza", "Alimentazione sensori", "Quando NON cambiare la scheda"],
        premiumContent: []
    },
    {
        id: "16-blocchi-codici",
        title: "16. Blocchi e codici errore",
        shortDescription: "Come leggerli e come non farsi fregare.",
        fullDescription: "Interpretare i codici errore non come vangelo, ma come indizi. Strategie per risalire alla vera causa radice dietro un codice generico.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Reset vs Blocco definitivo", "Lettura codici produttore", "False segnalazioni", "Procedura di sblocco"],
        premiumContent: []
    },
    {
        id: "17-calcare-magnetite",
        title: "17. Calcare, magnetite, sporco",
        shortDescription: "Sintomi, danni, prevenzione.",
        fullDescription: "I nemici silenziosi dell'impianto. Come si formano, che danni fanno (scambiatori bucati, pompe bloccate) e come prevenirli con lavaggi e defangatori.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Formazione calcare", "Magnetite e fanghi", "Danni ai componenti", "Trattamento acqua"],
        premiumContent: []
    },
    {
        id: "18-errori-installazione",
        title: "18. Errori di installazione comuni",
        shortDescription: "Che sembrano guasti ma sono errori di montaggio.",
        fullDescription: "Quando il problema non è la caldaia, ma chi l'ha montata. Scarichi fumi errati, polarità invertita, diametri gas insufficienti.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: ["Scarico fumi errato", "Inversione Fase/Neutro", "Dimensionamento tubi", "Assenza lavaggio impianto"],
        premiumContent: []
    },

    // --- LIVELLO AVANZATO (9 Video) ---
    {
        id: "19-valvola-gas-modulazione",
        title: "19. Valvola gas e modulazione",
        shortDescription: "On/off, modulanti, a membrana, condensazione.",
        fullDescription: "Tecniche avanzate di gestione valvola gas. Regolazione del minimo e massimo meccanico ed elettronico. Funzionamento delle valvole pneumatiche a rapporto aria/gas.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Regolazione Min/Max", "Valvole pneumatiche 1:1", "Modulazione elettronica", "Offset e CO2"],
        premiumContent: [],
        featured: true
    },
    {
        id: "20-combustione-evoluta",
        title: "20. Combustione evoluta",
        shortDescription: "Aria/gas, modulazione, limiti reali.",
        fullDescription: "Analisi fumi approfondita. Taratura della combustione nelle condensazione, eccesso d'aria, rendimento e punti di rugiada.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Analisi fumi avanzata", "Taratura CO2/O2", "Rendimento di combustione", "Modulazione profonda (1:10)"],
        premiumContent: []
    },
    {
        id: "21-logica-software",
        title: "21. Logica software caldaie moderne",
        shortDescription: "Algoritmi, protezioni, autoapprendimento.",
        fullDescription: "Come ragionano le moderne CPU. Algoritmi di adattamento automatico alla lunghezza tubi, auto-taratura gas (sistemi adattivi), gestione climatica.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Sistemi Gas Adaptive", "Gestione Climatica (Sonda Esterna)", "Algoritmi anti-pendolazione", "Cicli di purga/test"],
        premiumContent: []
    },
    {
        id: "22-diagnosi-avanzata",
        title: "22. Diagnosi avanzata",
        shortDescription: "Metodo, sequenza, esclusione.",
        fullDescription: "Metodologia di troubleshooting per esperti. Alberi decisionali, diagnosi per esclusione e uso strumentale avanzato per trovare l'introvabile.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Metodo deduttivo", "Diagnosi per esclusione", "Uso strumenti avanzati", "Lettura schemi complessi"],
        premiumContent: []
    },
    {
        id: "23-guasti-intermittenti",
        title: "23. Guasti intermittenti",
        shortDescription: "Quelli che fanno impazzire e spariscono quando arrivi.",
        fullDescription: "Come affrontare il peggior nemico del tecnico: il guasto che si presenta 'ogni tanto'. Strategie di logging, monitoring e stress test.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Logging eventi", "Stress test componenti", "Simulazione guasto", "Fattori ambientali"],
        premiumContent: []
    },
    {
        id: "24-perdite-invisibili",
        title: "24. Perdite invisibili",
        shortDescription: "Scambiatori bucati, condensa, vaso espansione.",
        fullDescription: "Quando l'acqua sparisce ma non c'è macchia. Micro-perdite nello scambiatore primario che evapora, trafilamenti in condensazione, vaso scarico.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Perdita su primario", "Trafilamento valvola sicurezza", "Micro-perdite evaporative", "Test tenuta impianto"],
        premiumContent: []
    },
    {
        id: "25-quando-fermarsi",
        title: "25. Quando fermarsi",
        shortDescription: "Caldaia a fine vita, come dirlo al cliente.",
        fullDescription: "Aspetti economici ed etici. Quando la riparazione supera il valore residuo. Tecniche di comunicazione per spiegare al cliente che è ora di cambiare.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Valutazione economica riparazione", "Etica professionale", "Comunicazione al cliente", "Consulenza sostituzione"],
        premiumContent: []
    },
    {
        id: "26-casi-reali-complessi",
        title: "26. Casi reali complessi",
        shortDescription: "Step-by-step, decisioni vere sul campo.",
        fullDescription: "Analisi di interventi reali particolarmente difficili. Dalla chiamata del cliente alla risoluzione, analizzando ogni bivio decisionale preso.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Case study 1", "Case study 2", "Case study 3", "Analisi errori commessi"],
        premiumContent: []
    },
    {
        id: "27-tecnico-evoluto",
        title: "27. Tecnico evoluto",
        shortDescription: "Come ragiona, come si posiziona, come si fa pagare.",
        fullDescription: "Oltre la tecnica: mindset. Come posizionarsi come specialista, gestire il cliente difficile e farsi pagare il giusto per la propria competenza diagnostica.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "49.00",
        learnings: ["Mindset diagnostico", "Gestione cliente", "Pricing competenza", "Personal branding tecnico"],
        premiumContent: []
    }
]

// Corsi in evidenza per la homepage (uno per livello)
export const getFeaturedCourses = () => [
    courses.find(c => c.id === "01-cose-caldaia")!,
    courses.find(c => c.id === "09-pompe-circolazione")!,
    courses.find(c => c.id === "22-diagnosi-avanzata")!
]

// Trova un corso per slug
export const getCourseBySlug = (slug: string) => courses.find(c => c.id === slug)

// Tutti i corsi per il catalogo
export const getAllCourses = () => courses
