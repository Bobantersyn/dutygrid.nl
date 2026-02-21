/**
 * =============================================================================
 * FEATURES & FUNCTIONALITEIT
 * =============================================================================
 *
 * FEATURE 1: DASHBOARD (/)
 * ------------------------
 *
 * Statistieken Kaarten:
 * - Aantal klanten
 * - Actieve opdrachten
 * - Beveiligingsmedewerkers
 * - Diensten vandaag
 *
 * Quick Actions:
 * - Nieuwe klant/opdracht toevoegen
 * - Nieuwe medewerker toevoegen
 * - Nieuwe dienst inplannen
 * - Diensten Ruilen (alleen voor medewerkers)
 *
 * Diensten Vandaag:
 * - Overzicht van alle diensten voor huidige dag
 * - Per dienst: medewerker, tijd, locatie, notities
 *
 * Klikbare Kaarten:
 * - Stats kaarten openen modals met details
 *
 *
 * FEATURE 2: KLANTEN & OPDRACHTENBEHEER (/clients)
 * -----------------------------------------------
 *
 * Functies:
 * - Lijst van alle klanten
 * - Klant toevoegen met contactgegevens
 * - Lijst van alle opdrachten/locaties (tabblad)
 * - Opdracht toevoegen (gekoppeld aan klant)
 * - Tarieven overzicht
 * - Zoeken/filteren op naam/klant
 *
 *
 * FEATURE 4: CAO BEHEER (/cao-management)
 * ----------------------------------------
 *
 * Functies:
 * - Overzicht van CAO types
 * - CAO toevoegen/bewerken
 * - Max uren per week/dag instellen
 * - PDF document uploaden (CAO tekst)
 * - Beschrijving toevoegen
 *
 *
 * FEATURE 5: MEDEWERKERBEHEER
 * ----------------------------
 *
 * LIJST PAGINA (/employees):
 * - Alle medewerkers in kaarten
 * - Filter op actief/inactief
 * - Zoeken op naam/email
 * - Groeperen op CAO type
 * - Klik op kaart → detail pagina
 *
 * DETAIL PAGINA (/employees/[id]):
 * - Persoonlijke gegevens:
 *   - Profielfoto
 *   - Naam, email, telefoon
 *   - Adres
 *   - Paspoort document
 *   - Beveiligingspas document
 *
 * - Functie informatie:
 *   - Job title
 *   - Contract type
 *   - Pass type (geen/grijs/groen)
 *
 * - CAO informatie:
 *   - CAO type
 *   - Max uren per week/dag
 *
 * - Rooster overzicht:
 *   - Komende diensten
 *   - Totale uren deze week
 *   - Voortgangsbalk (gebruikt vs max uren)
 *
 * - Acties:
 *   - Medewerker bewerken
 *   - Actief/inactief zetten
 *   - Dienst toevoegen voor medewerker
 *
 * NIEUWE MEDEWERKER (/employees/new):
 * - Formulier met alle velden
 * - CAO type dropdown (auto-fill max uren)
 * - Upload foto, paspoort, beveiligingspas
 * - Validatie op email (unique)
 *
 *
 * FEATURE 6: PLANNING (/planning)
 * -------------------------------
 *
 * WEEK VIEW (standaard):
 * - 7 dagen overzicht (Ma-Zo)
 * - Alle diensten per dag
 * - Kleurcodes per shift type
 * - Klik op dag → switch naar dag view
 * - Zoeken op medewerker naam
 *
 * DAG VIEW:
 * - Gedetailleerd overzicht één dag
 * - Alle diensten chronologisch
 * - Per dienst:
 *   - Medewerker (link naar profiel)
 *   - Tijd (start - eind)
 *   - Locatie (indien toegewezen)
 *   - Break minuten
 *   - Reiskosten
 *   - Notities
 *   - Verwijder knop
 *
 * PLANNING CONTROLS:
 * - Navigatie:
 *   - Vorige/volgende week
 *   - Vorige/volgende dag (in dag view)
 *   - Terug naar huidige week
 * - View toggle: Week / Dag
 * - Zoeken: Filter op medewerker naam
 * - Inklapbaar: Header samenvouwen
 *
 * SHIFT VISUAL STATES (alleen Planner/Admin):
 * --------------------------------------------
 * Het systeem toont drie verschillende states voor diensten:
 *
 * STATE A - 🟠 ORANJE WARNING (Buiten beschikbaarheid, niet goedgekeurd):
 * - Oranje linker border (border-l-4 border-orange-500)
 * - Oranje waarschuwing icoon (AlertTriangle) klikbaar
 * - Klikken opent OverrideApprovalModal
 * - Planner kan dienst goedkeuren met optionele notitie
 *
 * STATE B - ✅ GROEN VINKJE (Buiten beschikbaarheid, goedgekeurd):
 * - Groen vinkje icoon (CheckCircle2)
 * - Tooltip bij hover toont goedkeuringsnotitie
 * - Visuele bevestiging dat override bewust is goedgekeurd
 *
 * STATE C - ⚪ NORMAAL (Binnen beschikbaarheid):
 * - Normale shift card styling
 * - Geen extra indicatoren
 *
 * BELANGRIJK: Beveiligers zien deze states NIET. Alleen planners/admins.
 *
 * OPEN DIENSTEN:
 * --------------
 * - employee_id = null → Dienst zonder toegewezen medewerker
 * - Styling:
 *   - Gestippelde grijze border (border-2 border-dashed border-gray-300)
 *   - Tekst: "Open Dienst" in plaats van medewerker naam
 *   - Geen klikbare link naar profiel
 *   - Kan niet bewerkt via edit pagina
 * - Gebruik: Vacatures, toekomstige invulling
 *
 * OVERRIDE APPROVAL MODAL (Planner/Admin):
 * -----------------------------------------
 * - Opent bij klik op oranje waarschuwing (State A)
 * - Toont:
 *   - Shift details (datum, tijd, medewerker, locatie)
 *   - Beschikbaarheid conflictinfo
 * - Input:
 *   - Optioneel notitieveld voor goedkeuringsreden
 * - Actie:
 *   - "Goedkeuren" knop
 *   - POST naar /api/shifts/[id]/approve-override
 *   - Zet availability_override_approved = true
 *   - Slaat notitie op
 *   - Refresht planning
 * - Resultaat:
 *   - Shift gaat van State A (oranje) naar State B (groen vinkje)
 *
 * GAP DETECTION (Planner/Admin):
 * - Automatische detectie onbezette tijdslots
 * - Criteria:
 *   - Assignment heeft geen medewerker ingepland
 *   - Tijdslot binnen 7 dagen
 * - Weergave:
 *   - Inklapbare warning banner
 *   - Aantal gaps
 *   - Details per gap (datum, tijd, locatie, klant)
 *
 * SWAP REQUESTS PANEL (Planner/Admin):
 * - Pending requests overzicht
 * - Per aanvraag:
 *   - Medewerker naam
 *   - Type (overname/ruil)
 *   - Dienst details (datum, tijd, locatie)
 *   - Reden
 *   - Target medewerker (of "Open voor iedereen")
 * - Actie: "Beoordelen" knop
 *
 * SWAP APPROVAL MODAL (Planner/Admin):
 * - Volledige aanvraag details
 * - Reactieveld: Optioneel bericht aan medewerker
 * - Acties:
 *   - Goedkeuren → Dienst wordt toegewezen aan nieuwe medewerker
 *   - Afwijzen → Aanvraag wordt geweigerd
 *
 *
 * FEATURE 7: BESCHIKBAARHEID BEHEER (/beschikbaarheid)
 * -----------------------------------------------------
 *
 * Alleen toegankelijk voor medewerkers (beveiliger/beveiliger_extended)
 *
 * WEEK PATROON:
 * - Vaste beschikbaarheid per weekdag instellen
 * - Per dag: aan/uit toggle + tijden (start/eind)
 * - Opslaan als pattern (template)
 * - Laden van opgeslagen patterns
 *
 * UITZONDERINGEN:
 * - Specifieke datums markeren als niet beschikbaar
 * - Of juist WEL beschikbaar (override op vaste patroon)
 * - Reden toevoegen (bijv. "Vakantie", "Doktersafspraak")
 *
 * OVERZICHT:
 * - Kalender weergave met beschikbaarheid
 * - Groen = beschikbaar
 * - Rood = niet beschikbaar
 * - Patroon herhaalt zich wekelijks
 *
 *
 * FEATURE 8: DIENSTEN RUILEN (/diensten-ruilen)
 * ----------------------------------------------
 *
 * Alleen toegankelijk voor medewerkers (niet planners)
 *
 * EIGEN DIENSTEN SECTIE:
 * - Lijst van eigen komende diensten
 * - Per dienst:
 *   - Datum, tijd, locatie
 *   - Shift type
 *   - "Aanbieden" knop (indien nog niet aangeboden)
 *   - Status badge (pending/approved/rejected)
 *
 * AANBIEDEN MODAL:
 * - Type selectie:
 *   - Ruil (swap) - Toekomstige feature
 *   - Overname (takeover) - Iemand anders neemt dienst over
 * - Target selectie:
 *   - Open voor iedereen
 *   - Specifieke medewerker - Toekomstige feature
 * - Reden: Optioneel tekstveld
 * - Vervangingssuggesties:
 *   - Automatische lijst van geschikte medewerkers
 *   - Score 0-110 punten
 *   - Details: CAO match, beschikbaarheid, conflicten
 *
 * BESCHIKBARE DIENSTEN SECTIE:
 * - Diensten van collega's die open staan
 * - Per dienst:
 *   - Medewerker die aanbiedt
 *   - Datum, tijd, locatie
 *   - Shift type
 *   - Reden (indien opgegeven)
 *   - "Neem over" knop
 *
 * MIJN AANVRAGEN SECTIE:
 * - Status tracking:
 *   - Pending (wacht op goedkeuring)
 *   - Approved (goedgekeurd)
 *   - Rejected (afgewezen)
 * - Details per aanvraag:
 *   - Dienst info
 *   - Datum aanvraag
 *   - Planner reactie (indien opgegeven)
 * - Annuleren: Voor pending aanvragen
 *
 *
 * FEATURE 9: NIEUWE DIENST INPLANNEN (/planning/new)
 * ---------------------------------------------------
 *
 * Formulier:
 * - Medewerker (dropdown)
 * - Datum
 * - Start tijd
 * - Eind tijd
 * - Shift type (dag/nacht/evenement/object)
 * - Break minuten
 * - Opdracht/Locatie (optioneel dropdown)
 * - Reisafstand (km)
 * - Reiskosten (€)
 * - Notities
 *
 * Validatie:
 * - CAO max uren per dag check
 * - CAO max uren per week check
 * - Overlap check (geen dubbele diensten)
 *
 * Auto-calculate:
 * - Nachtdienst check (18:00-06:00)
 * - Totale uren
 */

export default function Features() {
  return null;
}
