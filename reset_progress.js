require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Find who has completions
    const { data: allProgress } = await supabase.from('video_watch_progress').select('user_id');
    const counts = {};
    for (const p of allProgress||[]) { counts[p.user_id] = (counts[p.user_id]||0)+1; }
    
    // Find users with 27 completions
    const targetUserIds = Object.keys(counts).filter(id => counts[id] >= 20); // 27 or 20
    console.log("Found user IDs with massive watch progress:", targetUserIds);
    
    if (targetUserIds.length === 0) {
        console.log("No one has massive completions");
        return;
    }
    
    // Reset them!
    for (const uid of targetUserIds) {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const u = users.find(x => x.id === uid);
        console.log(`Resetting user: ${u ? u.email : uid}`);
        
        await supabase.from('video_watch_progress').delete().eq('user_id', uid);
        console.log(`DELETED all video progress for ${u ? u.email : uid}`);
    }
}
main().catch(console.error);
