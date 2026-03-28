import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.FIC_ACCESS_TOKEN;
const companyId = process.env.FIC_COMPANY_ID;

async function checkInvoice() {
    const res = await fetch(`https://api-v2.fattureincloud.it/c/${companyId}/issued_documents/514033160`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const json = await res.json();
    if (json.data && json.data.items_list) {
        const vat = json.data.items_list[0].vat;
        console.log("VAT ID IS:", vat.id);
        console.log("Full VAT object:", JSON.stringify(vat, null, 2));
    } else {
        console.log("No items found:", json);
    }
}
checkInvoice();
