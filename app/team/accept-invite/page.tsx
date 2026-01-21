'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function AcceptInviteContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const router = useRouter()

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
    const [message, setMessage] = useState('Verifica invito in corso...')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Token mancante. Controlla il link.')
            return
        }

        const acceptInvite = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                // Save redirect for after login? 
                // Simple: Redirect to login with return url
                const returnUrl = encodeURIComponent(`/team/accept-invite?token=${token}`)
                router.push(`/login?redirect=${returnUrl}`)
                return
            }

            try {
                const res = await fetch('/api/team/invite/accept', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({ token })
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || 'Errore durante l\'accettazione')
                }

                setStatus('success')
                setMessage('Benvenuto nel Team! Accesso confermato.')

            } catch (e: any) {
                setStatus('error')
                setMessage(e.message)
            }
        }

        acceptInvite()
    }, [token, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">

                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto" />
                        <h1 className="text-xl font-bold text-gray-900">Verifica in corso...</h1>
                        <p className="text-gray-500">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Ottimo!</h1>
                        <p className="text-gray-600">{message}</p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
                        >
                            Vai alla Dashboard <ArrowRight className="w-4 h-4" />
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                            <XCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Ops...</h1>
                        <p className="text-red-600 font-medium">{message}</p>
                        <p className="text-sm text-gray-500">
                            L'invito potrebbe essere scaduto, revocato o già utilizzato.
                        </p>
                        <Link
                            href="/"
                            className="inline-block mt-4 text-indigo-600 font-medium hover:underline"
                        >
                            Torna alla Home
                        </Link>
                    </>
                )}

            </div>
        </div>
    )
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Caricamento...</div>}>
            <AcceptInviteContent />
        </Suspense>
    )
}
