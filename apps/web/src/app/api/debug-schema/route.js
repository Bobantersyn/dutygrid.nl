import sql from '@/app/api/utils/sql';

export async function GET() {
    try {
        const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'availability_exceptions'
      ORDER BY ordinal_position;
    `;
        return Response.json(columns);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
