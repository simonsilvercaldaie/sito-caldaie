'use client'
import { useState, useEffect } from 'react'
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { Package, CheckCircle2, Sparkles, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { LEGAL_TEXT_CHECKOUT } from "@/lib/legalTexts"
import { PayPalBtn } from "@/components/PayPalBtn"

const BUNDLE_PRICE = 1000 // €1000 (Sconto €200 da €1200)
const FULL_PRICE = 1200

export default function PacchettoCompletoPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [tosAccepted, setTosAccepted] = useState(false)
    const [tosLoading, setTosLoading] = useState(false)
    const [hasPurchased, setHasPurchased] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const currentUser = session?.user || null
            setUser(currentUser)

            if (currentUser) {
                // Check if already has complete access
                const { data: purchases } = await supabase
                    .from('purchases')
                    .select('product_code')
                    .eq('user_id', currentUser.id)

                if (purchases) {
                    const codes = purchases.map(p => p.product_code?.toLowerCase())
                    const hasComplete = codes.some(c => c?.includes('complete'))
                    const hasAllThree =
                        codes.some(c => c?.includes('base')) &&
                        codes.some(c => c?.includes('intermediate')) &&
                        codes.some(c => c?.includes('advanced'))

                    if (hasComplete || hasAllThree) {
                        setHasPurchased(true)
                    }
                }

                // Check team access
                const { data: teamMember } = await supabase
                    .from('team_members')
                    .select('team_license_id')
                    .eq('user_id', currentUser.id)
                    .is('removed_at', null)
                    .maybeSingle()

                if (teamMember) {
                    setHasPurchased(true)
                }
            }
            setLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })
        return () => subscription.unsubscribe()
    }, [])

    const handleTosCheckbox = async (checked: boolean) => {
        if (!checked) {
            setTosAccepted(false)
            return
        }

        setTosLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const accessToken = session?.access_token

            if (!accessToken) {
                alert('Sessione scaduta, effettua di nuovo l\'accesso.')
                setTosAccepted(false)
                setTosLoading(false)
                return
            }

            const res = await fetch('/api/accept-tos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok || res.status === 409) {
                setTosAccepted(true)
            } else {
                alert('Impossibile registrare l\'accettazione. Riprova.')
                setTosAccepted(false)
            }
        } catch (err) {
            console.error(err)
            alert('Errore di rete. Riprova.')
            setTosAccepted(false)
        } finally {
            setTosLoading(false)
        }
    }

    const handlePurchaseSuccess = async (orderId: string) => {
        if (!user) return

        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token

        if (!accessToken) {
            alert('Sessione scaduta. Effettua di nuovo l\'accesso e riprova.')
            return
        }

        const product_code = 'complete_bundle'
        const amount_cents = BUNDLE_PRICE * 100

        const attemptSave = async (attempt: number = 1): Promise<boolean> => {
            try {
                const body = {
                    orderId: orderId,
                    product_code: product_code,
                    amount_cents: amount_cents,
                    plan_type: 'individual'
                }

                const res = await fetch('/api/complete-purchase', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(body)
                })

                const data = await res.json()

                if (res.ok && data.ok) {
                    // Send confirmation email
                    try {
                        if (data.email) {
                            const emailData = {
                                service_id: 'service_fwvybtr',
                                template_id: 'template_b8p58ci',
                                user_id: 'NcJg5-hiu3gVJiJZ-',
                                template_params: {
                                    from_name: 'Simon Silver Caldaie',
                                    to_email: data.email,
                                    subject: '✅ Conferma Acquisto - Pacchetto Completo',
                                    message: `Grazie per il tuo acquisto!\n\nHai sbloccato il Pacchetto Completo (tutti i 27 video).\n\nAccedi al catalogo per iniziare: https://www.simonsilvercaldaie.it/catalogo\n\nBuono studio!`
                                }
                            }
                            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(emailData)
                            })
                        }
                    } catch (emailErr) {
                        console.error('Email error:', emailErr)
                    }
                    return true
                }

                if (data.error === 'tos_not_accepted') {
                    alert('Accetta i Termini per procedere.')
                    setTosAccepted(false)
                    return false
                }

                if (res.status >= 500 && attempt < 3) {
                    await new Promise(r => setTimeout(r, 2000))
                    return attemptSave(attempt + 1)
                }
                return false

            } catch (err) {
                if (attempt < 3) {
                    await new Promise(r => setTimeout(r, 2000))
                    return attemptSave(attempt + 1)
                }
                return false
            }
        }

        const success = await attemptSave()

        if (success) {
            window.location.href = `/ordine/${orderId}`
        } else {
            localStorage.setItem('pendingOrderId', orderId)
            window.location.href = `/ordine/${orderId}`
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const currentPrice = BUNDLE_PRICE
    const savings = FULL_PRICE - currentPrice

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-sm border border-amber-200">
                            <Sparkles className="w-4 h-4" />
                            OFFERTA SPECIALE
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Pacchetto <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Completo</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Tutti e 3 i livelli insieme per una formazione completa. <br />
                            <strong className="text-amber-600">Risparmio speciale</strong> rispetto all'acquisto singolo.
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

                        {hasPurchased ? (
                            <div className="text-center py-8 relative z-10">
                                <div className="p-4 bg-green-100 text-green-600 rounded-full inline-block mb-4">
                                    <CheckCircle2 className="w-16 h-16" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Hai già accesso completo!</h2>
                                <p className="text-gray-600 mb-8 text-lg">Tutti i 27 corsi sono già sbloccati nel tuo account.</p>
                                <Link
                                    href="/catalogo"
                                    className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    Vai ai Corsi <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-12 relative z-10">
                                {/* Left Side: Value Proposition */}
                                <div className="space-y-8 flex flex-col justify-center">
                                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 h-full flex flex-col justify-center">
                                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-xl">
                                            <Package className="w-6 h-6 text-amber-500" />
                                            Cosa include il pacchetto:
                                        </h3>
                                        <ul className="space-y-8">
                                            <li className="flex items-center gap-4 text-gray-700">
                                                <div className="bg-blue-100 p-2 rounded-xl text-blue-600 shadow-sm">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <span className="text-lg"><strong className="text-blue-700">Livello Base</strong> (9 video)</span>
                                            </li>
                                            <li className="flex items-center gap-4 text-gray-700">
                                                <div className="bg-green-100 p-2 rounded-xl text-green-600 shadow-sm">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <span className="text-lg"><strong className="text-green-700">Livello Intermedio</strong> (9 video)</span>
                                            </li>
                                            <li className="flex items-center gap-4 text-gray-700">
                                                <div className="bg-red-100 p-2 rounded-xl text-red-600 shadow-sm">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <span className="text-lg"><strong className="text-red-700">Livello Avanzato</strong> (9 video)</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Right Side: Price & Action */}
                                <div className="flex flex-col justify-center">
                                    <div className="text-center mb-8 bg-amber-50 rounded-2xl p-6 border border-amber-100">
                                        <p className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-2">Prezzo Totale</p>
                                        <div className="flex items-end justify-center gap-3 mb-2">
                                            <span className="text-6xl font-extrabold text-gray-900 tracking-tight">€ ---</span>
                                        </div>
                                        <div className="inline-block bg-white text-green-700 font-bold px-4 py-1.5 rounded-full text-sm shadow-sm border border-green-100">
                                            Prezzo speciale!
                                        </div>
                                    </div>

                                    {user ? (
                                        <div className="space-y-4">
                                            <label className={`flex items-start gap-3 text-sm text-gray-600 cursor-pointer p-4 bg-gray-50 rounded-xl border-2 ${tosAccepted ? 'border-amber-500 bg-amber-50/50' : 'border-gray-200'} transition-all hover:border-amber-300 ${tosLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={tosAccepted}
                                                    onChange={(e) => handleTosCheckbox(e.target.checked)}
                                                    disabled={tosLoading}
                                                    className="mt-1 w-5 h-5 accent-amber-500 flex-shrink-0"
                                                />
                                                <span className="leading-snug">
                                                    Dichiaro di aver letto e accettato i{' '}
                                                    <Link href="/termini" target="_blank" className="text-amber-600 underline hover:text-amber-700">Termini d'Uso</Link>
                                                    {' '}e le condizioni di vendita.
                                                </span>
                                            </label>

                                            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                {LEGAL_TEXT_CHECKOUT.slice(0, 150)}...
                                            </div>

                                            {tosAccepted ? (
                                                // ACQUISTI TEMPORANEAMENTE SOSPESI
                                                <div className="text-center p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                                    <p className="font-bold text-gray-500 mb-1">Acquisti momentaneamente sospesi</p>
                                                    <p className="text-xs text-gray-400">In attesa del caricamento dei video definitivi.</p>
                                                </div>
                                            ) : (
                                                <button disabled className="w-full py-4 bg-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                                                    Accetta i Termini per procedere
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-3">
                                            <Link
                                                href="/login"
                                                className="block w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
                                            >
                                                Accedi per Acquistare
                                            </Link>
                                            <p className="text-sm text-gray-500">
                                                Hai già un account? <Link href="/login" className="text-amber-600 font-semibold hover:underline">Accedi qui</Link>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Back Link */}
                    <div className="text-center mt-12">
                        <Link href="/catalogo" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
                            <ArrowRight className="w-4 h-4 rotate-180" /> Torna al Catalogo
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
