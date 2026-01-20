import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://simonsilvercaldaie.it'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/api/', '/admin/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
