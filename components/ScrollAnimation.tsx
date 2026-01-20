'use client'
import { useEffect, useRef, useState, ReactNode } from 'react'

interface ScrollAnimationProps {
    children: ReactNode
    animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale'
    delay?: number
    duration?: number
    className?: string
}

export function ScrollAnimation({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 600,
    className = ''
}: ScrollAnimationProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(entry.target)
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [])

    const animations = {
        'fade-up': {
            initial: 'opacity-0 translate-y-8',
            animate: 'opacity-100 translate-y-0'
        },
        'fade-in': {
            initial: 'opacity-0',
            animate: 'opacity-100'
        },
        'slide-left': {
            initial: 'opacity-0 -translate-x-8',
            animate: 'opacity-100 translate-x-0'
        },
        'slide-right': {
            initial: 'opacity-0 translate-x-8',
            animate: 'opacity-100 translate-x-0'
        },
        'scale': {
            initial: 'opacity-0 scale-95',
            animate: 'opacity-100 scale-100'
        }
    }

    const anim = animations[animation]

    return (
        <div
            ref={ref}
            className={`transition-all ease-out ${isVisible ? anim.animate : anim.initial} ${className}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`
            }}
        >
            {children}
        </div>
    )
}

// Stagger animation for lists
interface StaggerContainerProps {
    children: ReactNode
    staggerDelay?: number
    className?: string
}

export function StaggerContainer({
    children,
    staggerDelay = 100,
    className = ''
}: StaggerContainerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(entry.target)
                }
            },
            {
                threshold: 0.1
            }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [])

    return (
        <div ref={ref} className={className} data-visible={isVisible} data-stagger={staggerDelay}>
            {children}
        </div>
    )
}
