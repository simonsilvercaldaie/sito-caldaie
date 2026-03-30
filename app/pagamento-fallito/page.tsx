'use client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PagamentoFallitoPage() {
    const router = useRouter()
    const [seconds, setSeconds] = useState(15)

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    router.push('/catalogo')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        // Reset any pending states from local storage just in case
        localStorage.removeItem('pendingOrderId')

        return () => clearInterval(interval)
    }, [router])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center p-10">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Qualcosa è andato storto
                    </h1>
                    
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 text-left">
                        <p className="text-red-800 font-medium mb-3 border-b border-red-200 pb-3">
                            Sembra che ci sia stato un problema di connessione o che la tua banca non abbia autorizzato la transazione in tempo.
                        </p>
                        
                        <p className="text-red-700 text-sm leading-relaxed mb-4">
                            <strong>Nessun addebito è stato effettuato.</strong> Puoi riprovare l'acquisto tra qualche minuto dal catalogo. Assicurati che:
                        </p>
                        <ul className="list-disc list-inside text-red-700 text-sm space-y-1 mb-4">
                            <li>La carta non sia scaduta</li>
                            <li>Ci sia disponibilità sufficiente</li>
                            <li>L'app della tua banca non richieda un'autorizzazione manuale</li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            href="/catalogo" 
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Riprova l'acquisto nell'area Catalogo ({seconds}s)
                        </Link>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 text-sm text-gray-500">
                        <p className="mb-2">Hai ancora problemi con il checkout?</p>
                        <Link 
                            href="/contatti" 
                            className="inline-flex items-center gap-1 font-bold text-gray-700 hover:text-primary transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" /> 
                            Contatta l'Assistenza
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
