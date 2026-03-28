import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.FIC_ACCESS_TOKEN;
const companyId = process.env.FIC_COMPANY_ID;
const invoiceId = 514036687; // The new test invoice we just created

async function testEmail() {
    const payload = {
        data: {
            sender_id: 0,
            recipient_email: "simon.test.dev.app@gmail.com", 
            subject: "La tua fattura",
            body: "Gentile Cliente,\n\nIn allegato la copia della fattura.\n\nGrazie!",
            include: {
                document: true,
                delivery_note: false,
                attachment: false,
                accompanying_invoice: false
            },
            attach_pdf: true,
            send_copy: false
        }
    };

    console.log("Sending email via FIC...");
    const res = await fetch(`https://api-v2.fattureincloud.it/c/${companyId}/issued_documents/${invoiceId}/email`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
}

testEmail();
