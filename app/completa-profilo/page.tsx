'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, User, Building2, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { validateCodiceFiscale, validatePartitaIVA } from '@/lib/italianFiscalValidation'

export default function CompletaProfiloPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <CompletaProfiloContent />
        </Suspense>
    )
}

function CompletaProfiloContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnTo = searchParams.get('returnTo')
    const supabase = createClient()

    // Determina se l'acquisto è per team/scuola (obbliga P.IVA, nasconde toggle)
    const isTeamPurchase = returnTo === '/licenze-multidipendente' || returnTo === '/acquista-inviti-extra'

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [customerType, setCustomerType] = useState<'private' | 'company'>('company')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [vatNumber, setVatNumber] = useState('')
    const [sdiCode, setSdiCode] = useState('')
    const [pec, setPec] = useState('')
    const [fiscalCode, setFiscalCode] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [province, setProvince] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [phone, setPhone] = useState('')

    const PROVINCE_ITALIANE = [
        'AG','AL','AN','AO','AP','AQ','AR','AT','AV','BA','BG','BI','BL','BN','BO','BR','BS','BT','BZ',
        'CA','CB','CE','CH','CI','CL','CN','CO','CR','CS','CT','CZ','EN','FC','FE','FG','FI','FM','FR',
        'GE','GO','GR','IM','IS','KR','LC','LE','LI','LO','LT','LU','MB','MC','ME','MI','MN','MO','MS',
        'MT','NA','NO','NU','OG','OR','OT','PA','PC','PD','PE','PG','PI','PN','PO','PR','PT','PU','PV',
        'PZ','RA','RC','RE','RG','RI','RM','RN','RO','SA','SI','SO','SP','SR','SS','SU','SV','TA','TE',
        'TN','TO','TP','TR','TS','TV','UD','VA','VB','VC','VE','VI','VR','VT','VV'
    ]

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            setUser(session.user)

            // Pre-fill nome da Google se disponibile
            const fullName = session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name || ''
            const nameParts = fullName.trim().split(' ')
            if (nameParts.length >= 2) {
                setFirstName(nameParts[0])
                setLastName(nameParts.slice(1).join(' '))
            } else if (nameParts.length === 1) {
                setFirstName(nameParts[0])
            }

            setLoading(false)
        }
        checkSession()
    }, [router, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSaving(true)

        // ===== VALIDAZIONI RIGOROSE PER FATTURAZIONE =====

        // Nome e Cognome: obbligatori, almeno 2 caratteri
        if (!firstName.trim() || firstName.trim().length < 2) {
            setError('Il nome deve avere almeno 2 caratteri')
            setSaving(false)
            return
        }
        if (!lastName.trim() || lastName.trim().length < 2) {
            setError('Il cognome deve avere almeno 2 caratteri')
            setSaving(false)
            return
        }

        // Indirizzo: obbligatorio, almeno 5 caratteri
        if (!address.trim() || address.trim().length < 5) {
            setError('Inserisci un indirizzo valido (minimo 5 caratteri, es. "Via Roma 10")')
            setSaving(false)
            return
        }

        // Città: obbligatoria, almeno 2 caratteri
        if (!city.trim() || city.trim().length < 2) {
            setError('Inserisci una città valida')
            setSaving(false)
            return
        }

        // CAP: esattamente 5 cifre
        const capClean = postalCode.trim()
        if (!/^\d{5}$/.test(capClean)) {
            setError('Il CAP deve essere di 5 cifre (es. "20100")')
            setSaving(false)
            return
        }

        // Telefono: obbligatorio, minimo 8 cifre/caratteri
        const phoneClean = phone.trim()
        if (!phoneClean || phoneClean.length < 8) {
            setError('Inserisci un numero di telefono valido (minimo 8 caratteri)')
            setSaving(false)
            return
        }

        // --- PRIVATO ---
        if (customerType === 'private') {
            const cfClean = fiscalCode.trim().toUpperCase()
            if (!cfClean) {
                setError('Il Codice Fiscale è obbligatorio per la fatturazione')
                setSaving(false)
                return
            }
            const cfResult = validateCodiceFiscale(cfClean, firstName.trim(), lastName.trim())
            if (!cfResult.valid) {
                setError(cfResult.error!)
                setSaving(false)
                return
            }
        }

        // --- AZIENDA ---
        if (customerType === 'company') {
            if (!companyName.trim() || companyName.trim().length < 3) {
                setError('La Ragione Sociale deve avere almeno 3 caratteri')
                setSaving(false)
                return
            }

            // Partita IVA: solo cifre, 11 caratteri
            const pivaClean = vatNumber.replace(/\D/g, '')
            const pivaResult = validatePartitaIVA(pivaClean)
            if (!pivaResult.valid) {
                setError(pivaResult.error!)
                setSaving(false)
                return
            }

            // Codice SDI o PEC: almeno uno dei due obbligatorio
            const sdiClean = sdiCode.trim().toUpperCase()
            const pecClean = pec.trim().toLowerCase()

            if (!sdiClean && !pecClean) {
                setError('Inserisci il Codice SDI oppure la PEC (almeno uno è obbligatorio)')
                setSaving(false)
                return
            }
            if (sdiClean && !/^[A-Z0-9]{7}$/.test(sdiClean)) {
                setError('Il Codice SDI deve essere esattamente 7 caratteri alfanumerici (es. M5UXCR1)')
                setSaving(false)
                return
            }
            if (pecClean && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pecClean)) {
                setError('Indirizzo PEC non valido')
                setSaving(false)
                return
            }
        }

        // --- PROVINCIA (obbligatoria per tutti) ---
        if (!province) {
            setError('Seleziona la Provincia')
            setSaving(false)
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Sessione scaduta. Ricarica la pagina.')

            const response = await fetch('/api/complete-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    customer_type: customerType,
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    company_name: customerType === 'company' ? companyName.trim() : null,
                    vat_number: customerType === 'company' ? vatNumber.replace(/\D/g, '') : null,
                    sdi_code: customerType === 'company' ? (sdiCode.trim().toUpperCase() || '0000000') : null,
                    pec: customerType === 'company' ? (pec.trim().toLowerCase() || null) : null,
                    fiscal_code: customerType === 'private' ? fiscalCode.trim() : null,
                    address: address.trim(),
                    city: city.trim(),
                    province: province,
                    postal_code: postalCode.trim(),
                    phone: phoneClean
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Errore durante il salvataggio')
            }

            // Send welcome email from client (EmailJS works only from browser)
            if (data.email) {
                try {
                    const emailData = {
                        service_id: 'service_i4y7ewt',
                        template_id: 'template_sotc25n',
                        user_id: 'NcJg5-hiu3gVJiJZ-',
                        template_params: {
                            from_name: 'Simon Silver Caldaie',
                            to_email: data.email,
                            subject: '🎉 Benvenuto in Simon Silver Caldaie',
                            message: `
Benvenuto ${data.name || ''}!

Il tuo account è stato creato con successo.
Ora puoi accedere alla piattaforma e iniziare a esplorare i corsi.

Vai al Sito:
https://simonsilvercaldaie.it/

Buon lavoro,
Simon Silver
                            `.trim()
                        }
                    }
                    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(emailData)
                    })
                } catch (emailErr) {
                    console.error('Welcome email error:', emailErr)
                    // Non-blocking - continue to redirect
                }
            }

            // Success - redirect to returnTo or home
            const destination = returnTo || '/'
            router.push(destination)
            router.refresh()

        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-3 text-primary">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-lg">Caricamento...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-primary">Completa il tuo Profilo</h1>
                    <p className="text-gray-600 mt-2">
                        {returnTo
                            ? 'Per procedere con l\'acquisto, compila i tuoi dati di fatturazione'
                            : 'Inserisci i tuoi dati per la fatturazione dei futuri acquisti'
                        }
                    </p>
                </div>

                {/* Alert */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                        <strong>Importante:</strong> Questi dati saranno utilizzati per la fatturazione dei tuoi acquisti.
                        Assicurati che siano corretti.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
                    <div className="text-[10px] text-gray-300 font-mono text-center mb-4">Build: INPUT-FIX-01</div>

                    {/* Tipo cliente switch */}
                    {isTeamPurchase ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-blue-800">
                                <strong>Licenza Aziendale:</strong> questo tipo di acquisto richiede obbligatoriamente la fatturazione con Partita IVA.
                            </p>
                        </div>
                    ) : (
                        <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                            <button
                                type="button"
                                onClick={() => setCustomerType('private')}
                                className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${customerType === 'private'
                                    ? 'bg-white shadow-md text-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                Privato
                            </button>
                            <button
                                type="button"
                                onClick={() => setCustomerType('company')}
                                className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${customerType === 'company'
                                    ? 'bg-white shadow-md text-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Building2 className="w-4 h-4" />
                                Azienda / P.IVA
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Email (readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email associata al tuo account Google</p>
                        </div>

                        {/* Nome e Cognome */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                    placeholder="Mario"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cognome <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                    placeholder="Rossi"
                                />
                            </div>
                        </div>

                        {/* Company fields */}
                        {customerType === 'company' && (
                            <div className="space-y-4 p-5 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                <h3 className="font-bold text-blue-800 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Dati Aziendali
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ragione Sociale <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="Termotecnica SRL"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Partita IVA <span className="text-red-500">*</span>
                                        <span className="text-xs text-gray-400 ml-1">(11 cifre, senza spazi o barre)</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={vatNumber}
                                        onChange={(e) => setVatNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white transition-all text-gray-900 placeholder:text-gray-400 font-mono tracking-wider"
                                        placeholder="01234567890"
                                        maxLength={11}
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Codice SDI
                                            <span className="text-xs text-gray-400 ml-1">(7 caratteri)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={sdiCode}
                                            onChange={(e) => setSdiCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 7).toUpperCase())}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white transition-all text-gray-900 placeholder:text-gray-400 font-mono tracking-wider uppercase"
                                            placeholder="M5UXCR1"
                                            maxLength={7}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            PEC
                                            <span className="text-xs text-gray-400 ml-1">(alternativa al SDI)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={pec}
                                            onChange={(e) => setPec(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white transition-all text-gray-900 placeholder:text-gray-400"
                                            placeholder="info@pec.azienda.it"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600 -mt-2">⚠️ Inserisci almeno uno tra Codice SDI e PEC. Se non hai il codice SDI, inserisci la PEC.</p>
                            </div>
                        )}

                        {/* Private fields */}
                        {customerType === 'private' && (
                            <div className="animate-in fade-in">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Codice Fiscale <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={fiscalCode}
                                    onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none uppercase transition-all text-gray-900 placeholder:text-gray-400"
                                    placeholder="RSSMRA80A01H501U"
                                    maxLength={16}
                                />
                            </div>
                        )}

                        {/* Indirizzo e Contatti */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">Indirizzo e Contatti</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefono (WhatsApp / Chiamata) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="+39 333 1234567"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Usato esclusivamente per assistenza sulla fatturazione.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Indirizzo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="Via Roma 10"
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Città <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                            placeholder="Brescia"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Provincia <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={province}
                                            onChange={(e) => setProvince(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                                        >
                                            <option value="">Seleziona...</option>
                                            {PROVINCE_ITALIANE.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CAP <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 font-mono"
                                            placeholder="25017"
                                            maxLength={5}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                            Salva e Continua
                        </button>
                    </form>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    I tuoi dati sono al sicuro e verranno utilizzati solo per la fatturazione.
                </p>

                {/* Skip link - only if user is NOT coming from a purchase flow */}
                {!returnTo && (
                    <div className="text-center mt-4">
                        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline">
                            Salta per ora → Esplora i corsi
                        </Link>
                    </div>
                )}

            </div>
        </div>
    )
}
