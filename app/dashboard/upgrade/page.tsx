'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, Users, CheckCircle2, ArrowUpCircle, AlertCircle } from 'lucide-react'
import { PayPalBtn } from '@/components/PayPalBtn'
import { LEGAL_TEXT_CHECKOUT } from '@/lib/legalTexts'

// Upgrade pricing
const UPGRADE_PRICES = {
    // From Individual (all 3) to Team
    'individual_to_team_5': 600,
    'individual_to_team_10': 1100,
    'individual_to_team_25': 2100,
    // Team to Team
    'team_5_to_team_10': 500,
    'team_5_to_team_25': 1500,
    'team_10_to_team_25': 1000,
}

type LicenseStatus =
    | 'none'
    | 'partial_individual'  // Has 1 or 2 levels
    | 'full_individual'     // Has all 3 levels
    | 'team_5'
    | 'team_10'
    | 'team_25'

export default function UpgradePage() {
    const router = useRouter()

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>('none')
    const [ownedLevels, setOwnedLevels] = useState<string[]>([])
    const [teamSize, setTeamSize] = useState<number | null>(null)
    const [tosAccepted, setTosAccepted] = useState(false)
    const [tosLoading, setTosLoading] = useState(false)

    useEffect(() => {
        checkLicenseStatus()
    }, [])

    const checkLicenseStatus = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router.push('/login')
            return
        }
        setUser(session.user)

        // ADMIN BYPASS
        if (session.user.email === 'simonsilvercaldaie@gmail.com') {
            setLicenseStatus('full_individual')
            setLoading(false)
            return
        }

        // Check team license (owner)
        const { data: teamLicense } = await supabase
            .from('team_licenses')
            .select('max_members, status')
            .eq('owner_id', session.user.id)
            .eq('status', 'active')
            .maybeSingle()

        if (teamLicense) {
            setTeamSize(teamLicense.max_members)
            if (teamLicense.max_members >= 25) {
                setLicenseStatus('team_25')
            } else if (teamLicense.max_members >= 10) {
                setLicenseStatus('team_10')
            } else {
                setLicenseStatus('team_5')
            }
            setLoading(false)
            return
        }

        // Check individual purchases
        const { data: purchases } = await supabase
            .from('purchases')
            .select('product_code')
            .eq('user_id', session.user.id)

        if (purchases && purchases.length > 0) {
            const codes = purchases.map(p => p.product_code?.toLowerCase())
            const hasBase = codes.some(c => c?.includes('base'))
            const hasInter = codes.some(c => c?.includes('intermedi') || c?.includes('intermediate'))
            const hasAdvanced = codes.some(c => c?.includes('avanzat') || c?.includes('advanced'))
            const hasComplete = codes.some(c => c?.includes('complete'))

            const levels = []
            if (hasBase || hasComplete) levels.push('base')
            if (hasInter || hasComplete) levels.push('intermedio')
            if (hasAdvanced || hasComplete) levels.push('avanzato')

            setOwnedLevels(levels)

            if (levels.length === 3 || hasComplete) {
                setLicenseStatus('full_individual')
            } else if (levels.length > 0) {
                setLicenseStatus('partial_individual')
            } else {
                // No purchases at all, redirect
                router.push('/catalogo')
                return
            }
        } else {
            // No purchases, redirect to catalogo
            router.push('/catalogo')
            return
        }

        setLoading(false)
    }

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

    const handleUpgradeSuccess = async (orderId: string, targetTeam: number, upgradePrice: number) => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        try {
            const res = await fetch('/api/upgrade-license', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    orderId,
                    target_team_size: targetTeam,
                    upgrade_price_cents: upgradePrice * 100,
                    from_status: licenseStatus
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
                                subject: '✅ Upgrade Licenza Completato',
                                message: `Ciao!\n\nIl tuo upgrade a Team ${targetTeam} è stato completato con successo!\n\nOra puoi gestire i membri del tuo team dalla Dashboard.\n\nAccedi qui:\nhttps://simonsilvercaldaie.it/dashboard\n\nGrazie!\nSimon Silver`
                            }
                        }
                        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(emailData)
                        })
                    } catch (emailErr) {
                        console.error('Upgrade email error:', emailErr)
                    }
                }
                window.location.href = `/ordine/${orderId}`
            } else {
                alert('Errore nell\'upgrade: ' + (data.error || 'Errore sconosciuto'))
            }
        } catch (err) {
            console.error(err)
            alert('Errore di rete durante l\'upgrade.')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm px-4 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex items-center">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Torna alla Dashboard
                    </Link>
                    <h1 className="ml-auto font-bold text-xl text-primary">Upgrade Licenza</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 space-y-8">

                {/* STATUS BANNER */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">La tua situazione attuale</h2>
                    {licenseStatus === 'none' && (
                        <p className="text-gray-600">Non hai ancora acquistato alcuna licenza.</p>
                    )}
                    {licenseStatus === 'partial_individual' && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-amber-800 font-medium">Hai acquistato: {ownedLevels.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')}</p>
                                <p className="text-amber-700 text-sm mt-1">
                                    Per passare a una licenza Team, devi prima acquistare <strong>tutti e 3 i livelli</strong> (Base, Intermedio, Avanzato).
                                </p>
                                <Link href="/catalogo" className="inline-block mt-3 text-amber-800 font-bold underline hover:text-amber-900">
                                    Vai al Catalogo per completare gli acquisti
                                </Link>
                            </div>
                        </div>
                    )}
                    {licenseStatus === 'full_individual' && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-green-800">
                                <strong>Licenza Singola Completa</strong> - Hai tutti e 3 i livelli. Puoi fare l'upgrade a Team!
                            </p>
                        </div>
                    )}
                    {licenseStatus === 'team_5' && (
                        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <Users className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                            <p className="text-indigo-800">
                                <strong>Team 5</strong> - Puoi espandere a Team 10 o Team 25.
                            </p>
                        </div>
                    )}
                    {licenseStatus === 'team_10' && (
                        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <Users className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                            <p className="text-indigo-800">
                                <strong>Team 10</strong> - Puoi espandere a Team 25.
                            </p>
                        </div>
                    )}
                    {licenseStatus === 'team_25' && (
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                            <p className="text-purple-800">
                                <strong>Team 25</strong> - Hai già la licenza massima disponibile! 🎉
                            </p>
                        </div>
                    )}
                </div>

                {/* TOS CHECKBOX */}
                {(licenseStatus === 'full_individual' || licenseStatus === 'team_5' || licenseStatus === 'team_10') && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 ${tosAccepted ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'} transition-all ${tosLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input
                                type="checkbox"
                                checked={tosAccepted}
                                onChange={(e) => handleTosCheckbox(e.target.checked)}
                                disabled={tosLoading}
                                className="mt-1 w-5 h-5 accent-indigo-600"
                            />
                            <div className="text-sm text-gray-700">
                                <span className="font-bold text-gray-800 block mb-1">Accettazione Contrattuale</span>
                                Dichiaro di aver letto e accettato i <Link href="/termini" className="underline text-indigo-600">Termini d'Uso</Link> e le condizioni di upgrade.
                                <div className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                                    {LEGAL_TEXT_CHECKOUT}
                                </div>
                            </div>
                        </label>
                    </div>
                )}

                {/* UPGRADE OPTIONS */}
                {(licenseStatus === 'full_individual' || licenseStatus === 'team_5' || licenseStatus === 'team_10') && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Opzioni di Upgrade</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Team 5 */}
                            {licenseStatus === 'full_individual' && (
                                <UpgradeCard
                                    title="Team 5"
                                    users={5}
                                    price={user?.email === 'simonsilvercaldaie@gmail.com' ? 1 : UPGRADE_PRICES.individual_to_team_5}
                                    enabled={tosAccepted}
                                    onSuccess={(id) => handleUpgradeSuccess(id, 5, user?.email === 'simonsilvercaldaie@gmail.com' ? 1 : UPGRADE_PRICES.individual_to_team_5)}
                                />
                            )}

                            {/* Team 10 */}
                            {(licenseStatus === 'full_individual' || licenseStatus === 'team_5') && (
                                <UpgradeCard
                                    title="Team 10"
                                    users={10}
                                    price={user?.email === 'simonsilvercaldaie@gmail.com' ? 1 : (licenseStatus === 'full_individual' ? UPGRADE_PRICES.individual_to_team_10 : UPGRADE_PRICES.team_5_to_team_10)}
                                    enabled={tosAccepted}
                                    onSuccess={(id) => handleUpgradeSuccess(id, 10, user?.email === 'simonsilvercaldaie@gmail.com' ? 1 : (licenseStatus === 'full_individual' ? UPGRADE_PRICES.individual_to_team_10 : UPGRADE_PRICES.team_5_to_team_10))}
                                />
                            )}

                            {/* Team 25 */}
                            {(licenseStatus === 'full_individual' || licenseStatus === 'team_5' || licenseStatus === 'team_10') && (
                                <UpgradeCard
                                    title="Team 25"
                                    users={25}
                                    price={
                                        user?.email === 'simonsilvercaldaie@gmail.com' ? 1 : (
                                            licenseStatus === 'full_individual' ? UPGRADE_PRICES.individual_to_team_25 :
                                                licenseStatus === 'team_5' ? UPGRADE_PRICES.team_5_to_team_25 :
                                                    UPGRADE_PRICES.team_10_to_team_25
                                        )}
                                    enabled={tosAccepted}
                                    onSuccess={(id) => handleUpgradeSuccess(id, 25,
                                        user?.email === 'simonsilvercaldaie@gmail.com' ? 1 : (
                                            licenseStatus === 'full_individual' ? UPGRADE_PRICES.individual_to_team_25 :
                                                licenseStatus === 'team_5' ? UPGRADE_PRICES.team_5_to_team_25 :
                                                    UPGRADE_PRICES.team_10_to_team_25
                                        ))}
                                    highlight
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* CTA FOR PARTIAL */}
                {licenseStatus === 'partial_individual' && (
                    <div className="text-center py-8">
                        <Link
                            href="/catalogo"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                        >
                            Completa i tuoi Acquisti
                        </Link>
                    </div>
                )}

                {/* CTA FOR NONE */}
                {licenseStatus === 'none' && (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">Non hai ancora acquistato nessuna licenza.</p>
                        <Link
                            href="/catalogo"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                        >
                            Scopri i Corsi
                        </Link>
                    </div>
                )}

            </main>
        </div>
    )
}

function UpgradeCard({ title, users, price, enabled, onSuccess, highlight = false }: {
    title: string
    users: number
    price: number
    enabled: boolean
    onSuccess: (orderId: string) => void
    highlight?: boolean
}) {
    return (
        <div className={`bg-white border-2 ${highlight ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-200'} rounded-2xl p-6 flex flex-col`}>
            {highlight && (
                <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-4">
                    Più Popolare
                </div>
            )}
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <div className="flex items-center gap-2 text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full text-sm mb-4 w-fit">
                <Users className="w-4 h-4" />
                <span>Fino a {users} Tecnici</span>
            </div>

            <div className="mb-6">
                <div className="text-3xl font-extrabold text-gray-800">€ {price}</div>
                <div className="text-sm text-gray-500">Paga solo la differenza</div>
            </div>

            <ul className="space-y-2 mb-6 flex-grow text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Accesso a tutti i 3 Livelli
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Gestione membri da Dashboard
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Accesso a vita
                </li>
            </ul>

            <div className="mt-auto">
                {enabled ? (
                    <PayPalBtn
                        amount={price.toString()}
                        courseTitle={`Upgrade a ${title}`}
                        onSuccess={onSuccess}
                        showDisclaimer={false}
                    />
                ) : (
                    <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                        Accetta i termini sopra
                    </button>
                )}
            </div>
        </div>
    )
}
