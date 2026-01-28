'use client'
import { useState, useEffect, useRef } from 'react'

interface VideoPlayerSecuredProps {
    videoUrl: string
    userEmail: string
    orderId: string
    className?: string
}

/**
 * Secured Video Player with dynamic watermark overlay
 * - Email utente e Order ID visibili come filigrana
 * - Posizione casuale che cambia ogni 20-40 secondi
 * - Opacità 10-15% per deterrenza senza disturbare la visione
 * - Blocco context menu per prevenire download facile
 * - Opzione rallentamento 0.75x
 */
export default function VideoPlayerSecured({
    videoUrl,
    userEmail,
    orderId,
    className = ''
}: VideoPlayerSecuredProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [watermarkPosition, setWatermarkPosition] = useState({ x: 20, y: 20 })
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.12)
    const [secondaryPosition, setSecondaryPosition] = useState({ x: 70, y: 70 })
    const [isSlowMode, setIsSlowMode] = useState(false)

    // Gestione velocità playback
    const toggleSpeed = () => {
        if (videoRef.current) {
            const newSpeed = isSlowMode ? 1 : 0.75
            videoRef.current.playbackRate = newSpeed
            setIsSlowMode(!isSlowMode)
        }
    }

    useEffect(() => {
        // Posizione iniziale casuale
        const randomizePosition = () => ({
            x: Math.random() * 50 + 15, // 15-65%
            y: Math.random() * 50 + 15  // 15-65%
        })

        setWatermarkPosition(randomizePosition())
        setSecondaryPosition(randomizePosition())

        // Cambia posizione ogni 20-40 secondi
        const updatePositions = () => {
            setWatermarkPosition(randomizePosition())
            setSecondaryPosition(randomizePosition())

            // Varia leggermente l'opacità (10-15%)
            setWatermarkOpacity(0.10 + Math.random() * 0.05)
        }

        // Intervallo random tra 20 e 40 secondi
        const scheduleNext = () => {
            const delay = (20 + Math.random() * 20) * 1000
            return setTimeout(() => {
                updatePositions()
                intervalRef.current = scheduleNext()
            }, delay)
        }

        const intervalRef = { current: scheduleNext() }

        return () => {
            if (intervalRef.current) {
                clearTimeout(intervalRef.current)
            }
        }
    }, [])

    // Mascheramento parziale email
    const maskEmail = (email: string): string => {
        const [local, domain] = email.split('@')
        if (!domain) return email
        const maskedLocal = local.length > 2
            ? local[0] + '***' + local[local.length - 1]
            : local
        return `${maskedLocal}@${domain}`
    }

    const watermarkText = `${userEmail} | #${orderId.slice(-8).toUpperCase()}`
    const shortWatermark = maskEmail(userEmail)

    return (
        <div
            ref={containerRef}
            className={`relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl ${className}`}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
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

            {/* Speed Toggle Button */}
            <button
                onClick={toggleSpeed}
                className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ${isSlowMode
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-black/50 text-white/80 hover:bg-black/70'
                    }`}
                title={isSlowMode ? 'Velocità normale' : 'Rallenta 25%'}
            >
                {isSlowMode ? '🐢 0.75x' : '1x'}
            </button>

            {/* Primary Watermark - Full info */}
            <div
                className="absolute pointer-events-none select-none transition-all duration-[5000ms] ease-in-out z-10"
                style={{
                    left: `${watermarkPosition.x}%`,
                    top: `${watermarkPosition.y}%`,
                    opacity: watermarkOpacity,
                    transform: 'translate(-50%, -50%)',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                    whiteSpace: 'nowrap'
                }}
            >
                <span className="text-white text-sm md:text-base font-mono tracking-wider">
                    {watermarkText}
                </span>
            </div>

            {/* Secondary Watermark - Minimal, different position */}
            <div
                className="absolute pointer-events-none select-none transition-all duration-[8000ms] ease-in-out z-10"
                style={{
                    left: `${secondaryPosition.x}%`,
                    top: `${secondaryPosition.y}%`,
                    opacity: watermarkOpacity * 0.8,
                    transform: 'translate(-50%, -50%) rotate(15deg)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap'
                }}
            >
                <span className="text-white text-xs font-mono tracking-wide">
                    {shortWatermark}
                </span>
            </div>

            {/* Corner Watermark - Always visible, subtle */}
            <div
                className="absolute bottom-4 right-4 pointer-events-none select-none z-10"
                style={{
                    opacity: 0.08,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
            >
                <span className="text-white text-xs font-mono">
                    SSC-{orderId.slice(-6).toUpperCase()}
                </span>
            </div>

            {/* Anti-screen-record pattern (very subtle grid) */}
            <div
                className="absolute inset-0 pointer-events-none z-5"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 50px,
                        rgba(255,255,255,0.003) 50px,
                        rgba(255,255,255,0.003) 100px
                    )`,
                    mixBlendMode: 'overlay'
                }}
            />
        </div>
    )
}
