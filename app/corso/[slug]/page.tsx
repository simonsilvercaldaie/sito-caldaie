'use client'
import { useParams } from "next/navigation"
import { getCourseBySlug, getAllCourses, Course } from "@/lib/coursesData"
import { calculateNextPurchase, PRICES } from "@/lib/pricingLogic"
import { PayPalBtn } from "@/components/PayPalBtn"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import {
    PlayCircle,
    Clock,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Youtube,
    ArrowLeft,
    Star
} from "lucide-react"

export default function CorsoPage() {
    const params = useParams()
    const slug = params.slug as string
    const course = getCourseBySlug(slug)
    const allCourses = getAllCourses()

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [hasPurchased, setHasPurchased] = useState(false)
    const [purchasedCourses, setPurchasedCourses] = useState<string[]>([])
    const [totalSpent, setTotalSpent] = useState(0)
    const [pricingInfo, setPricingInfo] = useState<ReturnType<typeof calculateNextPurchase> | null>(null)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const currentUser = session?.user || null
            setUser(currentUser)

            if (currentUser) {
                // Carica tutti gli acquisti dell'utente
                const { data: purchases } = await supabase
                    .from('purchases')
                    .select('course_id, amount')
                    .eq('user_id', currentUser.id)

                if (purchases) {
                    const courseIds = purchases.map(p => p.course_id)
                    const spent = purchases.reduce((sum, p) => sum + (p.amount || 0), 0)

                    setPurchasedCourses(courseIds)
                    setTotalSpent(spent)

                    // Verifica se ha acquistato questo corso specifico
                    setHasPurchased(course ? courseIds.includes(course.title) : false)

                    // Calcola il pricing per il prossimo acquisto
                    const pricing = calculateNextPurchase(courseIds.length, spent)
                    setPricingInfo(pricing)
                }
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

    const handlePurchaseSuccess = async () => {
        if (!user || !course || !pricingInfo) return

        try {
            // Se è un bundle upgrade, sblocca più corsi
            if (pricingInfo.isBundleUpgrade && pricingInfo.coursesToUnlock > 1) {
                // Trova i corsi non ancora acquistati
                const unpurchasedCourses = allCourses
                    .filter(c => !purchasedCourses.includes(c.title))
                    .slice(0, pricingInfo.coursesToUnlock)

                // Inserisci tutti i corsi sbloccati
                const purchaseRecords = unpurchasedCourses.map(c => ({
                    user_id: user.id,
                    course_id: c.title,
                    amount: pricingInfo.amountToPay / pricingInfo.coursesToUnlock // Dividi equamente
                }))

                const { error } = await supabase
                    .from('purchases')
                    .insert(purchaseRecords)

                if (error) throw error

                setHasPurchased(true)
                alert(`🎁 OFFERTA BUNDLE!\n\nHai sbloccato ${pricingInfo.coursesToUnlock} corsi:\n${unpurchasedCourses.map(c => '• ' + c.title).join('\n')}\n\nTrovali tutti nella tua Dashboard!`)
            } else {
                // Acquisto singolo normale
                const { error } = await supabase
                    .from('purchases')
                    .insert([{
                        user_id: user.id,
                        course_id: course.title,
                        amount: pricingInfo.amountToPay
                    }])

                if (error) throw error

                setHasPurchased(true)
                alert(`🎉 Acquisto completato!\n\nIl corso "${course.title}" è ora disponibile nella tua Dashboard.`)
            }
        } catch (err: any) {
            console.error("Errore salvataggio acquisto:", err)
            alert("Pagamento ricevuto su PayPal, ma errore nel salvataggio. Contatta l'assistenza.")
        }
    }

    // Corso non trovato
    if (!course) {
        return (
            <div className="min-h-screen flex flex-col font-sans bg-gray-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-primary mb-4">Corso non trovato</h1>
                        <p className="text-gray-600 mb-6">Il corso che stai cercando non esiste.</p>
                        <Link href="/catalogo" className="text-accent hover:underline font-semibold">
                            ← Torna al catalogo
                        </Link>
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
                    <p className="text-gray-600">Caricamento corso...</p>
                </div>
            </div>
        )
    }

    const levelColors = {
        "Base": "bg-green-100 text-green-800",
        "Intermedio": "bg-yellow-100 text-yellow-800",
        "Avanzato": "bg-red-100 text-red-800"
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary via-primary to-slate-800 text-white py-12 px-4">
                    <div className="max-w-5xl mx-auto">
                        <Link href="/catalogo" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Torna al catalogo
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${levelColors[course.level]}`}>
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

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* VIDEO PARTE 1: GRATUITO */}
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

                            {/* VIDEO PARTE 2: PREMIUM */}
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-accent text-white text-xs font-bold px-2 py-1 rounded uppercase">Parte 2</div>
                                    <h2 className="text-xl font-bold text-gray-800">Video Premium (Corso Completo)</h2>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-accent/20 relative">
                                    {hasPurchased ? (
                                        // UTENTE HA ACQUISTATO: MOSTRA IL PLAYER (O Placeholder Premium)
                                        <div className="aspect-video bg-gray-900 relative">
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-800">
                                                <Lock className="w-20 h-20 mb-4 text-green-500 opacity-80" />
                                                <p className="text-xl font-bold mb-2 text-green-400">Accesso Sbloccato!</p>
                                                <p className="text-slate-300 text-center px-4 max-w-md">
                                                    Qui apparirà il player video Premium privato (Vimeo/Wistia/YouTube Unlisted).
                                                    <br /><span className="text-sm opacity-70">(In attesa di caricamento file)</span>
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        // UTENTE NON HA ACQUISTATO: MOSTRA IL BLOCCO
                                        <div className="aspect-video bg-slate-900 relative group cursor-pointer" onClick={() => document.getElementById('purchase-card')?.scrollIntoView({ behavior: 'smooth' })}>
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                                                <Lock className="w-16 h-16 text-white mb-4 group-hover:scale-110 transition-transform duration-300" />
                                                <h3 className="text-2xl font-bold text-white mb-2">Contenuto Riservato</h3>
                                                <p className="text-gray-200 mb-6 max-w-sm">
                                                    Guarda la Parte 2 ({course.premiumDuration}) con diagnosi avanzata e casi reali.
                                                </p>
                                                <button className="bg-accent text-white font-bold px-6 py-3 rounded-xl hover:bg-accent/90 transition-colors shadow-lg">
                                                    Sblocca il Corso Completo
                                                </button>
                                            </div>
                                            {/* Sfondo sfocato fake */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700 opacity-50"></div>
                                        </div>
                                    )}

                                    <div className="p-4 bg-accent/5 flex items-center justify-between gap-2 text-sm border-t border-accent/10">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <ShieldCheck className="w-5 h-5 text-accent" />
                                            <span>Durata: <strong>{course.premiumDuration}</strong> di tecnica pura</span>
                                        </div>
                                        {hasPurchased && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Acquistato</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-primary mb-4">Descrizione del Corso</h2>
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {course.fullDescription}
                                </p>
                            </div>

                            {/* What You'll Learn */}
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

                            {/* Premium Content */}
                            <div className="bg-gradient-to-br from-accent/10 to-orange-50 rounded-2xl shadow-lg p-6 md:p-8 border-2 border-accent/20">
                                <div className="flex items-center gap-2 mb-6">
                                    <Star className="w-6 h-6 text-accent" />
                                    <h2 className="text-2xl font-bold text-primary">Contenuto Premium Esclusivo</h2>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Acquistando il corso completo, avrai accesso a:
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

                        {/* Sidebar - Purchase Card */}
                        <div className="lg:col-span-1">
                            <div id="purchase-card" className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">

                                {/* Pricing Display */}
                                <div className="text-center mb-6">
                                    <div className="text-4xl font-extrabold text-primary mb-2">
                                        € {pricingInfo?.amountToPay.toFixed(2) || PRICES.SINGLE + '.00'}
                                    </div>
                                    <p className="text-gray-500 text-sm">Accesso illimitato per sempre</p>

                                    {/* Info risparmio - solo se bundle upgrade */}
                                    {pricingInfo?.isBundleUpgrade && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                                            <p>
                                                Con questo acquisto sblocchi <strong>{pricingInfo.coursesToUnlock} corsi</strong> e
                                                arrivi a {pricingInfo.totalAfterPurchase} corsi totali.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {hasPurchased ? (
                                    <div className="space-y-4">
                                        <div className="bg-green-50 text-green-800 p-4 rounded-xl text-center">
                                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                                            <p className="font-bold">Corso Acquistato!</p>
                                        </div>
                                        <Link
                                            href="/dashboard"
                                            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Vai alla Dashboard
                                        </Link>
                                    </div>
                                ) : user ? (
                                    <div className="space-y-4">
                                        <PayPalBtn
                                            amount={pricingInfo?.amountToPay.toFixed(2) || PRICES.SINGLE.toString()}
                                            courseTitle={pricingInfo?.isBundleUpgrade
                                                ? `Bundle ${pricingInfo.totalAfterPurchase} Corsi`
                                                : course.title}
                                            onSuccess={handlePurchaseSuccess}
                                        />
                                        <p className="text-xs text-gray-500 text-center">
                                            Pagamento sicuro con PayPal
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Link
                                            href="/login"
                                            className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Accedi per Acquistare
                                        </Link>
                                        <p className="text-xs text-gray-500 text-center">
                                            Devi effettuare l'accesso per completare l'acquisto
                                        </p>
                                    </div>
                                )}

                                <hr className="my-6" />

                                {/* Info prezzi - nascosto su mobile */}
                                <div className="hidden lg:block text-sm text-gray-500 mb-6">
                                    <p className="mb-2">
                                        <strong>Come funziona:</strong>
                                    </p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Ogni corso costa €{PRICES.SINGLE}</li>
                                        <li>• Con 5 corsi paghi max €{PRICES.BUNDLE_5}</li>
                                        <li>• Con tutti i 10 corsi paghi max €{PRICES.BUNDLE_10}</li>
                                    </ul>
                                    <p className="text-xs mt-2 text-gray-400">
                                        Il risparmio si applica automaticamente.
                                    </p>
                                </div>

                                {/* Lista benefici - nascosta su mobile */}
                                <ul className="hidden lg:block space-y-3 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                        Accesso immediato dopo l'acquisto
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                        Video in alta qualità
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                        Accesso da qualsiasi dispositivo
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                        Materiali scaricabili inclusi
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
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
