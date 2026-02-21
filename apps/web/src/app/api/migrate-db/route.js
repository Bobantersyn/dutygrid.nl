import sql from "@/app/api/utils/sql";

export async function GET(request) {
    try {
        await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2)`;
        return Response.json({ status: "success", message: "Added hourly_rate to assignments" });
    } catch (e) {
        return Response.json({ status: "error", error: e.message });
    }
}
