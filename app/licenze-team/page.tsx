'use client'
import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { Users, CheckCircle2 } from "lucide-react"
import { PayPalBtn } from "@/components/PayPalBtn"
import { supabase } from "@/lib/supabaseClient"
import { LEGAL_TEXT_CHECKOUT } from "@/lib/legalTexts"

export default function TeamLicensePage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [tosAccepted, setTosAccepted] = useState(false)
    const [tosLoading, setTosLoading] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user || null)
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

    const handlePurchaseSuccess = async (orderId: string, params: { product_code: string, amount_cents: number }) => {
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
                    product_code: params.product_code,
                    amount_cents: params.amount_cents,
                    plan_type: 'team'
                })
            })

            const data = await res.json()

            if (res.ok) {
                // Send team purchase confirmation email from client
                if (data.emailType && data.email) {
                    try {
                        const emailData = {
                            service_id: 'service_i4y7ewt',
                            template_id: 'template_sotc25n',
                            user_id: 'NcJg5-hiu3gVJiJZ-',
                            template_params: {
                                from_name: 'Simon Silver Caldaie',
                                to_email: data.email,
                                subject: '✅ Conferma Acquisto - Licenza Team',
                                message: `Ciao! Grazie per il tuo acquisto.\n\nHai sbloccato con successo una Licenza TEAM.\nOra puoi invitare i membri del tuo team dalla tua Dashboard.\n\nAccedi qui:\nhttps://simonsilvercaldaie.it/dashboard\n\nBuon lavoro!\nSimon Silver`
                            }
                        }
                        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(emailData)
                        })
                    } catch (emailErr) {
                        console.error('Team purchase email error:', emailErr)
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

    const TeamCard = ({ title, users, price, code, amount }: { title: string, users: number, price: string, code: string, amount: number }) => (
        <div className="bg-white border-2 border-indigo-100 rounded-3xl p-8 shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-indigo-900 mb-2">{title}</h3>
                <div className="flex items-center gap-2 text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full inline-block">
                    <Users className="w-4 h-4" />
                    <span>Fino a {users} Tecnici</span>
                </div>
            </div>

            <div className="mb-8">
                <div className="text-4xl font-extrabold text-slate-800">€ {price}</div>
                <div className="text-sm text-slate-500 mt-1">Pagamento unico · Accesso a vita</div>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Accesso completo a <strong>tutti i 3 Livelli</strong></span>
                </li>

                <li className="flex items-start gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Gestione utenti centralizzata</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span><strong>Admin + {users} tecnici</strong> invitabili</span>
                </li>
            </ul>

            <div className="mt-auto">
                {user ? (
                    tosAccepted ? (
                        <PayPalBtn
                            amount={amount.toString()}
                            courseTitle={`Licenza ${title}`}
                            onSuccess={(orderId) => handlePurchaseSuccess(orderId, { product_code: code, amount_cents: amount * 100 })}
                        />
                    ) : (
                        <button disabled className="w-full py-4 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                            Accetta i termini sopra per acquistare
                        </button>
                    )
                ) : (
                    <Link href="/login" className="block w-full py-4 bg-indigo-600 text-white font-bold rounded-xl text-center hover:bg-indigo-700 transition-colors">
                        Accedi per Acquistare
                    </Link>
                )}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Navbar />

            <main className="flex-grow py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm bg-indigo-50 px-4 py-2 rounded-full mb-4 inline-block">
                            Per Aziende e Centri Assistenza
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
                            Licenze <span className="text-indigo-600">Team</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Soluzione aziendale completa. Risparmia fino al 40% rispetto alle licenze singole e gestisci la formazione dei tuoi tecnici in un unico posto.
                        </p>
                    </div>

                    {user && (
                        <div className="max-w-xl mx-auto mb-12 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tosAccepted}
                                    onChange={(e) => handleTosCheckbox(e.target.checked)}
                                    disabled={tosLoading}
                                    className="mt-1 w-5 h-5 accent-indigo-600"
                                />
                                <div className="text-sm text-slate-600">
                                    <span className="font-bold text-slate-800 block mb-1">Accettazione Contrattuale</span>
                                    Dichiaro di aver letto e accettato i <Link href="/termini" className="underline text-indigo-600">Termini d'Uso</Link> e le condizioni di vendita.
                                    <div className="mt-2 text-xs text-slate-400 bg-slate-50 p-2 rounded">
                                        {LEGAL_TEXT_CHECKOUT}
                                    </div>
                                </div>
                            </label>
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <TeamCard
                            title="Team 5"
                            users={5}
                            price="3.000"
                            code="team_5"
                            amount={3000}
                        />
                        <TeamCard
                            title="Team 10"
                            users={10}
                            price="4.000"
                            code="team_10"
                            amount={4000}
                        />
                        <TeamCard
                            title="Team 25 / Formatore"
                            users={25}
                            price="5.000"
                            code="team_25"
                            amount={5000}
                        />
                    </div>


                </div>
            </main>
        </div>
    )
}
