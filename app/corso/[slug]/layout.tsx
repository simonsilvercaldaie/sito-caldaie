import type { Metadata } from 'next'
import { getCourseBySlug } from '@/lib/coursesData'

const siteUrl = 'https://simonsilvercaldaie.it'

interface Props {
    params: Promise<{ slug: string }>
    children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const course = getCourseBySlug(slug)

    if (!course) {
        return {
            title: 'Corso non trovato',
            description: 'Il corso richiesto non è stato trovato nel catalogo Simon Silver Caldaie.',
        }
    }

    const levelLabels: Record<string, string> = {
        'Base': 'Corso Base',
        'Intermedio': 'Corso Intermedio',
        'Avanzato': 'Corso Avanzato',
    }

    const title = `${course.title} | ${levelLabels[course.level] || 'Corso'} Caldaie - Simon Silver`
    const description = `${course.fullDescription} Video corso professionale per tecnici caldaie. Livello ${course.level} — ${course.premiumDuration} di contenuto esclusivo.`

    return {
        title,
        description,
        keywords: [
            course.title,
            `corso caldaie ${course.level.toLowerCase()}`,
            'diagnosi guasti caldaie',
            'corso tecnico caldaie',
            'formazione manutentori caldaie',
            'video corso caldaie online',
            'Simon Silver caldaie',
            ...course.learnings,
        ],
        alternates: {
            canonical: `${siteUrl}/corso/${course.id}`,
        },
        openGraph: {
            type: 'website',
            locale: 'it_IT',
            url: `${siteUrl}/corso/${course.id}`,
            siteName: 'Simon Silver Caldaie',
            title: `${course.title} — Corso ${course.level} Caldaie`,
            description: course.fullDescription,
            images: [
                {
                    url: course.coverImage || '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: course.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${course.title} | Corso ${course.level}`,
            description: course.fullDescription,
            images: [course.coverImage || '/og-image.png'],
        },
    }
}

export default function CorsoLayout({ children }: Props) {
    return <>{children}</>
}
