# Guida Installazione Progetto (Nuovo PC)

Segui questi passi per lavorare al sito da un altro computer.

## 1. Scarica i programmi necessari
Assicurati di avere installati:
- **Node.js** (versione 18 o superiore): https://nodejs.org/
- **Git**: https://git-scm.com/
- **Visual Studio Code**: https://code.visualstudio.com/

## 2. Scarica il codice (Clone)
Apri il terminale (o PowerShell) e scrivi:

```bash
git clone https://github.com/simonsilvercaldaie/sito-caldaie.git
cd sito-caldaie
```

## 3. Installa le librerie
Sempre nel terminale, scrivi:

```bash
npm install
```

## 4. Configura le chiavi segrete
Il file con le chiavi segrete (`.env.local`) non viene salvato online per sicurezza.
Devi crearlo tu manualmente nella cartella del progetto.

1. Crea un nuovo file chiamato `.env.local`
2. Incolla dentro le chiavi che ti ho fornito in chat o che hai salvato dal vecchio PC.

## 5. Avvia il sito
Per vedere il sito mentre ci lavori:

```bash
npm run dev
```

Apri il browser su `http://localhost:3000`.
