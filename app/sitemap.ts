import { MetadataRoute } from 'next'
import { courses } from '@/lib/coursesData'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://simonsilvercaldaie.it'

    // Pagine statiche principali
    const staticRoutes = [
        { route: '', priority: 1, changeFrequency: 'weekly' as const },
        { route: '/catalogo/base', priority: 0.9, changeFrequency: 'weekly' as const },
        { route: '/catalogo/intermedio', priority: 0.9, changeFrequency: 'weekly' as const },
        { route: '/catalogo/avanzato', priority: 0.9, changeFrequency: 'weekly' as const },
        { route: '/pacchetto-completo', priority: 0.9, changeFrequency: 'weekly' as const },
        { route: '/licenze-multidipendente', priority: 0.8, changeFrequency: 'monthly' as const },
        { route: '/licenze', priority: 0.7, changeFrequency: 'monthly' as const },
        { route: '/guida-caldaie', priority: 0.95, changeFrequency: 'weekly' as const },
        { route: '/contatti', priority: 0.6, changeFrequency: 'monthly' as const },
        { route: '/login', priority: 0.4, changeFrequency: 'yearly' as const },
        { route: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
        { route: '/termini', priority: 0.3, changeFrequency: 'yearly' as const },
    ].map((item) => ({
        url: `${baseUrl}${item.route}`,
        lastModified: new Date(),
        changeFrequency: item.changeFrequency,
        priority: item.priority,
    }))

    // Pagine dinamiche dei corsi (alta priorità per SEO)
    const courseRoutes = courses.map((course) => ({
        url: `${baseUrl}/corso/${course.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.9,
    }))

    return [...staticRoutes, ...courseRoutes]
}
