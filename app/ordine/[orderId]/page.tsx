'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

type OrderStatus = 'loading' | 'activating' | 'activated' | 'needs_assistance' | 'not_found'

export default function OrderStatusPage() {
    const params = useParams()
    const orderId = params.orderId as string

    const [status, setStatus] = useState<OrderStatus>('loading')
    const [message, setMessage] = useState('')
    const [coursesUnlocked, setCoursesUnlocked] = useState(0)
    const [retryCount, setRetryCount] = useState(0)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        checkOrderStatus()
    }, [orderId])

    const checkOrderStatus = async () => {
        try {
            // Ottieni sessione
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.user) {
                setStatus('needs_assistance')
                setMessage('Effettua l\'accesso per verificare lo stato del tuo ordine.')
                return
            }

            setUser(session.user)

            // Verifica se già attivato in DB (check both columns for compatibility)
            const { data: purchases } = await supabase
                .from('purchases')
                .select('id')
                .or(`paypal_order_id.eq.${orderId},paypal_capture_id.eq.${orderId}`)

            if (purchases && purchases.length > 0) {
                setStatus('activated')
                setCoursesUnlocked(purchases.length)
                setMessage('I tuoi corsi sono pronti!')
                return
            }

            // Prova ad attivare
            setStatus('activating')
            await attemptActivation(session.access_token)

        } catch (error) {
            console.error('Errore verifica ordine:', error)
            setStatus('needs_assistance')
            setMessage('Errore durante la verifica. Riprova tra qualche minuto.')
        }
    }

    const attemptActivation = async (accessToken: string) => {
        try {
            const res = await fetch('/api/replay-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ orderId })
            })

            const data = await res.json()

            if (data.status === 'activated') {
                setStatus('activated')
                setCoursesUnlocked(data.coursesUnlocked || 0)
                setMessage('I tuoi corsi sono pronti!')
                return
            }

            if (data.status === 'tos_required') {
                setStatus('needs_assistance')
                setMessage('Devi accettare i Termini e Condizioni prima di procedere.')
                return
            }

            if (data.code === 'ORDER_NOT_FOUND') {
                setStatus('not_found')
                setMessage('Ordine non trovato. Verifica l\'ID o contattaci.')
                return
            }

            if (data.code === 'ORDER_NOT_COMPLETED') {
                // Ordine non ancora completato su PayPal, riprova
                if (retryCount < 5) {
                    setRetryCount(prev => prev + 1)
                    setTimeout(() => attemptActivation(accessToken), 3000)
                    return
                }
            }

            // Dopo 5 tentativi, mostra assistenza
            setStatus('needs_assistance')
            setMessage(data.error || 'Attivazione in sospeso')

        } catch (error) {
            console.error('Errore attivazione:', error)
            if (retryCount < 3) {
                setRetryCount(prev => prev + 1)
                setTimeout(async () => {
                    const { data: { session } } = await supabase.auth.getSession()
                    if (session) attemptActivation(session.access_token)
                }, 3000)
            } else {
                setStatus('needs_assistance')
                setMessage('Errore di connessione. Riprova tra qualche minuto.')
            }
        }
    }

    const handleRetry = async () => {
        setStatus('activating')
        setRetryCount(0)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            await attemptActivation(session.access_token)
        }
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">

                    {/* LOADING */}
                    {status === 'loading' && (
                        <>
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                            <h1 className="text-xl font-bold text-gray-800 mb-2">Verifica in corso...</h1>
                            <p className="text-gray-600">Stiamo controllando lo stato del tuo ordine</p>
                        </>
                    )}

                    {/* ACTIVATING */}
                    {status === 'activating' && (
                        <>
                            <div className="animate-pulse">
                                <div className="text-6xl mb-4">⏳</div>
                            </div>
                            <h1 className="text-xl font-bold text-amber-600 mb-2">Attivazione in corso...</h1>
                            <p className="text-gray-600 mb-4">
                                Stiamo sbloccando i tuoi corsi.
                                {retryCount > 0 && ` Tentativo ${retryCount + 1}...`}
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-sm text-amber-800">Non chiudere questa pagina</p>
                            </div>
                        </>
                    )}

                    {/* ACTIVATED */}
                    {status === 'activated' && (
                        <>
                            <div className="text-6xl mb-4">🎉</div>
                            <h1 className="text-2xl font-bold text-green-600 mb-2">Attivazione completata!</h1>
                            <p className="text-gray-600 mb-6">{message}</p>
                            {coursesUnlocked > 0 && (
                                <p className="text-lg font-semibold text-gray-800 mb-6">
                                    {coursesUnlocked} corsi sbloccati
                                </p>
                            )}
                            <Link
                                href="/dashboard"
                                className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition"
                            >
                                Vai alla Dashboard
                            </Link>

                            {/* Device Policy Info Box */}
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-left">
                                <p className="text-sm text-blue-800 font-medium mb-1">📱 Ricorda</p>
                                <p className="text-xs text-blue-700">
                                    Puoi accedere da massimo <strong>2 dispositivi</strong> (es. PC e telefono).
                                    Se hai bisogno di cambiarli, vai nella tua Dashboard — è possibile 1 volta ogni 30 giorni.
                                </p>
                            </div>
                        </>
                    )}

                    {/* NEEDS ASSISTANCE */}
                    {status === 'needs_assistance' && (
                        <>
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-xl font-bold text-orange-600 mb-2">Serve assistenza</h1>
                            <p className="text-gray-600 mb-4">{message}</p>

                            <div className="bg-gray-100 rounded-lg p-4 mb-6">
                                <p className="text-xs text-gray-500 mb-1">ID Ordine (copia questo codice)</p>
                                <p className="font-mono text-lg font-bold text-gray-800 break-all select-all">
                                    {orderId}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleRetry}
                                    className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition"
                                >
                                    Riprova attivazione
                                </button>
                                <Link
                                    href="/contatti"
                                    className="block w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition"
                                >
                                    Contattaci
                                </Link>
                            </div>

                            <p className="text-xs text-gray-400 mt-6">
                                Se entro 10 minuti non si sblocca, contattaci indicando l'ID ordine sopra.
                            </p>
                        </>
                    )}

                    {/* NOT FOUND */}
                    {status === 'not_found' && (
                        <>
                            <div className="text-6xl mb-4">❓</div>
                            <h1 className="text-xl font-bold text-red-600 mb-2">Ordine non trovato</h1>
                            <p className="text-gray-600 mb-4">{message}</p>

                            <div className="bg-gray-100 rounded-lg p-4 mb-6">
                                <p className="text-xs text-gray-500 mb-1">ID cercato</p>
                                <p className="font-mono text-sm text-gray-800 break-all">
                                    {orderId}
                                </p>
                            </div>

                            <Link
                                href="/contatti"
                                className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition"
                            >
                                Contattaci
                            </Link>
                        </>
                    )}

                </div>
            </main>
        </div>
    )
}
