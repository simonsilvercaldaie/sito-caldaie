'use client'
import { useEffect } from 'react'

export default function PurchaseProcessingOverlay({ visible }: { visible: boolean }) {
    // Safety timeout: if stuck for 60s, auto-dismiss
    useEffect(() => {
        if (!visible) return
        const timeout = setTimeout(() => {
            window.location.href = '/pagamento-fallito'
        }, 30000)
        return () => clearTimeout(timeout)
    }, [visible])

    if (!visible) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-10 md:p-14 max-w-md mx-4 text-center shadow-2xl animate-fade-in">
                {/* Animated spinner */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-amber-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>

                <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
                    Transazione in corso...
                </h2>
                <p className="text-gray-600 text-base mb-6 leading-relaxed">
                    Stiamo elaborando il tuo pagamento e<br />
                    generando la tua fattura elettronica.
                </p>

                {/* Animated progress dots */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
                    <p className="text-amber-800 text-sm font-semibold">
                        ⚠️ Non chiudere questa pagina
                    </p>
                    <p className="text-amber-700 text-xs mt-1">
                        Verrai reindirizzato automaticamente
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
