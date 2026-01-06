'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback`,
            })
            if (error) throw error
            setMessage('Se esiste un account associato a questa email, riceverai un link per reimpostare la password.')
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
                        <Mail className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold text-primary">Recupero Password</span>
                    <p className="text-gray-500 mt-2">
                        Inserisci la tua email per ricevere le istruzioni
                    </p>
                </div>

                {message ? (
                    <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center">
                        <p>{message}</p>
                        <Link href="/login" className="mt-4 inline-block text-primary font-bold hover:underline">
                            Torna al Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
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

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#0A192F] text-white font-bold rounded-xl hover:bg-[#0A192F]/90 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Invia Link'}
                        </button>
                    </form>
                )}

                {!message && (
                    <div className="mt-8 text-center">
                        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Torna al Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
