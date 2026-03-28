import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.FIC_ACCESS_TOKEN;
const companyId = process.env.FIC_COMPANY_ID;

async function checkInvoices() {
    console.log("Fetching recent invoices...");
    const res = await fetch(`https://api-v2.fattureincloud.it/c/${companyId}/issued_documents?type=invoice&per_page=5`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const json = await res.json();
    if (json.data && json.data.length > 0) {
        for (const inv of json.data) {
            console.log("Invoice ID:", inv.id);
            if (inv.items_list && inv.items_list.length > 0) {
                const vat = inv.items_list[0].vat;
                console.log("Found VAT in invoice:", vat);
                if (vat && vat.id) {
                    console.log("SUCCESS! VAT ID is:", vat.id);
                }
            }
        }
    } else {
        console.log("No invoices found.");
    }
}

checkInvoices();
