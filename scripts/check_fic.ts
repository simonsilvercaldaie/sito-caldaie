import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.FIC_ACCESS_TOKEN;
const companyId = process.env.FIC_COMPANY_ID;

async function check() {
    console.log("Fetching invoices from FIC...");
    try {
        const res = await fetch(`https://api-v2.fattureincloud.it/c/${companyId}/issued_documents?type=invoice`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        const json = await res.json();
        if (!res.ok) {
            console.error("Error from FIC API:", json);
            return;
        }
        if (json.data && json.data.length > 0) {
            console.log(`Found ${json.data.length} total invoices.`);
            const recent = json.data.slice(0, 5).map((inv: any) => ({
                id: inv.id,
                number: inv.number,
                date: inv.date,
                entity_name: inv.entity.name,
                net_amount: inv.amount_net,
                gross_amount: inv.amount_gross,
                status: inv.state
            }));
            console.log("Most recent 5 invoices:");
            console.table(recent);
        } else {
            console.log("No invoices found.");
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

check();
