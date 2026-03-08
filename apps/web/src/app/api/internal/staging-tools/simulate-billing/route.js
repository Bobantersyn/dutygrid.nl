import sql from '@/app/api/utils/sql';
import { requireStagingEnvironment } from '../guard.js';

export async function POST(request) {
    try {
        requireStagingEnvironment();

        const body = await request.json();
        const { email, action } = body;

        if (!email || !action) {
            return Response.json({ error: 'Email and action are required.' }, { status: 400 });
        }

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
            return Response.json({ success: true, message: 'Status succesvol gewijzigd naar Actief (Jaarlijks - 2 maanden gratis).' });

        } else if (action === 'simulate_past_due') {
            // Simulate a failed payment
            await sql`
                UPDATE auth_users 
                SET subscription_status = 'past_due'
                WHERE email = ${email}
            `;
            return Response.json({ success: true, message: 'Betaling mislukt gesimuleerd (status: past_due).' });

        } else if (action === 'simulate_canceled') {
            await sql`
                UPDATE auth_users 
                SET subscription_status = 'canceled'
                WHERE email = ${email}
            `;
            return Response.json({ success: true, message: 'Abonnement succesvol opgezegd gesimuleerd.' });

        } else {
            return Response.json({ error: 'Geen geldige actie opgegeven.' }, { status: 400 });
        }

    } catch (error) {
        console.error('[SimulateBilling API] Error:', error);
        return Response.json({ error: 'Fout bij simuleren.' }, { status: 500 });
    }
}
