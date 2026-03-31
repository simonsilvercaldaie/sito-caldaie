import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const courses = [
    { id: '01-caldaia-decisioni' },
    { id: '02-struttura-base' },
    { id: '03-combustione-fumi' },
    { id: '04-circuito-acqua' },
    { id: '05-sicurezza-idraulica' },
    { id: '06-accensione-controllo' },
    { id: '07-elettronica-diagnosi' },
    { id: '08-condensazione-base' },
    { id: '09-termoregolazione' },
    // Intermedio
    { id: '10-valvola-gas' },
    { id: '11-tarature-combustione' },
    { id: '12-scambiatori-avanzati' },
    { id: '13-sonde-ntc-ptc' },
    { id: '14-schede-elettroniche' },
    { id: '15-circolatori-modulanti' },
    { id: '16-ventilatori-brushless' },
    { id: '17-vasi-espansione' },
    { id: '18-sifoni-condensa' },
    // Avanzato
    { id: '19-tester-multimetro' },
    { id: '20-schemi-elettrici' },
    { id: '21-ricerca-guasti-1' },
    { id: '22-ricerca-guasti-2' },
    { id: '23-microperdite-gas' },
    { id: '24-lavaggio-chimico' },
    { id: '25-abbinamento-ibridi' },
    { id: '26-manutenzione-pro' },
    { id: '27-centri-assistenza' }
]

async function run() {
    const { data: user } = await supabase.from('profiles').select('id').eq('email', 'simonsilverboombox@gmail.com').maybeSingle();
    
    if (!user) {
        console.log("User not found: simonsilverboombox@gmail.com");
        return;
    }

    console.log("Found user:", user.id);

    const records = courses.map(c => ({
        user_id: user.id,
        course_id: c.id,
        highest_time_watched: 9999,
        last_watched_at: new Date().toISOString(),
        completed: true
    }));

    const { error } = await supabase.from('video_progress').upsert(records, {
        onConflict: 'user_id,course_id'
    });

    if (error) {
        console.error("Error upserting progress:", error);
    } else {
        console.log("Successfully marked all 27 courses as completed!");
    }
}

run();
