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
                "url": siteUrl
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
            "diagnosi guasti",
            "riparazione caldaie",
            "tecnico caldaie"
        ],
        "audience": {
            "@type": "EducationalAudience",
            "educationalRole": "professional",
            "audienceType": "Tecnici caldaie, manutentori, installatori"
        }
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
        "name": level ? `Corsi Caldaie ${level}` : "Catalogo Corsi Caldaie",
        "description": level
            ? `Video corsi ${level} per tecnici caldaie - Formazione professionale Simon Silver`
            : "Catalogo completo dei video corsi per tecnici caldaie",
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

// JSON-LD for FAQ (useful for common questions)
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
                    "text": "I corsi coprono diagnosi guasti, manutenzione avanzata, riparazione componenti, lettura schemi elettrici e idraulici, gestione sicurezze, e tecniche di troubleshooting professionali per caldaie a condensazione e tradizionali."
                }
            },
            {
                "@type": "Question",
                "name": "I corsi sono adatti a chi vuole diventare tecnico caldaie?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sì, i corsi Base sono perfetti per chi inizia. Spiegano la logica della caldaia, come ragiona la scheda elettronica, e come approcciarsi alla diagnosi senza cambiare pezzi a caso."
                }
            },
            {
                "@type": "Question",
                "name": "Come accedo ai video corsi dopo l'acquisto?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Dopo l'acquisto ricevi accesso immediato dalla tua dashboard personale. I video sono tuoi per sempre, senza limiti di visualizzazione."
                }
            },
            {
                "@type": "Question",
                "name": "Quali metodi di pagamento accettate?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Accettiamo pagamenti sicuri tramite PayPal e carte di credito/debito attraverso PayPal."
                }
            }
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
