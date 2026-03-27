'use client'
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { LogOut, User, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user || null)
        }
        checkUser()

        // Ascolta i cambiamenti di stato (es. dopo login/logout in altre tab o componenti)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        // Clear device session token to avoid phantom slot occupation for next login
        if (typeof window !== 'undefined') {
            localStorage.removeItem('ssc_session_token')
        }
        await supabase.auth.signOut()
        setUser(null)
        router.refresh() // Ricarica la pagina corrente per aggiornare stati server-side se ce ne sono
    }

    return (
        <header className="w-full py-3 px-3 md:py-4 md:px-8 flex justify-between items-center bg-white shadow-sm border-b border-secondary/20 sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity min-w-0">
                <div className="relative w-9 h-9 md:w-12 md:h-12 flex-shrink-0">
                    <Image
                        src="/logo.png"
                        alt="Simon Silver Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="text-base sm:text-xl md:text-2xl font-bold text-primary tracking-tight">
                    Simon Silver <span className="text-accent">Caldaie</span>
                </span>
            </Link>

            <div className="flex items-center gap-2 md:gap-4">
                {user ? (
                    <>
                        <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="truncate max-w-[150px]">{user.email}</span>
                        </div>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 md:gap-2 px-2.5 py-2 md:px-3 bg-gray-100 text-primary font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            title="Il Mio Account"
                        >
                            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                            <span>Account</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-2.5 py-2 md:px-4 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                            title="Esci"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Esci</span>
                        </button>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="px-4 py-2 md:px-5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-sm md:text-base"
                    >
                        Accedi
                    </Link>
                )}
            </div>
        </header>
    )
}
