import sql from "@/app/api/utils/sql";

// Verwijder klant
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const [client] = await sql`
      DELETE FROM clients WHERE id = ${id} RETURNING *
    `;

    if (!client) {
      return Response.json({ error: "Client not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return Response.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
