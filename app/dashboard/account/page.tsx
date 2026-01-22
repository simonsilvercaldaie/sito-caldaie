'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { User, Lock, Save, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
    const [user, setUser] = useState<any>(null)
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(true)
    const [updatingProfile, setUpdatingProfile] = useState(false)
    const [updatingPassword, setUpdatingPassword] = useState(false)

    // Password change state
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            setUser(session.user)
            if (session.user.user_metadata?.full_name) {
                setFullName(session.user.user_metadata.full_name)
            }
            setLoading(false)
        }
        getUser()
    }, [router])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdatingProfile(true)
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-primary">
            <Loader2 className="animate-spin mr-2" /> Caricamento...
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header Semplificato */}
            <header className="bg-white shadow-sm px-4 py-4 mb-8">
                <div className="max-w-4xl mx-auto flex items-center">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Torna alla Dashboard
                    </Link>
                    <h1 className="ml-auto font-bold text-xl text-primary">Il Mio Account</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 space-y-8">

                {/* Sezione Profilo */}
                <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary">Dati Personali</h2>
                            <p className="text-sm text-gray-500">Gestisci le informazioni del tuo profilo</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="text"
                                value={user?.email}
                                disabled
                                className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">L'email non può essere modificata</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="Mario Rossi"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updatingProfile}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {updatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Salva Modifiche
                        </button>
                    </form>
                </section>

                {/* Sezione password */}
                <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 opacity-70">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-700">Sicurezza</h2>
                            <p className="text-sm text-gray-500">Gestione accesso</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                            <strong>Accesso Gestito da Google.</strong><br />
                            Non è necessario gestire password su questa piattaforma. L'autenticazione è sicura e centralizzata tramite Google.
                        </p>
                    </div>
                </section>

            </main>
        </div>
    )
}
