import type { Metadata } from 'next'

const siteUrl = 'https://simonsilvercaldaie.it'

interface Props {
    params: Promise<{ level: string }>
    children: React.ReactNode
}

const levelSeo: Record<string, { title: string; description: string; keywords: string[] }> = {
    base: {
        title: 'Corsi Caldaie Livello Base | 9 Video per Tecnici alle Prime Armi - Simon Silver',
        description: 'Corso Base caldaie: 9 video professionali per tecnici che vogliono capire la logica della caldaia. Catena dei consensi, diagnosi iniziale, sicurezze, manutenzione vera. Per chi viene dall\'idraulica o è alle prime armi.',
        keywords: [
            'corso caldaie base', 'corso tecnico caldaie principianti', 'come funziona una caldaia',
            'diagnosi guasti caldaie base', 'manutenzione caldaia corso', 'logica caldaia',
            'catena consensi caldaia', 'sicurezze caldaia', 'corso manutentore caldaie',
            'formazione tecnici caldaie', 'Simon Silver corso base',
        ],
    },
    intermedio: {
        title: 'Corsi Caldaie Livello Intermedio | 9 Video Diagnosi Avanzata - Simon Silver',
        description: 'Corso Intermedio caldaie: 9 video per tecnici che vogliono smettere di andare a tentativi. Scambiatori, valvola 3 vie, NTC, scheda elettronica, calcare e magnetite. Riparare senza cambiare pezzi.',
        keywords: [
            'corso caldaie intermedio', 'diagnosi caldaia avanzata', 'scambiatore caldaia',
            'valvola tre vie caldaia', 'NTC caldaia', 'scheda elettronica caldaia',
            'calcare magnetite caldaia', 'riparare caldaia senza cambiare pezzi',
            'corso tecnico caldaie professionale', 'Simon Silver intermedio',
        ],
    },
    avanzato: {
        title: 'Corsi Caldaie Livello Avanzato | 9 Video per Tecnici Esperti - Simon Silver',
        description: 'Corso Avanzato caldaie: 9 video per diventare il tecnico che decide. Combustione, guasti intermittenti, diagnosi parametrica, perdite invisibili, gestione cliente. Il livello che ti differenzia.',
        keywords: [
            'corso caldaie avanzato', 'diagnosi guasti intermittenti caldaia', 'combustione caldaia',
            'analisi fumi caldaia', 'perdite invisibili caldaia', 'guasti sistemici caldaia',
            'tecnico caldaie esperto', 'corso avanzato tecnico caldaie',
            'formazione professionale caldaie', 'Simon Silver avanzato',
        ],
    },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { level } = await params
    const seo = levelSeo[level.toLowerCase()]

    if (!seo) {
        return {
            title: 'Catalogo Corsi Caldaie | Simon Silver',
            description: 'Catalogo completo dei video corsi professionali per tecnici caldaie.',
        }
    }

    return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        alternates: {
            canonical: `${siteUrl}/catalogo/${level}`,
        },
        openGraph: {
            type: 'website',
            locale: 'it_IT',
            url: `${siteUrl}/catalogo/${level}`,
            siteName: 'Simon Silver Caldaie',
            title: seo.title,
            description: seo.description,
            images: [{ url: '/og-image.png', width: 1200, height: 630, alt: seo.title }],
        },
    }
}

export default function CatalogoLevelLayout({ children }: Props) {
    return <>{children}</>
}
