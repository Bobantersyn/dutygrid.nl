/**
 * =============================================================================
 * GEBRUIKERSROLLEN
 * =============================================================================
 *
 * Het systeem kent 4 gebruikersrollen:
 *
 * ROL 1: BEVEILIGER (beveiliger)
 * --------------------------------
 * Basis beveiligingsmedewerker
 *
 * Toegang:
 * - Eigen profiel bekijken
 * - Diensten ruilen pagina
 * - Dashboard (beperkt)
 *
 *
 * ROL 2: BEVEILIGER EXTENDED (beveiliger_extended)
 * -------------------------------------------------
 * Uitgebreide rechten voor ervaren beveiligers
 *
 * Toegang:
 * - Zelfde als beveiliger
 * - Extra rechten (toekomstige uitbreiding)
 *
 *
 * ROL 3: PLANNER (planner)
 * -------------------------
 * Roosterplanner
 *
 * Toegang:
 * - Alles van beveiliger +
 * - Planning beheren (toevoegen/wijzigen/verwijderen diensten)
 * - Swap requests goedkeuren/afwijzen
 * - Gap warnings bekijken
 * - Medewerkers beheren
 * - Klanten & opdrachten beheren
 *
 *
 * ROL 4: ADMIN (admin)
 * ---------------------
 * Systeembeheerder
 *
 * Toegang:
 * - Volledige toegang tot alle features
 * - CAO types beheren
 * - Alle gebruikers beheren
 * - Systeem instellingen
 */

export default function UserRoles() {
  return null;
}
