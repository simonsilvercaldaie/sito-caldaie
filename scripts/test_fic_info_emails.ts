import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.FIC_ACCESS_TOKEN;
const companyId = process.env.FIC_COMPANY_ID;

async function checkEmails() {
    console.log("Fetching emails...");
    // Let's query /emails to get the list of configured sender emails
    const res = await fetch(`https://api-v2.fattureincloud.it/c/${companyId}/emails`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log(res.status);
    console.log(await res.text());
}

checkEmails();
