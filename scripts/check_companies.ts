import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.FIC_ACCESS_TOKEN;

async function checkCompanies() {
    console.log("Fetching user companies...");
    const res = await fetch(`https://api-v2.fattureincloud.it/user/companies`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}

checkCompanies();
