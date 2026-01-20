'use client'

import { useState } from 'react'

export default function TestEmailPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Funzione generica per inviare email
    const sendTestEmail = async (type: string) => {
        if (!email) {
            setStatus('❌ Inserisci prima la tua email')
            return
        }

        setStatus(`⏳ Invio ${type} in corso...`)
        setLoading(true)

        try {
            // Costruiamo i parametri in base al tipo di email richiesto
            let templateParams = {}

            if (type === 'ACQUISTO_BASE') {
                templateParams = {
                    from_name: 'Simon Silver Caldaie',
                    to_email: email,
                    subject: '✅ Conferma Acquisto - Base',
                    message: `
Ciao! Grazie per il tuo acquisto.

Hai sbloccato con successo:
Pacchetto BASE (9 Video)

Puoi accedere subito ai tuoi corsi qui:
https://simonsilvercaldaie.it/catalogo/base

Buono studio!
Simon Silver
                    `.trim()
                }
            } else if (type === 'ACQUISTO_INTERMEDIO') {
                templateParams = {
                    from_name: 'Simon Silver Caldaie',
                    to_email: email,
                    subject: '✅ Conferma Acquisto - Intermedio',
                    message: `
Ciao! Grazie per il tuo acquisto.

Hai sbloccato con successo:
Pacchetto INTERMEDIO (9 Video)

Puoi accedere subito ai tuoi corsi qui:
https://simonsilvercaldaie.it/catalogo/intermedio

Buono studio!
Simon Silver
                    `.trim()
                }
            } else if (type === 'ACQUISTO_AVANZATO') {
                templateParams = {
                    from_name: 'Simon Silver Caldaie',
                    to_email: email,
                    subject: '✅ Conferma Acquisto - Avanzato',
                    message: `
Ciao! Grazie per il tuo acquisto.

Hai sbloccato con successo:
Pacchetto AVANZATO (9 Video)

Puoi accedere subito ai tuoi corsi qui:
https://simonsilvercaldaie.it/catalogo/avanzato

Buono studio!
Simon Silver
                    `.trim()
                }
            } else if (type === 'CANCELLAZIONE') {
                templateParams = {
                    from_name: 'Simon Silver Caldaie',
                    to_email: email,
                    subject: '❌ Account Cancellato',
                    message: `
Ciao.

Come da tua richiesta, ti confermiamo che il tuo account e tutti i dati associati sono stati cancellati.

Un saluto,
Simon Silver
                    `.trim()
                }
            } else if (type === 'REGISTRAZIONE_OK') {
                templateParams = {
                    from_name: 'Simon Silver Caldaie',
                    to_email: email,
                    subject: '🎉 Benvenuto in Simon Silver Caldaie',
                    message: `
Benvenuto!

Il tuo account è stato creato con successo.
Ora puoi accedere alla piattaforma e iniziare a esplorare i corsi.

Vai al Sito:
https://simonsilvercaldaie.it/

Buon lavoro,
Simon Silver
                    `.trim()
                }
            } else if (type === 'CONFERMA_MAIL') {
                templateParams = {
                    from_name: 'Simon Silver Caldaie',
                    to_email: email,
                    subject: '✉️ Conferma la tua email (Simulazione)',
                    message: `
Ciao!

Per attivare il tuo account, clicca sul link qui sotto (questo è un test):
https://simonsilvercaldaie.it/auth/confirm?token=test12345

Se non hai richiesto tu questa iscrizione, ignora questa email.

Simon Silver
                    `.trim()
                }
            }

            const data = {
                service_id: 'service_i4y7ewt',
                template_id: 'template_sotc25n',
                user_id: 'NcJg5-hiu3gVJiJZ-',
                template_params: templateParams
            }

            // Invia richiesta REST a EmailJS
            const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                setStatus(`✅ Email ${type} Inviata con successo! Controlla la posta.`)
            } else {
                const text = await res.text()
                setStatus(`❌ Errore EmailJS: ${text}`)
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
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>🧪 Test Email PRO</h1>
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
                    onClick={() => sendTestEmail('ACQUISTO_BASE')}
                    disabled={loading}
                    style={btnStyle}
                >
                    Test Acquisto BASE (9 Video)
                </button>

                <button
                    onClick={() => sendTestEmail('ACQUISTO_INTERMEDIO')}
                    disabled={loading}
                    style={btnStyle}
                >
                    Test Acquisto INTERMEDIO (9 Video)
                </button>

                <button
                    onClick={() => sendTestEmail('ACQUISTO_AVANZATO')}
                    disabled={loading}
                    style={btnStyle}
                >
                    Test Acquisto AVANZATO (9 Video)
                </button>

                {/* ACCOUNT */}
                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', marginTop: '20px' }}>👤 Gestione Account</h3>
                <button
                    onClick={() => sendTestEmail('REGISTRAZIONE_OK')}
                    disabled={loading}
                    style={{ ...btnStyle, backgroundColor: '#4CAF50' }}
                >
                    Test Account Registrato con Successo
                </button>

                <button
                    onClick={() => sendTestEmail('CONFERMA_MAIL')}
                    disabled={loading}
                    style={{ ...btnStyle, backgroundColor: '#2196F3' }}
                >
                    Test Conferma Mail (Simulazione)
                </button>

                <button
                    onClick={() => sendTestEmail('CANCELLAZIONE')}
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
