'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md text-center">
                <h1 className="text-xl font-bold text-gray-800 mb-4">Funzionalità non più disponibile</h1>
                <p className="text-gray-600 mb-6">
                    Per garantire una maggiore sicurezza, l'accesso avviene ora esclusivamente tramite <strong>Google</strong>.
                    Non è più necessario gestire password dedicate.
                </p>
                <Link href="/login" className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                    Vai al Login Google
                </Link>
            </div>
        </div>
    )
}
