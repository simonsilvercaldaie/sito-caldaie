import Image from "next/image";
import { Hammer, Mail } from "lucide-react";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">

            <div className="relative w-32 h-32 mb-8 opacity-80">
                <Image
                    src="/logo.png"
                    alt="Simon Silver Caldaie"
                    fill
                    className="object-contain"
                />
            </div>

            <div className="max-w-2xl space-y-6">
                <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-full mb-4">
                    <Hammer className="w-10 h-10 text-primary" />
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                    Stiamo lavorando <span className="text-primary">per voi</span>
                </h1>

                <p className="text-xl text-gray-400">
                    Il sito è attualmente offline per l'inserimento dei nuovi video corsi tecnici.
                    Torneremo presto con una libreria completa per i professionisti del settore.
                </p>

                <div className="pt-8 border-t border-white/10 mt-8">
                    <p className="text-sm text-gray-500 mb-2">Per informazioni urgenti o contatti:</p>
                    <a
                        href="mailto:simonsilver@tiscali.it"
                        className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors font-bold text-lg"
                    >
                        <Mail className="w-5 h-5" />
                        simonsilver@tiscali.it
                    </a>
                </div>
            </div>

            <div className="absolute bottom-8 text-xs text-gray-600">
                &copy; {new Date().getFullYear()} Simon Silver Caldaie
            </div>
        </div>
    );
}
