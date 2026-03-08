import fetch from 'node-fetch';

async function test() {
    console.log("Pinging Vercel...");
    const res = await fetch('https://www.dutygrid.nl/api/internal/staging-tools/build-environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            company: { name: 'Vercel Auto Tester', email: 'hello@vercel.test', employees: '50' },
            mode: 'preset_small',
            plan: 'growth',
            trialDuration: 14,
            billingStatus: 'trialing',
            timeOffsetDays: 7,
            seedData: { employees: true, shifts: true, incidents: true, clients: true },
            featureFlags: {}
        })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
