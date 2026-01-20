'use client'

import { useState } from 'react'

export default function TestEmailPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const sendTestEmail = async (type: 'purchase' | 'delete') => {
        if (!email) {
            setStatus('Inserisci una email')
            return
        }

        setLoading(true)
        setStatus(`Invio ${type}...`)

        try {
            const templateParams = type === 'purchase' ? {
                from_name: 'Simon Silver Caldaie',
                to_email: email,
                subject: '✅ TEST Conferma Acquisto',
                message: `
TEST EMAIL ACQUISTO
Ciao! Grazie per il tuo acquisto.
Hai sbloccato con successo il livello: TEST
Corsi sbloccati: 10
Puoi accedere subito ai tuoi corsi dalla Dashboard:
https://simonsilvercaldaie.it/dashboard
Buono studio!
Simon Silver
                `.trim()
            } : {
                from_name: 'Simon Silver Caldaie',
                to_email: email,
                subject: '❌ TEST Cancellazione Account',
                message: `
TEST EMAIL CANCELLAZIONE
Ciao.
Come da tua richiesta, ti confermiamo che il tuo account e tutti i dati associati sono stati cancellati.
Un saluto,
Simon Silver
                `.trim()
            }

            const data = {
                service_id: 'service_fwvybtr',
                // Usa il NUOVO template ID che mi hai dato
                template_id: 'template_esq7ac8',
                user_id: 'NcJg5-hiu3gVJiJZ-',
                template_params: templateParams
            }

            const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                setStatus('✅ Email inviata con successo! Controlla la posta.')
            } else {
                const text = await res.text()
                setStatus(`❌ Errore EmailJS: ${text}`)
                console.error('EmailJS Error:', text)
            }

        } catch (err: any) {
            setStatus(`❌ Errore fetch: ${err.message}`)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Test Email System</h1>

            <div>
                <label className="block text-sm font-medium">Email Destinatario</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded text-black"
                    placeholder="tua@email.com"
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => sendTestEmail('purchase')}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    Test Acquisto
                </button>
                <button
                    onClick={() => sendTestEmail('delete')}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                    Test Cancellazione
                </button>
            </div>

            {status && (
                <div className="p-4 bg-gray-100 rounded border text-sm whitespace-pre-wrap text-black">
                    {status}
                </div>
            )}
        </div>
    )
}
