import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="relative w-8 h-8 opacity-50">
                            <Image src="/logo.png" alt="Logo Footer" fill className="object-contain grayscale" />
                        </div>
                        <span className="font-semibold text-slate-200">Simon Silver Caldaie</span>
                    </div>
                    <div className="text-xs text-slate-500 max-w-xs">
                        <p>Simon Silver Assistenza Caldaie di Caroleo Simone</p>
                        <p>Sede Legale: Via San Martino 14L, 21020 Casciago (VA), Italia</p>
                        <p>P.IVA 03235620121</p>
                        <p>Email: simonsilvercaldaie@gmail.com</p>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 text-sm">
                    <p>&copy; {currentYear} Tutti i diritti riservati.</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a href="https://www.youtube.com/@SimonSilverCaldaie" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a>
                        <a href="https://www.instagram.com/simon_silver" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                        <Link href="/contatti" className="hover:text-white transition-colors">Contatti</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/termini" className="hover:text-white transition-colors">Termini</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
