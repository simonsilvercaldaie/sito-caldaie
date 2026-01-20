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
        await supabase.auth.signOut()
        setUser(null)
        router.refresh() // Ricarica la pagina corrente per aggiornare stati server-side se ce ne sono
    }

    return (
        <header className="w-full py-4 px-4 md:px-8 flex justify-between items-center bg-white shadow-sm border-b border-secondary/20 sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative w-10 h-10 md:w-12 md:h-12">
                    <Image
                        src="/logo.png"
                        alt="Simon Silver Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">
                    Simon Silver <span className="text-accent">Caldaie</span>
                </span>
            </Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="truncate max-w-[150px]">{user.email}</span>
                        </div>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-primary font-bold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                            title="Esci"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Esci</span>
                        </button>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="px-5 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Accedi
                    </Link>
                )}
            </div>
        </header>
    )
}
