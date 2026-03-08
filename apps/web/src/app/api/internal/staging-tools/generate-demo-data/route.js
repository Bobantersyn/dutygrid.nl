import sql from '@/app/api/utils/sql';
import { requireStagingEnvironment } from '../guard.js';

export async function POST(request) {
    try {
        requireStagingEnvironment();

        const body = await request.json();
        const { preset = 'small', adminId } = body;

        let empCount = 5;
        let shiftCount = 10;
        let incidentCount = 3;

        if (preset === 'growth') {
            empCount = 20;
            shiftCount = 50;
            incidentCount = 10;
        } else if (preset === 'pro') {
            empCount = 40;
            shiftCount = 120;
            incidentCount = 20;
        }

        // 1. Create a dummy client and assignment
        const [client] = await sql`
            INSERT INTO clients (name, email, city, status) 
            VALUES (${'Demo Client ' + preset}, 'contact@democlient.com', 'Amsterdam', 'active')
            RETURNING id
        `;

        const [assignment] = await sql`
            INSERT INTO assignments (client_id, name, city, status)
            VALUES (${client.id}, ${'Demo Assignment ' + preset}, 'Amsterdam', 'active')
            RETURNING id
        `;

        // 2. Create Employees
        const employeeIds = [];
        for (let i = 0; i < empCount; i++) {
            const [emp] = await sql`
                INSERT INTO employees (name, first_name, last_name, email, hourly_rate, status)
                VALUES (${`Demo V1-${i}`}, 'Demo', ${`V1-${i}`}, ${`demo${i}@test.com`}, 20.00, 'active')
                RETURNING id
            `;
            employeeIds.push(emp.id);
        }

        // 3. Create Shifts
        for (let i = 0; i < shiftCount; i++) {
            const randomEmp = employeeIds[Math.floor(Math.random() * employeeIds.length)];

            // Random start time between 7 days ago and 7 days in the future
            const start = new Date();
            start.setDate(start.getDate() + (Math.floor(Math.random() * 15) - 7));
            start.setHours(Math.floor(Math.random() * 14) + 6, 0, 0, 0); // 06:00 to 20:00

            const end = new Date(start);
            end.setHours(start.getHours() + 8); // 8 hour shifts

            await sql`
                INSERT INTO shifts (assignment_id, employee_id, start_time, end_time, status)
                VALUES (${assignment.id}, ${randomEmp}, ${start.toISOString()}, ${end.toISOString()}, 'planned')
            `;
        }

        // 4. Create Incidents
        for (let i = 0; i < incidentCount; i++) {
            await sql`
                INSERT INTO incidents (title, description, severity, status, location, reported_at)
                VALUES (${'Mock Incident ' + i}, 'Dit is een automatisch gegenereerd incident voor de staging omgeving.', 'medium', 'open', 'Amsterdam', NOW())
            `;
        }

        return Response.json({
            success: true,
            message: `Demo data ('${preset}') succesvol gegenereerd: ${empCount} medewerkers, ${shiftCount} diensten, ${incidentCount} incidenten.`
        });

    } catch (error) {
        console.error('[GenerateData API] Error:', error);
        return Response.json({ error: 'Fout bij genereren data.' }, { status: 500 });
    }
}
