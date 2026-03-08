# Internal Admin Specificaties (Founder Control Center)

Dit document beschrijft de architectuur en vereisten voor de "Platform Super Admin" (Owner) omgeving van DutyGrid.

## De Twee Soorten Admin
1. **Klant-admin (binnen de app):** Eigenaar van een beveiligingsbedrijf. Mag alleen zijn eigen bedrijf beheren.
2. **Platform Super Admin (jij):** SaaS-eigenaar. Heeft toegang tot alles via een gescheiden interne omgeving (`admin.dutygrid.nl`).

## Rechtenpakket Platform Super Admin (Owner)
**A. Alles zien (globaal)**
- Alle bedrijven, gebruikers, medewerkers, diensten
- Alle GPS logs, incidenten
- Alle facturen (en payment status), plan/abonnement data
- Live activity (wie is online)

**B. Alles aanpassen**
- Plan wijzigen (Starter/Growth/Pro/Enterprise)
- Trial verlengen / resetten
- Limieten overrulen (medewerkers/locaties/beheerders)
- Account blokkeren / pauzeren / verwijderen (GDPR flow)
- Support-instellingen aanpassen, Feature flags (later)

**C. Support superpowers**
- Inloggen als klant (impersonate)
- Wachtwoord reset triggeren
- 2FA resetten voor klant-admin

**D. Billing & revenue**
- Stripe subscription status bekijken, Failed payments zien + "retry payment" trigger
- Handmatig invoice aanmaken, Upgrades direct uitvoeren, Downgrades plannen

**E. Compliance / veiligheid**
- Audit log: wie deed wat
- Impersonation log
- Security logins (IP, last login, failed attempts)

## Architectuur & Beste Praktijk
De Super Admin logt alleen in op de **gescheiden Internal Admin App** (`admin.dutygrid.nl`), *niet* op de klant-app als hidden role. Dit is veiliger, voorkomt rechtenlekken, is onzichtbaar voor klanten en maakt het toevoegen van latere interne rollen (Support, Finance) makkelijker.

## Scope: Admin Lite V1 (Minimale Vereisten voor Livegang)
Focus op "alles kunnen uitvoeren en inzien" per bedrijf, zonder complexe globale Analytics.

1. **Companies list**
   - Zoek/filter op plan, trial, status, grootte
   - Kolommen: bedrijf, KvK, plan, medewerkers, trial/betaald, last_login, payment_status
2. **Company detail (controlepaneel per klant)**
   - Account, Users, Subscription, Billing, Activity tabs
   - Acties: plan wijzigen, trial verlengen, limiet override, blokkeren/pauzeren, impersonate login
3. **Impersonate**
   - Knop "Log in as Company Admin" -> Opent klant-app in impersonation mode met audit logging banner.

## Fundament (Vanaf Dag 1)
Zorg dat de backend data netjes gelogd wordt voor later:
- `audit_log`
- `subscription_events`
- `activity_log`

*Note: Geavanceerde analytics (MRR grafieken, Revenue Retention, Cohort analyses) behoren tot een latere scope (V2).*
