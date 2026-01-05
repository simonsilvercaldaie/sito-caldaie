'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, Lock, ArrowLeft, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function WatchPage() {
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const [courseTitle, setCourseTitle] = useState("")
    const [videoUrl, setVideoUrl] = useState("")
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        const checkAccess = async () => {
            // Decode URI component to handle spaces correctly
            const rawId = params.courseId as string
            const courseId = decodeURIComponent(rawId)
            setCourseTitle(courseId)

            // 1. Check Auth
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            // 2. Check Purchase per questo specifico corso
            const { data, error } = await supabase
                .from('purchases')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('course_id', courseId)
                .single()

            if (data) {
                setAuthorized(true)

                // Logica per determinare quale file caricare in base al Product Name
                // In produzione, avremmo una colonna 'video_filename' nella tabella 'courses' o 'products'.
                // Per ora facciamo un mapping manuale semplice.
                let videoFilename = "default_placeholder.mp4"

                if (courseId.includes("Sostituzione Scambiatore")) {
                    videoFilename = "scambiatore.mp4"
                }
                // Aggiungere altri casi qui...

                // Genera Signed URL valido per 1 ora (3600 secondi)
                const { data: fileData, error: fileError } = await supabase
                    .storage
                    .from('videos')
                    .createSignedUrl(videoFilename, 3600)

                if (fileError) {
                    console.error("Errore caricamento video:", fileError)
                    // Fallback se il file non esiste ancora
                    setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
                } else {
                    setVideoUrl(fileData.signedUrl)
                }
            } else {
                setAuthorized(false)
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
                Non risulti aver acquistato il corso: <strong>{courseTitle}</strong>.
            </p>
            <Link href="/" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                Torna al Catalogo
            </Link>
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
                        <p className="text-gray-400 text-sm">Capitolo 1: Introduzione e Diagnosi</p>
                    </div>
                </div>

                {/* Video Player Container */}
                <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-gray-800">
                    <video
                        className="w-full h-full object-cover"
                        controls
                        autoPlay
                        src={videoUrl}
                    >
                        Il tuo browser non supporta il tag video.
                    </video>
                </div>

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
