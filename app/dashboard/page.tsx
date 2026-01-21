'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { LogOut, User, Lock, Save, Loader2, Eye, EyeOff } from 'lucide-react'
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
    const [updatingPassword, setUpdatingPassword] = useState(false)

    // Password change state
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirmChecked, setDeleteConfirmChecked] = useState(false)
    const [deletingAccount, setDeletingAccount] = useState(false)

    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            setUser(session.user)

            // Carica metadati
            const meta = session.user.user_metadata || {}
            setFullName(meta.full_name || '')
            setAddress(meta.address || '')
            setCity(meta.city || '')
            setCap(meta.cap || '')
            setCf(meta.cf || '')
            setPiva(meta.piva || '') // Se azienda
            setSdi(meta.sdi || '')
            setPec(meta.pec || '')

            setLoading(false)
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
            const updates = {
                full_name: fullName,
                address,
                city,
                cap,
                cf,
                piva,
                sdi,
                pec
            }

            const { error } = await supabase.auth.updateUser({
                data: updates
            })
            if (error) throw error
            alert('Profilo aggiornato con successo!')
        } catch (error: any) {
            alert('Errore: ' + error.message)
        } finally {
            setUpdatingProfile(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            alert('Le password non coincidono')
            return
        }
        if (newPassword.length < 6) {
            alert('La password deve essere di almeno 6 caratteri')
            return
        }

        setUpdatingPassword(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })
            if (error) throw error
            alert('Password aggiornata con successo!')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            alert('Errore: ' + error.message)
        } finally {
            setUpdatingPassword(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!deleteConfirmChecked) return

        setDeletingAccount(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("No session")

            const response = await fetch('/api/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Errore durante l\'eliminazione')
            }

            // Logout steps
            await supabase.auth.signOut()
            alert('Account eliminato correttamente.')
            router.push('/')

        } catch (error: any) {
            alert('Errore: ' + error.message)
        } finally {
            setDeletingAccount(false)
            setShowDeleteModal(false)
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
                    <Link href="/" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-primary transition-colors text-sm font-medium shadow-sm">
                        → Home page
                    </Link>
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

                {/* Sezione password */}
                <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary">Sicurezza</h2>
                            <p className="text-sm text-gray-600">Modifica la passowrd del tuo account</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">Nuova Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none pr-12 text-black"
                                    placeholder="Nuova password sicura"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1">Conferma Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none pr-12 text-black"
                                    placeholder="Ripeti la password"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={updatingPassword}
                                className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {updatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Aggiorna Password
                            </button>
                        </div>
                    </form>
                </section>

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
                            Vuoi eliminare il tuo account? Questa azione è irreversibile e perderai l'accesso a tutti i contenuti.
                        </p>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm shadow-sm whitespace-nowrap"
                        >
                            Elimina Account
                        </button>
                    </div>
                </section>

            </main>

            {/* Modal Conferma Eliminazione */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Eliminazione Account</h3>

                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <p className="text-red-700 font-medium">
                                Attenzione: Azione Irreversibile
                            </p>
                            <p className="text-red-600 text-sm mt-1">
                                Eliminando l'account perderai permanentemente l'accesso a tutti i corsi acquistati e allo storico ordini.
                            </p>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Sei sicuro di voler procedere? Per confermare, devi accettare esplicitamente la rinuncia ai tuoi diritti sui contenuti acquistati.
                        </p>

                        <div className="flex items-start gap-3 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <input
                                type="checkbox"
                                id="confirm-delete"
                                checked={deleteConfirmChecked}
                                onChange={(e) => setDeleteConfirmChecked(e.target.checked)}
                                className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                            />
                            <label htmlFor="confirm-delete" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
                                Dichiaro di essere consapevole che eliminando l'account rinuncio ai diritti sugli acquisti fatti e perdo l'accesso ai corsi.
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setDeleteConfirmChecked(false)
                                }}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={!deleteConfirmChecked || deletingAccount}
                                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Conferma Eliminazione
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
