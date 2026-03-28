import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.FIC_ACCESS_TOKEN;
const companyId = process.env.FIC_COMPANY_ID;
const invoiceId = 514033443; // The test invoice we just created

async function testEmail() {
    const payload = {
        data: {
            recipient_email: "simon.test.dev.app@gmail.com", // Just a fake one so it fails gracefully or sends to nowhere
            subject: "La tua fattura Simon Silver Caldaie",
            body: "Gentile Cliente,\n\nIn allegato trovi la copia di cortesia della fattura relativa al tuo acquisto del Video Corso.\n\nGrazie per la fiducia!\nSimon Silver Caldaie",
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
