
import sql from "@/app/api/utils/sql";

export async function GET() {
    try {
        const result = await sql`
      SELECT conname, pg_get_constraintdef(oid)
      FROM pg_constraint
      WHERE conrelid = 'availability_exceptions'::regclass;
    `;
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message });
    }
}
