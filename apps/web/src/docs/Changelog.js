/**
 * =============================================================================
 * CHANGELOG
 * =============================================================================
 *
 * v1.1 - Januari 2026
 * -------------------
 * ✅ Open diensten (employee_id nullable)
 * ✅ Beschikbaarheidsbeheer systeem
 *    - Vaste weekpatronen instellen
 *    - Uitzonderingen op specifieke datums
 *    - Opgeslagen patterns (templates)
 * ✅ Availability Override Approval systeem
 *    - Planners kunnen diensten buiten beschikbaarheid goedkeuren
 *    - Optionele notitie bij goedkeuring
 *    - Visual feedback met states (A/B/C)
 * ✅ Shift Visual States (voor Planners/Admins):
 *    - State A: Oranje warning voor niet-goedgekeurde overrides
 *    - State B: Groen vinkje voor goedgekeurde overrides
 *    - State C: Normaal voor shifts binnen beschikbaarheid
 * ✅ OverrideApprovalModal component
 * ✅ API endpoint: /api/shifts/[id]/approve-override
 * ✅ API endpoints voor availability beheer
 *    - /api/availability/patterns
 *    - /api/availability/exceptions
 *    - /api/availability/saved-patterns
 *    - /api/availability/check
 * ✅ Beschikbaarheid overzicht pagina (/beschikbaarheid-overzicht)
 * ✅ Beschikbaarheid invoer pagina (/beschikbaarheid)
 * ✅ Database updates:
 *    - availability_patterns tabel
 *    - availability_exceptions tabel
 *    - saved_availability_patterns tabel
 *    - shifts.availability_override_approved kolom
 *    - shifts.availability_override_note kolom
 *    - employees.planning_visibility_weeks kolom
 *    - employees.can_manage_own_availability kolom
 *
 * v1.0 - Januari 2026
 * -------------------
 * ✅ Basis systeem opzet
 * ✅ Klantenbeheer
 * ✅ Opdrachtenbeheer
 * ✅ Medewerkerbeheer
 * ✅ CAO types beheer
 * ✅ Planning systeem (week/dag views)
 * ✅ Diensten toevoegen met validatie
 * ✅ Gap detection
 * ✅ Diensten ruilen/overname systeem
 * ✅ Automatische vervangingssuggesties
 * ✅ Swap request goedkeuring voor planners
 * ✅ Role-based access control
 * ✅ Dashboard met statistieken
 *
 * Laatste update: Januari 2026
 * Versie: 1.1
 * Status: ✅ Productie Ready
 *
 * Voor vragen: Zie Anything.com documentatie
 */

export default function Changelog() {
  return null;
}
