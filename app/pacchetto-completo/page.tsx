'use client'
import { useState, useEffect } from 'react'
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { Package, CheckCircle2, Sparkles, ArrowRight } from "lucide-react"
import { PayPalBtn } from "@/components/PayPalBtn"
import { supabase } from "@/lib/supabaseClient"
import { LEGAL_TEXT_CHECKOUT } from "@/lib/legalTexts"

const BUNDLE_PRICE = 1100 // €1100 invece di €1200
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
        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token

        if (!accessToken) return

        try {
            const res = await fetch('/api/complete-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    orderId,
                    product_code: 'complete_bundle',
                    amount_cents: BUNDLE_PRICE * 100,
                    plan_type: 'individual'
                })
            })

            const data = await res.json()

            if (res.ok) {
                // Send confirmation email
                if (data.email) {
                    try {
                        const emailData = {
                            service_id: 'service_i4y7ewt',
                            template_id: 'template_sotc25n',
                            user_id: 'NcJg5-hiu3gVJiJZ-',
                            template_params: {
                                from_name: 'Simon Silver Caldaie',
                                to_email: data.email,
                                subject: '✅ Conferma Acquisto - Pacchetto Completo',
                                message: `Ciao! Grazie per il tuo acquisto.\n\nHai sbloccato con successo:\nPACCHETTO COMPLETO (27 Video - Tutti i 3 Livelli)\n\nPuoi accedere subito ai tuoi corsi qui:\nhttps://simonsilvercaldaie.it/catalogo\n\nBuono studio!\nSimon Silver`
                            }
                        }
                        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(emailData)
                        })
                    } catch (emailErr) {
                        console.error('Email error:', emailErr)
                    }
                }
                window.location.href = `/ordine/${orderId}`
            } else {
                alert('Errore nel completamento dell\'ordine. Contatta l\'assistenza.')
            }
        } catch (err) {
            console.error(err)
            alert('Errore di rete.')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Navbar />

            <main className="flex-grow py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <Sparkles className="w-4 h-4" />
                            OFFERTA SPECIALE
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Pacchetto <span className="text-amber-400">Completo</span>
                        </h1>
                        <p className="text-xl text-slate-300">
                            Tutti e 3 i livelli insieme. <strong className="text-amber-400">Risparmi €100!</strong>
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-600">
                        {hasPurchased ? (
                            <div className="text-center py-8">
                                <div className="p-4 bg-green-500/20 rounded-full inline-block mb-4">
                                    <CheckCircle2 className="w-16 h-16 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Hai già accesso completo!</h2>
                                <p className="text-slate-300 mb-6">Tutti i 27 corsi sono già sbloccati nel tuo account.</p>
                                <Link
                                    href="/catalogo"
                                    className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-500 transition-colors"
                                >
                                    Vai ai Corsi <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Price Section */}
                                <div className="text-center mb-8">
                                    <div className="flex items-center justify-center gap-4 mb-2">
                                        <span className="text-3xl text-slate-400 line-through">€{FULL_PRICE}</span>
                                        <span className="text-6xl font-extrabold text-white">€{BUNDLE_PRICE}</span>
                                    </div>
                                    <div className="inline-block bg-amber-500 text-slate-900 font-bold px-4 py-1 rounded-full text-sm">
                                        RISPARMI €{FULL_PRICE - BUNDLE_PRICE}
                                    </div>
                                </div>

                                {/* What's Included */}
                                <div className="bg-slate-900/50 rounded-2xl p-6 mb-8">
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-amber-400" />
                                        Cosa include:
                                    </h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-slate-200">
                                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span><strong className="text-green-400">Livello Base</strong> - 9 video corsi (valore €300)</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-200">
                                            <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                            <span><strong className="text-blue-400">Livello Intermedio</strong> - 9 video corsi (valore €400)</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-200">
                                            <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                            <span><strong className="text-purple-400">Livello Avanzato</strong> - 9 video corsi (valore €500)</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-200 pt-2 border-t border-slate-600">
                                            <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                            <span><strong>27 video totali</strong> - Accesso a vita</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Purchase Section */}
                                {user ? (
                                    <div className="space-y-4">
                                        <label className={`flex items-start gap-3 text-sm text-slate-300 cursor-pointer p-4 bg-slate-900/50 rounded-xl border-2 ${tosAccepted ? 'border-amber-500/50' : 'border-slate-600'} transition-all ${tosLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={tosAccepted}
                                                onChange={(e) => handleTosCheckbox(e.target.checked)}
                                                disabled={tosLoading}
                                                className="mt-1 w-5 h-5 accent-amber-500 flex-shrink-0"
                                            />
                                            <span>
                                                Dichiaro di aver letto e accettato i{' '}
                                                <Link href="/termini" target="_blank" className="text-amber-400 underline">Termini d'Uso</Link>
                                                {' '}e le condizioni di vendita.
                                            </span>
                                        </label>

                                        <div className="text-xs text-slate-500 bg-slate-900/30 p-3 rounded-lg">
                                            {LEGAL_TEXT_CHECKOUT}
                                        </div>

                                        {tosAccepted ? (
                                            // DISABILITATO TEMPORANEAMENTE
                                            <div className="text-center p-4 bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-600">
                                                <p className="font-bold text-slate-400 mb-1">Acquisti momentaneamente sospesi</p>
                                                <p className="text-xs text-slate-500">In attesa del caricamento dei video definitivi.</p>
                                            </div>
                                        ) : (
                                            <button disabled className="w-full py-4 bg-slate-600 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                                                Accetta i Termini per procedere
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Link
                                            href="/login"
                                            className="inline-block w-full py-4 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 transition-colors text-lg"
                                        >
                                            Accedi per Acquistare
                                        </Link>
                                        <p className="text-sm text-slate-400 mt-3">
                                            Hai già acquistato? <Link href="/login" className="text-amber-400 underline">Accedi</Link>
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Back Link */}
                    <div className="text-center mt-8">
                        <Link href="/catalogo" className="text-slate-400 hover:text-white transition-colors">
                            ← Torna al Catalogo
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
