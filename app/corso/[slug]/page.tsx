'use client'
import { useParams } from "next/navigation"
import { useRef } from 'react'
import { getCourseBySlug, getAllCourses, Course } from "@/lib/coursesData"
import { getLevelPricing, getTestPrice, formatPrice } from "@/lib/pricingLogic"
import { PayPalBtn } from "@/components/PayPalBtn"
import { LEGAL_TEXT_CHECKOUT } from "@/lib/legalTexts"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import VideoPlayerSecured from "@/components/VideoPlayerSecured"
import FullScreenLoader from "@/components/FullScreenLoader"
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
    AlertTriangle,
    Monitor,
} from "lucide-react"
import { CourseJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd"
import { useSessionGuard } from "@/hooks/useSessionGuard"

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
    const [profileCompleted, setProfileCompleted] = useState(false)

    const [viewMode, setViewMode] = useState<'individual' | 'team' | null>(null)
    const [showBundleWarning, setShowBundleWarning] = useState(false)
    const [teamAccess, setTeamAccess] = useState<'none' | 'multi' | 'scuola'>('none')
    const [secureVideoUrl, setSecureVideoUrl] = useState<string>("")
    const youtubeRef = useRef<HTMLIFrameElement>(null)
    const bunnyRef = useRef<HTMLIFrameElement>(null)

    // Mutual video exclusion: overlay-based approach
    const [activePlayer, setActivePlayer] = useState<'none' | 'youtube' | 'bunny'>('none')
    const savedYouTubeSrc = useRef<string>('')

    // Device Authorization State
    const [deviceConfirmed, setDeviceConfirmed] = useState(false)

    // Check if device is already known on mount AND VALIDATE IT
    useEffect(() => {
        const { getSessionToken, clearSessionToken, saveSessionToken, generateDeviceId, getDeviceName } = require('@/lib/deviceFingerprint')
        const token = getSessionToken()
        
        const autoCreateSession = async (accessToken: string) => {
            try {
                const deviceId = await generateDeviceId()
                const deviceName = getDeviceName()
                const res = await fetch('/api/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ deviceId, deviceName })
                })
                if (res.ok) {
                    const json = await res.json()
                    if (json.success && json.sessionToken) {
                        saveSessionToken(json.sessionToken)
                        setDeviceConfirmed(true)
                    }
                }
            } catch {}
        }

        if (token) {
            // Validate the existing token gracefully
            supabase.auth.getSession().then(({ data }) => {
                if (data.session) {
                    fetch('/api/session', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${data.session.access_token}`
                        },
                        body: JSON.stringify({ sessionToken: token })
                    }).then(res => {
                        if (res.ok) {
                            res.json().then(json => {
                                if (json.valid) {
                                    setDeviceConfirmed(true)
                                } else {
                                    clearSessionToken()
                                    // Auto-create new session — device is already known
                                    autoCreateSession(data.session!.access_token)
                                }
                            })
                        } else {
                            clearSessionToken()
                            // Auto-create new session — device is already known
                            autoCreateSession(data.session!.access_token)
                        }
                    }).catch(() => {
                        // Network error: don't auto-confirm, force user to click
                    })
                }
            })
        } else {
            // No token at all — check if device is already trusted and auto-create
            supabase.auth.getSession().then(({ data }) => {
                if (data.session) {
                    autoCreateSession(data.session.access_token)
                }
            })
        }
    }, [])

    const activateYouTube = () => {
        if (activePlayer === 'youtube') return
        // Restore YouTube src if it was blanked
        if (youtubeRef.current && savedYouTubeSrc.current && youtubeRef.current.src !== savedYouTubeSrc.current) {
            youtubeRef.current.src = savedYouTubeSrc.current
        }
        // Kill Bunny by blanking its src to stop audio
        if (bunnyRef.current) {
            bunnyRef.current.src = 'about:blank'
        }
        setActivePlayer('youtube')
    }

    const activateBunny = () => {
        if (activePlayer === 'bunny') return
        // Kill YouTube by blanking its src to stop audio
        if (youtubeRef.current) {
            if (!savedYouTubeSrc.current) {
                savedYouTubeSrc.current = youtubeRef.current.src
            }
            youtubeRef.current.src = 'about:blank'
        }
        // Restore Bunny (reload by re-setting the url)
        if (bunnyRef.current && secureVideoUrl) {
            const currentSrc = bunnyRef.current.src
            if (currentSrc === 'about:blank' || !currentSrc) {
                bunnyRef.current.src = secureVideoUrl
            }
        }
        setActivePlayer('bunny')
    }

    // Save the youtube src on first render
    useEffect(() => {
        if (youtubeRef.current && !savedYouTubeSrc.current) {
            savedYouTubeSrc.current = youtubeRef.current.src
        }
    })

    // Session Guard — activates when user has purchased access AND confirmed the device
    const { status: sessionStatus, errorMessage: sessionError } = useSessionGuard({
        enabled: hasPurchased && !loading && deviceConfirmed
    })

    // Fetch Bunny Secure Token only when session becomes active
    useEffect(() => {
        const fetchBunnyToken = async () => {
            if (sessionStatus === 'active' && hasPurchased && course?.bunnyVideoId) {
                try {
                    const { data: { session } } = await supabase.auth.getSession()
                    const tokenRes = await fetch(`/api/bunny-token?videoId=${course.bunnyVideoId}`, {
                        headers: { 'Authorization': `Bearer ${session?.access_token}` }
                    })
                    const tokenData = await tokenRes.json()
                    if (tokenData.embedUrl) {
                        setSecureVideoUrl(tokenData.embedUrl)
                    }
                } catch (e) {
                    console.error('Error fetching secure video URL', e)
                }
            }
        }
        fetchBunnyToken()
    }, [sessionStatus, hasPurchased, course?.bunnyVideoId])

    useEffect(() => {
        const checkUser = async () => {
            const loadStartTime = Date.now()
            const { data: { session } } = await supabase.auth.getSession()
            const currentUser = session?.user || null
            setUser(currentUser)

            if (course) {
                const pricing = getLevelPricing(course.level)
                setPricingInfo(pricing)
            }

            if (currentUser) {
                // Check profile completion
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('profile_completed')
                    .eq('id', currentUser.id)
                    .maybeSingle()
                setProfileCompleted(profile?.profile_completed ?? false)
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
                            id,
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
                        // Determine if scuola or multi by checking the original purchase
                        const { data: licPurchase } = await supabase
                            .from('purchases')
                            .select('product_code')
                            .eq('team_license_id', lic.id)
                            .not('product_code', 'like', 'extra_invito_%')
                            .limit(1)
                            .maybeSingle()
                        const isScuola = licPurchase?.product_code?.startsWith('scuola_')
                        setTeamAccess(isScuola ? 'scuola' : 'multi')
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

                // 2b. Server-side fallback: check user_access table (catches admin gifts)
                if (!hasAccess && course && session?.access_token) {
                    try {
                        const accessRes = await fetch('/api/video-access', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`
                            },
                            body: JSON.stringify({ courseId: course.id })
                        })
                        if (accessRes.ok) {
                            const accessData = await accessRes.json()
                            if (accessData.authorized) {
                                hasAccess = true
                                orderLimitId = 'LIC-' + new Date().toISOString().slice(0, 10).replace(/-/g, '')
                            }
                        }
                    } catch (e) {
                        console.error('Server-side access check failed', e)
                    }
                }

                if (hasAccess && !orderLimitId) {
                    orderLimitId = "TEAM-LIC"
                }

                setPurchasedCourses(userCourseIds)
                setHasPurchased(hasAccess)
                setActiveOrderId(orderLimitId)
            }

            const elapsed = Date.now() - loadStartTime
            if (elapsed < 1500) {
                await new Promise(r => setTimeout(r, 1500 - elapsed))
            }
            setLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
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
            amount_cents = getTestPrice(pricingInfo.amountToPay, user?.email) * 100
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
                                    subject: `✅ Conferma Acquisto - ${course.title}`,
                                    message: `Ciao! Grazie per il tuo acquisto.\n\nHai sbloccato con successo: ${course.title}.\nOra puoi invitare i membri del tuo team o i tuoi studenti dal tuo Account.\n\nAccedi qui:\nhttps://simonsilvercaldaie.it/dashboard\n\nBuon lavoro!\nSimon Silver`
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
        return <FullScreenLoader />
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
                                    <div className="aspect-video bg-gray-900 relative" onClick={activateYouTube}>
                                        {course.youtubeId !== "PLACEHOLDER" ? (
                                            <iframe
                                                ref={youtubeRef}
                                                className="w-full h-full"
                                                src={`https://www.youtube.com/embed/${course.youtubeId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
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
                                        {/* Overlay: transparent interceptor when no player selected, dark when Bunny is active */}
                                        {activePlayer !== 'youtube' && (
                                            <div 
                                                className={`absolute inset-0 z-20 flex items-center justify-center cursor-pointer transition-all ${
                                                    activePlayer === 'bunny' ? 'bg-black/70' : 'bg-transparent'
                                                }`}
                                                onClick={(e) => { e.stopPropagation(); activateYouTube(); }}
                                            >
                                                {activePlayer === 'bunny' && (
                                                    <div className="text-center text-white">
                                                        <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-80" />
                                                        <p className="text-sm font-semibold opacity-80">Clicca per guardare Parte 1</p>
                                                    </div>
                                                )}
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
                                        (sessionStatus === 'kicked' || sessionStatus === 'device_limit') ? (
                                            <div className="aspect-video bg-red-950 relative">
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                                                    {sessionStatus === 'kicked'
                                                        ? <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
                                                        : <Monitor className="w-16 h-16 text-red-400 mb-4" />
                                                    }
                                                    <h3 className="text-2xl font-bold text-red-200 mb-2">
                                                        {sessionStatus === 'kicked'
                                                            ? 'Sessione Chiusa'
                                                            : 'Limite Dispositivi Raggiunto'
                                                        }
                                                    </h3>
                                                    <p className="text-red-300 text-center max-w-md mb-4">
                                                        {sessionError || 'Hai effettuato l\'accesso da un altro dispositivo.'}
                                                    </p>
                                                    {sessionStatus === 'kicked' ? (
                                                        <button
                                                            onClick={() => window.location.reload()}
                                                            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                                                        >
                                                            Riprova accesso
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href="/dashboard"
                                                            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                                                        >
                                                            Vai al tuo Account per resettare
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ) : !deviceConfirmed ? (
                                            <div className="aspect-video bg-gradient-to-br from-slate-900 to-indigo-950 relative flex items-center justify-center p-6 text-center">
                                                <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                                                    <div className="bg-indigo-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <ShieldCheck className="w-8 h-8 text-indigo-300" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white mb-2">Autorizza Dispositivo</h3>
                                                    <p className="text-indigo-200 text-sm mb-6">
                                                        Stai per accedere a un contenuto Premium. Questo dispositivo <strong>occuperà 1 dei 2 slot</strong> disponibili nella tua licenza.
                                                    </p>
                                                    
                                                    <button
                                                        onClick={() => setDeviceConfirmed(true)}
                                                        className="w-full py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
                                                    >
                                                        <Lock className="w-5 h-5" />
                                                        Autorizza e Guarda Ora
                                                    </button>
                                                    
                                                    <p className="text-xs text-slate-400 mt-4">
                                                        Se raggiungi il limite, potrai resettare i dispositivi dal tuo Account (1 volta ogni 30 giorni).
                                                    </p>
                                                </div>
                                            </div>
                                        ) : sessionStatus === 'connecting' ? (
                                            <div className="aspect-video bg-slate-900 relative flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                                                <p className="text-slate-300 animate-pulse">Verifica licenza in corso...</p>
                                            </div>
                                        ) : secureVideoUrl || course.premiumVideoUrl ? (
                                            <div className="relative" onClick={activateBunny}>
                                                <VideoPlayerSecured
                                                    videoUrl={secureVideoUrl || course.premiumVideoUrl!}
                                                    userEmail={user?.email || 'utente@simonsilver.it'}
                                                    orderId={activeOrderId || 'ORDER-XXXX'}
                                                    iframeRef={bunnyRef}
                                                />
                                                {/* Overlay: transparent interceptor when no player selected, dark when YouTube is active */}
                                                {activePlayer !== 'bunny' && (
                                                    <div 
                                                        className={`absolute inset-0 z-20 flex items-center justify-center cursor-pointer transition-all rounded-2xl ${
                                                            activePlayer === 'youtube' ? 'bg-black/70' : 'bg-transparent'
                                                        }`}
                                                        onClick={(e) => { e.stopPropagation(); activateBunny(); }}
                                                    >
                                                        {activePlayer === 'youtube' && (
                                                            <div className="text-center text-white">
                                                                <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-80" />
                                                                <p className="text-sm font-semibold opacity-80">Clicca per guardare Parte 2</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
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
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 border-2 rounded-2xl p-6 text-center">
                                            <div className="p-4 bg-green-100 text-green-600 rounded-2xl mb-4 inline-block">
                                                <CheckCircle2 className="w-10 h-10" />
                                            </div>
                                            <h3 className="font-bold text-xl text-green-900 mb-2">
                                                {teamAccess === 'scuola' ? 'Accesso Formatore Attivo' : teamAccess === 'multi' ? 'Accesso Team Attivo' : 'Accesso Attivo'}
                                            </h3>
                                            <p className="text-gray-600">
                                                {teamAccess !== 'none'
                                                    ? 'Hai accesso completo a tutti i livelli.'
                                                    : 'Hai già accesso a questo livello.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {!hasPurchased && viewMode === null && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <Link
                                            href="/licenze-multidipendente"
                                            className="block bg-indigo-50/50 border-2 border-indigo-200 rounded-2xl p-8 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg transition-all duration-300 group text-center"
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                                                    <Users className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-xl text-indigo-900 mb-2">Sei un'azienda multidipendente o una scuola?</h4>
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
                                                        {formatPrice(getTestPrice(pricingInfo!.amountToPay, user?.email))}
                                                    </div>

                                                    <p className="text-base lg:text-lg text-gray-700 font-medium mb-1">
                                                        Comprende l'intero livello <strong className={colors.levelHighlight}>{course.level}</strong>
                                                    </p>
                                                    <p className="text-sm text-gray-500 mb-6">
                                                        1 utente · Accesso a vita · 9 video corsi
                                                    </p>

                                                    <button
                                                        onClick={() => {
                                                            if (user && profileCompleted) {
                                                                setShowBundleWarning(true)
                                                            } else {
                                                                setViewMode('individual')
                                                            }
                                                        }}
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
                                                {formatPrice(getTestPrice(pricingInfo!.amountToPay, user?.email))}
                                            </div>
                                            <p className="text-gray-500 text-sm">Include tutti i 9 corsi del livello</p>
                                        </div>

                                        {hasPurchased ? (
                                            <div className="space-y-4">
                                                <div className="bg-green-50 text-green-800 p-4 rounded-xl text-center">
                                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                                                    <p className="font-bold">{teamAccess === 'scuola' ? 'Accesso Formatore Attivo!' : teamAccess === 'multi' ? 'Accesso Team Attivo!' : 'Pacchetto Attivo!'}</p>
                                                </div>
                                                <Link
                                                    href="/dashboard"
                                                    className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Vai al Mio Account
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {user && !profileCompleted && (
                                                    <Link
                                                        href={`/completa-profilo?returnTo=/corso/${slug}`}
                                                        className="w-full py-4 bg-amber-500 text-white font-bold text-lg rounded-2xl hover:bg-amber-600 transition-all shadow-lg flex items-center justify-center gap-2"
                                                    >
                                                        ✏️ Compila il profilo<br/>per acquistare
                                                    </Link>
                                                )}

                                                {user && profileCompleted && (
                                                    <>
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
                                                                            Termini d&apos;Uso
                                                                        </Link>
                                                                        {' '}e le regole di{' '}
                                                                        <Link href="/licenze" target="_blank" className="text-accent underline font-bold hover:text-accent/80">
                                                                            Accesso &amp; Licenze
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
                                                    </>
                                                )}

                                                {viewMode === 'individual' && pricingInfo && profileCompleted && (
                                                    tosAccepted ? (
                                                        <PayPalBtn
                                                            amount={String(getTestPrice(pricingInfo.amountToPay, user?.email))}
                                                            courseTitle={`Pacchetto ${course.level} (9 Video)`}
                                                            onSuccess={(id) => handlePurchaseSuccess(id, { plan_type: 'individual' })}
                                                            productCode={({'Base': 'base', 'Intermedio': 'intermediate', 'Avanzato': 'advanced', 'Laboratorio': 'advanced'} as Record<string, string>)[course.level] || 'base'}
                                                        />
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

                {/* MODAL DI UPSELL (BUNDLE WARNING) */}
                {showBundleWarning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBundleWarning(false)}></div>
                        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden flex flex-col items-center text-center p-8 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-4">
                                Aspetta! Sicuro di voler comprare solo questo livello a prezzo pieno?
                            </h3>
                            <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                                Se acquisti i 3 livelli separatamente finirai per spendere <strong>1.200€</strong>. 
                                Acquistando ora il Pacchetto Completo, li sblocchi tutti e 3 subito a <strong>soli 1.000€</strong> 
                                (<span className="text-green-600 font-bold">risparmi 200€ netti!</span>).
                            </p>
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-8">
                                <p className="text-sm text-amber-800">
                                    <strong>Attenzione:</strong> se acquisti questo singolo livello ora, in futuro non potrai più attivare il pacchetto intero a prezzo scontato.
                                </p>
                            </div>
                            
                            <div className="w-full space-y-3">
                                <Link 
                                    href="/pacchetto-completo"
                                    className="block w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-amber-500/30"
                                >
                                    🔥 Voglio risparmiare 200€<br/><span className="text-sm font-normal opacity-90">(Bundle Completo a 1.000€)</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setShowBundleWarning(false)
                                        setViewMode('individual')
                                        setTimeout(() => {
                                            document.getElementById('purchase-card')?.scrollIntoView({ behavior: 'smooth' })
                                        }, 100)
                                    }}
                                    className="block w-full py-3 text-gray-500 text-sm font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Ho capito, procedi con l'acquisto singolo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
