'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import emailjs from '@emailjs/browser'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [isCompany, setIsCompany] = useState(false)
    const [fullName, setFullName] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [cap, setCap] = useState('')
    const [cf, setCf] = useState('')
    const [piva, setPiva] = useState('')
    const [sdi, setSdi] = useState('')
    const [registrationSuccess, setRegistrationSuccess] = useState(false)

    const router = useRouter()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Verifica T&C solo in signup
        if (mode === 'signup' && !acceptedTerms) {
            setError('Devi accettare i Termini e Condizioni per registrarti.')
            setLoading(false)
            return
        }

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            is_company: isCompany,
                            address,
                            city,
                            cap,
                            cf,
                            piva: isCompany ? piva : null,
                            sdi: isCompany ? sdi : null,
                            user_type: isCompany ? 'company' : 'private'
                        }
                    }
                })
                if (error) throw error
                // Invia notifica email se è un'azienda (Simple Invoice Automation)
                if (isCompany) {
                    try {
                        const messageDetails = `
                            NUOVA AZIENDA REGISTRATA:
                            Ragione Sociale: ${fullName}
                            Email: ${email}
                            P.IVA: ${piva}
                            SDI/PEC: ${sdi}
                            Codice Fiscale: ${cf}
                            Indirizzo: ${address}, ${cap} ${city}
                            
                            (Dati salvati in Supabase Metadata per fatturazione)
                        `

                        await emailjs.send(
                            'service_fwvybtr',      // Service ID (from contatti/page.tsx)
                            'template_b8p58ci',     // Template ID (reusing contact form)
                            {
                                from_name: "REGISTRAZIONE AZIENDA: " + fullName,
                                from_email: email,
                                subject: "NUOVA REGISTRAZIONE AZIENDA - FATTURARE",
                                message: messageDetails,
                            },
                            'NcJg5-hiu3gVJiJZ-'     // Public Key
                        )
                    } catch (emailErr) {
                        console.error('Errore invio notifica admin:', emailErr)
                        // Non blocchiamo la UX se l'email fallisce, ma lo logghiamo
                    }
                }

                // Redirect to login view with success message
                setMode('login')
                setRegistrationSuccess(true)
                setError(null)
                // Scroll to top to ensure message is seen
                window.scrollTo({ top: 0, behavior: 'smooth' })

            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">

                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Lock className="w-6 h-6" />
                    </div>

                    {mode === 'login' ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <span className="text-xl font-bold text-primary">Accedi a</span>
                            <div className="relative w-full h-96">
                                <Image
                                    src="/logo.png"
                                    alt="Simon Silver Caldaie"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                    ) : (
                        <h1 className="text-2xl font-bold text-primary">
                            Crea il tuo Account
                        </h1>
                    )}

                    <p className="text-gray-500 mt-2">
                        {mode === 'login' ? 'Inserisci le tue credenziali' : 'Inizia la tua formazione professionale'}
                    </p>

                    {registrationSuccess && mode === 'login' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center animate-in fade-in zoom-in">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-green-800">Registrazione Effettuata!</h3>
                            <p className="text-sm text-green-700 text-center mt-1">
                                Ti abbiamo inviato una email di conferma. <br />
                                <strong>Clicca sul link nella mail</strong> per attivare il tuo account e accedere.
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleAuth} className="space-y-4">

                    {/* Switch Privato / Azienda (solo in signup) */}
                    {mode === 'signup' && (
                        <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                            <button
                                type="button"
                                onClick={() => setIsCompany(false)}
                                className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${!isCompany ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Privato
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCompany(true)}
                                className={`flex-1 py-1 text-sm font-medium rounded-md transition-colors ${isCompany ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Azienda / P.IVA
                            </button>
                        </div>
                    )}

                    {/* Campi extra solo in signup */}
                    {mode === 'signup' && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    {isCompany ? 'Ragione Sociale' : 'Nome e Cognome'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-primary bg-white text-black"
                                    placeholder={isCompany ? "Es. Termotecnica SRL" : "Es. Mario Rossi"}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Indirizzo</label>
                                    <input
                                        type="text"
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-primary bg-white text-black"
                                        placeholder="Via Roma 10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Città</label>
                                    <input
                                        type="text"
                                        required
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-primary bg-white text-black"
                                        placeholder="Es. Milano"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">CAP</label>
                                    <input
                                        type="text"
                                        required
                                        value={cap}
                                        onChange={(e) => setCap(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-primary bg-white text-black"
                                        placeholder="Es. 20100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Codice Fiscale</label>
                                <input
                                    type="text"
                                    required
                                    value={cf}
                                    onChange={(e) => setCf(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-primary bg-white uppercase text-black"
                                    placeholder="Es. RSSMRA80A01H501U"
                                />
                            </div>

                            {isCompany && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Partita IVA</label>
                                        <input
                                            type="text"
                                            required
                                            value={piva}
                                            onChange={(e) => setPiva(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-primary bg-white text-black"
                                            placeholder="Es. 12345678901"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Codice SDI o PEC</label>
                                        <input
                                            type="text"
                                            required
                                            value={sdi}
                                            onChange={(e) => setSdi(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-primary bg-white text-black"
                                            placeholder="XXXXXXX o email@pec.it"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-black"
                                placeholder="nome@esempio.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-black"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {mode === 'login' && (
                            <div className="flex justify-end mt-2">
                                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                    Password dimenticata?
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Checkbox T&C solo in modalità signup */}
                    {mode === 'signup' && (
                        <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-600 leading-snug select-none">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                            />
                            <span>
                                Accetto i{' '}
                                <Link href="/termini" target="_blank" className="text-accent font-bold hover:underline">
                                    Termini e Condizioni
                                </Link>
                            </span>
                        </label>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#0A192F] text-white font-bold rounded-xl hover:bg-[#0A192F]/90 transition-colors flex items-center justify-center gap-2 border border-transparent"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'Accedi' : 'Registrati')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    {mode === 'login' ? (
                        <>
                            Non hai ancora un account?{' '}
                            <button onClick={() => setMode('signup')} className="text-accent font-bold hover:underline">
                                Registrati Gratis
                            </button>
                        </>
                    ) : (
                        <>
                            Hai già un account?{' '}
                            <button onClick={() => setMode('login')} className="text-accent font-bold hover:underline">
                                Accedi
                            </button>
                        </>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-gray-400 hover:text-primary transition-colors">
                        ← Torna alla Home
                    </Link>
                </div>

            </div >
        </div >
    )
}
