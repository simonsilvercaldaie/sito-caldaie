'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, Lock, ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import VideoPlayerSecured from '@/components/VideoPlayerSecured'

export default function WatchPage() {
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const [courseTitle, setCourseTitle] = useState("")
    const [videoUrl, setVideoUrl] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [orderId, setOrderId] = useState("")
    const [requiredLevel, setRequiredLevel] = useState<string | null>(null)

    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        const checkAccess = async () => {
            const rawId = params.courseId as string
            const courseId = decodeURIComponent(rawId)

            // 1. Check Auth
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            setUserEmail(session.user.email || '')

            // 2. Call server-side access check API
            try {
                const res = await fetch('/api/video-access', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({ courseId })
                })

                const data = await res.json()

                if (res.ok && data.authorized) {
                    setAuthorized(true)
                    setCourseTitle(data.courseTitle || courseId)
                    setVideoUrl(data.videoUrl)
                    // Use a stable identifier for the watermark
                    setOrderId(session.user.id.slice(-12))
                } else {
                    setAuthorized(false)
                    setCourseTitle(data.courseTitle || courseId)
                    setRequiredLevel(data.requiredLevel || null)
                }
            } catch (err) {
                console.error('Error checking video access:', err)
                setAuthorized(false)
                setCourseTitle(courseId)
            }

            setLoading(false)
        }
        checkAccess()
    }, [params, router])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white gap-2">
            <Loader2 className="animate-spin" /> Caricamento Player...
        </div>
    )

    if (!authorized) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <Lock className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Accesso Negato</h1>
            <p className="text-gray-600 max-w-md mb-6">
                Non hai accesso al corso: <strong>{courseTitle}</strong>.
                {requiredLevel && (
                    <span className="block mt-2 text-sm">
                        Serve il pacchetto <strong className="capitalize">{requiredLevel}</strong>.
                    </span>
                )}
            </p>
            <div className="flex gap-4">
                <Link href="/catalogo" className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                    Vai al Catalogo
                </Link>
                <Link href="/" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                    Torna alla Home
                </Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col font-sans text-white">
            <Navbar />

            <div className="flex-grow flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8">

                <div className="mb-6 flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold">{courseTitle}</h1>
                    </div>
                </div>

                {/* Video Player Secured Container */}
                <VideoPlayerSecured
                    videoUrl={videoUrl}
                    userEmail={userEmail}
                    orderId={orderId}
                    courseId={params.courseId as string}
                    className="border border-gray-800"
                />

                <div className="mt-8 grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold">Descrizione Lezione</h2>
                        <p className="text-gray-300 leading-relaxed">
                            In questa lezione impareremo le basi della diagnosi tecnica per questo componente.
                            Segui attentamente i passaggi mostrati nel video. Ricordati di scaricare il manuale PDF allegato.
                        </p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl h-fit border border-gray-700">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            Materiale Didattico
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-not-allowed opacity-50">
                                📄 Manuale Tecnico.pdf (Presto disponibile)
                            </li>
                            <li className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-not-allowed opacity-50">
                                📋 Checklist Diagnosi.pdf (Presto disponibile)
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    )
}
