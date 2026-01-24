'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { LogOut, User, Smartphone, Save, Loader2, RefreshCw, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import TeamDashboard from '@/components/TeamDashboard'

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Form States
    const [fullName, setFullName] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [cap, setCap] = useState('')
    const [cf, setCf] = useState('')
    const [piva, setPiva] = useState('')
    const [sdi, setSdi] = useState('')
    const [pec, setPec] = useState('')

    const [updatingProfile, setUpdatingProfile] = useState(false)

    // Device management state
    const [devices, setDevices] = useState<any[]>([])
    const [loadingDevices, setLoadingDevices] = useState(false)
    const [canResetDevices, setCanResetDevices] = useState(false)
    const [daysUntilReset, setDaysUntilReset] = useState<number | null>(null)
    const [resettingDevices, setResettingDevices] = useState(false)

    // Upgrade eligibility state
    const [canUpgrade, setCanUpgrade] = useState(false)



    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            setUser(session.user)

            // 1. Carica Billing Profile (Source of Truth)
            const { data: billing } = await supabase
                .from('billing_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle()

            if (billing) {
                setFullName(billing.company_name || `${billing.first_name} ${billing.last_name}`.trim())
                setAddress(billing.address || '')
                setCity(billing.city || '')
                setCap(billing.postal_code || '')
                setCf(billing.fiscal_code || '')
                setPiva(billing.vat_number || '')
                setSdi(billing.sdi_code || '')
                // PEC handling if separate column exists, otherwise reuse SDI logic or ignore
            } else {
                // Fallback to metadata only if no billing profile exists (legacy)
                const meta = session.user.user_metadata || {}
                setFullName(meta.full_name || '')
            }

            setLoading(false)

            // 2. Carica Dispositivi (Bug 2.3 Fix)
            setLoadingDevices(true)
            try {
                const res = await fetch('/api/devices', {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setDevices(data.devices || [])
                    setCanResetDevices(data.canReset)
                    setDaysUntilReset(data.daysRemaining)
                }
            } catch (e) {
                console.error('Error fetching devices', e)
            } finally {
                setLoadingDevices(false)
            }

            // 3. Check upgrade eligibility (has all 3 levels OR has team < 25)
            try {

                // Check if user is team owner with < 25 members
                const { data: teamLicense } = await supabase
                    .from('team_licenses')
                    .select('max_members')
                    .eq('owner_id', session.user.id)
                    .eq('status', 'active')
                    .maybeSingle()

                if (teamLicense && teamLicense.max_members < 25) {
                    setCanUpgrade(true)
                } else if (!teamLicense) {
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

                        if ((hasBase && hasInter && hasAdvanced) || hasComplete) {
                            setCanUpgrade(true)
                        }
                    }
                }
            } catch (e) {
                console.error('Error checking upgrade eligibility', e)
            }
        }
        checkUser()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdatingProfile(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("Sessione scaduta")

            // Determine names
            let first_name = fullName.split(' ')[0] || ''
            let last_name = fullName.substring(first_name.length).trim() || ''

            // Upsert Billing Profile (Bug 2.2 Fix)
            const billingData = {
                user_id: session.user.id,
                customer_type: piva ? 'company' : 'private',
                first_name,
                last_name,
                company_name: piva ? fullName : null,
                vat_number: piva || null,
                sdi_code: sdi || null, // Shared with PEC input
                address,
                city,
                postal_code: cap,
                fiscal_code: cf,
                updated_at: new Date().toISOString()
            }

            const { error } = await supabase
                .from('billing_profiles')
                .upsert(billingData)

            if (error) throw error

            // Optional: Also update basic auth metadata for UI consistency elsewhere
            await supabase.auth.updateUser({
                data: { full_name: fullName }
            })

            alert('Profilo aggiornato con successo!')
        } catch (error: any) {
            console.error(error)
            alert('Errore aggiornamento: ' + error.message)
        } finally {
            setUpdatingProfile(false)
        }
    }

    const handleResetDevices = async () => {
        if (!canResetDevices) {
            alert(`Puoi resettare i dispositivi tra ${daysUntilReset} giorni.`)
            return
        }

        if (!confirm('Sei sicuro di voler resettare tutti i dispositivi? Dovrai rieffettuare l\'accesso.')) {
            return
        }

        setResettingDevices(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Sessione non valida')

            const response = await fetch('/api/devices/reset', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            const data = await response.json()
            if (!data.success) {
                throw new Error(data.error || 'Errore durante il reset')
            }

            alert('Dispositivi resettati. Verrai disconnesso.')
            await supabase.auth.signOut()
            router.push('/login')
        } catch (error: any) {
            alert('Errore: ' + error.message)
        } finally {
            setResettingDevices(false)
        }
    }


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 gap-2 text-primary">
            <Loader2 className="animate-spin" /> Caricamento Area Riservata...
        </div>
    )

    const isCompany = !!piva // Semplice check se ha piva salvata

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">

            {/* Navbar Dashboard */}
            <header className="bg-white shadow-sm px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10 mb-8 max-w-7xl mx-auto rounded-b-2xl">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <div className="relative w-8 h-8">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                    </Link>
                    <div className="font-bold text-primary text-xl hidden sm:block">Area Riservata</div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <User className="w-4 h-4" />
                        {user?.email}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" />
                        Esci
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 space-y-8">

                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Il Mio Account</h1>
                    <div className="flex gap-2">
                        {user?.email === 'simonsilvercaldaie@gmail.com' && (
                            <Link href="/admin" className="px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-xl hover:bg-slate-900 transition-colors text-sm font-bold shadow-sm flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Pannello Admin
                            </Link>
                        )}
                        <Link href="/" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-primary transition-colors text-sm font-medium shadow-sm">
                            → Home page
                        </Link>
                    </div>
                </div>

                <TeamDashboard />

                {/* Sezione Profilo */}
                <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary">Dati Fatturazione</h2>
                            <p className="text-sm text-gray-600">I dati per le fatture dei tuoi acquisti</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="text" value={user?.email} disabled className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-500 cursor-not-allowed" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-800 mb-1">
                                    {isCompany ? 'Ragione Sociale' : 'Nome e Cognome'}
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-black"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-800 mb-1">Indirizzo</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-black"
                                    placeholder="Via Roma 10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Città</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">CAP</label>
                                <input
                                    type="text"
                                    value={cap}
                                    onChange={(e) => setCap(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Codice Fiscale</label>
                                <input
                                    type="text"
                                    value={cf}
                                    onChange={(e) => setCf(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase text-black"
                                />
                            </div>

                            <div className="md:col-span-2 border-t pt-4 mt-2">
                                <p className="text-sm font-bold text-gray-500 mb-4">Dati Aziendali (Opzionali)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Partita IVA</label>
                                <input
                                    type="text"
                                    value={piva}
                                    onChange={(e) => setPiva(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-black"
                                    placeholder="Solo se richiedi fattura"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-1">Codice SDI / PEC</label>
                                <input
                                    type="text"
                                    value={sdi || pec}
                                    onChange={(e) => {
                                        // Semplificazione: salviamo nello stesso campo sdi o entrambi se l'utente li scrive
                                        setSdi(e.target.value)
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-black"
                                    placeholder="Codice Univoco o PEC"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={updatingProfile}
                                className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {updatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Salva Dati
                            </button>
                        </div>
                    </form>
                </section>

                {/* Sezione Dispositivi e Sicurezza */}
                <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary">Sicurezza e Dispositivi</h2>
                            <p className="text-sm text-gray-600">Gestisci i dispositivi autorizzati ad accedere al tuo account</p>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>🔒 Accesso con Google</strong><br />
                            Il tuo account è protetto dall'autenticazione Google. Puoi accedere da un massimo di 2 dispositivi.
                        </p>
                    </div>

                    {/* Devices List */}
                    <div className="space-y-3 mb-6">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            Dispositivi Autorizzati ({devices.length}/2)
                        </h3>

                        {loadingDevices ? (
                            <p className="text-sm text-gray-500 italic"><Loader2 className="inline w-3 h-3 animate-spin" /> Caricamento dispositivi...</p>
                        ) : devices.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Nessun dispositivo registrato</p>
                        ) : (
                            <div className="space-y-2">
                                {devices.map((device: any) => (
                                    <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{device.device_name || 'Dispositivo'}</p>
                                                <p className="text-xs text-gray-500">
                                                    Aggiunto: {new Date(device.created_at).toLocaleDateString('it-IT')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reset Devices */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Hai raggiunto il limite di dispositivi?
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {canResetDevices
                                        ? 'Puoi resettare i dispositivi ora.'
                                        : `Potrai resettare tra ${daysUntilReset || '?'} giorni.`
                                    }
                                </p>
                            </div>
                            <button
                                onClick={handleResetDevices}
                                disabled={!canResetDevices || resettingDevices}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resettingDevices ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Reset Dispositivi
                            </button>
                        </div>
                    </div>
                </section>

                {/* UPGRADE LICENZA CTA - Solo per utenti con tutti e 3 i livelli o team < 25 */}
                {canUpgrade && (
                    <section className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 md:p-8 rounded-2xl shadow-sm border-2 border-indigo-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-indigo-900 mb-2">Vuoi fare un Upgrade?</h2>
                            <p className="text-indigo-700 mb-6 max-w-md mx-auto">
                                Hai già una licenza singola e vuoi passare a Team?<br />
                                O hai già un Team e vuoi espanderlo?
                            </p>
                            <Link
                                href="/dashboard/upgrade"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                Esplora le Opzioni di Upgrade
                            </Link>
                        </div>
                    </section>
                )}

                {/* Zona Pericolo - Eliminazione Account */}
                <section className="bg-red-50 p-6 md:p-8 rounded-2xl shadow-sm border border-red-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-100">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <LogOut className="w-5 h-5 rotate-180" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-700">Zona Pericolo</h2>
                            <p className="text-sm text-red-500">Gestione eliminazione account</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-600 text-sm">
                            Vuoi eliminare il tuo account? Puoi gestire la cancellazione nelle impostazioni del profilo.
                        </p>
                        <Link
                            href="/dashboard/account"
                            className="px-6 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm shadow-sm whitespace-nowrap"
                        >
                            Vai alle Impostazioni Account
                        </Link>
                    </div>
                </section>

            </main>


        </div>
    )
}
