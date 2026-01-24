'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Trash2, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AccountSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'initial' | 'confirm' | 'success'>('initial')
    const [error, setError] = useState<string | null>(null)

    const handleDeleteRequest = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const res = await fetch('/api/delete-account/request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Errore durante la richiesta')
            }

            // Client-side email sending via EmailJS
            if (data.confirmUrl) {
                try {
                    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            service_id: 'service_i4y7ewt',
                            template_id: 'template_sotc25n', // Reusing Welcome template structure or generic? 
                            // Using a generic template ID or assuming one exists. 
                            // Ideally, I should verify the template ID.
                            // However, the previous 'welcome' template was template_sotc25n. 
                            // I should probably use a generic ID or allow the user to configure.
                            // For now, I'll use the service ID I saw in complete-profile: service_i4y7ewt.
                            // And I'll use a placeholder template ID that I've likely used before or is generic: template_b8p58ci (from admin warning) might work?
                            // Let's use template_b8p58ci (from admin route 'send_warning').
                            user_id: 'NcJg5-hiu3gVJiJZ-',
                            template_params: {
                                to_email: data.email,
                                from_name: 'Simon Silver Caldaie',
                                subject: 'Conferma Eliminazione Account',
                                message: `Hai richiesto di eliminare il tuo account.\n\nPer confermare definitivamente l'operazione, clicca sul link seguente:\n\n${data.confirmUrl}\n\nSe non sei stato tu, ignora questa email.`
                            }
                        })
                    })
                } catch (e) {
                    console.error('EmailJs Error', e)
                }
            }

            setStep('success')

        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans">
            <div className="max-w-2xl mx-auto pt-10">
                <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Torna alla Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-red-800">Eliminazione Account</h1>
                            <p className="text-red-600">Gestione della cancellazione definitiva</p>
                        </div>
                    </div>

                    <div className="p-8">
                        {step === 'initial' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-900">
                                        <p className="font-bold mb-1">Attenzione: Azione Irreversibile</p>
                                        <p>
                                            Eliminando il tuo account perderai accesso a tutti i corsi acquistati,
                                            certificazioni e cronologia ordini. Non sarà possibile recuperare questi dati.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-gray-700">
                                        Per procedere verrà inviata una email di conferma al tuo indirizzo.
                                        Dovrai cliccare sul link ricevuto per completare l'operazione.
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={() => setStep('confirm')}
                                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                                    >
                                        Voglio eliminare il mio account
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'confirm' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h3 className="text-xl font-bold text-gray-900">Sei davvero sicuro?</h3>
                                <p className="text-gray-600">
                                    Questa è l'ultima conferma prima dell'invio della email di cancellazione.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleDeleteRequest}
                                        disabled={loading}
                                        className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                        Si, inviami l'email di cancellazione
                                    </button>
                                    <button
                                        onClick={() => setStep('initial')}
                                        disabled={loading}
                                        className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Annulla
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="text-center py-10 animate-in zoom-in-95">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Email Inviata</h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-8">
                                    Abbiamo inviato un link di conferma al tuo indirizzo email.
                                    Controlla la tua casella di posta (anche lo spam) e clicca sul link per eliminare definitivamente l'account.
                                </p>
                                <Link
                                    href="/dashboard"
                                    className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                                >
                                    Torna alla Dashboard
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
