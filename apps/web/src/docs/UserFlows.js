/**
 * =============================================================================
 * USER FLOWS
 * =============================================================================
 *
 * FLOW 1: Medewerker biedt dienst aan voor overname
 * --------------------------------------------------
 *
 * 1. Medewerker logt in
 * 2. Gaat naar Dashboard → klikt "Diensten Ruilen"
 * 3. Ziet lijst van eigen komende diensten
 * 4. Klikt "Aanbieden" bij een dienst
 * 5. Kiest type: "Overname"
 * 6. Kiest target: "Open voor iedereen"
 * 7. Voegt optioneel reden toe
 * 8. Bekijkt automatische vervangingssuggesties met scores
 * 9. Klikt "Aanvraag Indienen"
 * 10. Aanvraag krijgt status: Pending
 * 11. Wacht op planner goedkeuring
 *
 *
 * FLOW 2: Medewerker neemt dienst over van collega
 * -------------------------------------------------
 *
 * 1. Medewerker logt in
 * 2. Gaat naar "Diensten Ruilen"
 * 3. Scrollt naar "Beschikbare Diensten"
 * 4. Ziet dienst van collega die open staat
 * 5. Leest details (datum, tijd, locatie, reden)
 * 6. Klikt "Neem over"
 * 7. Bevestigt in modal
 * 8. Aanvraag wordt gekoppeld aan deze medewerker
 * 9. Status blijft Pending totdat planner goedkeurt
 *
 *
 * FLOW 3: Planner keurt swap request goed
 * ----------------------------------------
 *
 * 1. Planner logt in
 * 2. Gaat naar "Planning"
 * 3. Ziet banner: "3 Openstaande Swap Aanvragen"
 * 4. Klikt om sectie uit te klappen
 * 5. Ziet lijst van pending requests met details
 * 6. Klikt "Beoordelen" bij een aanvraag
 * 7. Modal opent met volledige details:
 *    - Medewerker die vraagt
 *    - Medewerker die overneemt (of "Open")
 *    - Dienst info (datum, tijd, locatie)
 *    - Reden
 * 8. Voegt optioneel reactie toe
 * 9. Klikt "Goedkeuren"
 * 10. Systeem:
 *     - Update shift.employee_id naar nieuwe medewerker
 *     - Update swap request status naar "approved"
 *     - Voegt approved_by_user_id en response_message toe
 *     - Refresht planning en swap lijst
 * 11. Bevestiging toast: "Swap request goedgekeurd!"
 *
 *
 * FLOW 4: Nieuwe medewerker toevoegen
 * ------------------------------------
 *
 * 1. Planner/Admin logt in
 * 2. Gaat naar Dashboard → klikt "Nieuwe Medewerker"
 * 3. Vult formulier in:
 *    - Voornaam, achternaam
 *    - Email (unique)
 *    - Telefoon
 *    - Adres
 *    - Job title
 *    - Contract type
 *    - CAO type (dropdown)
 *      → Systeem vult automatisch max uren in
 *    - Pass type
 *    - Upload profielfoto
 *    - Upload paspoort
 *    - Upload beveiligingspas
 * 4. Klikt "Medewerker Toevoegen"
 * 5. Validatie:
 *    - Email unique check
 *    - Alle verplichte velden ingevuld
 * 6. Succes → Redirect naar medewerker detail pagina
 *
 *
 * FLOW 5: Dienst inplannen met validatie
 * ---------------------------------------
 *
 * 1. Planner logt in
 * 2. Gaat naar "Planning" → klikt "Nieuwe Dienst"
 * 3. Vult formulier in:
 *    - Medewerker (dropdown)
 *    - Datum
 *    - Start tijd (bijv. 08:00)
 *    - Eind tijd (bijv. 16:00)
 *    - Shift type: Dag
 *    - Break: 30 minuten
 *    - Opdracht: Schiphol Terminal 3
 *    - Reisafstand: 25 km
 *    - Reiskosten: €15
 *    - Notities: "VCA pas meenemen"
 * 4. Klikt "Dienst Toevoegen"
 * 5. Validatie checks:
 *    ✅ Medewerker CAO: Particuliere Beveiliging (60u/week, 12u/dag)
 *    ✅ Dienst duur: 8 uur (binnen 12u/dag limiet)
 *    ✅ Week totaal: 8u (binnen 60u/week limiet)
 *    ✅ Geen overlap met andere diensten
 * 6. Validatie slaagt → Dienst wordt toegevoegd
 * 7. Redirect naar planning overzicht
 * 8. Dienst is zichtbaar in week/dag view
 *
 * VALIDATIE FAALT VOORBEELD:
 * - Medewerker heeft al 55u deze week
 * - Nieuwe dienst = 8u
 * - Totaal zou worden: 63u > 60u max
 * - ❌ Error: "Medewerker zou meer dan 60 uur per week werken"
 * - Dienst wordt NIET toegevoegd
 *
 *
 * FLOW 6: Planner keurt shift buiten beschikbaarheid goed
 * --------------------------------------------------------
 *
 * 1. Planner logt in
 * 2. Gaat naar "Planning"
 * 3. Ziet planning overzicht met alle diensten
 * 4. Ziet shift met oranje linker border (State A)
 *    - Oranje waarschuwingsicoon zichtbaar
 *    - Dit betekent: shift valt buiten beschikbaarheid medewerker
 * 5. Klikt op het oranje waarschuwingsicoon
 * 6. OverrideApprovalModal opent met details:
 *    - Medewerker naam
 *    - Shift datum, tijd, locatie
 *    - Beschikbaarheid conflict uitleg
 *      bijv. "Medewerker heeft aangegeven niet beschikbaar te zijn op dinsdag 08:00-16:00"
 * 7. Planner overweegt goedkeuring:
 *    - Heeft met medewerker gesproken
 *    - Medewerker heeft toegezegd toch beschikbaar te zijn
 *    - Of: Is een noodsituatie
 * 8. Planner voegt optionele notitie toe in tekstveld:
 *    bijv. "Medewerker heeft telefonisch bevestigd beschikbaar te zijn"
 * 9. Planner klikt "Goedkeuren"
 * 10. Systeem:
 *     - POST naar /api/shifts/[id]/approve-override
 *     - Zet availability_override_approved = true
 *     - Slaat notitie op in availability_override_note
 *     - Refresht planning overzicht
 * 11. Resultaat:
 *     - Shift gaat van State A (oranje) naar State B (groen vinkje)
 *     - Groen vinkje icoon verschijnt op shift
 *     - Bij hover over vinkje: tooltip toont de notitie
 * 12. Bevestiging toast: "Shift goedgekeurd buiten beschikbaarheid"
 * 13. Medewerker ziet deze indicators NIET (alleen planning, geen states)
 *
 * ALTERNATIEF - Als planner NIET goedkeurt:
 * - Planner laat shift zoals die is
 * - Oranje warning blijft zichtbaar als reminder
 * - Planner kan medewerker contacten
 * - Shift kan verwijderd worden en opnieuw ingepland met andere medewerker
 *
 *
 * FLOW 7: Medewerker stelt beschikbaarheid in
 * --------------------------------------------
 *
 * 1. Medewerker (beveiliger) logt in
 * 2. Gaat naar "Beschikbaarheid" pagina
 * 3. Ziet week overzicht met 7 dagen (Ma-Zo)
 * 4. Per dag:
 *    - Zet toggle aan voor beschikbaar
 *    - Vult start tijd in (bijv. 08:00)
 *    - Vult eind tijd in (bijv. 17:00)
 * 5. Voorbeeld patroon:
 *    - Ma: 08:00-17:00
 *    - Di: 08:00-17:00
 *    - Wo: 08:00-17:00
 *    - Do: 08:00-17:00
 *    - Vr: 08:00-17:00
 *    - Za: Niet beschikbaar
 *    - Zo: Niet beschikbaar
 * 6. Klikt "Patroon Opslaan"
 * 7. Krijgt optie om pattern op te slaan als template:
 *    - Naam: "Standaard Werkweek"
 *    - Voor hergebruik later
 * 8. Patroon wordt opgeslagen
 * 9. Gaat naar "Uitzonderingen" sectie
 * 10. Voegt uitzondering toe voor specifieke datum:
 *     - Datum: 15 februari 2026
 *     - Type: Niet beschikbaar
 *     - Reden: "Doktersafspraak"
 * 11. Klikt "Uitzondering Toevoegen"
 * 12. Uitzondering wordt opgeslagen
 * 13. In kalender overzicht:
 *     - Groene dagen = beschikbaar volgens patroon
 *     - Rode dag (15 feb) = niet beschikbaar (uitzondering)
 * 14. Planner kan nu rekening houden met beschikbaarheid bij planning
 */

export default function UserFlows() {
  return null;
}
