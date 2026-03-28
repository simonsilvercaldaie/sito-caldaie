import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.FIC_ACCESS_TOKEN;
const companyId = process.env.FIC_COMPANY_ID;

async function testFix() {
    const today = new Date().toISOString().split('T')[0];
    const payload = {
        data: {
            type: 'invoice',
            date: today,
            entity: {
                name: "Test User",
                first_name: "Test",
                last_name: "User",
                address_street: "Via Roma",
                address_city: "Milano",
                address_postal_code: "20100",
                country: "Italia",
                country_iso: "IT",
                tax_code: "RSSMRA85T10A562S",
                ei_code: "0000000"
            },
            items_list: [{
                code: "test",
                name: "Test Forfettario",
                net_price: 1.0,
                qty: 1,
                vat: { id: 0 },
                discount: 0
            }],
            currency: { id: 'EUR' },
            language: { code: 'it' },
            e_invoice: true,
            notes: "Test invoice"
        }
    };

    const res = await fetch(`https://api-v2.fattureincloud.it/c/${companyId}/issued_documents`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const json = await res.json();
    console.log(`Test:`, res.status, json.error ? json.error : "SUCCESS: " + json.data.id);
    return res.ok;
}

testFix();
