# SCRIPT VIDEO PREMIUM - Scheda Elettronica
## Durata: 50-60 minuti | ~7000 parole

---

## IMPOSTAZIONI TELEPROMPTER
- Velocità: 120 parole/minuto
- Font: 40pt bianco su nero
- [PAUSA] = respiro 2 secondi
- [PAUSA LUNGA] = 4 secondi
- **GRASSETTO** = enfatizzare
- [IMMAGINE: descrizione] = grafica
- [DEMO: descrizione] = parte pratica

---

# INTRO (2 minuti)

Benvenuto nel video tecnico completo sulla scheda elettronica. [PAUSA]

Sono Simone.
Questo è un video **per professionisti**. [PAUSA]

La scheda è il componente più costoso.
E quello più spesso accusato ingiustamente. [PAUSA]

Vedrai:
- Come testare i sensori NTC
- Come verificare le uscite
- Come interpretare i codici errore
- E come configurare una scheda nuova [PAUSA]

Queste competenze ti fanno risparmiare
e ti rendono credibile col cliente. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 1: TEORIA AVANZATA (12 minuti)

## 1.1 Architettura della Scheda

[IMMAGINE: Schema a blocchi scheda caldaia]

Una scheda caldaia ha diverse sezioni:

**Alimentatore**: converte 230V AC in bassa tensione.
Tipicamente 5V e 24V per la logica e i relè. [PAUSA]

**Microprocessore**: esegue il firmware.
Legge i sensori, decide, comanda le uscite. [PAUSA]

**Sezione di ingresso**: riceve i segnali.
- Sensori NTC per le temperature
- Contatti on/off (pressostato, termostato)
- Sonda ionizzazione [PAUSA]

**Sezione di uscita**: comanda i componenti.
- Relè per valvola gas
- Driver PWM per circolatore e ventilatore
- Trasformatore accensione [PAUSA]

[IMMAGINE: Foto scheda con zone evidenziate]

Capire le zone ti aiuta nella diagnosi.
Se un'uscita non funziona...
guardi quella sezione. [PAUSA]

---

## 1.2 Sensori NTC

[IMMAGINE: Sonda NTC con grafico curva]

I sensori di temperatura sono **NTC**.
Negative Temperature Coefficient. [PAUSA]

La resistenza **diminuisce** quando la temperatura **aumenta**. [PAUSA]

Valori tipici:
- A 20°C: circa 10.000 ohm (10k)
- A 40°C: circa 5.000 ohm
- A 60°C: circa 2.500 ohm
- A 80°C: circa 1.300 ohm [PAUSA]

[IMMAGINE: Tabella temperatura/resistenza NTC]

Se la sonda è guasta:
- Resistenza infinita = circuito aperto
- Resistenza zero = corto circuito
- Resistenza fissa = bloccata [PAUSA]

La scheda interpreta questi valori anomali
come errori specifici. [PAUSA]

---

## 1.3 Comunicazione e Protocolli

[IMMAGINE: Connettore bus caldaia]

Molte caldaie moderne hanno un **bus digitale**. [PAUSA]

Permette la comunicazione con:
- Termostati intelligenti
- Moduli zona
- Pannelli remoti
- Connettività Internet (WiFi) [PAUSA]

Protocolli comuni:
- **eBUS**: Vaillant, alcune Ariston
- **OpenTherm**: standard aperto
- **Proprietari**: ogni marca il suo [PAUSA]

Se il bus non comunica:
- Verifica cablaggi
- Verifica compatibilità dispositivi
- Reset dei dispositivi connessi [PAUSA]

---

## 1.4 Configurazione e Parametri

[IMMAGINE: Menu service caldaia]

Le schede moderne sono **configurabili**. [PAUSA]

Dal menu service puoi:
- Impostare la potenza massima
- Configurare il tipo di gas
- Attivare o disattivare funzioni
- Leggere lo storico errori [PAUSA]

Per accedere al menu service
serve di solito una combinazione di tasti.
Consulta il manuale del modello. [PAUSA]

Quando cambi una scheda...
devi spesso **riconfigurare** i parametri.
Altrimenti la caldaia non funziona correttamente. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 2: DIAGNOSI COMPLETA (18 minuti)

## 2.1 Strumenti Necessari

[IMMAGINE: Kit diagnosi scheda]

**Numero uno**: Multimetro digitale.
Per tensioni, resistenze, continuità. [PAUSA]

**Numero due**: Schema elettrico della caldaia.
Fondamentale per trovare i morsetti. [PAUSA]

**Numero tre**: Pinza amperometrica.
Per verificare se le uscite comandano. [PAUSA]

**Numero quattro**: Manuale service.
Per i codici errore e i parametri. [PAUSA]

---

## 2.2 Test 1: Verifica Alimentazione Scheda

[DEMO: Misurazione tensione ingresso scheda]

La scheda riceve corrente? [PAUSA]

Trova i morsetti di ingresso alimentazione.
Di solito L e N (fase e neutro).
Misura: devi leggere 230V AC. [PAUSA]

Se leggi 0V:
- Interruttore caldaia spento
- Fusibile quadro bruciato
- Cavo alimentazione interrotto [PAUSA]

[IMMAGINE: Morsetti alimentazione scheda]

Se c'è tensione ma la scheda è morta:
- Fusibile interno bruciato
- Alimentatore scheda guasto [PAUSA]

---

## 2.3 Test 2: Verifica Fusibile

[DEMO: Controllo fusibile su scheda]

Trova il fusibile sulla scheda.
È spesso vicino all'ingresso. [PAUSA]

Estrai e controlla visivamente.
Se il filo interno è interrotto: bruciato. [PAUSA]

Test con multimetro in continuità:
- Continuità = ok
- Nessuna continuità = bruciato [PAUSA]

[IMMAGINE: Fusibile buono vs bruciato]

Attenzione: se il fusibile brucia...
c'è stato un **corto circuito** da qualche parte.
Non limitarti a cambiare il fusibile.
Cerca la causa. [PAUSA]

Cause comuni:
- Corto su un'uscita (valvola, circolatore)
- Acqua entrata nella scheda
- Componente che è andato in corto [PAUSA]

---

## 2.4 Test 3: Verifica Sensori NTC

[DEMO: Misurazione resistenza sonda NTC]

I sensori sono spesso il vero colpevole. [PAUSA]

Procedura:
1. Scollega la sonda dalla scheda
2. Misura la resistenza con il multimetro
3. Confronta con la tabella [PAUSA]

[IMMAGINE: Multimetro su sonda NTC]

A temperatura ambiente (20°C):
dovrebbe essere circa 10.000 ohm. [PAUSA]

Se leggi:
- Infinito (OL): sonda aperta, guasta
- Zero: sonda in corto, guasta
- Valore fisso anche scaldandola: bloccata [PAUSA]

Se la sonda è ok ma l'errore persiste...
il problema è l'ingresso sulla scheda. [PAUSA]

---

## 2.5 Test 4: Verifica Uscite

[DEMO: Misurazione tensione uscita valvola gas]

Le uscite comandano? [PAUSA]

Esempio: uscita valvola gas.
Quando la scheda la comanda...
devi misurare tensione sui morsetti della valvola. [PAUSA]

Se la scheda è in richiesta accensione
e sui morsetti valvola non c'è tensione:
l'uscita è guasta. [PAUSA]

Stessa logica per:
- Circolatore
- Ventilatore (o segnale PWM)
- Trasformatore accensione [PAUSA]

[IMMAGINE: Schema uscite tipiche]

Se un'uscita specifica è morta
ma le altre funzionano:
il relè o il driver di quella uscita è guasto. [PAUSA]

---

## 2.6 Test 5: Lettura Storico Errori

[DEMO: Accesso menu errori]

Le schede moderne memorizzano gli errori. [PAUSA]

Accedi al menu service.
Cerca "storico errori" o "error log". [PAUSA]

Vedrai una lista degli ultimi errori
con data/ora o contatore. [PAUSA]

[IMMAGINE: Display con storico errori]

Questo ti dice:
- L'errore è sempre lo stesso?
- Ci sono pattern?
- Quando è iniziato? [PAUSA]

Informazioni preziose per la diagnosi. [PAUSA]

---

## 2.7 Test 6: Verifica Bus e Comunicazione

[DEMO: Controllo bus con termostato]

Se la caldaia non comunica col termostato...
può sembrare colpa della scheda. [PAUSA]

Prima verifica:
- Il cablaggio è corretto
- Il termostato è compatibile
- I parametri bus sono configurati [PAUSA]

Test: scollega il bus.
Collega un termostato semplice ON/OFF.
Funziona? [PAUSA]

Se il termostato semplice funziona:
il problema è nel bus o nel termostato smart.
Non nella scheda. [PAUSA]

---

## 2.8 Codici Errore per Marca

[IMMAGINE: Tabella errori multi-marca]

Errori comuni e loro significato:

**Vaillant**:
- F22: pressione troppo bassa
- F28: mancata accensione
- F75: sensore pressione acqua [PAUSA]

**Ariston**:
- 501: mancata rilevazione fiamma
- 108: pressione insufficiente
- 103: sovratemperatura [PAUSA]

**Immergas**:
- 01: blocco accensione
- 10: bassa pressione
- 31: scheda bloccata [PAUSA]

**Beretta**:
- A01: pressione bassa
- A03: mancata accensione
- A06: sovratemperatura [PAUSA]

[IMMAGINE: QR code database errori]

Tieni sempre il manuale a portata di mano.
O usa app con database errori. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 3: SOSTITUZIONE E CONFIGURAZIONE (12 minuti)

## 3.1 Quando Sostituire

[IMMAGINE: Decision tree sostituzione scheda]

Sostituisci se:
- Uscita specifica morta (relè bruciato)
- Alimentatore interno guasto
- Display morto ma alimentazione ok
- Errori che non corrispondono a nulla [PAUSA]

Non sostituire se:
- Sensori guasti (cambia i sensori)
- Fusibile bruciabile + causa nota
- Problema di configurazione [PAUSA]

---

## 3.2 Scelta del Ricambio

[IMMAGINE: Schede diverse per stesso modello]

Attenzione: le schede non sono sempre uguali
anche per lo stesso modello di caldaia. [PAUSA]

Verifica:
- Codice esatto della scheda
- Versione firmware se applicabile
- Anno di produzione [PAUSA]

Alcune schede sono retro-compatibili.
Altre no.
Consulta il ricambista. [PAUSA]

---

## 3.3 Procedura Sostituzione

[DEMO: Cambio scheda passo-passo]

**Passo 1**: Togli corrente. [PAUSA]
**Passo 2**: Fotografa tutti i collegamenti.
Prima di scollegare qualsiasi cosa. [PAUSA]
**Passo 3**: Scollega i connettori uno a uno.
Annotando la posizione. [PAUSA]
**Passo 4**: Svita la scheda dal supporto. [PAUSA]
**Passo 5**: Monta la scheda nuova. [PAUSA]
**Passo 6**: Ricollega i connettori.
Riferendoti alle foto. [PAUSA]
**Passo 7**: Riattacca la corrente. [PAUSA]
**Passo 8**: Configura i parametri. [PAUSA]

[IMMAGINE: Scheda nuova montata]

---

## 3.4 Configurazione Post-Sostituzione

[DEMO: Menu configurazione caldaia]

La scheda nuova arriva con parametri di fabbrica. [PAUSA]

Devi configurare:
- Tipo di gas (metano/GPL)
- Potenza minima e massima
- Tipo di impianto (solo riscaldamento, con bollitore...)
- Opzioni regionali [PAUSA]

Accedi al menu service.
Imposta i parametri secondo il manuale.
Salva. [PAUSA]

Alcune schede richiedono un codice di sblocco
o una procedura di inizializzazione. [PAUSA]

---

## 3.5 Trasferimento Parametri (se possibile)

[DEMO: Backup/restore parametri]

In alcuni modelli puoi trasferire i parametri
dalla scheda vecchia alla nuova. [PAUSA]

Servono:
- Software diagnostico del produttore
- Cavo interfaccia [PAUSA]

Collega al PC.
Leggi i parametri dalla vecchia scheda.
Scrivi sulla nuova. [PAUSA]

Non tutti i modelli lo permettono.
Ma quando è possibile, risparmia tempo. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 4: CASI REALI (8 minuti)

## Caso 1: Il Fusibile Che Bruciava

[IMMAGINE: Fusibile e condensatore]

Caldaia morta. Fusibile bruciato.
Il tecnico precedente: cambia il fusibile.
Brucia di nuovo il giorno dopo. [PAUSA]

Arrivo io.
Cerco la causa del corto.
Trovo: condensatore in uscita pompa in corto. [PAUSA]

Cambio il condensatore.
Cambio il fusibile.
Problema risolto. [PAUSA]

Lezione: se il fusibile brucia, c'è una causa.
Trovala prima di rimettere il fusibile. [PAUSA]

---

## Caso 2: L'Errore Fantasma

[IMMAGINE: Connettore ossidato]

Caldaia con errori casuali.
Un giorno F75, un giorno F22.
Sembrava la scheda impazzita. [PAUSA]

Controllo tutti i connettori.
Ne trovo uno con ossidazione.
Collegamento del sensore di pressione. [PAUSA]

Pulisco il connettore.
Applico spray protettivo.
Errori spariti. [PAUSA]

Lezione: i connettori ossidati
causano errori intermittenti assurdi.
Controllali sempre. [PAUSA]

---

## Caso 3: La Scheda Non Configurata

[IMMAGINE: Menu parametri caldaia]

Tecnico sostituisce la scheda.
La caldaia parte ma funziona male.
Fiamma troppo alta, consumi eccessivi. [PAUSA]

Controllo: scheda impostata per 35kW.
Ma la caldaia è da 24kW. [PAUSA]

I parametri di fabbrica erano sbagliati
per quel modello specifico. [PAUSA]

Riconfiguro correttamente.
Tutto torna normale. [PAUSA]

Lezione: dopo la sostituzione
**sempre** configurare i parametri. [PAUSA]

[PAUSA LUNGA]

---

# CHIUSURA (3 minuti)

Ricapitolando. [PAUSA]

La scheda elettronica è il cervello.
Costosa e spesso accusata ingiustamente. [PAUSA]

Prima di cambiarla:
1. Verifica fusibile
2. Verifica alimentazione
3. Testa i sensori NTC
4. Testa le uscite
5. Controlla i connettori [PAUSA]

Dopo la sostituzione:
- Ricollega tutto correttamente
- Configura i parametri
- Verifica il funzionamento [PAUSA]

Hai domande?
info@simonsilvercaldaie punto it. [PAUSA]

Prossimo video: **scambiatore secondario**.
Ci vediamo. [PAUSA]

[IMMAGINE: Logo + prossimo video]

---

# MATERIALI BONUS

## PDF Tabella Resistenze NTC
(Curva temperatura/ohm standard)

## Database Codici Errore Multi-Marca
(PDF consultabile)

## Checklist Sostituzione Scheda
(Da stampare)

---

## FINE SCRIPT PREMIUM

**Durata stimata**: 55-60 minuti
**Parole totali**: ~6700
**Velocità lettura**: 120 parole/min
