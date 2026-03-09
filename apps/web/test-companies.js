import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function run() {
    const companies = await sql`
      WITH CompanyStats AS (
          SELECT 
              company_name,
              MIN(id) as primary_owner_id,
              COUNT(id) as total_users,
              MAX(subscription_status) as current_plan,
              MAX(trial_ends_at) as trial_ends_at
          FROM auth_users
          WHERE company_name IS NOT NULL
          GROUP BY company_name
      ),
      EmployeeStats AS (
          SELECT 
              u.company_name,
              COUNT(e.id) as total_employees
          FROM employees e
          JOIN auth_users u ON e.email = u.email
          GROUP BY u.company_name
      )
      SELECT 
          cs.company_name as name,
          u.id as owner_id,
          u.email as owner_email,
          u.kvk_number,
          u.company_size,
          cs.current_plan,
          cs.trial_ends_at,
          cs.total_users,
          COALESCE(es.total_employees, 0) as total_employees
      FROM CompanyStats cs
      JOIN auth_users u ON cs.primary_owner_id = u.id
      LEFT JOIN EmployeeStats es ON cs.company_name = es.company_name
      ORDER BY u.created_at DESC
      LIMIT 10
  `;
    console.log(JSON.stringify(companies, null, 2));
}

run();
