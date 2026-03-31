import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Licenze Aziendali Corsi Caldaie | Team e Scuole - Simon Silver',
    description: 'Licenze multi-utente per aziende, centri assistenza e scuole tecniche. Forma il tuo team di tecnici caldaie con sconti fino al 40%. Accesso gestito, monitoraggio progressi dipendenti, certificati completamento.',
    keywords: [
        'licenza aziendale corsi caldaie', 'formazione team tecnici caldaie',
        'corsi caldaie per aziende', 'corso caldaie centro assistenza tecnica',
        'formazione dipendenti caldaie', 'scuola tecnica caldaie',
        'licenza multi utente corso caldaie', 'sconto aziendale corsi caldaie',
        'Simon Silver licenze aziendali', 'formazione CAT caldaie',
    ],
    alternates: {
        canonical: 'https://simonsilvercaldaie.it/licenze-multidipendente',
    },
    openGraph: {
        type: 'website',
        locale: 'it_IT',
        url: 'https://simonsilvercaldaie.it/licenze-multidipendente',
        siteName: 'Simon Silver Caldaie',
        title: 'Licenze Aziendali Corsi Caldaie | Fino al 40% di Sconto',
        description: 'Forma il tuo team di tecnici caldaie. Licenze multi-utente per aziende, CAT e scuole con sconti fino al 40%.',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Licenze Aziendali Corsi Caldaie Simon Silver' }],
    },
}

export default function LicenzeMultiLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
