import { POST } from '../apps/web/src/app/api/internal/staging-tools/build-environment/route.js';
import dotenv from 'dotenv';

dotenv.config({ path: 'apps/web/.env.local' });

async function run() {
  const req = new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company: { name: 'Test API Local', email: 'test_engine@test.com', employees: '3' },
      mode: 'preset_small',
      plan: 'starter',
      billingStatus: 'trialing',
      timeOffsetDays: 0,
      seedData: { employees: true, shifts: true, incidents: false, clients: true, invoices: false }
    })
  });
  
  try {
    const res = await POST(req);
    const json = await res.json();
    console.log(json);
  } catch (e) {
    console.error(e);
  }
}
run();
