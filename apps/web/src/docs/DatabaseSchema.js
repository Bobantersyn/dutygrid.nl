/**
 * =============================================================================
 * DATABASE SCHEMA
 * =============================================================================
 *
 * TABEL: auth_users
 * -----------------
 * Gebruikers authenticatie (NextAuth.js)
 *
 * Velden:
 * - id (PK)
 * - name
 * - email (unique)
 * - emailVerified
 * - image
 *
 *
 * TABEL: user_roles
 * -----------------
 * Koppeling tussen auth users en rollen + employee_id
 *
 * Velden:
 * - id (PK)
 * - user_id (FK → auth_users.id) [unique]
 * - role (beveiliger | beveiliger_extended | planner | admin)
 * - employee_id (FK → employees.id, nullable)
 * - created_at
 *
 *
 * TABEL: clients
 * --------------
 * Beveiligingsklanten
 *
 * Velden:
 * - id (PK)
 * - name
 * - contact_person
 * - email
 * - phone
 * - address
 * - created_at
 *
 *
 * TABEL: assignments
 * ------------------
 * Beveiligingsopdrachten/locaties
 *
 * Velden:
 * - id (PK)
 * - client_id (FK → clients.id)
 * - location_name
 * - location_address
 * - description
 * - hourly_rate (€/uur)
 * - active (boolean, default: true)
 * - created_at
 *
 *
 * TABEL: cao_types
 * ----------------
 * CAO regels voor werknemers
 *
 * Velden:
 * - id (PK)
 * - name (unique)
 * - max_hours_per_week (int)
 * - max_hours_per_day (int)
 * - description
 * - pdf_document (URL naar PDF)
 * - last_updated
 *
 * Standaard CAO Types:
 * - Schoonmaak: 40u/week, 12u/dag
 * - Particuliere Beveiliging: 60u/week, 12u/dag
 * - Deeltijd: 20u/week, 8u/dag
 *
 *
 * TABEL: employees
 * ----------------
 * Beveiligingsmedewerkers
 *
 * Velden:
 * - id (PK)
 * - first_name
 * - last_name
 * - name (computed: first_name + last_name)
 * - email (unique)
 * - phone
 * - cao_type (text, verwijst naar cao_types.name)
 * - max_hours_per_week (int)
 * - max_hours_per_day (int)
 * - home_address
 * - job_title
 * - contract_type
 * - badge_type (geen | grijs | groen)
 * - is_flexible (boolean, default: false)
 * - profile_photo (URL)
 * - passport_document (URL)
 * - security_pass_document (URL)
 * - active (boolean, default: true)
 * - planning_visibility_weeks (int, default: 1)
 * - can_manage_own_availability (boolean, default: true)
 * - created_at
 *
 *
 * TABEL: availability_patterns
 * -----------------------------
 * Vaste beschikbaarheidspatronen per week
 *
 * Velden:
 * - id (PK)
 * - employee_id (FK → employees.id)
 * - day_of_week (int, 0-6, 0=zondag, 1=maandag, etc.)
 * - start_time (time)
 * - end_time (time)
 * - is_available (boolean, default: true)
 * - created_at
 *
 *
 * TABEL: availability_exceptions
 * -------------------------------
 * Uitzonderingen op vaste beschikbaarheid (specifieke datums)
 *
 * Velden:
 * - id (PK)
 * - employee_id (FK → employees.id)
 * - exception_date (date)
 * - start_time (time, nullable)
 * - end_time (time, nullable)
 * - is_available (boolean, default: false)
 * - reason (text)
 * - created_at
 *
 *
 * TABEL: saved_availability_patterns
 * -----------------------------------
 * Opgeslagen beschikbaarheidspatronen (templates)
 *
 * Velden:
 * - id (PK)
 * - employee_id (FK → employees.id)
 * - pattern_name (text)
 * - pattern_data (jsonb) - JSON met weekpatroon
 * - created_at
 *
 * Pattern Data Format:
 * {
 *   "0": { "enabled": true, "start_time": "08:00", "end_time": "16:00" },
 *   "1": { "enabled": true, "start_time": "08:00", "end_time": "16:00" },
 *   ...
 * }
 *
 *
 * TABEL: shifts
 * -------------
 * Geplande diensten
 *
 * Velden:
 * - id (PK)
 * - employee_id (FK → employees.id, NULLABLE - voor open diensten)
 * - assignment_id (FK → assignments.id, nullable)
 * - shift_date (date)
 * - start_time (time)
 * - end_time (time)
 * - shift_type (dag | nacht | evenement | object)
 * - break_minutes (int, default: 0)
 * - travel_distance_km (decimal)
 * - travel_costs (decimal)
 * - notes (text)
 * - availability_override_approved (boolean, default: false)
 * - availability_override_note (text)
 * - created_at
 *
 * Shift Types:
 * - dag: Dagdienst (06:00-18:00)
 * - nacht: Nachtdienst (18:00-06:00)
 * - evenement: Evenementbeveiliging
 * - object: Objectbeveiliging
 *
 * Open Diensten:
 * - employee_id = NULL → Dienst zonder medewerker (vacature)
 * - Wordt weergegeven als "Open Dienst" in planning
 *
 * Availability Override:
 * - availability_override_approved: Of planner deze dienst buiten beschikbaarheid
 *   heeft goedgekeurd
 * - availability_override_note: Optionele notitie van planner bij goedkeuring
 *
 *
 * TABEL: shift_swap_requests
 * --------------------------
 * Dienst ruil/overname aanvragen
 *
 * Velden:
 * - id (PK)
 * - shift_id (FK → shifts.id)
 * - requesting_employee_id (FK → employees.id)
 * - target_employee_id (FK → employees.id, nullable)
 * - swap_type (swap | takeover)
 * - status (pending | approved | rejected | cancelled)
 * - reason (text)
 * - approved_by_user_id (FK → auth_users.id)
 * - response_message (text)
 * - created_at
 * - updated_at
 *
 * Swap Types:
 * - swap: Ruilen met iemand anders (toekomstige feature)
 * - takeover: Iemand neemt dienst over
 *
 * Target Employee:
 * - NULL = Open voor iedereen
 * - ID = Specifiek voor één medewerker
 */

export default function DatabaseSchema() {
  return null;
}
