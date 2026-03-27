
export type EmailType =
    | 'ACQUISTO_BASE'
    | 'ACQUISTO_INTERMEDIO'
    | 'ACQUISTO_AVANZATO'
    | 'ACQUISTO_TEAM'
    | 'INVITO_TEAM'
    | 'CANCELLAZIONE'
    | 'REGISTRAZIONE_OK'

interface EmailParams {
    to_email: string
    [key: string]: any
}

const EMAILJS_SERVICE_ID = 'service_i4y7ewt'
const EMAILJS_TEMPLATE_ID = 'template_sotc25n'
const EMAILJS_USER_ID = 'NcJg5-hiu3gVJiJZ-'

export async function sendEmail(type: EmailType, params: EmailParams): Promise<boolean> {
    const templateParams = buildTemplateParams(type, params)

    const data = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_USER_ID, // Key pubblica
        template_params: templateParams
    }

    console.log(`[EMAIL] Attempting to send ${type} to ${params.to_email}`)
    console.log(`[EMAIL] Using service: ${EMAILJS_SERVICE_ID}, template: ${EMAILJS_TEMPLATE_ID}`)

    try {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error(`[EMAIL] Failed to send ${type} to ${params.to_email}: ${errorText}`)
            return false
        }

        console.log(`[EMAIL] Sent ${type} to ${params.to_email}`)
        return true

    } catch (error) {
        console.error(`[EMAIL] Exception sending ${type} to ${params.to_email}:`, error)
        return false
    }
}

function buildTemplateParams(type: EmailType, params: EmailParams): any {
    const baseParams = {
        from_name: 'Simon Silver Caldaie',
        ...params
    }

    let specificParams = {}

    switch (type) {
        case 'ACQUISTO_BASE':
            specificParams = {
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
            break
        case 'ACQUISTO_INTERMEDIO':
            specificParams = {
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
            break
        case 'ACQUISTO_AVANZATO':
            specificParams = {
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
            break
        case 'ACQUISTO_TEAM':
            specificParams = {
                subject: '✅ Conferma Acquisto - Licenza Team',
                message: `
Ciao! Grazie per il tuo acquisto.

Hai sbloccato con successo una Licenza TEAM.
Ora puoi invitare i membri del tuo team dal tuo Account.

Accedi qui:
https://simonsilvercaldaie.it/dashboard

Buon lavoro!
Simon Silver
                `.trim()
            }
            break
        case 'CANCELLAZIONE':
            const confirmUrl = params.confirmUrl || '#'
            specificParams = {
                subject: 'CONFERMA CANCELLAZIONE ACCOUNT',
                message: `
Hai richiesto la cancellazione del tuo account su Simon Silver Caldaie.

Questa operazione è DEFINITIVA e irreversibile.
Tutti i tuoi dati, progressi e acquisti verranno rimossi permanentemente.

Se sei sicuro, clicca sul link seguente entro 15 minuti:
${confirmUrl}

Se non hai richiesto tu la cancellazione, ignora questa email e contatta l'assistenza.
                `.trim()
            }
            break
        case 'INVITO_TEAM':
            const inviteUrl = params.inviteUrl || '#'
            const ownerName = params.ownerName || 'il tuo responsabile'
            specificParams = {
                subject: '📩 Invito al Team - Simon Silver Caldaie',
                message: `
Ciao!

Sei stato invitato da ${ownerName} ad accedere ai corsi Simon Silver Caldaie tramite una licenza aziendale Multidipendente.

Per accettare l'invito e accedere a tutti i contenuti, clicca sul link seguente:
${inviteUrl}

Se non hai un account, ti verrà chiesto di registrarti prima.
L'invito scade tra 7 giorni.

Buon lavoro!
Simon Silver
                `.trim()
            }
            break
        case 'REGISTRAZIONE_OK':
            specificParams = {
                subject: '🎉 Benvenuto in Simon Silver Caldaie',
                message: `
Benvenuto ${params.name || ''}!

Il tuo account è stato creato con successo.
Ora puoi accedere alla piattaforma e iniziare a esplorare i corsi.

Vai al Sito:
https://simonsilvercaldaie.it/

Buon lavoro,
Simon Silver
                `.trim()
            }
            break
    }

    return { ...baseParams, ...specificParams }
}
