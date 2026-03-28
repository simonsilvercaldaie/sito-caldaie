import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.FIC_ACCESS_TOKEN;
const companyId = process.env.FIC_COMPANY_ID;

async function check() {
    console.log("Fetching VAT types from FIC...");
    try {
        const res = await fetch(`https://api-v2.fattureincloud.it/c/${companyId}/info/vat_types`, {
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
        console.log("VAT types:");
        console.table(json.data.map((v: any) => ({
            id: v.id,
            value: v.value,
            description: v.description,
            is_disabled: v.is_disabled
        })));
    } catch (e) {
        console.error("Exception:", e);
    }
}

check();
