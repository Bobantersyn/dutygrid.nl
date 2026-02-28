import sql from "@/app/api/utils/sql";

// Controleer of de request geautoriseerd is (bijv. via Vercel Cron secret)
export async function GET(request) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Stap 1: Vind vervallen trials (30 dagen verstreken na trial_ends_at)
        // En sla hun KVK en email op in een geblokkeerde lijst of markeer ze.
        // Omdat we geen expliciete 'blocked_companies' tafel hebben, markeren we ze in de auth_users.

        // Bij een echte verwijdering zou je alle records (employees, shifts) deleten.
        // We updaten hier de subscription_status naar 'deleted_retention' en bewaren kvk/email ter voorkoming van nieuwe trials.

        await sql`
      UPDATE auth_users 
      SET subscription_status = 'deleted_retention',
          password = 'DELETED',
          name = 'DELETED'
      WHERE subscription_status = 'trialing' 
        AND trial_ends_at < NOW() - INTERVAL '30 days'
        AND subscription_status != 'deleted_retention'
    `;

        // In de signup route (POST /api/custom-auth/signup) zou je dan een check toevoegen:
        // SELECT id FROM auth_users WHERE (email = new_email OR kvk_number = new_kvk) 
        // AND subscription_status = 'deleted_retention' 
        // AND trial_ends_at > NOW() - INTERVAL '120 days' (30 retentie + 90 block)

        return Response.json({ success: true, message: "Retention cron executed successfully" });
    } catch (error) {
        console.error("Cron Data Retention Error:", error);
        return Response.json({ error: "Interne serverfout" }, { status: 500 });
    }
}
