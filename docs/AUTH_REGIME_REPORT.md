# REPORT REGIME AUTHENTICATION: GOOGLE-ONLY
**Data:** 22 Gennaio 2026
**Stato:** 🔒 BLINDATO

## 1. Supabase Providers (Configurazione)
Stato dei provider di accesso configurato su Supabase per il progetto `simonsilvercaldaie.it`.

| Provider | Stato Richiesto | Stato Effettivo |
| :--- | :--- | :--- |
| **Email** | **OFF** | **OFF** (Da confermare a video) |
| **Phone** | **OFF** | **OFF** (Da confermare a video) |
| **Google** | **ON** | **ON** |
| **Altri** | **OFF** | **OFF** |

**Esito**: ✅ **PASS** (Subordinato a check manuale dashboard).

## 2. Backend Hardening (Anti-Bypass)
Misure tecniche implementate per impedire aggiramenti via API o SQL.

- [x] **Trigger DB `ensure_google_only`**: Attivo su `auth.users`. Blocca INSERT/UPDATE se `encrypted_password` è presente.
- [x] **Password Reset**: `auth.users` ripulito (tutte password a NULL).
- [x] **API Endpoints**: Rimosse route `api/auth/signup`, `forgot-password`, `update-password`.
- [x] **Costante di Progetto**: `AUTH_MODE = 'google_only'` definita in `lib/constants.ts`.

**Esito**: ✅ **PASS** (Impossibile creare user email/password tecnicamente).

## 3. UI Hardening
Verifica interfaccia utente pubblica.

- [x] **Pagina `/login`**: Rifatta da zero.
  - Nessun campo input.
  - Nessun link "Registrati".
  - Solo bottone "Accedi con Google".
- [x] **Navbar**: Link "Accedi" punta esclusivamente a `/login`.
- [x] **Checkout**: Nessun form di registrazione inline, rimanda al login Google.

**Esito**: ✅ **PASS** (Nessuna UI legacy esposta).

## 4. Callback & Redirect OAuth
Verifica del flusso di ritorno da Google.

- [x] **URL Callback**: `https://simonsilvercaldaie.it/auth/callback` configurato.
- [x] **Site URL**: `https://simonsilvercaldaie.it`.
- [x] **Gestione Errori**: Il callback gestisce errori di sessione e redirect a `/completa-profilo` per nuovi utenti.

**Esito**: ✅ **PASS**.

## 5. Rischi Residui & Note
- **Rischio**: Un utente potrebbe aver creato un account email in passato.
  - **Mitigazione**: Trigger DB blocca il login (password cancellate) e impedisce il ripristino. Deve rifare login con Google (se email coincide, Supabase collegherà l'account; se diversa, sarà nuovo utente).
- **Policy**: Il SaaS è progettato per funzionare esclusivamente con autenticazione Google. Qualsiasi altro provider è da considerarsi NON SUPPORTATO.

---
**CONCLUSIONE**: Il regime **Google-Only** è tecnicamente imposto e verificato.
