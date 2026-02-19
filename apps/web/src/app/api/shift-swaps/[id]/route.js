import { getSession } from "@/utils/session";
import sql from "@/app/api/utils/sql";

// PATCH - Update swap request (approve/reject/cancel)
export async function PATCH(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, response_message, target_employee_id } = body;

    if (!action || !["approve", "reject", "cancel", "claim"].includes(action)) {
      return Response.json(
        { error: "action must be 'approve', 'reject', 'cancel', or 'claim'" },
        { status: 400 },
      );
    }

    // Get user role
    const userRoleResult = await sql`
      SELECT role, employee_id FROM user_roles WHERE user_id = ${session.user.id}
    `;

    if (userRoleResult.length === 0) {
      return Response.json({ error: "No role assigned" }, { status: 403 });
    }

    const { role, employee_id } = userRoleResult[0];

    // Get swap request details
    const swapRequest = await sql`
      SELECT sr.*, s.employee_id as shift_employee_id
      FROM shift_swap_requests sr
      JOIN shifts s ON sr.shift_id = s.id
      WHERE sr.id = ${id}
    `;

    if (swapRequest.length === 0) {
      return Response.json(
        { error: "Swap request not found" },
        { status: 404 },
      );
    }

    const swap = swapRequest[0];

    // Handle different actions
    if (action === "cancel") {
      // Only the requesting employee can cancel
      if (swap.requesting_employee_id !== employee_id) {
        return Response.json(
          { error: "Only the requesting employee can cancel" },
          { status: 403 },
        );
      }

      if (swap.status !== "pending") {
        return Response.json(
          { error: "Can only cancel pending requests" },
          { status: 400 },
        );
      }

      await sql`
        UPDATE shift_swap_requests
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = ${id}
      `;

      return Response.json({ message: "Swap request cancelled" });
    }

    if (action === "claim") {
      // Employee claims an open swap request
      if (!employee_id) {
        return Response.json(
          { error: "No employee profile linked" },
          { status: 403 },
        );
      }

      if (swap.status !== "pending") {
        return Response.json(
          { error: "This swap request is no longer available" },
          { status: 400 },
        );
      }

      if (swap.target_employee_id !== null) {
        return Response.json(
          { error: "This swap request is not open for claiming" },
          { status: 400 },
        );
      }

      // Update swap request with claiming employee
      await sql`
        UPDATE shift_swap_requests
        SET target_employee_id = ${employee_id}, updated_at = NOW()
        WHERE id = ${id}
      `;

      return Response.json({
        message: "Swap request claimed, waiting for planner approval",
      });
    }

    if (action === "approve" || action === "reject") {
      // Only planners/admins can approve/reject
      if (role !== "planner" && role !== "admin") {
        return Response.json(
          { error: "Only planners can approve/reject swap requests" },
          { status: 403 },
        );
      }

      if (swap.status !== "pending") {
        return Response.json(
          { error: "Can only approve/reject pending requests" },
          { status: 400 },
        );
      }

      const newStatus = action === "approve" ? "approved" : "rejected";

      // If approving a takeover, assign the shift to the target employee
      if (
        action === "approve" &&
        swap.swap_type === "takeover" &&
        swap.target_employee_id
      ) {
        await sql`
          UPDATE shifts
          SET employee_id = ${swap.target_employee_id}
          WHERE id = ${swap.shift_id}
        `;
      }

      // Update swap request
      await sql`
        UPDATE shift_swap_requests
        SET 
          status = ${newStatus},
          approved_by_user_id = ${session.user.id},
          response_message = ${response_message || null},
          updated_at = NOW()
        WHERE id = ${id}
      `;

      return Response.json({ message: `Swap request ${newStatus}` });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating swap request:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete swap request
export async function DELETE(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get user role
    const userRoleResult = await sql`
      SELECT role, employee_id FROM user_roles WHERE user_id = ${session.user.id}
    `;

    if (userRoleResult.length === 0) {
      return Response.json({ error: "No role assigned" }, { status: 403 });
    }

    const { role, employee_id } = userRoleResult[0];

    // Get swap request
    const swapRequest = await sql`
      SELECT * FROM shift_swap_requests WHERE id = ${id}
    `;

    if (swapRequest.length === 0) {
      return Response.json(
        { error: "Swap request not found" },
        { status: 404 },
      );
    }

    const swap = swapRequest[0];

    // Only requesting employee or planner/admin can delete
    if (
      swap.requesting_employee_id !== employee_id &&
      role !== "planner" &&
      role !== "admin"
    ) {
      return Response.json(
        { error: "Not authorized to delete this request" },
        { status: 403 },
      );
    }

    await sql`
      DELETE FROM shift_swap_requests WHERE id = ${id}
    `;

    return Response.json({ message: "Swap request deleted" });
  } catch (error) {
    console.error("Error deleting swap request:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
