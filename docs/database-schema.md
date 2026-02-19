# DutyGrid Database Schema Documentation

> **Note:** Dit schema is reverse-engineered uit de bestaande API code. Alle tabellen bestaan al in de Neon PostgreSQL database.

---

## Core Tables

### `employees`
Beveiligingsmedewerkers die ingepland kunnen worden.

```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  
  -- Persoonlijke informatie
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  home_address TEXT,
  
  -- Profielfoto & documenten
  profile_photo TEXT,
  passport_document TEXT,
  security_pass_document TEXT,
  
  -- CAO & Contract
  cao_type VARCHAR(100) NOT NULL,
  max_hours_per_week DECIMAL(5,2) NOT NULL,
  max_hours_per_day DECIMAL(5,2) NOT NULL,
  job_title VARCHAR(100),
  contract_type VARCHAR(50),
  pass_type VARCHAR(50) DEFAULT 'geen',
  
  -- Planning instellingen
  planning_visibility_weeks INTEGER DEFAULT 1,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_active ON employees(active);
CREATE INDEX idx_employees_cao_type ON employees(cao_type);
```

**Gebruikt in:**
- `/api/employees` - CRUD operations
- `/api/employees/[id]` - Detail view
- `/api/employees/availability-overview` - Beschikbaarheid overzicht

---

### `shifts`
Diensten/shifts die zijn ingepland.

```sql
CREATE TABLE shifts (
  id SERIAL PRIMARY KEY,
  
  -- Medewerker (NULL = open dienst)
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  
  -- Timing
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER DEFAULT 0,
  shift_type VARCHAR(50) DEFAULT 'dag', -- 'dag', 'nacht', 'evenement', 'object'
  
  -- Locatie
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
  
  -- Reiskosten
  travel_distance_km DECIMAL(6,2),
  travel_costs DECIMAL(8,2),
  
  -- Beschikbaarheid override
  availability_override_approved BOOLEAN DEFAULT FALSE,
  availability_override_note TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shifts_employee ON shifts(employee_id);
CREATE INDEX idx_shifts_date ON shifts(shift_date);
CREATE INDEX idx_shifts_assignment ON shifts(assignment_id);
CREATE INDEX idx_shifts_date_employee ON shifts(shift_date, employee_id);
```

**Business Rules:**
- Max uren per dag (uit employee.max_hours_per_day)
- Max uren per week (uit employee.max_hours_per_week)
- 12 uur rust tussen diensten verplicht
- Nachtdienst + ochtenddienst niet toegestaan

**Gebruikt in:**
- `/api/shifts` - CRUD operations met CAO validatie
- `/api/planning` - Planning overzicht
- `/api/planning-gaps` - Open diensten detectie

---

### `assignments`
Locaties/objecten waar beveiligingsmedewerkers werken.

```sql
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  
  -- Klant
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Locatie informatie
  location_name VARCHAR(200) NOT NULL,
  location_address TEXT NOT NULL,
  
  -- Metadata
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assignments_client ON assignments(client_id);
CREATE INDEX idx_assignments_active ON assignments(active);
```

**Gebruikt in:**
- `/api/assignments` - CRUD operations
- `/api/shifts` - Gekoppeld aan shifts voor locatie

---

### `clients`
Klanten waarvoor beveiligingsdiensten worden geleverd.

```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  
  -- Bedrijfsinformatie
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_active ON clients(active);
```

**Gebruikt in:**
- `/api/clients` - CRUD operations

---

### `cao_types`
CAO types voor beveiligingsmedewerkers.

```sql
CREATE TABLE cao_types (
  id SERIAL PRIMARY KEY,
  
  -- CAO informatie
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Regels
  max_hours_per_week_default DECIMAL(5,2),
  max_hours_per_day_default DECIMAL(5,2),
  min_rest_hours INTEGER DEFAULT 12,
  
  -- Metadata
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Standaard CAO's:**
- Beveiliging CAO (enige die we gebruiken)

**Gebruikt in:**
- `/api/cao-types` - CAO management
- `/api/employees` - CAO type selectie

---

## Availability System

### `availability_patterns`
Standaard beschikbaarheidspatronen per medewerker.

```sql
CREATE TABLE availability_patterns (
  id SERIAL PRIMARY KEY,
  
  -- Medewerker
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Patroon
  day_of_week INTEGER NOT NULL, -- 0=zondag, 1=maandag, etc.
  available BOOLEAN DEFAULT TRUE,
  start_time TIME,
  end_time TIME,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, day_of_week)
);

CREATE INDEX idx_availability_employee ON availability_patterns(employee_id);
```

**Gebruikt in:**
- `/api/availability/patterns` - Standaard beschikbaarheid
- `/api/availability/check` - Check beschikbaarheid voor shift

---

### `availability_exceptions`
Uitzonderingen op standaard beschikbaarheid (vrije dagen, extra beschikbaar, etc.).

```sql
CREATE TABLE availability_exceptions (
  id SERIAL PRIMARY KEY,
  
  -- Medewerker
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Datum
  exception_date DATE NOT NULL,
  
  -- Status
  available BOOLEAN NOT NULL,
  reason VARCHAR(200),
  start_time TIME,
  end_time TIME,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(employee_id, exception_date)
);

CREATE INDEX idx_availability_exceptions_employee ON availability_exceptions(employee_id);
CREATE INDEX idx_availability_exceptions_date ON availability_exceptions(exception_date);
```

**Gebruikt in:**
- `/api/availability/exceptions` - Uitzonderingen beheren
- `/api/availability/check` - Check beschikbaarheid

---

### `saved_availability_patterns`
Opgeslagen beschikbaarheidspatronen die hergebruikt kunnen worden.

```sql
CREATE TABLE saved_availability_patterns (
  id SERIAL PRIMARY KEY,
  
  -- Medewerker
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Patroon naam
  pattern_name VARCHAR(100) NOT NULL,
  
  -- Patroon data (JSON)
  pattern_data JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_saved_patterns_employee ON saved_availability_patterns(employee_id);
```

**Pattern data format:**
```json
{
  "monday": {"available": true, "start": "08:00", "end": "17:00"},
  "tuesday": {"available": true, "start": "08:00", "end": "17:00"},
  "wednesday": {"available": false},
  ...
}
```

**Gebruikt in:**
- `/api/availability/saved-patterns` - Opgeslagen patronen

---

## Shift Swaps

### `shift_swaps`
Ruilvragen voor diensten.

```sql
CREATE TABLE shift_swaps (
  id SERIAL PRIMARY KEY,
  
  -- Shifts
  shift_id INTEGER REFERENCES shifts(id) ON DELETE CASCADE,
  requesting_employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  target_employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  
  -- Reden & notities
  reason TEXT,
  admin_notes TEXT,
  
  -- Goedkeuring
  approved_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shift_swaps_shift ON shift_swaps(shift_id);
CREATE INDEX idx_shift_swaps_requesting ON shift_swaps(requesting_employee_id);
CREATE INDEX idx_shift_swaps_target ON shift_swaps(target_employee_id);
CREATE INDEX idx_shift_swaps_status ON shift_swaps(status);
```

**Gebruikt in:**
- `/api/shift-swaps` - Ruilvragen beheren
- `/api/shift-swaps/suggestions/[shift_id]` - Suggesties voor ruil

---

## Authentication & Authorization

### `auth_users`
Gebruikers accounts (Auth.js compatible).

```sql
CREATE TABLE auth_users (
  id TEXT PRIMARY KEY,
  
  -- Credentials
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMP,
  password_hash TEXT, -- Argon2 hash
  
  -- Metadata
  name VARCHAR(200),
  image TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auth_users_email ON auth_users(email);
```

**Gebruikt in:**
- `/api/auth/*` - Authentication endpoints
- `src/auth.js` - Auth.js adapter

---

### `auth_accounts`
OAuth accounts (voor toekomstige OAuth integratie).

```sql
CREATE TABLE auth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Provider info
  type VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_account_id TEXT NOT NULL,
  
  -- Tokens
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  
  UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_auth_accounts_user ON auth_accounts(user_id);
```

---

### `auth_sessions`
Actieve sessies.

```sql
CREATE TABLE auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(session_token);
```

---

### `user_roles`
Rollen en rechten per gebruiker.

```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  
  -- User
  user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Role
  role VARCHAR(50) NOT NULL, -- 'beveiliger', 'planner', 'admin'
  
  -- Gekoppelde medewerker (voor beveiligingsmedewerkers)
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_employee ON user_roles(employee_id);
```

**Roles:**
- `beveiliger` - Ziet alleen eigen planning
- `planner` - Kan planning maken voor team
- `admin` - Volledige toegang

**Gebruikt in:**
- Alle API endpoints voor role-based filtering
- `/api/user-role` - Role management

---

## Summary

**Totaal aantal tabellen:** 14

**Core entities:**
- employees (medewerkers)
- shifts (diensten)
- assignments (locaties)
- clients (klanten)
- cao_types (CAO regels)

**Availability:**
- availability_patterns (standaard beschikbaarheid)
- availability_exceptions (uitzonderingen)
- saved_availability_patterns (opgeslagen patronen)

**Shift management:**
- shift_swaps (ruilvragen)

**Authentication:**
- auth_users (gebruikers)
- auth_accounts (OAuth accounts)
- auth_sessions (sessies)
- user_roles (rollen & rechten)

---

## Next Steps (Week 1)

Nu we het schema kennen, gaan we toevoegen:

1. **audit_logs** - Track alle wijzigingen
2. **2FA fields** - Two-factor authentication
3. **Enhanced RBAC fields** - Extra rechten per rol
4. **Notifications** - Notificatie systeem
5. **Document expiry** - Verloopdatums tracking

Zie `implementation_plan.md` voor details.
