'use client'
import { PayPalBtn } from "@/components/PayPalBtn"
import { Lock, MonitorPlay, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"

// Demo courses data
const demoCourses = [
    { id: 1, title: "Sostituzione Scambiatore Caldaia Condensazione", duration: "45 min", level: "Avanzato", price: "49.00" },
    { id: 2, title: "Diagnosi Scheda Elettronica: Ripara o Sostituisci?", duration: "30 min", level: "Intermedio", price: "39.00" },
    { id: 3, title: "Manutenzione Annuale Completa: Protocollo 2025", duration: "60 min", level: "Base", price: "59.00" },
    { id: 4, title: "Analisi Fumi e Rendimento Combustione", duration: "35 min", level: "Intermedio", price: "35.00" },
    { id: 5, title: "Sostituzione Valvola Gas: Procedura Sicura", duration: "40 min", level: "Avanzato", price: "45.00" },
    { id: 6, title: "Circolatore Bloccato: Diagnosi e Riparazione", duration: "25 min", level: "Base", price: "29.00" },
    { id: 7, title: "Pressostato Differenziale: Come Funziona", duration: "20 min", level: "Base", price: "25.00" },
    { id: 8, title: "Sonda NTC: Test e Sostituzione", duration: "15 min", level: "Intermedio", price: "19.00" },
    { id: 9, title: "Errori Frequenti Caldaie Vaillant: Guida Completa", duration: "50 min", level: "Avanzato", price: "55.00" },
]

export default function CatalogoPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user || null)
            setLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handlePurchaseSuccess = async (courseTitle: string, amount: string) => {
        if (!user) {
            alert("Devi essere loggato per acquistare!")
            return
        }

        try {
            const { error } = await supabase
                .from('purchases')
                .insert([
                    {
                        user_id: user.id,
                        course_id: courseTitle,
                        amount: parseFloat(amount)
                    }
                ])

            if (error) throw error

            alert(`Pagamento riuscito per: ${courseTitle}!\nIl corso è stato sbloccato nella tua Dashboard.`)
        } catch (err: any) {
            console.error("Errore salvataggio acquisto:", err)
            alert("Pagamento ricevuto su PayPal, ma errore nel salvataggio su database. Contatta l'assistenza.")
        }
    }

    if (loading) return <div className="py-20 text-center">Caricamento catalogo...</div>

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">

                    <div className="text-center mb-12">
                        <span className="inline-block py-1 px-3 bg-primary/10 text-primary font-bold rounded-full text-sm uppercase tracking-wider border border-primary/20 mb-4">
                            Catalogo Completo
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
                            Tutti i <span className="text-accent">Corsi Disponibili</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Esplora la nostra libreria completa di video corsi tecnici. Acquista singolarmente e accedi per sempre.
                        </p>
                        {!user && (
                            <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg inline-block text-sm">
                                ⚠️ Devi effettuare il <Link href="/login" className="font-bold underline">Login</Link> o <Link href="/login" className="font-bold underline">Registrarti</Link> per acquistare.
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {demoCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all group flex flex-col">
                                <div className="relative aspect-video bg-gray-200">
                                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                                        <Lock className="w-12 h-12 text-primary/50 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="absolute top-4 right-4 bg-accent text-white font-bold px-3 py-1 rounded-full text-sm shadow-md">
                                        € {course.price}
                                    </div>
                                </div>
                                <div className="p-6 space-y-4 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold text-primary leading-tight">{course.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto mb-4">
                                        <span className="flex items-center gap-1"><MonitorPlay className="w-4 h-4" /> {course.duration}</span>
                                        <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> {course.level}</span>
                                    </div>
                                    <div className="relative z-10">
                                        {user ? (
                                            <PayPalBtn
                                                amount={course.price}
                                                courseTitle={course.title}
                                                onSuccess={() => handlePurchaseSuccess(course.title, course.price)}
                                            />
                                        ) : (
                                            <Link href="/login" className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                                                Accedi per Acquistare
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
