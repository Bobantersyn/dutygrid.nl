# DutyGrid Agent Orchestrator

## Doel
Deze orchestrator beheert welke AI-agents actief zijn tijdens elke fase van het DutyGrid project. Het zorgt ervoor dat de juiste expertise op het juiste moment wordt ingezet.

## Huidige Project Status
- **Current Phase:** 1 (Concept & Strategie)
- **Project:** DutyGrid Beveiligingsplanning App
- **Goal:** Een complete beveiligingsplanning applicatie bouwen voor 200+ gebruikers

## Hoe te gebruiken

### 1. Fase instellen
Stel de huidige fase in (1-6) op basis van waar je in het project zit:

```
current_phase: 1
```

### 2. Context meegeven
Bij elke agent call, geef altijd mee:
- `current_phase`: Huidige fase nummer (1-6)
- `goal`: Wat moet er nu gebeuren
- `context`: Korte status + beperkingen

### 3. Agents activeren
De orchestrator activeert automatisch alleen de agents die ACTIVE of ADVISORY zijn in de huidige fase.

## Fase Overzicht

### Phase 1 — Concept & Strategie
**Doel:** Wat bouwen we en waarom?

**Active Agents:**
- Product Strategist

**Advisory Agents:**
- Business & Operations
- UX/UI Designer

**Sleep:**
- Frontend Builder
- Backend & Logic Manager
- Security Guardian
- QA Tester
- DevOps & Infrastructure
- Support Manager

---

### Phase 2 — Design & Architectuur
**Doel:** Hoe gaat het eruit zien en hoe zit het technisch in elkaar?

**Active Agents:**
- UX/UI Designer
- Backend & Logic Manager
- Product Strategist

**Advisory Agents:**
- Security Guardian

**Sleep/Low:**
- Frontend Builder
- QA Tester (low)
- DevOps & Infrastructure (low)
- Business & Operations (low)
- Support Manager

---

### Phase 3 — Bouwfase (Development)
**Doel:** De app echt bouwen.

**Active Agents:**
- Frontend Builder
- Backend & Logic Manager
- Security Guardian

**Advisory Agents:**
- QA Tester (meelopen)
- Product Strategist (beslissingen)
- UX/UI Designer (bijsturen)

**Sleep:**
- Support Manager
- Business & Operations
- DevOps & Infrastructure (low)

---

### Phase 4 — Test & Optimalisatie
**Doel:** Bugs eruit en flow strak maken.

**Active Agents:**
- QA Tester
- Security Guardian
- Frontend Builder
- Backend & Logic Manager

**Advisory Agents:**
- Product Strategist

**Sleep:**
- Support Manager
- Business & Operations

---

### Phase 5 — Launch / Livegang
**Doel:** App online zetten en stabiel live krijgen.

**Active Agents:**
- DevOps & Infrastructure
- Security Guardian
- QA Tester
- Support Manager

**Advisory Agents:**
- Business & Operations
- Product Strategist

**Sleep:**
- UX/UI Designer
- Frontend Builder (alleen fixes)
- Backend & Logic Manager (alleen fixes)

---

### Phase 6 — Groei & Onderhoud
**Doel:** Verbeteren, opschalen, itereren op feedback.

**Active Agents:**
- Support Manager
- Business & Operations
- Product Strategist
- QA Tester
- DevOps & Infrastructure

**Conditional (alleen bij updates):**
- Frontend Builder
- Backend & Logic Manager
- UX/UI Designer
- Security Guardian

---

## Activatie Matrix

| Rol | P1 | P2 | P3 | P4 | P5 | P6 |
|---|---|---|---|---|---|---|
| Product Strategist | ACTIVE | ACTIVE | ADVISORY | ADVISORY | ADVISORY | ACTIVE |
| UX/UI Designer | ADVISORY | ACTIVE | ADVISORY | SLEEP | SLEEP | CONDITIONAL |
| Frontend Builder | SLEEP | SLEEP | ACTIVE | ACTIVE | ADVISORY | CONDITIONAL |
| Backend & Logic Manager | SLEEP | ACTIVE | ACTIVE | ACTIVE | ADVISORY | CONDITIONAL |
| Security Guardian | SLEEP | ADVISORY | ACTIVE | ACTIVE | ACTIVE | CONDITIONAL |
| QA Tester | SLEEP | SLEEP | ADVISORY | ACTIVE | ACTIVE | ACTIVE |
| DevOps & Infrastructure | SLEEP | SLEEP | SLEEP | SLEEP | ACTIVE | ACTIVE |
| Business & Operations | ADVISORY | SLEEP | SLEEP | SLEEP | ADVISORY | ACTIVE |
| Support Manager | SLEEP | SLEEP | SLEEP | SLEEP | ACTIVE | ACTIVE |

## Status Regels

### ACTIVE
- Werkt zelfstandig
- Maakt output en voorstellen
- Neemt beslissingen binnen hun domein
- Levert concrete deliverables

### ADVISORY
- Geeft alleen advies
- Geen grote besluiten zonder Product Strategist
- Beoordeelt risico's
- Geeft aanbevelingen

### SLEEP
- Doet niets tenzij expliciet geroepen
- Antwoordt met: `Idle`
- Wacht op activatie

### CONDITIONAL
- Alleen actief bij specifieke updates/wijzigingen
- Reageert op verzoek

## Workflow

1. **Bepaal huidige fase** → Kijk naar project status
2. **Check activatie matrix** → Zie welke agents ACTIVE/ADVISORY zijn
3. **Roep alleen actieve agents aan** → Bespaar resources
4. **Bundel antwoorden** → Maak één samenhangend plan
5. **Voer uit** → Implementeer met de juiste agents

## DutyGrid Specifieke Aandachtspunten

Voor een beveiligingsplanning app is **rechten + data** kritisch:

- ✅ Welke user ziet welke planning?
- ✅ Welke rol mag diensten wijzigen?
- ✅ Audit log: wie veranderde wat, wanneer?
- ✅ Backups + herstelplan
- ✅ AVG/GDPR compliance
- ✅ 2FA voor gevoelige acties

Dit voorkomt 90% van latere problemen.
