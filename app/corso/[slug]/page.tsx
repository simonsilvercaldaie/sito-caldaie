'use client'
import { useParams } from "next/navigation"
import { getCourseBySlug, getAllCourses, Course } from "@/lib/coursesData"
import { getLevelPricing } from "@/lib/pricingLogic"
import { PayPalBtn } from "@/components/PayPalBtn"
import { LEGAL_TEXT_CHECKOUT } from "@/lib/legalTexts"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import VideoPlayerSecured from "@/components/VideoPlayerSecured"
import {
    PlayCircle,
    Clock,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Youtube,
    ArrowLeft,
    Star,
    Package,
    Users,
    User,
} from "lucide-react"
import { CourseJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd"

export default function CorsoPage() {
    const params = useParams()
    const slug = params.slug as string
    const course = getCourseBySlug(slug)
    const allCourses = getAllCourses()

    // Robust Video ID Extraction
    const m = slug.match(/(?:^|\D)(\d{1,2})(?:\D|$)/);
    const courseIdPrefix = course?.id ? course.id.split('-')[0] : null;
    const rawVideoId = m ? m[1] : courseIdPrefix;
    const videoId = rawVideoId ? rawVideoId.padStart(2, '0') : null;

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [hasPurchased, setHasPurchased] = useState(false)
    const [purchasedCourses, setPurchasedCourses] = useState<string[]>([])
    const [activeOrderId, setActiveOrderId] = useState<string>("")
    const [pricingInfo, setPricingInfo] = useState<ReturnType<typeof getLevelPricing> | null>(null)
    const [tosAccepted, setTosAccepted] = useState(false)
    const [tosLoading, setTosLoading] = useState(false)

    // Team UI State
    const [viewMode, setViewMode] = useState<'individual' | 'team' | null>(null)
    const [teamAccess, setTeamAccess] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const currentUser = session?.user || null
            setUser(currentUser)

            if (course) {
                const pricing = getLevelPricing(course.level)
                setPricingInfo(pricing)
            }

            if (currentUser) {
                // 1. Carica acquisti Individuali
                const { data: purchases } = await supabase
                    .from('purchases')
                    .select('product_code, paypal_capture_id, id')
                    .eq('user_id', currentUser.id)

                let hasAccess = false
                let userCourseIds: string[] = []
                let orderLimitId = ""

                if (purchases) {
                    userCourseIds = purchases.map(p => p.product_code)
                }

                // 2. Check Team Membership (Accesso Totale)
                const { data: teamMember } = await supabase
                    .from('team_members')
                    .select(`
                        team_license_id,
                        team_licenses (
                            status,
                            valid_until
                        )
                    `)
                    .eq('user_id', currentUser.id)
                    .is('removed_at', null)
                    .maybeSingle()

                if (teamMember && teamMember.team_licenses) {
                    const lic = teamMember.team_licenses as any
                    const now = new Date()
                    const validUntil = new Date(lic.valid_until)

                    if (lic.status === 'active' && (!lic.valid_until || validUntil > now)) {
                        setTeamAccess(true)
                        hasAccess = true
                    }
                }

                // Verifica accesso Individuale
                if (!hasAccess && course) {
                    const levelMap: Record<string, string> = {
                        'Base': 'base',
                        'Intermedio': 'intermediate',
                        'Avanzato': 'advanced',
                        'Laboratorio': 'advanced'
                    }
                    const expectedProductCode = levelMap[course.level] || ''

                    const validPurchase = purchases?.find(p =>
                        p.product_code?.toUpperCase() === expectedProductCode.toUpperCase() ||
                        p.product_code?.toUpperCase() === 'COMPLETE'
                    )

                    if (validPurchase) {
                        hasAccess = true
                        orderLimitId = validPurchase.paypal_capture_id || validPurchase.id
                    }
                }

                if (hasAccess && !orderLimitId) {
                    orderLimitId = "TEAM-LIC"
                }

                setPurchasedCourses(userCourseIds)
                setHasPurchased(hasAccess)
                setActiveOrderId(orderLimitId)
            }
            setLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [course])

    const handleTosCheckbox = async (checked: boolean) => {
        if (!checked) {
            setTosAccepted(false)
            return
        }

        setTosLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const accessToken = session?.access_token

            if (!accessToken) {
                alert('Sessione scaduta, effettua di nuovo l\'accesso.')
                setTosAccepted(false)
                setTosLoading(false)
                return
            }

            const res = await fetch('/api/accept-tos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok || res.status === 409) {
                setTosAccepted(true)
            } else {
                setTosAccepted(false)
                alert('Impossibile registrare l\'accettazione. Riprova.')
            }
        } catch (err) {
            alert('Errore di rete. Riprova.')
            setTosAccepted(false)
        } finally {
            setTosLoading(false)
        }
    }

    const handlePurchaseSuccess = async (orderId: string, params: { product_code?: string, amount_cents?: number, plan_type?: string }) => {
        if (!user || !course || !pricingInfo) return

        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token

        if (!accessToken) {
            alert('Sessione scaduta. Effettua di nuovo l\'accesso e riprova.')
            return
        }

        let product_code = params.product_code
        let amount_cents = params.amount_cents

        if (!product_code && params.plan_type === 'individual') {
            const map: Record<string, string> = {
                "Base": "base",
                "Intermedio": "intermediate",
                "Avanzato": "advanced",
                "Laboratorio": "advanced"
            }
            product_code = map[course.level]
            amount_cents = pricingInfo.amountToPay * 100
        }

        if (!product_code || !amount_cents) {
            alert("Errore configurazione prodotto.")
            return
        }

        const attemptSave = async (attempt: number = 1): Promise<boolean> => {
            try {
                const body = {
                    orderId: orderId,
                    product_code: product_code,
                    amount_cents: amount_cents,
                    plan_type: params.plan_type
                }

                const res = await fetch('/api/complete-purchase', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(body)
                })

                const data = await res.json()

                if (res.ok) {
                    if (data.emailType && data.email) {
                        try {
                            const emailMessages: Record<string, { subject: string, message: string }> = {
                                'ACQUISTO_BASE': {
                                    subject: '✅ Conferma Acquisto - Base',
                                    message: `Ciao! Grazie per il tuo acquisto.\n\nHai sbloccato con successo:\nPacchetto BASE (9 Video)\n\nPuoi accedere subito ai tuoi corsi qui:\nhttps://simonsilvercaldaie.it/catalogo/base\n\nBuono studio!\nSimon Silver`
                                },
                                'ACQUISTO_INTERMEDIO': {
                                    subject: '✅ Conferma Acquisto - Intermedio',
                                    message: `Ciao! Grazie per il tuo acquisto.\n\nHai sbloccato con successo:\nPacchetto INTERMEDIO (9 Video)\n\nPuoi accedere subito ai tuoi corsi qui:\nhttps://simonsilvercaldaie.it/catalogo/intermedio\n\nBuono studio!\nSimon Silver`
                                },
                                'ACQUISTO_AVANZATO': {
                                    subject: '✅ Conferma Acquisto - Avanzato',
                                    message: `Ciao! Grazie per il tuo acquisto.\n\nHai sbloccato con successo:\nPacchetto AVANZATO (9 Video)\n\nPuoi accedere subito ai tuoi corsi qui:\nhttps://simonsilvercaldaie.it/catalogo/avanzato\n\nBuono studio!\nSimon Silver`
                                },
                                'ACQUISTO_TEAM': {
                                    subject: '✅ Conferma Acquisto - Licenza Team',
                                    message: `Ciao! Grazie per il tuo acquisto.\n\nHai sbloccato con successo una Licenza TEAM.\nOra puoi invitare i membri del tuo team dalla tua Dashboard.\n\nAccedi qui:\nhttps://simonsilvercaldaie.it/dashboard\n\nBuon lavoro!\nSimon Silver`
                                }
                            }
                            const emailContent = emailMessages[data.emailType]
                            if (emailContent) {
                                const emailData = {
                                    service_id: 'service_i4y7ewt',
                                    template_id: 'template_sotc25n',
                                    user_id: 'NcJg5-hiu3gVJiJZ-',
                                    template_params: {
                                        from_name: 'Simon Silver Caldaie',
                                        to_email: data.email,
                                        subject: emailContent.subject,
                                        message: emailContent.message
                                    }
                                }
                                await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(emailData)
                                })
                            }
                        } catch (emailErr) {
                            console.error('Purchase email error:', emailErr)
                        }
                    }
                    return true
                }

                if (data.error === 'tos_not_accepted') {
                    alert('Accetta i Termini per procedere.')
                    setTosAccepted(false)
                    return false
                }
                if (res.status >= 500 && attempt < 3) {
                    await new Promise(r => setTimeout(r, 2000))
                    return attemptSave(attempt + 1)
                }
                return false

            } catch (err) {
                if (attempt < 3) {
                    await new Promise(r => setTimeout(r, 2000))
                    return attemptSave(attempt + 1)
                }
                return false
            }
        }

        const success = await attemptSave()

        if (success) {
            window.location.href = `/ordine/${orderId}`
        } else {
            localStorage.setItem('pendingOrderId', orderId)
            window.location.href = `/ordine/${orderId}`
        }
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col font-sans bg-gray-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-primary mb-4">Corso non trovato</h1>
                        <p className="text-gray-600 mb-6">Il corso che stai cercando non esiste.</p>
                        <Link href="/" className="text-accent hover:underline font-semibold">Torna alla Home</Link>
                    </div>
                </main>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                </div>
            </div>
        )
    }

    const levelColors = {
        "Base": "bg-green-100 text-green-800",
        "Intermedio": "bg-blue-100 text-blue-800",
        "Avanzato": "bg-purple-100 text-purple-800",
        "Laboratorio": "bg-yellow-100 text-yellow-800"
    } as const

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />
            <CourseJsonLd course={course} />
            <BreadcrumbJsonLd items={[
                { name: "Home", url: "/" },
                { name: "Catalogo", url: "/catalogo" },
                { name: `Corsi ${course.level}`, url: `/catalogo/${course.level.toLowerCase()}` },
                { name: course.title, url: `/corso/${course.id}` }
            ]} />

            <main className="flex-grow">
                <section className="bg-gradient-to-br from-primary via-primary to-slate-800 text-white py-12 px-4">
                    <div className="max-w-5xl mx-auto">
                        <Link href={`/catalogo/${course.level.toLowerCase()}`} className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Torna ai corsi {course.level}
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${levelColors[course.level as keyof typeof levelColors]}`}>
                                {course.level}
                            </span>
                            <span className="flex items-center gap-1 text-white/70">
                                <Clock className="w-4 h-4" />
                                {course.freeDuration} gratis + {course.premiumDuration} premium
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 max-w-3xl">
                            {course.shortDescription}
                        </p>
                    </div>
                </section>

                <div className="max-w-5xl mx-auto px-4 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">Parte 1</div>
                                    <h2 className="text-xl font-bold text-gray-800">Video Gratuito (YouTube)</h2>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                                    <div className="aspect-video bg-gray-900 relative">
                                        {course.youtubeId !== "PLACEHOLDER" ? (
                                            <iframe
                                                className="w-full h-full"
                                                src={`https://www.youtube.com/embed/${course.youtubeId}`}
                                                title={course.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-red-600 to-red-700">
                                                <Youtube className="w-20 h-20 mb-4 opacity-80" />
                                                <p className="text-xl font-bold mb-2">Parte 1 in arrivo!</p>
                                                <p className="text-white/70 text-center px-4">
                                                    Disponibile a breve sul canale YouTube
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-gray-50 flex items-center gap-2 text-sm text-gray-600">
                                        <PlayCircle className="w-5 h-5 text-red-600" />
                                        <span>Durata: <strong>{course.freeDuration}</strong> a disposizione di tutti</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-accent text-white text-xs font-bold px-2 py-1 rounded uppercase">Parte 2</div>
                                    <h2 className="text-xl font-bold text-gray-800">Video Premium (Esclusiva)</h2>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-accent/20 relative">
                                    {hasPurchased ? (
                                        course.premiumVideoUrl ? (
                                            <VideoPlayerSecured
                                                videoUrl={course.premiumVideoUrl}
                                                userEmail={user?.email || 'utente@simonsilver.it'}
                                                orderId={activeOrderId || 'ORDER-XXXX'}
                                            />
                                        ) : (
                                            <div className="aspect-video bg-gray-900 relative">
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-800">
                                                    <Lock className="w-20 h-20 mb-4 text-green-500 opacity-80" />
                                                    <p className="text-xl font-bold mb-2 text-green-400">Accesso Sbloccato!</p>
                                                    <p className="text-slate-300 text-center px-4 max-w-md">
                                                        Video Premium in arrivo.
                                                        <br /><span className="text-sm opacity-70">(Il file video non è ancora stato caricato)</span>
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="aspect-video bg-slate-900 relative group cursor-pointer" onClick={() => document.getElementById('purchase-card')?.scrollIntoView({ behavior: 'smooth' })}>
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                                                <Lock className="w-16 h-16 text-white mb-4 group-hover:scale-110 transition-transform duration-300" />
                                                <h3 className="text-2xl font-bold text-white mb-2">Contenuto Riservato</h3>
                                                <p className="text-gray-200 mb-6 max-w-sm">
                                                    Fa parte del <strong>Pacchetto {course.level}</strong>. Sbloccalo per accedere.
                                                </p>
                                                <button className="bg-accent text-white font-bold px-6 py-3 rounded-xl hover:bg-accent/90 transition-colors shadow-lg">
                                                    Sblocca il Livello Completo
                                                </button>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700 opacity-50"></div>
                                        </div>
                                    )}

                                    <div className="p-4 bg-accent/5 flex items-center justify-between gap-2 text-sm border-t border-accent/10">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <ShieldCheck className="w-5 h-5 text-accent" />
                                            <span>Solo per i membri del <strong>Livello {course.level}</strong></span>
                                        </div>
                                        {hasPurchased && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Incluso</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-primary mb-4">Descrizione del Corso</h2>
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {course.fullDescription}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-primary mb-6">Cosa Imparerai (Anteprima Gratuita)</h2>
                                <ul className="space-y-3">
                                    {course.learnings.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-accent/10 to-orange-50 rounded-2xl shadow-lg p-6 md:p-8 border-2 border-accent/20">
                                <div className="flex items-center gap-2 mb-6">
                                    <Star className="w-6 h-6 text-accent" />
                                    <h2 className="text-2xl font-bold text-primary">Contenuto Premium (Solo nel Pack)</h2>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Acquistando il pacchetto {course.level}, potrai vedere:
                                </p>
                                <ul className="space-y-3">
                                    {course.premiumContent.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Lock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div id="purchase-card" className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                                {hasPurchased && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className={`${teamAccess ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} border-2 rounded-2xl p-6 text-center`}>
                                            <div className={`p-4 ${teamAccess ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'} rounded-2xl mb-4 inline-block`}>
                                                <CheckCircle2 className="w-10 h-10" />
                                            </div>
                                            <h3 className={`font-bold text-xl ${teamAccess ? 'text-indigo-900' : 'text-green-900'} mb-2`}>
                                                {teamAccess ? 'Accesso Team Attivo' : 'Accesso Attivo'}
                                            </h3>
                                            <p className="text-gray-600 mb-4">
                                                {teamAccess
                                                    ? 'Hai accesso completo a tutti i livelli.'
                                                    : 'Hai già accesso a questo livello.'}
                                            </p>
                                            <a
                                                href="#premium-section"
                                                className={`inline-block py-3 px-6 ${teamAccess ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg`}
                                            >
                                                Vai al contenuto premium
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {!hasPurchased && viewMode === null && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <Link
                                            href="/licenze-team"
                                            className="block bg-indigo-50/50 border-2 border-indigo-200 rounded-2xl p-8 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg transition-all duration-300 group text-center"
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                                                    <Users className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-xl text-indigo-900 mb-2">Sei un team o una scuola?</h4>
                                                    <p className="text-slate-600 leading-relaxed">
                                                        Licenze per aziende e istituti di formazione.<br />
                                                        <span className="text-sm font-semibold text-indigo-600/80">Risparmia fino al 40%</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Banner Promo Bundle Completo */}
                                        {/* Banner Promo Bundle Completo */}
                                        <Link
                                            href="/pacchetto-completo"
                                            className="block bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-8 cursor-pointer hover:border-amber-500 hover:shadow-lg transition-all duration-300 group text-center"
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                                                    <Package className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-2xl text-amber-900 mb-2">Vuoi tutti e 3 i livelli?</h4>
                                                    <p className="text-amber-800 leading-relaxed">
                                                        Acquistali insieme e<br />
                                                        <span className="font-bold bg-amber-200/50 px-2 rounded-md">risparmi €200!</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>

                                        {(() => {
                                            const levCols = {
                                                'Base': {
                                                    gradient: 'from-blue-50 to-white',
                                                    border: 'border-blue-200',
                                                    iconBg: 'bg-blue-100',
                                                    iconText: 'text-blue-600',
                                                    title: 'text-blue-900',
                                                    levelHighlight: 'text-blue-700',
                                                    button: 'bg-blue-600 hover:bg-blue-700',
                                                },
                                                'Intermedio': {
                                                    gradient: 'from-green-50 to-white',
                                                    border: 'border-green-200',
                                                    iconBg: 'bg-green-100',
                                                    iconText: 'text-green-600',
                                                    title: 'text-green-900',
                                                    levelHighlight: 'text-green-700',
                                                    button: 'bg-green-600 hover:bg-green-700',
                                                },
                                                'Avanzato': {
                                                    gradient: 'from-red-50 to-white',
                                                    border: 'border-red-200',
                                                    iconBg: 'bg-red-100',
                                                    iconText: 'text-red-600',
                                                    title: 'text-red-900',
                                                    levelHighlight: 'text-red-700',
                                                    button: 'bg-red-600 hover:bg-red-700',
                                                },
                                            };
                                            const colors = levCols[course.level as keyof typeof levCols] || levCols['Base'];

                                            return (
                                                <div className={`bg-gradient-to-br ${colors.gradient} border-2 ${colors.border} rounded-3xl p-6 lg:p-8 text-center shadow-lg`}>
                                                    <div className={`p-4 ${colors.iconBg} ${colors.iconText} rounded-2xl mb-4 inline-block`}>
                                                        <User className="w-10 h-10" />
                                                    </div>
                                                    <h3 className={`font-bold text-2xl lg:text-3xl ${colors.title} mb-4`}>Licenza Singola</h3>

                                                    <div className="text-4xl lg:text-5xl font-extrabold text-primary mb-2">
                                                        € ---
                                                    </div>

                                                    <p className="text-base lg:text-lg text-gray-700 font-medium mb-1">
                                                        Comprende l'intero livello <strong className={colors.levelHighlight}>{course.level}</strong>
                                                    </p>
                                                    <p className="text-sm text-gray-500 mb-6">
                                                        1 utente · Accesso a vita · 9 video corsi
                                                    </p>

                                                    <button
                                                        onClick={() => setViewMode('individual')}
                                                        className={`w-full py-4 ${colors.button} text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}
                                                    >
                                                        Acquista questo livello
                                                    </button>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {viewMode !== null && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {!hasPurchased && (
                                            <button
                                                onClick={() => setViewMode(null)}
                                                className="mb-6 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors mx-auto"
                                            >
                                                ← Cambia Scelta
                                            </button>
                                        )}

                                        <div className="text-center mb-6">
                                            <div className="inline-block p-3 rounded-full mb-3 bg-primary/10 text-primary">
                                                <Package className="w-8 h-8 mx-auto" />
                                            </div>
                                            <h3 className="font-bold text-gray-500 uppercase tracking-wider text-sm mb-1">
                                                PACCHETTO {course.level.toUpperCase()}
                                            </h3>

                                            <div className="text-4xl font-extrabold text-primary mb-2">
                                                € ---
                                            </div>
                                            <p className="text-gray-500 text-sm">Include tutti i 9 corsi del livello</p>
                                        </div>

                                        {hasPurchased ? (
                                            <div className="space-y-4">
                                                <div className="bg-green-50 text-green-800 p-4 rounded-xl text-center">
                                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                                                    <p className="font-bold">{teamAccess ? 'Accesso Team Attivo!' : 'Pacchetto Attivo!'}</p>
                                                </div>
                                                <Link
                                                    href="/dashboard"
                                                    className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Vai alla Dashboard
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {user && (
                                                    <div className="space-y-4">
                                                        <label className={`flex items-start gap-3 text-sm text-gray-700 font-medium cursor-pointer p-4 bg-gray-50 rounded-xl border-2 ${tosAccepted ? 'border-accent/50 bg-accent/5' : 'border-gray-200'} transition-all hover:border-accent/30 ${tosLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={tosAccepted}
                                                                onChange={(e) => handleTosCheckbox(e.target.checked)}
                                                                disabled={tosLoading}
                                                                className="mt-1 w-5 h-5 accent-accent flex-shrink-0"
                                                            />
                                                            <span className="leading-relaxed">
                                                                {tosLoading ? 'Registrazione accettazione in corso...' : (
                                                                    <>
                                                                        Dichiaro di aver letto e accettato i{' '}
                                                                        <Link href="/termini" target="_blank" className="text-accent underline font-bold hover:text-accent/80">
                                                                            Termini d’Uso
                                                                        </Link>
                                                                        {' '}e le regole di{' '}
                                                                        <Link href="/licenze" target="_blank" className="text-accent underline font-bold hover:text-accent/80">
                                                                            Accesso & Licenze
                                                                        </Link>
                                                                        {' '}della piattaforma SimonSilverCaldaie.it.
                                                                    </>
                                                                )}
                                                            </span>
                                                        </label>

                                                        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                            <div className="whitespace-pre-line leading-relaxed">
                                                                {LEGAL_TEXT_CHECKOUT}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {viewMode === 'individual' && pricingInfo && (
                                                    tosAccepted ? (
                                                        // ACQUISTI TEMPORANEAMENTE SOSPESI
                                                        <div className="text-center p-4 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                                                            <p className="font-bold text-gray-500 mb-1">Acquisti momentaneamente sospesi</p>
                                                            <p className="text-xs text-gray-400">In attesa del caricamento dei video definitivi.</p>
                                                        </div>
                                                    ) : (
                                                        !user ? (
                                                            <p className="text-xs text-gray-400 text-center mt-2">
                                                                <Link href="/login" className="underline hover:text-accent">Accedi</Link> se hai già acquistato.
                                                            </p>
                                                        ) : (
                                                            <button disabled className="w-full py-3 bg-gray-300 text-gray-500 font-bold rounded-xl cursor-not-allowed">
                                                                Accetta i Termini per procedere
                                                            </button>
                                                        )
                                                    )
                                                )}

                                                {!user && (
                                                    <p className="text-xs text-gray-400 text-center mt-2">
                                                        <Link href="/login" className="underline hover:text-accent">Accedi</Link> se hai già acquistato.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <hr className="my-6" />

                                        {viewMode === 'individual' && (
                                            <div className="hidden lg:block text-sm text-gray-500 mb-6">
                                                <p className="mb-2"><strong>Cosa include il pack:</strong></p>
                                                <ul className="space-y-2 text-xs">
                                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />Tutti i 9 corsi {course.level}</li>
                                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />Accesso a vita senza scadenza</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">Simon Silver Caldaie</span>
                    </div>
                    <div className="text-sm">
                        &copy; {new Date().getFullYear()} Simon Silver. P.IVA 03235620121
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a href="https://www.youtube.com/@SimonSilverCaldaie" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a>
                        <a href="https://www.instagram.com/simon_silver" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                        <Link href="/contatti" className="hover:text-white transition-colors">Contatti</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/termini" className="hover:text-white transition-colors">Termini</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
