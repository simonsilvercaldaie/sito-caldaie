'use client'
import { useState, useEffect, useRef, useCallback, RefObject } from 'react'
import { Maximize } from 'lucide-react'

interface VideoPlayerSecuredProps {
    videoUrl: string
    userEmail: string
    orderId: string
    className?: string
    iframeRef?: RefObject<HTMLIFrameElement | null>
}

// Posizioni angolari fisse (mai al centro)
const CORNER_POSITIONS = [
    { x: 8, y: 8 },      // Alto sinistra
    { x: 92, y: 8 },      // Alto destra
    { x: 8, y: 88 },      // Basso sinistra
    { x: 92, y: 88 },     // Basso destra
    { x: 50, y: 8 },      // Centro alto
    { x: 50, y: 92 },     // Centro basso
    { x: 8, y: 50 },      // Centro sinistra
    { x: 92, y: 50 },     // Centro destra
]

/**
 * Secured Video Player with "Flash Discreto" watermark
 * - Filigrana visibile 5 secondi ogni 45-60 secondi
 * - Solo negli angoli/bordi, MAI al centro del video
 * - Opacità 28% per leggibilità senza disturbo
 * - Funziona anche in fullscreen
 */
export default function VideoPlayerSecured({
    videoUrl,
    userEmail,
    orderId,
    className = '',
    iframeRef
}: VideoPlayerSecuredProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [showWatermark, setShowWatermark] = useState(false)
    const [cornerIndex, setCornerIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Ciclo "Flash Discreto": 5s visibile, poi 45-60s nascosto
    useEffect(() => {
        let showTimeout: ReturnType<typeof setTimeout>
        let hideTimeout: ReturnType<typeof setTimeout>

        const flash = () => {
            // Scegli angolo casuale (diverso dal precedente)
            setCornerIndex(prev => {
                let next = Math.floor(Math.random() * CORNER_POSITIONS.length)
                while (next === prev) next = Math.floor(Math.random() * CORNER_POSITIONS.length)
                return next
            })

            // Mostra per 5 secondi
            setShowWatermark(true)
            hideTimeout = setTimeout(() => {
                setShowWatermark(false)

                // Prossimo flash tra 45-60 secondi
                const nextDelay = (45 + Math.random() * 15) * 1000
                showTimeout = setTimeout(flash, nextDelay)
            }, 5000)
        }

        // Primo flash dopo 8-15 secondi (lascia partire il video)
        const initialDelay = (8 + Math.random() * 7) * 1000
        showTimeout = setTimeout(flash, initialDelay)

        return () => {
            clearTimeout(showTimeout)
            clearTimeout(hideTimeout)
        }
    }, [])

    // Fullscreen: fa andare il CONTAINER in fullscreen (non l'iframe)
    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => {})
        } else {
            document.exitFullscreen().catch(() => {})
        }
    }, [])

    // Ascolta i cambiamenti di fullscreen
    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFsChange)
        return () => document.removeEventListener('fullscreenchange', handleFsChange)
    }, [])

    const watermarkText = `${userEmail} • ${orderId.slice(0, 12).toUpperCase()}`
    const currentPos = CORNER_POSITIONS[cornerIndex]

    return (
        <div
            ref={containerRef}
            className={`relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl group ${className}`}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Video Element (Iframe o Video) */}
            {videoUrl.includes('iframe.mediadelivery.net') ? (
                <iframe
                    ref={iframeRef}
                    title="Simon Silver Video Player"
                    src={videoUrl}
                    loading="lazy"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen={false}
                    className="w-full h-full border-none"
                />
            ) : (
                <video
                    className="w-full h-full object-cover"
                    controls
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    src={videoUrl}
                    playsInline
                >
                    Il tuo browser non supporta il tag video.
                </video>
            )}

            {/* In basso a destra: Firma statica persistente */}
            <div className="absolute bottom-3 right-14 pointer-events-none select-none z-20">
                <span className="text-white/30 text-[10px] md:text-xs font-mono tracking-wide" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                    {userEmail}
                </span>
            </div>

            {/* Flash Watermark - Solo angoli, 5s ogni ~4 minuti */}
            <div
                className="absolute pointer-events-none select-none z-20 transition-opacity duration-700"
                style={{
                    left: `${currentPos.x}%`,
                    top: `${currentPos.y}%`,
                    opacity: showWatermark ? 0.28 : 0,
                    transform: 'translate(-50%, -50%)',
                    textShadow: '1px 1px 4px rgba(0,0,0,0.8), -1px -1px 4px rgba(0,0,0,0.8)',
                    whiteSpace: 'nowrap'
                }}
            >
                <span className="text-white text-xs md:text-sm font-mono tracking-wider">
                    {watermarkText}
                </span>
            </div>

            {/* Bottone Fullscreen personalizzato (in basso a destra, sopra il player) */}
            <button
                onClick={toggleFullscreen}
                className="absolute bottom-3 right-3 z-30 p-2 bg-black/50 hover:bg-black/80 
                           rounded-lg text-white/70 hover:text-white transition-all duration-200
                           opacity-0 group-hover:opacity-100 cursor-pointer"
                title={isFullscreen ? 'Esci da schermo intero' : 'Schermo intero'}
            >
                <Maximize className="w-5 h-5" />
            </button>
        </div>
    )
}
