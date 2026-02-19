---
description: Phase 3 - Development (Bouwfase) Workflow
---

# Phase 3: Bouwfase (Development)

**Doel:** De app echt bouwen

**Active Agents:** Frontend Builder, Backend & Logic Manager, Security Guardian  
**Advisory Agents:** QA Tester, Product Strategist, UX/UI Designer  
**Sleep:** Support Manager, Business & Operations, DevOps (low)

---

## Stappen

### 1. Database Setup & Migrations
**Verantwoordelijk:** Backend & Logic Manager (ACTIVE)

- [ ] Setup database (Neon PostgreSQL)
- [ ] Maak migratie scripts
- [ ] Implementeer alle tabellen uit schema
- [ ] Setup seed data voor development
- [ ] Maak database backup strategie

**Tabellen te implementeren:**
```sql
- users (id, email, name, role_id, created_at, updated_at)
- roles (id, name, permissions)
- shifts (id, user_id, location_id, start_time, end_time, status)
- planning (id, week_number, year, created_by, approved_by)
- availability (id, user_id, day_of_week, start_time, end_time)
- swap_requests (id, shift_id, requester_id, target_id, status)
- locations (id, name, address, contact)
- audit_logs (id, user_id, action, entity, entity_id, changes, timestamp)
- notifications (id, user_id, type, message, read, created_at)
```

**Output:** Database migrations + seed scripts

---

### 2. Backend API Development
**Verantwoordelijk:** Backend & Logic Manager (ACTIVE)  
**Advisory:** Security Guardian

#### 2.1 Authentication API
- [ ] `/api/auth/signup` - Registratie
- [ ] `/api/auth/signin` - Login
- [ ] `/api/auth/logout` - Logout
- [ ] `/api/auth/refresh` - Token refresh
- [ ] `/api/auth/2fa/setup` - 2FA setup
- [ ] `/api/auth/2fa/verify` - 2FA verificatie

#### 2.2 Shifts API
- [ ] `GET /api/shifts` - Lijst shifts (met filters)
- [ ] `GET /api/shifts/:id` - Shift details
- [ ] `POST /api/shifts` - Nieuwe shift
- [ ] `PUT /api/shifts/:id` - Update shift
- [ ] `DELETE /api/shifts/:id` - Verwijder shift
- [ ] `POST /api/shifts/bulk` - Bulk shift creation

#### 2.3 Planning API
- [ ] `GET /api/planning/week/:week/:year` - Week planning
- [ ] `GET /api/planning/month/:month/:year` - Maand planning
- [ ] `POST /api/planning/generate` - Auto-genereer planning
- [ ] `PUT /api/planning/:id/approve` - Goedkeuren planning
- [ ] `GET /api/planning/gaps` - Detecteer gaps in planning

#### 2.4 Availability API
- [ ] `GET /api/availability/:userId` - Beschikbaarheid ophalen
- [ ] `POST /api/availability` - Beschikbaarheid toevoegen
- [ ] `PUT /api/availability/:id` - Update beschikbaarheid
- [ ] `DELETE /api/availability/:id` - Verwijder beschikbaarheid

#### 2.5 Swap Requests API
- [ ] `GET /api/swaps` - Lijst swap requests
- [ ] `POST /api/swaps` - Nieuwe swap request
- [ ] `PUT /api/swaps/:id/approve` - Goedkeuren swap
- [ ] `PUT /api/swaps/:id/reject` - Afwijzen swap
- [ ] `DELETE /api/swaps/:id` - Annuleer swap

#### 2.6 Employees API
- [ ] `GET /api/employees` - Lijst medewerkers
- [ ] `GET /api/employees/:id` - Medewerker details
- [ ] `PUT /api/employees/:id` - Update medewerker
- [ ] `GET /api/employees/:id/stats` - Statistieken

#### 2.7 Audit API
- [ ] `GET /api/audit` - Audit logs (admin only)
- [ ] `GET /api/audit/:entityId` - Logs voor specifieke entity

**Output:** Werkende API endpoints met documentatie

---

### 3. Business Logic Implementation
**Verantwoordelijk:** Backend & Logic Manager (ACTIVE)

#### 3.1 Planning Algoritme
- [ ] Auto-genereer planning op basis van beschikbaarheid
- [ ] Detecteer conflicten (dubbele shifts)
- [ ] Detecteer gaps in coverage
- [ ] Balanceer shifts tussen medewerkers
- [ ] Respecteer max uren per week regels

#### 3.2 Validation Logic
- [ ] Shift overlap validatie
- [ ] Beschikbaarheid validatie
- [ ] Rol permissie validatie
- [ ] Max uren per week validatie

#### 3.3 Notification Logic
- [ ] Nieuwe shift toegewezen
- [ ] Swap request ontvangen
- [ ] Swap goedgekeurd/afgewezen
- [ ] Planning gepubliceerd
- [ ] Shift reminder (24h voor shift)

**Output:** Business logic modules

---

### 4. Security Implementation
**Verantwoordelijk:** Security Guardian (ACTIVE)  
**Support:** Backend & Logic Manager

- [ ] Implementeer RBAC (Role-Based Access Control)
  - Admin: Alles
  - Manager: Planning maken/wijzigen
  - Security Guard: Eigen shifts bekijken, swap requests
  - Read-only: Alleen bekijken
  
- [ ] Implementeer audit logging voor alle wijzigingen
- [ ] Setup rate limiting (API throttling)
- [ ] Implementeer CSRF protection
- [ ] Setup security headers (CORS, CSP, etc.)
- [ ] Implementeer 2FA met TOTP
- [ ] Data encryptie (gevoelige velden)

**Output:** Security middleware + RBAC systeem

---

### 5. Frontend Development (Web)
**Verantwoordelijk:** Frontend Builder (ACTIVE)  
**Advisory:** UX/UI Designer

#### 5.1 Core Pages (al deels gebouwd, te completeren)
- [ ] Dashboard (✅ componenten bestaan, integreer met API)
- [ ] Planning overzicht (✅ componenten bestaan, integreer met API)
- [ ] Shift management (✅ componenten bestaan, integreer met API)
- [ ] Beschikbaarheid beheer (✅ componenten bestaan, integreer met API)
- [ ] Swap requests (✅ componenten bestaan, integreer met API)
- [ ] Medewerker profiel
- [ ] Admin panel
- [ ] Settings

#### 5.2 API Integratie
- [ ] Setup React Query voor data fetching
- [ ] Implementeer API client met error handling
- [ ] Setup authentication state management
- [ ] Implementeer optimistic updates
- [ ] Setup caching strategie

#### 5.3 Real-time Updates
- [ ] Setup WebSocket connection (of polling)
- [ ] Real-time shift updates
- [ ] Real-time notifications
- [ ] Online/offline status

**Output:** Werkende web applicatie

---

### 6. Mobile App Development
**Verantwoordelijk:** Frontend Builder (ACTIVE)

- [ ] Implementeer API integratie
- [ ] Setup offline data storage (AsyncStorage)
- [ ] Implementeer push notifications (Expo Notifications)
- [ ] Setup sync mechanisme
- [ ] Implementeer biometric auth (optioneel)
- [ ] Test op iOS en Android

**Output:** Werkende mobile app (iOS + Android)

---

### 7. Testing tijdens Development
**Verantwoordelijk:** QA Tester (ADVISORY)

- [ ] Schrijf unit tests voor business logic
- [ ] Test API endpoints (Postman/Insomnia)
- [ ] Test edge cases
- [ ] Rapporteer bugs aan developers
- [ ] Verify fixes

**Output:** Bug reports + test cases

---

## Deliverables Phase 3

✅ Database met alle tabellen + migrations  
✅ Werkende backend API (alle endpoints)  
✅ Business logic (planning algoritme, validaties)  
✅ Security implementatie (RBAC, audit logs, 2FA)  
✅ Web applicatie (alle pagina's werkend)  
✅ Mobile applicatie (iOS + Android)  
✅ API documentatie  
✅ Initial test coverage

---

## Transition naar Phase 4

**Criteria om door te gaan:**
- [ ] Alle core features zijn gebouwd
- [ ] API endpoints werken en zijn gedocumenteerd
- [ ] Web app is functioneel
- [ ] Mobile app is functioneel
- [ ] Security features zijn geïmplementeerd
- [ ] Basis tests zijn geschreven
- [ ] Geen blocking bugs

**Volgende fase:** Phase 4 - Test & Optimalisatie
