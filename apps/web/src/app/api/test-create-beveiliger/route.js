import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

// Check account status
export async function GET() {
  try {
    const user = await sql`
      SELECT u.id, u.email, u.name
      FROM auth_users u
      WHERE u.email = 'jan@test.nl'
    `;

    if (user.length === 0) {
      return Response.json({ exists: false, message: "Account bestaat niet" });
    }

    const account = await sql`
      SELECT id, provider, "providerAccountId", "userId", CASE WHEN password IS NOT NULL THEN true ELSE false END as has_password
      FROM auth_accounts
      WHERE "userId" = ${user[0].id}
    `;

    const role = await sql`
      SELECT role, employee_id
      FROM user_roles
      WHERE user_id = ${user[0].id.toString()}
    `;

    return Response.json({
      exists: true,
      user: user[0],
      account: account[0] || null,
      role: role[0] || null,
    });
  } catch (error) {
    console.error("Error checking account:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Tijdelijke endpoint om test accounts aan te maken
export async function POST(request) {
  try {
    const { email, password, employeeId } = await request.json();

    console.log("Creating/resetting account for:", email);
    console.log("Password to hash:", password);

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM auth_users WHERE email = ${email}
    `;

    let userId;

    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      console.log("User already exists, resetting password. User ID:", userId);

      // Delete old account
      await sql`DELETE FROM auth_accounts WHERE "userId" = ${userId}`;

      // Hash password exactly like auth.js does
      const hashedPassword = await hash(password);
      console.log("New hashed password:", hashedPassword);

      // Create new account with fresh password
      // CRITICAL: providerAccountId must be same TYPE as userId (not string)
      await sql`
        INSERT INTO auth_accounts (
          "userId", 
          type, 
          provider, 
          "providerAccountId", 
          password
        )
        VALUES (
          ${userId},
          'credentials',
          'credentials',
          ${userId},
          ${hashedPassword}
        )
      `;
    } else {
      console.log("Creating new user");

      // Create user
      const [newUser] = await sql`
        INSERT INTO auth_users (email, name)
        VALUES (${email}, ${email.split("@")[0]})
        RETURNING id
      `;
      userId = newUser.id;
      console.log("New user ID:", userId);

      // Hash password exactly like auth.js does
      const hashedPassword = await hash(password);
      console.log("Hashed password:", hashedPassword);

      // Create account
      // CRITICAL: providerAccountId must be same TYPE as userId (not string)
      await sql`
        INSERT INTO auth_accounts (
          "userId", 
          type, 
          provider, 
          "providerAccountId", 
          password
        )
        VALUES (
          ${userId},
          'credentials',
          'credentials',
          ${userId},
          ${hashedPassword}
        )
      `;
    }

    // Create or update user role
    const existingRole = await sql`
      SELECT id FROM user_roles WHERE user_id = ${userId.toString()}
    `;

    if (existingRole.length > 0) {
      await sql`
        UPDATE user_roles 
        SET employee_id = ${employeeId}, role = 'beveiliger'
        WHERE user_id = ${userId.toString()}
      `;
    } else {
      await sql`
        INSERT INTO user_roles (user_id, role, employee_id)
        VALUES (${userId.toString()}, 'beveiliger', ${employeeId})
      `;
    }

    console.log("✅ Account successfully created/reset");

    return Response.json({
      success: true,
      message: "Beveiliger account created/reset successfully! ✅",
      userId,
      email,
      info: "Je kunt nu inloggen met dit account",
    });
  } catch (error) {
    console.error("Error creating test account:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
