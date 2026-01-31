import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pacchetto Completo | Simon Silver Caldaie',
    description: 'Accedi al percorso formativo completo. Include tutti i 3 livelli: Base, Intermedio e Avanzato. 27 video corsi per tecnici caldaisti.',
    openGraph: {
        title: 'Pacchetto Completo - Formazione Tecnica Caldaie',
        description: 'Il percorso definitivo per tecnici. Include i livelli Base, Intermedio e Avanzato (27 video).',
        url: 'https://www.simonsilvercaldaie.it/pacchetto-completo',
        siteName: 'Simon Silver Caldaie',
        locale: 'it_IT',
        type: 'website',
    },
}

export default function PacchettoLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
