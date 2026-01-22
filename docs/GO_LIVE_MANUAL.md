# MANUALE GO LIVE & OPERATIVITÀ

## 1. CHECKLIST PRODUZIONE (Supabase & Vercel)

Da eseguire prima del lancio ufficiale. Tempo stimato: 10 minuti.

### A. SUPABASE (Database & Auth)

1.  **Migration Check**:
    *   Vai su **SQL Editor**.
    *   Verifica che la tabella `profiles` abbia la colonna `last_device_reset_at`.
    *   Verifica che la tabella `active_sessions` abbia il vincolo `UNIQUE(user_id)`.
    *   *Se mancano, esegui `full_hardening_migration.sql`.*

2.  **Auth Providers**:
    *   Vai su **Authentication > Providers**.
    *   **Google**: [ENABLED] (Verifica Client ID / Secret).
    *   **Email**: [DISABLED] (Importante: deve essere spento).
    *   **Phone**: [DISABLED].

3.  **URL Configuration**:
    *   Vai su **Authentication > URL Configuration**.
    *   **Site URL**: `https://simonsilvercaldaie.it` (Produzione).
    *   **Redirect URLs**:
        *   `https://simonsilvercaldaie.it/auth/callback`
        *   `http://localhost:3000/auth/callback` (per test locale).

4.  **Email Templates** (Opzionale ma raccomandato):
    *   Vai su **Authentication > Email Templates**.
    *   Verifica che il template "Confirm Signup" non serva (dato che Email è disabilitato), ma "Magic Link" o altri siano coerenti se usati (Google non ne usa).

### B. VERCEL (Hosting)

1.  **Environment Variables**:
    *   Vai su **Settings > Environment Variables**.
    *   Verifica presenza di:
        *   `NEXT_PUBLIC_SUPABASE_URL`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        *   `SUPABASE_SERVICE_ROLE_KEY`
        *   `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (Live)
        *   `PAYPAL_CLIENT_ID` (Live)
        *   `PAYPAL_CLIENT_SECRET` (Live)
        *   `NEXT_PUBLIC_PAYMENTS_ENABLED=true`
        *   `INVOICE_NOTIFICATION_EMAIL=fatture@simonsilvercaldaie.it`
        *   `ADMIN_EMAILS=simonsilver@tiscali.it` (Per pannello admin, vedi punto 4).

2.  **Deploy**:
    *   Assicurati che l'ultimo commit sia deployato su **Production**.

---

### 🛑 3 Errori Comuni da Controllare
| Errore | Sintomo | Soluzione |
| :--- | :--- | :--- |
| **Redirect Mismatch** | Dopo login Google appare errore `invalid_grant` o redirect loop. | Correggi Site URL/Redirect URLs in Supabase. |
| **Auth Password Attiva** | Appare form email/password o bot si registrano. | Disabilita Provider Email in Supabase. |
| **Pagamenti Sandbox** | PayPal non accetta carte reali o non addebita. | Cambia ENV `PAYPAL_ENV` a `live` e usa credenziali Live. |

---

## 2. SCRIPT COLLAUDO END-TO-END

Esegui questi test come se fossi un utente cliente.

### SCENARIO 1: Licenza Personale (Privato)

1.  **Login**:
    *   Vai su `/login`. Clicca "Accedi con Google".
    *   Usa un account Gmail personale (es. `test.user@gmail.com`).
    *   *Atteso*: Redirect a `/completa-profilo` (se primo accesso).

2.  **Profilazione**:
    *   Seleziona "Privato". Compila Nome, Cognome, CF, Indirizzo.
    *   Clicca "Salva".
    *   *Atteso*: Redirect alla Home.

3.  **Acquisto**:
    *   Vai su un corso (es. Base). Clicca box acquisto.
    *   Spunta Checkbox "Dichiaro di aver letto...".
    *   Paga con PayPal (o carta test se sandbox).
    *   *Atteso*: "Pagamento Riuscito", redirect a `/ordine/[id]`.

4.  **Accesso Contenuti**:
    *   Vai su `/watch/[courseId]`.
    *   *Atteso*: Video visibile. Filigrana con tua email che si muove.

5.  **Sicurezza Sessione**:
    *   Resta loggato sul **Dispositivo A**.
    *   Apri **Dispositivo B** (o Finestra Incognito). Fai Login.
    *   Torna su **Dispositivo A** e ricarica pagina.
    *   *Atteso*: Dispositivo A viene disconnesso (login richiesto).

6.  **Limite Dispositivi**:
    *   Hai loggato con A e B (totale 2).
    *   Prova Login con **Dispositivo C** (o altro browser).
    *   *Atteso*: Errore "Limite dispositivi raggiunto".

### SCENARIO 2: Licenza Azienda (P.IVA)

1.  **Login**:
    *   Usa un *altro* account Google (es. `test.company@gmail.com`).

2.  **Profilazione**:
    *   Seleziona "Azienda".
    *   Compila Ragione Sociale e **Partita IVA**.
    *   Clicca "Salva".

3.  **Acquisto**:
    *   Acquista corso. Paga.
    *   *Atteso*: Successo.

4.  **Verifica Dati (Admin)**:
    *   Controlla email su `fatture@simonsilvercaldaie.it`.
    *   *Atteso*: Email ricevuta con Oggetto "NUOVA FATTURA DA EMETTERE" e dati P.IVA corretti nel corpo.

---

## 3. MONITORAGGIO ABUSI (Interpretare i dati)

Usa la pagina `/admin` (da creare) per controllare settimanalmente:

*   **Sessioni Invalidate Elevate**: Se un utente ha > 10 invalidazioni/settimana, probabilmente condivide l'account con molte persone che provano ad accedere contemporaneamente. -> **Candidato per warning.**
*   **Blocchi Dispositivo**: Se un utente ha frequenti blocchi "Limite raggiunto", sta provando ad accedere da troppi device diversi. -> **Candidato per warning.**
*   **Reset Frequenti**: Il reset è 1/mese. Se tentano spesso, è sospetto.
