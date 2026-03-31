import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Guida Completa Caldaie: Diagnosi Guasti, Manutenzione e Riparazione | Simon Silver',
    description: 'La guida definitiva per tecnici caldaie: come diagnosticare un guasto, manutenzione vera vs da libretto, codici errore, scambiatori, valvola 3 vie, NTC, perdite invisibili. Scritta da Simon Silver, tecnico caldaista con esperienza sul campo.',
    keywords: [
        'guida caldaie', 'diagnosi guasti caldaie', 'caldaia non parte', 'caldaia si blocca',
        'codici errore caldaia', 'manutenzione caldaia', 'riparazione caldaia',
        'caldaia non scalda acqua', 'caldaia perde pressione', 'caldaia rumore strano',
        'scambiatore caldaia sporco', 'valvola tre vie bloccata', 'NTC caldaia guasta',
        'scheda elettronica caldaia', 'caldaia condensazione problemi',
        'caldaia si spegne da sola', 'pressostato caldaia', 'vaso espansione caldaia',
        'calcare caldaia', 'magnetite impianto', 'manutenzione caldaia cosa fare',
        'corso tecnico caldaie', 'formazione caldaie online',
        'tecnico caldaie cosa studiare', 'come diventare tecnico caldaie',
        'troubleshooting caldaia', 'errore fiamma caldaia', 'caldaia non si accende',
        'caldaia va in blocco', 'pulizia scambiatore caldaia',
    ],
    alternates: {
        canonical: 'https://simonsilvercaldaie.it/guida-caldaie',
    },
    openGraph: {
        type: 'article',
        locale: 'it_IT',
        url: 'https://simonsilvercaldaie.it/guida-caldaie',
        siteName: 'Simon Silver Caldaie',
        title: 'Guida Completa Caldaie: Diagnosi, Manutenzione e Riparazione',
        description: 'La guida definitiva per tecnici caldaie scritta da Simon Silver. Diagnosi guasti, manutenzione, codici errore, e molto altro.',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Guida Completa Caldaie - Simon Silver' }],
    },
}

export default function GuidaCaldaieLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
