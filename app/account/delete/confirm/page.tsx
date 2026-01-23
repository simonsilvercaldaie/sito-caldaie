'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

function ConfirmDeleteContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleConfirm = async () => {
        if (!token) return
        setStatus('processing')

        try {
            const res = await fetch('/api/delete-account/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Errore sconosciuto')
            }

            setStatus('success')
            // Redirect to home after 3 seconds
            setTimeout(() => {
                router.push('/')
            }, 3000)

        } catch (e: any) {
            console.error(e)
            setStatus('error')
            setMessage(e.message)
        }
    }

    if (!token) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-md border border-red-100 max-w-md mx-auto mt-20">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-gray-800 mb-2">Token Mancante</h1>
                <p className="text-gray-600 mb-6">Il link che hai seguito non è valido.</p>
                <Link href="/" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Torna alla Home
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="bg-red-50 p-6 border-b border-red-100 flex flex-col items-center text-center">
                    <AlertTriangle className="w-12 h-12 text-red-600 mb-3" />
                    <h1 className="text-2xl font-bold text-red-700">Conferma Cancellazione</h1>
                </div>

                {/* Content */}
                <div className="p-8">
                    {status === 'idle' && (
                        <div className="text-center space-y-6">
                            <p className="text-gray-600">
                                Stai per cancellare definitivamente il tuo account su <strong>Simon Silver Caldaie</strong>.
                            </p>
                            <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-sm text-red-800 text-left">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Tutti i tuoi corsi verranno rimossi.</li>
                                    <li>Il progresso di studio sarà perso.</li>
                                    <li>Questa azione è <strong>irreversibile</strong>.</li>
                                </ul>
                            </div>
                            <button
                                onClick={handleConfirm}
                                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                Conferma Cancellazione Definitiva
                            </button>
                            <Link href="/dashboard" className="block text-gray-500 hover:text-gray-700 text-sm">
                                Annulla e torna al sicuro
                            </Link>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                            <p className="text-gray-600 font-medium">Cancellazione in corso...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center py-4">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Account Cancellato</h2>
                            <p className="text-gray-600 mb-6">Ci dispiace vederti andare. I tuoi dati sono stati rimossi.</p>
                            <p className="text-xs text-gray-400">Reindirizzamento alla home...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center py-4">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Errore</h2>
                            <p className="text-red-600 mb-6">{message}</p>
                            <Link href="/dashboard/account" className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                Riprova
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ConfirmDeletePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <ConfirmDeleteContent />
        </Suspense>
    )
}
