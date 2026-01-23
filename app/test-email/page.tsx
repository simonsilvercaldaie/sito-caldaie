'use client'

import { useState } from 'react'
import { sendEmail, EmailType } from '@/lib/email'

export default function TestEmailPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Funzione generica per inviare email
    const handleSendTestEmail = async (type: EmailType) => {
        if (!email) {
            setStatus('❌ Inserisci prima la tua email')
            return
        }

        setStatus(`⏳ Invio ${type} in corso...`)
        setLoading(true)

        try {
            let params: any = { to_email: email }

            // Parametri specifici per mock
            if (type === 'REGISTRAZIONE_OK') {
                params.name = 'Tester'
            }
            if (type === 'CANCELLAZIONE') {
                params.confirmUrl = 'https://simonsilvercaldaie.it/account/delete/confirm?token=TEST_TOKEN'
            }

            const success = await sendEmail(type, params)

            if (success) {
                setStatus(`✅ Email ${type} Inviata con successo! Controlla la posta.`)
            } else {
                setStatus(`❌ Errore durante l'invio. Controlla la console.`)
            }

        } catch (error: any) {
            console.error(error)
            setStatus('❌ Errore di connessione o imprevisto.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', color: '#333' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>🧪 Test Email PRO (Refactored)</h1>
            <p style={{ marginBottom: '20px' }}>Inserisci la tua email e prova tutti i tipi di notifica.</p>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tua Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@esempio.com"
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        marginBottom: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        color: '#333'
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* ACQUISTI */}
                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', marginTop: '0' }}>🛒 Acquisti</h3>
                <button
                    onClick={() => handleSendTestEmail('ACQUISTO_BASE')}
                    disabled={loading}
                    style={btnStyle}
                >
                    Test Acquisto BASE (9 Video)
                </button>

                <button
                    onClick={() => handleSendTestEmail('ACQUISTO_INTERMEDIO')}
                    disabled={loading}
                    style={btnStyle}
                >
                    Test Acquisto INTERMEDIO (9 Video)
                </button>

                <button
                    onClick={() => handleSendTestEmail('ACQUISTO_AVANZATO')}
                    disabled={loading}
                    style={btnStyle}
                >
                    Test Acquisto AVANZATO (9 Video)
                </button>

                <button
                    onClick={() => handleSendTestEmail('ACQUISTO_TEAM')}
                    disabled={loading}
                    style={btnStyle}
                >
                    Test Acquisto TEAM
                </button>


                {/* ACCOUNT */}
                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', marginTop: '20px' }}>👤 Gestione Account</h3>
                <button
                    onClick={() => handleSendTestEmail('REGISTRAZIONE_OK')}
                    disabled={loading}
                    style={{ ...btnStyle, backgroundColor: '#4CAF50' }}
                >
                    Test Account Registrato con Successo
                </button>

                <button
                    onClick={() => handleSendTestEmail('CANCELLAZIONE')}
                    disabled={loading}
                    style={{ ...btnStyle, backgroundColor: '#F44336' }}
                >
                    Test Cancellazione Account
                </button>
            </div>

            {status && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: status.includes('❌') ? '#ffebee' : '#e8f5e9',
                    borderRadius: '4px',
                    color: '#333',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid #ccc'
                }}>
                    {status}
                </div>
            )}
        </div>
    )
}

const btnStyle = {
    padding: '12px',
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
}
