# Database Migrations - How to Run

## Wat zijn migrations?

Migrations zijn SQL bestanden die de database schema updaten. Ze zitten in de `migrations/` folder.

---

## Hoe run je een migration?

### Optie 1: Via de App (Aanbevolen)

**Stap 1:** Zorg dat je ingelogd bent als **admin**

**Stap 2:** Open je browser console (F12)

**Stap 3:** Run dit JavaScript:

```javascript
// Run migration
fetch('/api/migrations/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ migration: '001_week1_security' })
})
.then(r => r.json())
.then(data => {
  console.log('Migration result:', data);
  if (data.success) {
    console.log('✅ Migration successful!');
  } else {
    console.log('⚠️ Migration had errors:', data.errorCount);
  }
});
```

**Stap 4:** Check de console output

---

### Optie 2: Via cURL (Terminal)

```bash
# Eerst inloggen en session cookie krijgen, dan:
curl -X POST http://localhost:3000/api/migrations/run \
  -H "Content-Type: application/json" \
  -d '{"migration": "001_week1_security"}' \
  --cookie "your-session-cookie"
```

---

### Optie 3: Handmatig in Neon Dashboard

Als de app methode niet werkt:

1. Ga naar [Neon Dashboard](https://console.neon.tech)
2. Selecteer je DutyGrid project
3. Ga naar "SQL Editor"
4. Copy-paste de inhoud van `migrations/001_week1_security.sql`
5. Klik "Run"

---

## Beschikbare Migrations

### 001_week1_security.sql

**Wat doet het:**
- Maakt `audit_logs` tabel aan
- Maakt `two_factor_attempts` tabel aan
- Maakt `rate_limit_violations` tabel aan
- Maakt `system_settings` tabel aan
- Voegt 2FA velden toe aan `auth_users`
- Voegt RBAC velden toe aan `user_roles`
- Voegt permission velden toe aan `employees`

**Veilig om te runnen:**
- ✅ Ja, gebruikt `CREATE TABLE IF NOT EXISTS`
- ✅ Ja, gebruikt `ALTER TABLE ADD COLUMN IF NOT EXISTS` (waar mogelijk)
- ⚠️ Sommige statements kunnen falen als kolommen al bestaan (dat is OK)

---

## Check of migration succesvol was

Run dit in de browser console:

```javascript
// Check welke tabellen er zijn
fetch('/api/migrations/run')
  .then(r => r.json())
  .then(data => console.log('Available migrations:', data));

// Of check direct in de database
fetch('/api/audit')
  .then(r => r.json())
  .then(data => {
    if (data.logs) {
      console.log('✅ Audit logs table exists!');
    }
  })
  .catch(err => {
    console.log('❌ Audit logs table not found');
  });
```

---

## Troubleshooting

### Error: "Migration file not found"

De migrations folder staat niet op de juiste plek. Check of:
- `migrations/001_week1_security.sql` bestaat
- Het pad klopt in de migration runner

### Error: "relation already exists"

Dit is OK! Het betekent dat de tabel al bestaat. De migration skipt deze statement en gaat verder.

### Error: "column already exists"

Ook OK! De kolom bestaat al. Dit kan gebeuren als je de migration meerdere keren runt.

---

## Volgende Stappen

Na het runnen van `001_week1_security.sql`:

1. ✅ Audit logging werkt
2. ✅ 2FA velden zijn toegevoegd
3. ✅ RBAC velden zijn toegevoegd
4. ✅ System settings tabel bestaat

Dan kunnen we verder met:
- Audit logging integreren in endpoints
- 2FA implementatie
- Rate limiting
