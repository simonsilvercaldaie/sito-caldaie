'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { User, Loader2, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
    const [user, setUser] = useState<any>(null)

    const [loading, setLoading] = useState(true)



    // Delete Account State
    const [requestingDelete, setRequestingDelete] = useState(false)
    const [deleteRequestSent, setDeleteRequestSent] = useState(false)

    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            setUser(session.user)
            setLoading(false)
        }
        getUser()
    }, [router])



    const handleRequestDelete = async () => {
        if (!confirm('Sei sicuro di voler avviare la procedura di cancellazione? Riceverai una email di conferma.')) return

        setRequestingDelete(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch('/api/delete-account/request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || data.error || 'Errore nella richiesta')
            }

            const responseData = await res.json()

            // Send email from client (EmailJS works only from browser)
            const emailData = {
                service_id: 'service_i4y7ewt',
                template_id: 'template_sotc25n',
                user_id: 'NcJg5-hiu3gVJiJZ-',
                template_params: {
                    from_name: 'Simon Silver Caldaie',
                    to_email: responseData.email,
                    subject: 'CONFERMA CANCELLAZIONE ACCOUNT',
                    message: `
Hai richiesto la cancellazione del tuo account su Simon Silver Caldaie.

Questa operazione è DEFINITIVA e irreversibile.
Tutti i tuoi dati, progressi e acquisti verranno rimossi permanentemente.

Se sei sicuro, clicca sul link seguente entro 15 minuti:
${responseData.confirmUrl}

Se non hai richiesto tu la cancellazione, ignora questa email e contatta l'assistenza.
                    `.trim()
                }
            }

            const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData)
            })

            if (!emailRes.ok) {
                throw new Error('Impossibile inviare l\'email di conferma.')
            }

            setDeleteRequestSent(true)
        } catch (error: any) {
            alert('Errore: ' + error.message)
        } finally {
            setRequestingDelete(false)
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



                {/* DANGER ZONE - Cancellazione Account */}
                <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-red-100">
                    <div className="flex items-center gap-3 mb-4 border-b border-red-50 pb-4">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-700">Zona Pericolosa</h2>
                            <p className="text-sm text-red-400">Azioni irreversibili</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            La cancellazione dell'account comporta la perdita definitiva di tutti i corsi acquistati e dei progressi fatti.
                            Questa operazione non può essere annullata.
                        </p>

                        {!deleteRequestSent ? (
                            <button
                                onClick={handleRequestDelete}
                                disabled={requestingDelete}
                                className="px-4 py-2 bg-red-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {requestingDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                                Avvia procedura di cancellazione
                            </button>
                        ) : (
                            <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-green-800">Email inviata con successo!</p>
                                    <p className="text-sm text-green-700 mt-1">
                                        Controlla la tua casella di posta (e lo spam). Hai 15 minuti per confermare la cancellazione cliccando sul link che ti abbiamo inviato.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    )
}
