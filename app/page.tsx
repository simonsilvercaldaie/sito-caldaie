'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import { PlayCircle, MonitorPlay, Lock, ShieldCheck, UserCheck } from "lucide-react";
import ProductShowcase from "@/components/ProductShowcase";
import AboutSimonSection from "@/components/AboutSimonSection";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
    const [session, setSession] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow">
                <section className="relative py-20 px-4 md:px-8 bg-gradient-to-b from-muted to-white flex flex-col items-center text-center">
                    <div className="max-w-4xl space-y-6">
                        <span className="inline-block py-1 px-3 bg-primary/10 text-primary font-bold rounded-full text-sm uppercase tracking-wider border border-primary/20">
                            Formazione Tecnica Avanzata per Professionisti
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-primary leading-tight">
                            Alza il tuo livello <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Professionale</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                            Video corsi tecnici riservati a manutentori e installatori iscritti all'albo.
                            Eleva la tua competenza con procedure di diagnosi e risoluzione guasti di livello superiore.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                            {session ? (
                                <button disabled className="flex items-center justify-center gap-2 px-8 py-4 bg-green-600/80 text-white rounded-xl text-lg font-bold cursor-not-allowed shadow-none opacity-90 hover:bg-green-600/80">
                                    <UserCheck className="w-6 h-6" />
                                    Sei già loggato
                                </button>
                            ) : (
                                <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded-xl text-lg font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                                    <PlayCircle className="w-6 h-6" />
                                    Accedi / Registrati
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="mt-16 w-full max-w-4xl aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden border-4 border-white/20 ring-1 ring-gray-900/10">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/3B3go9raH38?rel=0"
                            title="Presentazione Simon Silver Caldaie"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </section>

                <ProductShowcase />
                <AboutSimonSection />

                <section className="py-20 bg-primary text-white">
                    <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent">
                                <MonitorPlay className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold">Video Dettagliati</h3>
                            <p className="text-gray-400">Spiegazioni chiare, niente giri di parole.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold">Accesso Riservato</h3>
                            <p className="text-gray-400">Una volta acquistato, il video è tuo per sempre. Accedi dalla tua dashboard personale.</p>
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold">Pagamento Sicuro</h3>
                            <p className="text-gray-400">Transazioni protette con PayPal.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 opacity-50">
                            <Image src="/logo.png" alt="Logo Footer" fill className="object-contain grayscale" />
                        </div>
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
    );
}
