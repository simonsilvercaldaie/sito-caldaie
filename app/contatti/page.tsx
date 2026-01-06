'use client'
import { useState, useEffect } from 'react'
import { Mail, Send, MessageSquare, Instagram, Youtube } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function ContactsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    // Math Captcha
    const [captchaNumbers, setCaptchaNumbers] = useState({ a: 0, b: 0 })
    const [captchaAnswer, setCaptchaAnswer] = useState('')
    const [captchaError, setCaptchaError] = useState(false)

    useEffect(() => {
        generateCaptcha()
    }, [])

    const generateCaptcha = () => {
        const a = Math.floor(Math.random() * 10) + 1
        const b = Math.floor(Math.random() * 10) + 1
        setCaptchaNumbers({ a, b })
        setCaptchaAnswer('')
        setCaptchaError(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Verifica captcha
        const correctAnswer = captchaNumbers.a + captchaNumbers.b
        if (parseInt(captchaAnswer) !== correctAnswer) {
            setCaptchaError(true)
            generateCaptcha()
            return
        }

        setSending(true)
        // Simulazione invio
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('Form Data:', formData)
        setSending(false)
        setSent(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">

                    <div className="text-center mb-12">
                        <span className="inline-block py-1 px-3 bg-primary/10 text-primary font-bold rounded-full text-sm uppercase tracking-wider border border-primary/20 mb-4">
                            Contattaci
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
                            Siamo qui per <span className="text-accent">Aiutarti</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Hai domande sui corsi o bisogno di assistenza tecnica?
                            Scrivici un messaggio o contattaci direttamente.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">

                        {/* Column 1: Contact Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            {sent ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Messaggio Inviato!</h3>
                                    <p className="text-gray-500 mb-6">Grazie per averci contattato. Ti risponderemo il prima possibile.</p>
                                    <button
                                        onClick={() => { setSent(false); generateCaptcha(); }}
                                        className="text-primary font-bold hover:underline"
                                    >
                                        Invia un altro messaggio
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 transition-all text-black"
                                                placeholder="Mario Rossi"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 transition-all text-black"
                                                placeholder="mario@esempio.it"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Oggetto</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 transition-all text-black"
                                            placeholder="Informazioni sul corso..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Messaggio</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 transition-all resize-none text-black"
                                            placeholder="Scrivi qui la tua richiesta..."
                                        ></textarea>
                                    </div>

                                    {/* Math Captcha */}
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Verifica anti-spam: Quanto fa {captchaNumbers.a} + {captchaNumbers.b}?
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={captchaAnswer}
                                            onChange={(e) => { setCaptchaAnswer(e.target.value); setCaptchaError(false); }}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-black ${captchaError ? 'border-red-500 bg-red-50' : 'bg-white'}`}
                                            placeholder="Scrivi il risultato"
                                        />
                                        {captchaError && (
                                            <p className="text-red-500 text-sm mt-2">Risposta errata. Riprova.</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {sending ? (
                                            <>Invio in corso...</>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" /> Invia Messaggio
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Column 2: Contact Info */}
                        <div className="space-y-8">

                            <div className="bg-primary text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <h3 className="text-2xl font-bold mb-6 relative z-10">Informazioni di Contatto</h3>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-300 mb-1">Email Diretta</p>
                                            <a href="mailto:simonsilver@tiscali.it" className="font-bold hover:text-accent transition-colors">
                                                simonsilver@tiscali.it
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-300 mb-1">Partita IVA</p>
                                            <p className="font-bold">03235620121</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <p className="text-sm text-gray-300 mb-4">Seguici sui social</p>
                                    <div className="flex gap-4">
                                        <a
                                            href="https://www.youtube.com/@SimonSilverCaldaie"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                                        >
                                            <Youtube className="w-5 h-5" />
                                        </a>
                                        <a
                                            href="https://www.instagram.com/simon_silver"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
                                        >
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg text-primary mb-3">FAQ - Domande Frequenti</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <details className="group cursor-pointer">
                                            <summary className="font-medium text-gray-700 flex items-center gap-2 group-hover:text-primary transition-colors">
                                                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                                                Come accedo ai corsi?
                                            </summary>
                                            <p className="text-sm text-gray-500 mt-2 pl-4 leading-relaxed">
                                                Dopo l'acquisto, riceverai una mail con le credenziali. Potrai accedere alla tua Dashboard personale in qualsiasi momento.
                                            </p>
                                        </details>
                                    </li>
                                    <li>
                                        <details className="group cursor-pointer">
                                            <summary className="font-medium text-gray-700 flex items-center gap-2 group-hover:text-primary transition-colors">
                                                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                                                È previsto il rimborso?
                                            </summary>
                                            <p className="text-sm text-gray-500 mt-2 pl-4 leading-relaxed">
                                                Trattandosi di contenuti digitali ad accesso immediato, una volta sbloccato il corso non è previsto il diritto di recesso, come da normativa vigente (D.Lgs. 206/2005, art. 59). Prima dell'acquisto, acconsenti esplicitamente all'accesso immediato.
                                            </p>
                                        </details>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800 mt-12">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">Simon Silver Caldaie</span>
                    </div>
                    <div className="text-sm">
                        &copy; {new Date().getFullYear()} Simon Silver. P.IVA 03235620121
                    </div>
                </div>
            </footer>
        </div>
    )
}
