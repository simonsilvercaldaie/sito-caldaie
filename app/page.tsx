import Image from "next/image";
import { PlayCircle, MonitorPlay, Lock, ShieldCheck, Bot, Sparkles } from "lucide-react";
import ProductShowcase from "@/components/ProductShowcase";
import Link from "next/link";

import Navbar from "@/components/Navbar";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col font-sans">

            {/* Navbar Dinamica */}
            <Navbar />

            {/* Hero Section */}
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
                            <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded-xl text-lg font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                                <PlayCircle className="w-6 h-6" />
                                Accedi alla Libreria
                            </Link>
                            <Link href="/catalogo" className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary border-2 border-primary/10 rounded-xl text-lg font-bold hover:bg-accent hover:text-white hover:border-accent transition-all">
                                Catalogo Corsi
                            </Link>
                        </div>
                    </div>

                    {/* Video Placeholder / Hero Image */}
                    <div className="mt-16 relative w-full max-w-4xl aspect-video bg-primary rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/50 ring-1 ring-gray-200">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2532&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                        <div className="text-center z-10 p-6">
                            <PlayCircle className="w-20 h-20 text-white/80 mx-auto mb-4" />
                            <p className="text-white text-lg font-medium">Video Analisi Tecnica: Diagnostica Avanzata</p>
                        </div>
                    </div>
                </section>

                {/* Banner Promozionale CaldaieGPT */}
                <section className="py-12 px-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
                    {/* Background decorativo */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="max-w-5xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30 shadow-2xl">
                                    <Bot className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                                        <span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">Novità Esclusiva</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-extrabold">CaldaieGPT</h2>
                                    <p className="text-white/80 text-lg mt-1">La prima Intelligenza Artificiale per Tecnici Caldaie</p>
                                </div>
                            </div>

                            <a
                                href="https://www.caldaiegpt.it"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 px-8 py-4 bg-white text-purple-700 rounded-xl text-lg font-bold hover:bg-yellow-300 hover:text-purple-800 transition-all shadow-2xl hover:shadow-yellow-300/30 hover:scale-105"
                            >
                                <Bot className="w-6 h-6" />
                                Scopri CaldaieGPT
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Product Showcase (Vetrina Corsi) */}
                <ProductShowcase />

                {/* Features / Value Prop */}
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

            {/* Footer */}
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
