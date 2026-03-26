import Image from 'next/image'

export default function FullScreenLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-32 h-32 md:w-40 md:h-40 animate-bounce">
                    <Image 
                        src="/logo.png" 
                        alt="Caricamento..." 
                        fill 
                        className="object-contain drop-shadow-2xl"
                        priority
                    />
                </div>
                <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-accent animate-ping delay-100"></div>
                    Accesso in corso...
                    <div className="w-2 h-2 rounded-full bg-accent animate-ping delay-300"></div>
                </div>
            </div>
        </div>
    )
}
