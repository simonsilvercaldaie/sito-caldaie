# Rilascio Sistema Pagamenti PayPal

## Panoramica

Il sistema di pagamenti è controllato da variabili d'ambiente. Può essere abilitato/disabilitato in 10 secondi senza modifiche al codice.

---

## Variabili d'Ambiente

### Sandbox (Test)

```bash
# .env.local o Vercel Environment Variables
NEXT_PUBLIC_PAYMENTS_ENABLED=true
NEXT_PUBLIC_PAYPAL_ENV=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<sandbox_client_id>

# Solo server (mai NEXT_PUBLIC_)
PAYPAL_CLIENT_ID=<sandbox_client_id>
PAYPAL_CLIENT_SECRET=<sandbox_secret>
```

### Live (Produzione)

```bash
NEXT_PUBLIC_PAYMENTS_ENABLED=true
NEXT_PUBLIC_PAYPAL_ENV=live
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<live_client_id>

PAYPAL_CLIENT_ID=<live_client_id>
PAYPAL_CLIENT_SECRET=<live_secret>
```

### Pagamenti Disabilitati (Fallback)

```bash
NEXT_PUBLIC_PAYMENTS_ENABLED=false
# Le altre variabili possono restare, saranno ignorate
```

---

## Come Bloccare i Pagamenti in 10 Secondi

1. Vai su **Vercel Dashboard** → tuo progetto → **Settings** → **Environment Variables**
2. Modifica `NEXT_PUBLIC_PAYMENTS_ENABLED` da `true` a `false`
3. Clicca **Save**
4. Vai su **Deployments** → clicca **Redeploy** sul deploy attivo
5. Attendi ~30 secondi

**Risultato:** UI mostra "Pagamenti temporaneamente non disponibili", API ritorna 503.

---

## Sequenza Test Pre-Rilascio (5 passi)

| # | Passo | Verifica |
|---|-------|----------|
| 1 | Imposta ENV sandbox, `npm run dev` | Server parte senza errori |
| 2 | Login, vai su `/corso/[qualsiasi]`, spunta ToS | Checkbox funziona, record in `tos_acceptances` |
| 3 | Clicca PayPal, paga con buyer sandbox | Popup si chiude, alert "Complimenti" |
| 4 | Controlla Supabase `purchases` | Record con `paypal_order_id` popolato |
| 5 | Ricarica pagina, riprova acquisto stesso corso | Mostra "Pacchetto Attivo" (no doppio addebito) |

---

## Controlli Supabase

### Tabella `tos_acceptances`

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → auth.users |
| `tos_version` | TEXT | Es: `2026-01-18-v1` |
| `accepted_at` | TIMESTAMPTZ | Data accettazione |
| `ip_address` | TEXT | IP utente |
| `user_agent` | TEXT | Browser/device |

**RLS:** INSERT/SELECT permessi, UPDATE/DELETE negati.

### Tabella `purchases`

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → auth.users |
| `course_id` | TEXT | Titolo corso |
| `amount` | NUMERIC | Importo pagato |
| `paypal_order_id` | TEXT | ID ordine PayPal (UNIQUE) |
| `created_at` | TIMESTAMPTZ | Data acquisto |

**Indice UNIQUE:** `paypal_order_id` (idempotenza)

---

## Checklist "OK per Live"

- [ ] SQL `supabase_tos_acceptances.sql` eseguito
- [ ] SQL `supabase_purchases_migration.sql` eseguito
- [ ] ENV live configurate su Vercel
- [ ] Test acquisto sandbox completato
- [ ] Verificato record in `purchases` con `paypal_order_id`
- [ ] Testato toggle PAYMENTS_ENABLED=false (blocca UI e API)
- [ ] Account PayPal Business verificato e attivo
- [ ] Webhook PayPal configurati (opzionale, per ricevute)

---

## Troubleshooting

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| PayPal non si apre | Client ID errato | Verifica ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID |
| 503 PAYMENTS_DISABLED | ENV false | Imposta NEXT_PUBLIC_PAYMENTS_ENABLED=true |
| 402 PAYMENT_VERIFICATION_FAILED | Ordine non completato o importo errato | Controlla console server per dettagli |
| 403 TOS_NOT_ACCEPTED | Utente non ha spuntato ToS | Verifica `tos_acceptances` |
| 401 NO_SESSION_COOKIE | Non loggato | L'utente deve fare login |

---

## Contatti Emergenza

In caso di problemi critici:
1. Blocca pagamenti (toggle ENV)
2. Controlla logs Vercel
3. Verifica transazioni su PayPal Dashboard
