'use client'
import { PayPalBtn } from "./PayPalBtn"
import { Lock, MonitorPlay, ShieldCheck, Loader2 } from "lucide-react" // Added Loader2
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function ProductShowcase() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Controlla se l'utente è loggato e ascolta i cambiamenti
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user || null)
            setLoading(false)
        }
        checkUser()

        // Listener per logout/login in tempo reale
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Funzione chiamata quando un pagamento va a buon fine
    const handlePurchaseSuccess = async (courseTitle: string, amount: string) => {
        if (!user) {
            alert("Devi essere loggato per acquistare!")
            return
        }

        try {
            // Registra l'acquisto su Supabase
            const { error } = await supabase
                .from('purchases')
                .insert([
                    {
                        user_id: user.id,
                        course_id: courseTitle, // In futuro usare ID univoci, per ora va bene il titolo
                        amount: parseFloat(amount)
                    }
                ])

            if (error) throw error

            alert(`Pagamento riuscito per: ${courseTitle}! \nIl corso è stato sbloccato nella tua Dashboard.`)
            // Opzionale: redirect alla dashboard
            // window.location.href = '/dashboard'

        } catch (err: any) {
            console.error("Errore salvataggio acquisto:", err)
            alert("Pagamento ricevuto su PayPal, ma errore nel salvataggio su database. Contatta l'assistenza.")
        }
    }

    if (loading) return <div className="py-20 text-center">Caricamento listino...</div>

    return (
        <section className="py-20 px-4 md:px-8 bg-muted/30">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">Masterclass Premium Disponibili</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Corsi completi dalla diagnosi alla risoluzione. Acquista una volta, accedi per sempre.
                    </p>
                    {!user && (
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg inline-block text-sm">
                            ⚠️ Devi effettuare il <Link href="/login" className="font-bold underline">Login</Link> o <Link href="/login" className="font-bold underline">Registrarti</Link> per acquistare.
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Card 1 */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all group flex flex-col">
                        <div className="relative aspect-video bg-gray-200">
                            <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                                <Lock className="w-12 h-12 text-primary/50 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="absolute top-4 right-4 bg-accent text-white font-bold px-3 py-1 rounded-full text-sm shadow-md">
                                € 1.00 (TEST)
                            </div>
                        </div>
                        <div className="p-6 space-y-4 flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-primary leading-tight">Sostituzione Scambiatore Caldaia Condensazione</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                Guida passo-passo alla sostituzione sicura dello scambiatore primario su modelli di ultima generazione.
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto mb-4">
                                <span className="flex items-center gap-1"><MonitorPlay className="w-4 h-4" /> 45 min</span>
                                <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Avanzato</span>
                            </div>
                            {/* PayPal Button */}
                            <div className="relative z-10">
                                {user ? (
                                    <PayPalBtn
                                        amount="1.00"
                                        courseTitle="Sostituzione Scambiatore Caldaia Condensazione"
                                        onSuccess={() => handlePurchaseSuccess("Sostituzione Scambiatore Caldaia Condensazione", "1.00")}
                                    />
                                ) : (
                                    <Link href="/login" className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                                        Accedi per Acquistare
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all group flex flex-col">
                        <div className="relative aspect-video bg-gray-200">
                            <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                                <Lock className="w-12 h-12 text-primary/50 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="absolute top-4 right-4 bg-accent text-white font-bold px-3 py-1 rounded-full text-sm shadow-md">
                                € 39.00
                            </div>
                        </div>
                        <div className="p-6 space-y-4 flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-primary leading-tight">Diagnosi Scheda Elettronica: Ripara o Sostituisci?</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                Impara a testare i componenti della scheda madre con il multimetro e identifica i guasti comuni.
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto mb-4">
                                <span className="flex items-center gap-1"><MonitorPlay className="w-4 h-4" /> 30 min</span>
                                <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Intermedio</span>
                            </div>
                            {/* PayPal Button */}
                            <div className="relative z-10">
                                {user ? (
                                    <PayPalBtn
                                        amount="39.00"
                                        courseTitle="Diagnosi Scheda Elettronica: Ripara o Sostituisci?"
                                        onSuccess={() => handlePurchaseSuccess("Diagnosi Scheda Elettronica: Ripara o Sostituisci?", "39.00")}
                                    />
                                ) : (
                                    <Link href="/login" className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                                        Accedi per Acquistare
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all group flex flex-col">
                        <div className="relative aspect-video bg-gray-200">
                            <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                                <Lock className="w-12 h-12 text-primary/50 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="absolute top-4 right-4 bg-accent text-white font-bold px-3 py-1 rounded-full text-sm shadow-md">
                                € 59.00
                            </div>
                        </div>
                        <div className="p-6 space-y-4 flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-primary leading-tight">Manutenzione Annuale Completa: Protocollo 2025</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                La checklist definitiva per una manutenzione ordinaria impeccabile e a norma di legge.
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto mb-4">
                                <span className="flex items-center gap-1"><MonitorPlay className="w-4 h-4" /> 60 min</span>
                                <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Base</span>
                            </div>
                            {/* PayPal Button */}
                            <div className="relative z-10">
                                {user ? (
                                    <PayPalBtn
                                        amount="59.00"
                                        courseTitle="Manutenzione Annuale Completa: Protocollo 2025"
                                        onSuccess={() => handlePurchaseSuccess("Manutenzione Annuale Completa: Protocollo 2025", "59.00")}
                                    />
                                ) : (
                                    <Link href="/login" className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                                        Accedi per Acquistare
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
