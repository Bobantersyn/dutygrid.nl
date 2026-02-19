/**
 * =============================================================================
 * API ENDPOINTS
 * =============================================================================
 *
 * CLIENTS API
 * -----------
 * GET    /api/clients           - Lijst van alle klanten
 * POST   /api/clients           - Nieuwe klant toevoegen
 * GET    /api/clients/[id]      - Enkele klant ophalen
 * PATCH  /api/clients/[id]      - Klant bijwerken
 * DELETE /api/clients/[id]      - Klant verwijderen
 *
 *
 * ASSIGNMENTS API
 * ---------------
 * GET    /api/assignments       - Lijst van alle opdrachten
 * POST   /api/assignments       - Nieuwe opdracht toevoegen
 * GET    /api/assignments/[id]  - Enkele opdracht ophalen
 * PATCH  /api/assignments/[id]  - Opdracht bijwerken
 * DELETE /api/assignments/[id]  - Opdracht verwijderen
 *
 *
 * CAO TYPES API
 * -------------
 * GET    /api/cao-types         - Lijst van alle CAO types
 * POST   /api/cao-types         - Nieuwe CAO type toevoegen
 * GET    /api/cao-types/[id]    - Enkele CAO type ophalen
 * PATCH  /api/cao-types/[id]    - CAO type bijwerken
 * DELETE /api/cao-types/[id]    - CAO type verwijderen
 *
 *
 * EMPLOYEES API
 * -------------
 * GET    /api/employees         - Lijst van alle medewerkers
 * POST   /api/employees         - Nieuwe medewerker toevoegen
 * GET    /api/employees/[id]    - Enkele medewerker ophalen (met shifts)
 * PATCH  /api/employees/[id]    - Medewerker bijwerken
 * DELETE /api/employees/[id]    - Medewerker verwijderen
 *
 *
 * SHIFTS API
 * ----------
 * GET    /api/shifts                        - Lijst van shifts
 *                                             Query params: start_date, end_date, employee_id
 * POST   /api/shifts                        - Nieuwe dienst inplannen (met validatie)
 *                                             Accepteert employee_id = null voor open diensten
 * GET    /api/shifts/[id]                   - Enkele dienst ophalen
 * PATCH  /api/shifts/[id]                   - Dienst bijwerken
 * DELETE /api/shifts/[id]                   - Dienst verwijderen
 * POST   /api/shifts/[id]/approve-override  - Keur dienst buiten beschikbaarheid goed
 *                                             (Alleen Planner/Admin)
 *
 * Query parameters GET /api/shifts:
 * - start_date: Filter vanaf datum (YYYY-MM-DD)
 * - end_date: Filter tot datum (YYYY-MM-DD)
 * - employee_id: Filter op medewerker
 *
 * POST /api/shifts body:
 * {
 *   "employee_id": 123,  // OF null voor open dienst
 *   "shift_date": "2026-01-28",
 *   "start_time": "08:00",
 *   "end_time": "16:00",
 *   "shift_type": "dag",
 *   "break_minutes": 30,
 *   "assignment_id": 5,
 *   "travel_distance_km": 25,
 *   "travel_costs": 15,
 *   "notes": "VCA pas meenemen"
 * }
 *
 * POST /api/shifts/[id]/approve-override body:
 * {
 *   "note": "Medewerker heeft toegezegd beschikbaar te zijn" // optioneel
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "shift": {
 *     "id": 123,
 *     "availability_override_approved": true,
 *     "availability_override_note": "Medewerker heeft toegezegd...",
 *     ...
 *   }
 * }
 *
 *
 * AVAILABILITY API
 * ----------------
 * GET    /api/availability/patterns           - Vaste beschikbaarheidspatronen ophalen
 * POST   /api/availability/patterns           - Patroon toevoegen/updaten
 * DELETE /api/availability/patterns           - Alle patronen verwijderen
 *
 * GET    /api/availability/exceptions         - Uitzonderingen ophalen
 * POST   /api/availability/exceptions         - Uitzondering toevoegen
 * DELETE /api/availability/exceptions/[id]    - Uitzondering verwijderen
 *
 * GET    /api/availability/saved-patterns     - Opgeslagen patterns ophalen
 * POST   /api/availability/saved-patterns     - Pattern opslaan
 * DELETE /api/availability/saved-patterns/[id] - Pattern verwijderen
 *
 * POST   /api/availability/check              - Check beschikbaarheid voor shift(s)
 *
 * POST /api/availability/check body:
 * {
 *   "shifts": [
 *     {
 *       "employee_id": 5,
 *       "shift_date": "2026-01-28",
 *       "start_time": "08:00",
 *       "end_time": "16:00"
 *     }
 *   ]
 * }
 *
 * Response:
 * {
 *   "results": [
 *     {
 *       "employee_id": 5,
 *       "shift_date": "2026-01-28",
 *       "is_available": false,
 *       "reason": "Niet beschikbaar op dinsdag 08:00-16:00"
 *     }
 *   ]
 * }
 *
 *
 * SHIFT SWAPS API
 * ---------------
 * GET    /api/shift-swaps                    - Lijst van swap requests
 * POST   /api/shift-swaps                    - Nieuwe swap request
 * PATCH  /api/shift-swaps/[id]               - Actie: approve/reject/claim/cancel
 * DELETE /api/shift-swaps/[id]               - Swap request verwijderen
 * GET    /api/shift-swaps/suggestions/[id]  - Vervangingssuggesties voor shift
 *
 * POST /api/shift-swaps body:
 * {
 *   "shift_id": 123,
 *   "swap_type": "takeover",
 *   "target_employee_id": null,  // null = open voor iedereen
 *   "reason": "Optionele reden"
 * }
 *
 * PATCH /api/shift-swaps/[id] body:
 * {
 *   "action": "approve",  // approve | reject | claim | cancel
 *   "response_message": "Optionele reactie"
 * }
 *
 * GET /api/shift-swaps/suggestions/[shift_id] response:
 * {
 *   "suggestions": [
 *     {
 *       "employee_id": 5,
 *       "employee_name": "Jan Jansen",
 *       "cao_type": "Particuliere Beveiliging",
 *       "score": 100,
 *       "reasons": [
 *         "CAO type komt overeen",
 *         "Geen conflicten gevonden",
 *         "Binnen max uren per week (10/60)",
 *         "Binnen max uren per dag (8/12)"
 *       ],
 *       "hours_this_week": 10,
 *       "max_hours_week": 60,
 *       "max_hours_day": 12,
 *       "has_conflict": false
 *     }
 *   ]
 * }
 *
 *
 * PLANNING GAPS API
 * -----------------
 * GET    /api/planning-gaps     - Detecteer onbezette tijdslots (7 dagen)
 *
 * Response:
 * {
 *   "gaps": [
 *     {
 *       "assignment_id": 3,
 *       "location_name": "Schiphol Terminal 3",
 *       "client_name": "AMS Security",
 *       "gap_start": "2026-01-28T08:00:00",
 *       "gap_end": "2026-01-28T16:00:00",
 *       "hours_uncovered": 8
 *     }
 *   ]
 * }
 *
 *
 * USER ROLE API
 * -------------
 * GET    /api/user-role         - Huidige gebruiker rol ophalen
 */

export default function ApiEndpoints() {
  return null;
}
