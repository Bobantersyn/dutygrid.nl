import sql from "@/app/api/utils/sql";

// Haal alle object labels op
export async function GET(request) {
    try {
        const labels = await sql`
      SELECT * FROM object_labels ORDER BY name ASC
    `;
        return Response.json({ labels });
    } catch (error) {
        console.error("Error fetching object labels:", error);
        return Response.json(
            { error: "Failed to fetch object labels" },
            { status: 500 },
        );
    }
}

// Maak nieuw object label aan
export async function POST(request) {
    try {
        const { name, description } = await request.json();

        if (!name) {
            return Response.json(
                { error: "Naam is verplicht" },
                { status: 400 },
            );
        }

        const [label] = await sql`
      INSERT INTO object_labels (name, description)
      VALUES (${name}, ${description || null})
      RETURNING *
    `;

        return Response.json({ label });
    } catch (error) {
        console.error("Error creating object label:", error);
        // Behandel unieke constraint fout
        if (error.code === '23505') {
            return Response.json(
                { error: "Dit object label bestaat al" },
                { status: 400 },
            );
        }
        return Response.json(
            { error: "Failed to create object label" },
            { status: 500 },
        );
    }
}
