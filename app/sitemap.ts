import { MetadataRoute } from 'next'
import { courses } from '@/lib/coursesData'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://simonsilvercaldaie.it'

    // Pagine statiche
    const staticRoutes = [
        '',
        '/catalogo',
        '/catalogo/base',
        '/catalogo/intermedio',
        '/catalogo/avanzato',
        '/catalogo/laboratorio',
        '/contatti',
        '/login',
        '/dashboard',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Pagine dinamiche dei corsi
    const courseRoutes = courses.map((course) => ({
        url: `${baseUrl}/corso/${course.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.9,
    }))

    return [...staticRoutes, ...courseRoutes]
}
