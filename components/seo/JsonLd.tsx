// JSON-LD Structured Data Component for Course pages
// This provides rich snippets in Google search results

import { Course } from '@/lib/coursesData'

interface CourseJsonLdProps {
    course: Course
}

export function CourseJsonLd({ course }: CourseJsonLdProps) {
    const siteUrl = "https://simonsilvercaldaie.it"

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.title,
        "description": course.fullDescription,
        "provider": {
            "@type": "Organization",
            "name": "Simon Silver Caldaie",
            "url": siteUrl,
            "logo": `${siteUrl}/logo.png`
        },
        "url": `${siteUrl}/corso/${course.id}`,
        "image": course.coverImage ? `${siteUrl}${course.coverImage}` : `${siteUrl}/og-image.png`,
        "educationalLevel": course.level,
        "inLanguage": "it",
        "isAccessibleForFree": false,
        "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "duration": `PT${parseInt(course.premiumDuration)}M`,
            "instructor": {
                "@type": "Person",
                "name": "Simon Silver",
                "url": siteUrl,
                "jobTitle": "Tecnico Caldaista e Formatore"
            }
        },
        "offers": {
            "@type": "Offer",
            "price": course.price,
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock",
            "url": `${siteUrl}/corso/${course.id}`
        },
        "teaches": course.learnings.join(", "),
        "about": [
            "caldaie",
            "manutenzione caldaie",
            "diagnosi guasti caldaie",
            "riparazione caldaie",
            "tecnico caldaie",
            "formazione professionale caldaie"
        ],
        "audience": {
            "@type": "EducationalAudience",
            "educationalRole": "professional",
            "audienceType": "Tecnici caldaie, manutentori, installatori, centri assistenza tecnica"
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

// VideoObject JSON-LD — makes YouTube videos appear in Google with thumbnail, duration, play button
export function VideoJsonLd({ course }: CourseJsonLdProps) {
    const siteUrl = "https://simonsilvercaldaie.it"

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": course.title,
        "description": course.fullDescription,
        "thumbnailUrl": course.coverImage
            ? `${siteUrl}${course.coverImage}`
            : `https://img.youtube.com/vi/${course.youtubeId}/maxresdefault.jpg`,
        "uploadDate": "2025-01-01",
        "duration": `PT${parseInt(course.freeDuration)}M`,
        "contentUrl": `https://www.youtube.com/watch?v=${course.youtubeId}`,
        "embedUrl": `https://www.youtube.com/embed/${course.youtubeId}`,
        "publisher": {
            "@type": "Organization",
            "name": "Simon Silver Caldaie",
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo.png`
            }
        },
        "author": {
            "@type": "Person",
            "name": "Simon Silver",
            "url": siteUrl
        },
        "inLanguage": "it",
        "isFamilyFriendly": true,
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

// JSON-LD for Course Catalog (ItemList)
interface CatalogJsonLdProps {
    courses: Course[]
    level?: string
}

export function CatalogJsonLd({ courses, level }: CatalogJsonLdProps) {
    const siteUrl = "https://simonsilvercaldaie.it"

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": level ? `Corsi Caldaie - Livello ${level}` : "Catalogo Corsi Caldaie",
        "description": level
            ? `Video corsi di livello ${level} per tecnici caldaie - Formazione professionale Simon Silver`
            : "Catalogo completo dei video corsi professionali per tecnici caldaie",
        "numberOfItems": courses.length,
        "itemListElement": courses.map((course, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Course",
                "name": course.title,
                "description": course.shortDescription,
                "url": `${siteUrl}/corso/${course.id}`,
                "provider": {
                    "@type": "Organization",
                    "name": "Simon Silver Caldaie"
                }
            }
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

// JSON-LD for FAQ (expanded: 12 questions covering real search queries)
export function FaqJsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Cosa imparo nei corsi caldaie di Simon Silver?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "I corsi coprono diagnosi guasti, manutenzione avanzata, riparazione componenti, lettura schemi elettrici e idraulici, gestione sicurezze, e tecniche di troubleshooting professionali per caldaie a condensazione e tradizionali. Il percorso va dal livello Base (per chi viene dall'idraulica) al livello Avanzato (per chi vuole diventare il tecnico che decide)."
                }
            },
            {
                "@type": "Question",
                "name": "I corsi sono adatti a chi vuole diventare tecnico caldaie?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sì, i corsi Base sono perfetti per chi inizia. Spiegano la logica della caldaia, come ragiona la scheda elettronica, e come approcciarsi alla diagnosi senza cambiare pezzi a caso. Non servono prerequisiti specifici: basta avere curiosità e voglia di imparare."
                }
            },
            {
                "@type": "Question",
                "name": "Come accedo ai video corsi dopo l'acquisto?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Dopo l'acquisto ricevi accesso immediato dalla tua dashboard personale. I video sono tuoi per sempre, senza limiti di visualizzazione e accessibili da qualsiasi dispositivo."
                }
            },
            {
                "@type": "Question",
                "name": "Quali metodi di pagamento accettate?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Accettiamo pagamenti sicuri tramite PayPal e carte di credito/debito attraverso PayPal. Tutte le transazioni sono protette e cifrate."
                }
            },
            {
                "@type": "Question",
                "name": "Quanto costano i corsi caldaie?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Il Livello Base (9 video) costa €200. Il Livello Intermedio (9 video) costa €400. Il Livello Avanzato (9 video) costa €600. Il Pacchetto Completo con tutti e 3 i livelli costa €1.000 (risparmi €200). Sono disponibili anche licenze aziendali con sconti fino al 40%."
                }
            },
            {
                "@type": "Question",
                "name": "Come diagnosticare un guasto alla caldaia?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "La diagnosi parte dall'osservazione nei primi 3 minuti: pressione, rumori, temperatura, eventuali perdite visibili. Poi si leggono i codici errore come indizi (non come sentenze), si escludono i componenti uno alla volta, e si arriva alla soluzione per eliminazione — non aggiungendo ricambi. Il metodo UKT di Simon Silver insegna esattamente questo approccio strutturato."
                }
            },
            {
                "@type": "Question",
                "name": "Cosa fare se la caldaia non parte?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Se la caldaia non parte, prima di tutto controlla: la pressione dell'acqua (deve essere tra 1.0 e 1.5 bar), il display per eventuali codici errore, e che gas e corrente siano disponibili. Se la caldaia va in blocco, prova un reset. Se il problema persiste, serve verificare la catena dei consensi: sicurezze, tiraggio, pressostato, elettrodo di rilevazione fiamma."
                }
            },
            {
                "@type": "Question",
                "name": "Caldaia perde pressione: cosa può essere?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Le cause più comuni sono: perdita interna nello scambiatore primario (l'acqua evapora e non la vedi), valvola di sicurezza che gocciola solo a caldo, vaso d'espansione scarico (si comporta come una perdita), o una perdita sottotraccia nell'impianto. Serve isolare caldaia e impianto per capire dove va l'acqua."
                }
            },
            {
                "@type": "Question",
                "name": "Come interpretare i codici errore della caldaia?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "I codici errore sono indizi, non diagnosi definitive. La scheda elettronica legge i sensori e segnala anomalie basandosi su soglie predefinite, ma non sempre indica la causa root. Un errore 'fiamma assente' può essere un elettrodo sporco, un problema di gas, messa a terra errata o persino tiraggio invertito. Il tecnico esperto usa il codice come punto di partenza e verifica coi propri strumenti."
                }
            },
            {
                "@type": "Question",
                "name": "Serve il patentino per lavorare sulle caldaie?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Per la manutenzione e installazione di caldaie a gas serve essere abilitati secondo il D.M. 37/08 (ex legge 46/90). Per gli interventi sui gas fluorurati (pompe di calore) serve il patentino F-GAS. I corsi di Simon Silver sono complementari a queste certificazioni e forniscono la competenza pratica che i corsi normativi spesso non coprono."
                }
            },
            {
                "@type": "Question",
                "name": "Ci sono licenze per aziende e centri assistenza?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sì, offriamo licenze multi-utente per aziende, centri assistenza tecnica (CAT) e scuole tecniche con sconti fino al 40% rispetto all'acquisto singolo. Include dashboard di gestione team, monitoraggio progressi dei dipendenti, e certificato di completamento per ogni membro."
                }
            },
            {
                "@type": "Question",
                "name": "In cosa i corsi di Simon Silver sono diversi dagli altri?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "I corsi di Simon Silver non insegnano a smontare una caldaia — insegnano a CAPIRLA. Il focus è sulla logica diagnostica, sul metodo di esclusione, e sul mindset del tecnico esperto. Non troverai formule accademiche ma casi reali dal campo, spiegati da un tecnico che le caldaie le tocca ogni giorno. 27 video pratici, niente teoria sterile."
                }
            },
        ]
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

// Breadcrumb JSON-LD
interface BreadcrumbJsonLdProps {
    items: { name: string; url: string }[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
    const siteUrl = "https://simonsilvercaldaie.it"

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
