import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.FIC_ACCESS_TOKEN;
const companyId = process.env.FIC_COMPANY_ID;

async function run() {
    console.log("Fetching VAT types...");
    const res = await fetch(`https://api-v2.fattureincloud.it/c/${companyId}/info/vat_types`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text);
}
run();
