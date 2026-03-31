import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pacchetto Completo 27 Video Corsi Caldaie | Risparmia €200 - Simon Silver',
    description: 'Acquista il pacchetto completo con tutti e 3 i livelli (Base + Intermedio + Avanzato): 27 video corsi professionali per tecnici caldaie a €1.000 invece di €1.200. Accesso a vita, formazione completa su diagnosi, manutenzione e riparazione caldaie.',
    keywords: [
        'pacchetto completo corsi caldaie', 'bundle corsi caldaie', 'corsi caldaie offerta',
        'formazione completa tecnico caldaie', '27 video corsi caldaie', 'sconto corsi caldaie',
        'tutti i corsi caldaie', 'corso caldaie prezzo', 'Simon Silver pacchetto completo',
    ],
    alternates: {
        canonical: 'https://simonsilvercaldaie.it/pacchetto-completo',
    },
    openGraph: {
        type: 'website',
        locale: 'it_IT',
        url: 'https://simonsilvercaldaie.it/pacchetto-completo',
        siteName: 'Simon Silver Caldaie',
        title: 'Pacchetto Completo 27 Video Corsi Caldaie | Risparmia €200',
        description: 'Tutti e 3 i livelli insieme: 27 video corsi per tecnici caldaie a €1.000 invece di €1.200. Formazione completa dalla diagnosi alla gestione del cliente.',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pacchetto Completo Corsi Caldaie Simon Silver' }],
    },
}

export default function PacchettoCompletoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
