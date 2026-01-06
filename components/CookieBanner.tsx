'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function CookieBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Mostra il banner solo se non è già stato accettato
        const accepted = localStorage.getItem('cookiesAccepted')
        if (!accepted) {
            setVisible(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookiesAccepted', 'true')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900 border-t border-slate-700 shadow-2xl">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-300 text-center sm:text-left">
                    Questo sito utilizza solo cookie tecnici necessari al funzionamento.
                    Continuando la navigazione accetti l'uso dei cookie.{' '}
                    <Link href="/privacy" className="text-accent hover:underline font-medium">
                        Leggi l'informativa
                    </Link>
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 bg-accent text-white font-bold rounded-lg hover:bg-orange-600 transition-colors text-sm"
                    >
                        OK, ho capito
                    </button>
                </div>
            </div>
        </div>
    )
}
