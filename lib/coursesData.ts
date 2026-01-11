// Dati centralizzati per tutti i corsi video
// I youtubeId sono placeholder - aggiornali quando carichi i video su YouTube

export interface Course {
    id: string
    title: string
    shortDescription: string
    fullDescription: string
    youtubeId: string // ID del video YouTube gratuito (es: "dQw4w9WgXcQ")
    freeDuration: string // Durata video gratuito YouTube (es: "15 min")
    premiumDuration: string // Durata video premium completo (es: "45 min")
    level: "Base" | "Intermedio" | "Avanzato"
    price: string
    learnings: string[]
    premiumContent: string[]
    featured?: boolean // Per mostrare in homepage
}

export const courses: Course[] = [
    {
        id: "vaso-espansione",
        title: "Pressione a Zero? Il Vaso di Espansione è il Colpevole",
        shortDescription: "9 volte su 10 quando la pressione cala senza perdite visibili, è il vaso. Scopri come diagnosticarlo in 30 secondi.",
        fullDescription: "Ti è mai capitato di andare su un intervento, la caldaia va in blocco, la pressione è a zero, e il cliente ti dice 'l'ho ricaricata ieri sera'? E tu già sai cos'è. In questo video ti spiego tutto sul vaso di espansione: come funziona la membrana, perché si deteriora, e i sintomi classici di un vaso guasto. Imparerai a riconoscere le diverse varianti (membrana fissa, intercambiabile, flangia, cartuccia) e cosa succede se ignori il problema.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "39.00",
        learnings: [
            "Cos'è il vaso di espansione e perché è fondamentale",
            "Come funziona la membrana interna e perché si deteriora",
            "I 3 sintomi classici di un vaso scarico o rotto",
            "Le diverse tipologie: membrana fissa, intercambiabile, flangia, cartuccia",
            "Cosa succede se ignori il problema (spoiler: danni costosi)"
        ],
        premiumContent: [
            "Diagnosi completa con tutti e 4 i test professionali",
            "Procedura di ricarica azoto passo-passo",
            "Valori precisi di precarica per Vaillant, Ariston, Beretta, Immergas e altre 10 marche",
            "5 casi reali completi dal campo con soluzioni",
            "PDF checklist da stampare per il furgone"
        ],
        featured: true
    },
    {
        id: "circolatore",
        title: "Radiatori Freddi? Il Circolatore Ti Sta Fregando",
        shortDescription: "La caldaia parte, il bruciatore si accende, ma il calore non arriva. Nel 70% dei casi, il trucco dello sblocco funziona.",
        fullDescription: "Radiatori freddi con caldaia accesa? La caldaia parte, senti il bruciatore che va, ma i radiatori non si scaldano. Prima di cambiare il circolatore, c'è un trucco che può salvarti l'intervento. In questo video ti spiego cos'è il circolatore, l'evoluzione dai modelli anni 80 ai moderni PWM modulanti, i sintomi classici di guasto, e il famoso trucco dello sblocco manuale che funziona nel 70% dei casi dopo il fermo estivo.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: [
            "Cos'è il circolatore e qual è il suo ruolo nel sistema",
            "Evoluzione: velocità fissa → alta efficienza → PWM modulanti",
            "I 3 sintomi classici: radiatori freddi, rumori strani, blocchi surriscaldamento",
            "Il trucco dello sblocco manuale (funziona nel 70% dei casi)",
            "Quando lo sblocco NON basta e serve la sostituzione"
        ],
        premiumContent: [
            "Diagnosi elettrica completa con multimetro",
            "Test del segnale PWM per circolatori modulanti",
            "Procedura di sostituzione passo-passo",
            "Spurgo aria corretto dopo la sostituzione",
            "4 casi reali completi dal campo"
        ],
        featured: true
    },
    {
        id: "valvola-gas",
        title: "Caldaia che Non Accende? Il Segreto della Valvola Gas",
        shortDescription: "Scintilla presente, gas aperto, ma niente fiamma. Prima di cambiare la valvola, evita l'errore che costa caro a molti tecnici.",
        fullDescription: "La caldaia non accende. Senti lo scatto del relè, la scintilla scocca, ma la fiamma non parte. Controlli il gas, il contatore è aperto. E allora pensi: è la valvola gas. Ma sei sicuro? L'errore diagnostico più comune è cambiare la valvola senza verificare che la scheda stia effettivamente comandando. In questo video ti spiego l'evoluzione delle valvole (fiamma pilota → ON/OFF → modulanti), il doppio stadio di sicurezza, e come evitare di sprecare soldi.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: [
            "Cos'è la valvola gas e le sue due funzioni fondamentali",
            "Evoluzione: fiamma pilota → ON/OFF → High/Low → modulanti",
            "Il doppio stadio di sicurezza (normativa EN 161)",
            "I 4 sintomi classici di una valvola guasta",
            "L'errore diagnostico che costa caro alla maggior parte dei tecnici"
        ],
        premiumContent: [
            "Test elettrici completi delle bobine",
            "Misurazione delle pressioni con manometro (statica e dinamica)",
            "Procedura di taratura per valvole modulanti",
            "Specifiche per SIT Sigma 840/843/845 e Honeywell VK4100/VK4105",
            "4 casi reali complessi dal campo"
        ],
        featured: true
    },
    {
        id: "scambiatore-primario",
        title: "Surriscaldamento Misterioso? Lo Scambiatore Parla Chiaro",
        shortDescription: "Blocchi ripetuti per sovratemperatura, radiatori tiepidi, rumori di bollitura. Il calcare è il nemico numero uno.",
        fullDescription: "La caldaia va in blocco per surriscaldamento. La resetti e dopo 5 minuti blocco di nuovo. Controlli circolatore, vaso, pressione... tutto ok. Cosa può essere? Lo scambiatore primario, incrostato dal calcare. In questo video ti spiego i diversi tipi (rame, inox, alluminio-silicio, bitermico), come si forma il calcare, i sintomi di intasamento, e quando conviene pulire vs sostituire.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "39.00",
        learnings: [
            "Cos'è lo scambiatore primario e perché è il cuore termico",
            "I diversi tipi: rame, inox, alluminio-silicio, bitermico",
            "Come si forma il calcare e dove si deposita di più",
            "I 4 sintomi di intasamento: surriscaldamento, radiatori tiepidi, rumori, oscillazioni",
            "Regole pratiche: quando pulire vs quando sostituire"
        ],
        premiumContent: [
            "Lavaggio chimico completo passo-passo",
            "Prodotti, attrezzatura e procedura sicura",
            "Sostituzione scambiatore e controllo guarnizioni",
            "Prevenzione: trattamento acqua, filtri, addolcitori",
            "3 casi reali con diagnosi difficili"
        ]
    },
    {
        id: "ventilatore-pressostato",
        title: "Niente Fiamma? Ventilatore e Pressostato Sotto Accusa",
        shortDescription: "Il ventilatore gira ma la fiamma non parte. Spesso basta un tubicino staccato. Ma sai riconoscere tutti i casi?",
        fullDescription: "La caldaia non accende. Provi il reset, niente. Senti il ventilatore che gira ma la fiamma non parte. Controlli valvola gas, elettrodo, tutto ok. E allora capisci: il pressostato aria non chiude. In questo video ti spiego cos'è il ventilatore, l'evoluzione dai modelli AC ai moderni EC modulanti, cos'è il pressostato e come protegge la caldaia, e i 5 controlli rapidi da fare prima di sostituire qualsiasi cosa.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: [
            "Cos'è il ventilatore e come crea la depressione per la combustione",
            "Evoluzione: AC velocità fissa → AC due velocità → EC modulanti",
            "Cos'è il pressostato aria e come protegge la caldaia",
            "I sintomi classici: errore pressostato, ventilatore rumoroso, intermittenza",
            "5 controlli rapidi che spesso risolvono senza ricambi"
        ],
        premiumContent: [
            "Test elettrico del ventilatore (alimentazione, assorbimento, segnale)",
            "Test del pressostato con multimetro",
            "Verifica con manometro differenziale",
            "Sostituzione passo-passo",
            "3 casi reali dal campo"
        ]
    },
    {
        id: "bruciatore-accensione",
        title: "Scintilla Sì, Fiamma No? Svela il Problema di Accensione",
        shortDescription: "La scintilla scocca ma il gas non prende. Spesso basta pulire l'elettrodo con carta vetrata. Ma sai quando non basta?",
        fullDescription: "La caldaia prova ad accendere. Senti la scintilla che scocca, vedi il tentativo, ma la fiamma non parte. Oppure parte e si spegne subito: 'mancata ionizzazione'. È l'elettrodo? Il bruciatore? La scheda? In questo video ti spiego l'evoluzione dei bruciatori, i diversi tipi di elettrodi (accensione, ionizzazione, combinato), come funziona la rilevazione fiamma, e i controlli rapidi prima di sostituire componenti.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "39.00",
        learnings: [
            "Evoluzione bruciatori: atmosferico → premiscelato → condensazione",
            "I diversi tipi di elettrodi: accensione, ionizzazione, combinato",
            "Come funziona la rilevazione fiamma (corrente di ionizzazione)",
            "Valori tipici di ionizzazione: minimo 2-3 µA, normale 5-10 µA",
            "Controlli rapidi: scintilla, pulizia, posizione, bruciatore"
        ],
        premiumContent: [
            "Test dell'alta tensione",
            "Misurazione corrente di ionizzazione",
            "Sostituzione elettrodo passo-passo",
            "Pulizia bruciatore professionale",
            "Casi reali con diagnosi complesse"
        ]
    },
    {
        id: "scheda-elettronica",
        title: "Errore sul Display? Non È Sempre la Scheda",
        shortDescription: "Nell'80% dei casi la scheda sta solo segnalando un problema altrove. Prima di spendere 300€, fai questi controlli.",
        fullDescription: "La caldaia mostra un errore. Un codice sul display: F28, 501, E02. E la prima cosa che pensi è 'sarà la scheda'. Ma lo sai che la scheda è RARAMENTE guasta? Nell'80% dei casi, sta solo segnalando un problema altrove. In questo video ti spiego cos'è la scheda, gli input/output che gestisce, come interpretare i codici errore, quando è davvero guasta, e i controlli da fare prima di spendere 200-400€ inutilmente.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "39.00",
        learnings: [
            "Cos'è la scheda elettronica: il cervello che gestisce tutto",
            "Gli input (sonde, pressostato, ionizzazione) e output (ventilatore, valvola, circolatore)",
            "Come interpretare i codici errore (sintomi, non cause!)",
            "I 4 segni che indicano una scheda davvero guasta",
            "Controlli prima di sostituire: alimentazione, fusibili, connettori"
        ],
        premiumContent: [
            "Test dei relè con multimetro",
            "Verifica delle uscite tensione",
            "Diagnosi sensori guasti",
            "3 casi 'sembrava la scheda' risolti diversamente",
            "Tabella codici errore per marca"
        ]
    },
    {
        id: "scambiatore-secondario",
        title: "Acqua Tiepida? Il Colpevole è lo Scambiatore Sanitario",
        shortDescription: "L'acqua calda ci mette una vita ad arrivare e quando arriva è tiepida. Il problema potrebbe essere anche la valvola deviatrice.",
        fullDescription: "Il cliente chiama: 'l'acqua calda ci mette una vita ad arrivare, quando arriva è tiepida, e dopo un po' diventa fredda di nuovo'. Ti suona familiare? Questi problemi dipendono spesso dallo scambiatore secondario, quello per l'acqua sanitaria. In questo video ti spiego cos'è, la differenza dal primario, i sintomi classici, il ruolo della valvola deviatrice, e il trucco del delta T per diagnosticare.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Intermedio",
        price: "39.00",
        learnings: [
            "Cos'è lo scambiatore secondario (a piastre) e come funziona",
            "La differenza dal primario: sicurezza e igiene",
            "I 3 sintomi: acqua tiepida, oscillazioni caldo-freddo, attese lunghe",
            "Il ruolo della valvola deviatrice (spesso coinvolta)",
            "Il trucco del delta T per diagnosticare"
        ],
        premiumContent: [
            "Diagnosi completa valvola deviatrice",
            "Pulizia scambiatore con acido citrico",
            "Sostituzione passo-passo",
            "Tabella valori per marca",
            "Casi reali con soluzioni"
        ]
    },
    {
        id: "valvole-sicurezza-bypass",
        title: "Valvola che Gocciola? Smetti di Cambiarla a Caso",
        shortDescription: "Cambi la valvola di sicurezza e dopo una settimana gocciola di nuovo. Perché? Perché non hai trovato la vera causa.",
        fullDescription: "La valvola di sicurezza gocciola. Il cliente ti chiama preoccupato. Tu vai, cambi la valvola. Dopo una settimana: gocciola di nuovo. Sai perché? Perché la valvola non era il problema, era un SINTOMO. In questo video ti spiego cos'è la valvola di sicurezza, cos'è il bypass, perché la valvola gocciola davvero (vaso, bypass, rubinetto carico), e la domanda da fare SEMPRE prima di sostituirla.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "15 min",
        premiumDuration: "45 min",
        level: "Base",
        price: "39.00",
        learnings: [
            "Cos'è la valvola di sicurezza e come protegge dalle sovrapressioni",
            "Cos'è il bypass e perché è fondamentale con le termostatiche",
            "Le 3 cause reali per cui la valvola gocciola",
            "La domanda da fare SEMPRE: 'Perché si è aperta?'",
            "Quando cambiare davvero: non tiene, bloccata, ossidata"
        ],
        premiumContent: [
            "Come testare la tenuta della valvola",
            "Come tarare/verificare il bypass",
            "Sostituzione passo-passo",
            "Tabella valori per marca",
            "Casi reali con diagnosi corretta"
        ]
    },
    {
        id: "drhouse-silossani",
        title: "Caso Dr. House: 5 Uscite e la Diagnosi Impossibile",
        shortDescription: "Una diagnosi che sembrava ovvia, 5 uscite dal cliente, colleghi consultati... e una soluzione che nessuno si aspettava.",
        fullDescription: "Questa storia sembra uscita da un episodio di Dottor House. Una caldaia con controllo lambda, errore elettrodo, 5 uscite dal cliente, colleghi consultati sul mio gruppo Facebook da 20.000 iscritti... e una soluzione che nessuno si aspettava. La pressione del gas crollava solo alla massima potenza. Ma a 2 metri di distanza, al piano cottura, restava stabile. Il problema era DENTRO la caldaia. E l'ho risolto in 5 minuti con una semplice paglietta di metallo.",
        youtubeId: "PLACEHOLDER",
        freeDuration: "14 min",
        premiumDuration: "45 min",
        level: "Avanzato",
        price: "39.00",
        learnings: [
            "Come funziona il controllo lambda (elettrodo = sonda lambda)",
            "Perché la pressione crollava solo alla massima potenza",
            "Il test decisivo: piano cottura vs caldaia",
            "Come pensare 'fuori dagli schemi' nella diagnosi",
            "Il cliffhanger: cosa mi ha rivelato Sandro?"
        ],
        premiumContent: [
            "La spiegazione scientifica completa del fenomeno",
            "Cos'erano i SILOSSANI e da dove venivano",
            "Come diagnosticare questo problema",
            "Come risolverlo (con paglietta metallica)",
            "Come PREVENIRLO nei futuri interventi"
        ]
    }
]

// Corsi in evidenza per la homepage (primi 3 con featured: true)
export const getFeaturedCourses = () => courses.filter(c => c.featured).slice(0, 3)

// Trova un corso per slug
export const getCourseBySlug = (slug: string) => courses.find(c => c.id === slug)

// Tutti i corsi per il catalogo
export const getAllCourses = () => courses
