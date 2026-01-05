'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2, KeyRound } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const router = useRouter()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                alert('Controlla la tua email per confermare la registrazione!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/dashboard') // Reindirizza alla dashboard dopo il login
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
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

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

            </div>
        </div>
    )
}
