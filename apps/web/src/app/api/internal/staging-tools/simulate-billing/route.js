import sql from '@/app/api/utils/sql';
import { requireStagingEnvironment } from '../guard.js';
import { getSession } from '@/utils/session';
import { logAudit } from '@/app/api/utils/audit-logger';

export async function POST(request) {
    try {
        requireStagingEnvironment();

        const body = await request.json();
        const { email, action } = body;

        if (!email || !action) {
            return Response.json({ error: 'Email and action are required.' }, { status: 400 });
        }

        const session = await getSession(request);
        const users = await sql`SELECT id FROM auth_users WHERE email = ${email}`;
        const targetUserId = users.length > 0 ? users[0].id : null;

        const logBillingAction = async (simulatedActionStr) => {
            if (session?.user?.id && targetUserId) {
                await logAudit(session, 'UPDATE', 'staging_environment_billing', targetUserId, null, { email, action: simulatedActionStr }, request);
            }
        };

        let query;

        if (action === 'expire_trial') {
            // Set trial end date to yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            await sql`
                UPDATE auth_users 
                SET trial_ends_at = ${yesterday.toISOString()}, subscription_status = 'trialing'
                WHERE email = ${email}
            `;
            await logBillingAction('expire_trial');
            return Response.json({ success: true, message: 'Proefperiode succesvol verlopen (datum op gisteren gezet).' });

        } else if (action === 'simulate_active_monthly') {
            // Simulate a paid active subscription for 1 month
            const future = new Date();
            future.setMonth(future.getMonth() + 1);

            await sql`
                UPDATE auth_users 
                SET subscription_status = 'active', stripe_customer_id = 'cus_' || md5(random()::text), stripe_subscription_id = 'sub_' || md5(random()::text), current_period_end = ${future.toISOString()}
                WHERE email = ${email}
            `;
            await logBillingAction('simulate_active_monthly');
            return Response.json({ success: true, message: 'Status succesvol gewijzigd naar Actief (Maandelijks).' });

        } else if (action === 'simulate_active_yearly') {
            // Simulate a paid active subscription for 1 year (2 months free)
            const future = new Date();
            future.setFullYear(future.getFullYear() + 1);

            await sql`
                UPDATE auth_users 
                SET subscription_status = 'active', stripe_customer_id = 'cus_' || md5(random()::text), stripe_subscription_id = 'sub_' || md5(random()::text), current_period_end = ${future.toISOString()}
                WHERE email = ${email}
            `;
            await logBillingAction('simulate_active_yearly');
            return Response.json({ success: true, message: 'Status succesvol gewijzigd naar Actief (Jaarlijks - 2 maanden gratis).' });

        } else if (action === 'simulate_past_due') {
            // Simulate a failed payment
            await sql`
                UPDATE auth_users 
                SET subscription_status = 'past_due'
                WHERE email = ${email}
            `;
            await logBillingAction('simulate_past_due');
            return Response.json({ success: true, message: 'Betaling mislukt gesimuleerd (status: past_due).' });

        } else if (action === 'simulate_canceled') {
            await sql`
                UPDATE auth_users 
                SET subscription_status = 'canceled'
                WHERE email = ${email}
            `;
            await logBillingAction('simulate_canceled');
            return Response.json({ success: true, message: 'Abonnement succesvol opgezegd gesimuleerd.' });

        } else {
            return Response.json({ error: 'Geen geldige actie opgegeven.' }, { status: 400 });
        }

    } catch (error) {
        console.error('[SimulateBilling API] Error:', error);
        return Response.json({ error: 'Fout bij simuleren.' }, { status: 500 });
    }
}
