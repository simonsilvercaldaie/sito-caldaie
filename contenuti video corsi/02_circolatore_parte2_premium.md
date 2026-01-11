# SCRIPT VIDEO PARTE 2 - Circolatore (Pompa)
## Video PREMIUM A PAGAMENTO | Durata: 40-45 minuti | ~5000 parole

---

## IMPOSTAZIONI TELEPROMPTER
- Velocità: 120 parole/minuto
- Font: 40pt bianco su nero
- [PAUSA] = respiro 2 secondi
- [PAUSA LUNGA] = 4 secondi, cambio argomento
- **GRASSETTO** = enfatizzare
- [IMMAGINE: descrizione] = grafica/video
- [DEMO: descrizione] = parte pratica da filmare

---

# INTRO (2 minuti)

Bentornato. [PAUSA]

Questa è la **Parte 2** sul circolatore.
Il video completo per tecnici professionisti. [PAUSA]

Se hai visto la Parte 1 su YouTube...
sai già cos'è un circolatore, i sintomi base,
e il trucco dello sblocco manuale. [PAUSA]

Ora andiamo **in profondità**. [PAUSA]

In questo video vedrai:
- Come testare elettricamente il circolatore
- Diagnosi completa del segnale PWM
- Procedura di sostituzione passo-passo
- Sfogo aria e spurgo corretto
- E tre casi reali dal campo [PAUSA]

Prendi gli appunti.
Queste sono cose che non trovi nei manuali. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 1: TEORIA AVANZATA (10 minuti)

## 1.1 Tipologie di Circolatori

[IMMAGINE: Confronto circolatori vecchi vs nuovi]

Esistono due categorie principali:

**Circolatori a velocità fissa**: [PAUSA]
Tre velocità selezionabili.
Uno, due, tre... e basta.
Li trovi nelle caldaie vecchie, pre-2010. [PAUSA]

**Circolatori modulanti**: [PAUSA]
Velocità variabile continua.
Controllati dalla scheda elettronica via PWM.
Standard nelle caldaie moderne. [PAUSA]

La differenza è fondamentale per la diagnosi. [PAUSA]

Un circolatore a velocità fissa:
o gira o non gira. Diagnosi semplice. [PAUSA]

Un circolatore modulante:
può non ricevere il segnale PWM.
Può riceverlo sbagliato.
Può girare ma non alla velocità giusta. [PAUSA]

---

## 1.2 Il Segnale PWM

[IMMAGINE: Forma d'onda PWM]

PWM significa Pulse Width Modulation. [PAUSA]

La scheda manda un segnale che alterna ON e OFF.
La percentuale di tempo ON determina la velocità. [PAUSA]

Duty cycle 100%: massima velocità.
Duty cycle 50%: metà velocità.
Duty cycle 0%: circolatore fermo. [PAUSA]

Perché è importante? [PAUSA]

Perché se il circolatore non gira...
potrebbe essere colpa della scheda, non del circolatore. [PAUSA]

E se cambi il circolatore senza testare il PWM...
spendi 150 euro per niente. [PAUSA]

---

## 1.3 Specifiche Elettriche per Marca

[IMMAGINE: Tabella specifiche circolatori]

Valori tipici:

| Marca | Modello comune | Watt max | Tipo PWM |
|-------|----------------|----------|----------|
| Wilo | Para 25/6 | 45W | 0-10V |
| Grundfos | UPM3 | 45W | onda quadra |
| DAB | Evosta | 40W | 0-10V |
| Vaillant OEM | interno | 35W | proprietario |
| Ariston OEM | interno | 40W | 0-10V |

[PAUSA]

Questi valori ti servono per la diagnosi. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 2: DIAGNOSI COMPLETA (15 minuti)

## 2.1 Strumenti Necessari

[IMMAGINE: Kit diagnosi circolatore]

Per una diagnosi professionale:

**Numero uno**: Multimetro digitale.
Per misurare tensione e continuità. [PAUSA]

**Numero due**: Pinza amperometrica.
Per misurare l'assorbimento. [PAUSA]

**Numero tre**: Cacciavite a taglio grande.
Per lo sblocco manuale. [PAUSA]

---

## 2.2 Test 1: Verifica Alimentazione

[DEMO: Misurazione tensione ai morsetti circolatore]

Prima cosa: il circolatore riceve corrente? [PAUSA]

Togli il connettore dal circolatore.
Metti il multimetro su AC Volt.
Misura tra i due poli di alimentazione. [PAUSA]

**Con caldaia in richiesta riscaldamento**:
Devi leggere **230V AC** circa. [PAUSA]

Se leggi 0V:
- La scheda non sta alimentando
- Controlla i fusibili sulla scheda
- Controlla il relè del circolatore [PAUSA]

Se leggi 230V ma il circolatore non gira:
il problema è nel circolatore stesso. [PAUSA]

---

## 2.3 Test 2: Misura Assorbimento

[DEMO: Pinza amperometrica sul cavo alimentazione]

Se il circolatore parte... misura quanto assorbe. [PAUSA]

Metti la pinza amperometrica sul filo di fase.
Solo uno dei due fili, non entrambi insieme. [PAUSA]

Valori normali:
- A regime: 0.1-0.4 Ampere
- In spunto: fino a 1 Ampere per un secondo [PAUSA]

Valori anomali:
- Sempre sopra 0.5A: cuscinetto duro
- Zero: non gira o girante libera sull'albero
- Oscillante: problema elettrico interno [PAUSA]

---

## 2.4 Test 3: Verifica Segnale PWM

[DEMO: Misurazione segnale PWM con multimetro]

Per circolatori modulanti. [PAUSA]

Trovi il connettore del segnale PWM.
Di solito un filo separato, spesso blu o grigio. [PAUSA]

Con il multimetro su DC Volt:
misura tra il filo PWM e il neutro. [PAUSA]

**Richiesta minima**: circa 1-2V
**Richiesta massima**: circa 8-10V [PAUSA]

Se il segnale non varia:
problema sulla scheda elettronica. [PAUSA]

Se il segnale è sempre 0V:
nessun comando dalla scheda. [PAUSA]

---

## 2.5 Test 4: Verifica Circolazione Effettiva

[DEMO: Controllo temperatura mandata/ritorno]

Il circolatore gira... ma l'acqua circola? [PAUSA]

Misura la temperatura dell'acqua:
- Sul tubo di **mandata**: uscita caldaia
- Sul tubo di **ritorno**: ingresso caldaia [PAUSA]

Differenza normale: 15-20 gradi.
Esempio: mandata 60°C, ritorno 42°C. [PAUSA]

Se la differenza è troppo alta (oltre 25°C):
il circolatore gira piano o c'è un'ostruzione. [PAUSA]

Se la differenza è quasi zero:
il circolatore non sta spingendo. [PAUSA]

---

## 2.6 Codici Errore Correlati

[IMMAGINE: Display errori caldaia]

Errori comuni legati al circolatore:

**Vaillant F20/F28**: temperatura di mandata troppo alta
**Ariston 501**: mancanza circolazione acqua
**Immergas**: surriscaldamento primario
**Beretta errore 30**: flusso acqua insufficiente [PAUSA]

Quando vedi "surriscaldamento"...
pensa sempre al circolatore. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 3: SOSTITUZIONE E SPURGO (12 minuti)

## 3.1 Quando Sostituire

[IMMAGINE: Circolatore usurato]

**Sostituire** se:
- Bloccato meccanicamente e non si libera
- Cuscinetti rumorosi dopo lubrificazione
- Assorbimento anomalo persistente
- Visibilmente corroso o perdite [PAUSA]

**Riparare/pulire** se:
- Solo bloccato da fermo estivo
- Aria intrappolata
- Connettore ossidato [PAUSA]

---

## 3.2 Procedura Sostituzione

[DEMO: Sostituzione passo-passo]

**Passo 1**: Togli corrente e chiudi il gas. [PAUSA]

**Passo 2**: Chiudi i rubinetti di intercettazione.
Se non ci sono, scarica tutto l'impianto. [PAUSA]

**Passo 3**: Scarica la pressione.
Apri uno scarico sotto la caldaia. [PAUSA]

**Passo 4**: Scollega l'elettrico.
Connettore alimentazione e PWM. [PAUSA]

**Passo 5**: Svita il circolatore.
Due dadi o due viti. Attenzione alle guarnizioni. [PAUSA]

**Passo 6**: Monta il nuovo.
Usa guarnizioni nuove. Stringi a croce. [PAUSA]

**Passo 7**: Ricolega l'elettrico.
Controlla polarità se indicata. [PAUSA]

**Passo 8**: Riempi e sfoga. [PAUSA]

---

## 3.3 Sfogo Aria dal Circolatore

[DEMO: Sfogo aria circolatore]

Molti circolatori hanno una **vite di spurgo**. [PAUSA]

Procedura:
1. Riempi l'impianto lentamente
2. Porta la pressione a 1.5 bar
3. Allenta la vite di spurgo
4. Aspetta che esca prima aria, poi acqua
5. Richiudi [PAUSA]

Se non sfoghi il circolatore...
sentirai ronzii e vibrazioni.
A volte non parte proprio. [PAUSA]

---

## 3.4 Spurgo Completo Impianto

[DEMO: Spurgo radiatori in sequenza]

Ordine corretto:
1. Radiatori al piano terra, dal più lontano
2. Poi primo piano
3. Infine sfogo caldaia [PAUSA]

Durante lo spurgo:
tieni il circolatore spento o al minimo.
Così l'aria sale meglio. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 4: CASI REALI DAL CAMPO (8 minuti)

## Caso 1: Il Circolatore che Girava a Vuoto

[IMMAGINE: Circolatore con girante staccata]

Cliente: radiatori freddi, caldaia che parte. [PAUSA]

Controllo il circolatore: assorbe corrente.
Lo sento ronzare. Sembra che giri. [PAUSA]

Ma l'acqua non circola.
Differenza mandata/ritorno quasi zero. [PAUSA]

Apro il circolatore: la girante si era **staccata** dall'albero.
Il motore girava... ma la girante no. [PAUSA]

**Lezione**: non fidarti solo del rumore.
Verifica la circolazione effettiva. [PAUSA]

---

## Caso 2: Il Segnale PWM Mancante

[IMMAGINE: Multimetro che mostra 0V]

Caldaia nuova, pochi mesi.
I radiatori non si scaldano bene. [PAUSA]

Il circolatore gira, ma sempre al minimo. [PAUSA]

Controllo il segnale PWM: **zero volt**. [PAUSA]

La scheda non stava comandando la modulazione.
Cambio la scheda. Problema risolto. [PAUSA]

**Lezione**: sempre testare il segnale PWM
prima di condannare il circolatore. [PAUSA]

---

## Caso 3: L'Aria che Tornava Sempre

[IMMAGINE: Sfogo automatico incrostato]

Cliente: rumori nei radiatori dopo ogni accensione.
Ha già spurgato dieci volte. [PAUSA]

Controllo circolatore e vaso: perfetti. [PAUSA]

Lo sfogo automatico era incrostato.
Non chiudeva bene.
Ad ogni fermata, aspirava aria. [PAUSA]

Sostituisco lo sfogo. Fine dei problemi. [PAUSA]

**Lezione**: a volte il problema non è dove pensi. [PAUSA]

[PAUSA LUNGA]

---

# CHIUSURA (3 minuti)

Ricapitolando. [PAUSA]

Il circolatore è il cuore dell'impianto.
Senza circolazione, niente riscaldamento. [PAUSA]

I quattro test fondamentali:
1. Verifica alimentazione 230V
2. Misura assorbimento con pinza
3. Verifica segnale PWM
4. Controllo circolazione effettiva [PAUSA]

Quando sostituire:
- Cuscinetti rumorosi
- Bloccato meccanicamente
- Se il PWM manca: è la scheda, non il circolatore [PAUSA]

Lo sfogo aria dopo la sostituzione è **fondamentale**. [PAUSA]

Hai domande?
Scrivimi a info@simonsilvercaldaie.it. [PAUSA]

Nel prossimo video tecnico:
la **valvola gas**. [PAUSA]

Grazie per la fiducia.
Ci vediamo al prossimo video. [PAUSA]

[IMMAGINE: Logo + prossimo video preview]

---

# MATERIALI BONUS

## PDF Checklist Diagnosi Circolatore
- [ ] Alimentazione 230V presente
- [ ] Circolatore gira (rumore/vibrazione)
- [ ] Assorbimento normale (0.1-0.4A)
- [ ] Segnale PWM presente e variabile
- [ ] Circolazione effettiva (delta T corretto)
- [ ] Aria spurgata

## Tabella Valori PWM per Marca
(Tensioni tipiche per schede comuni)

---

## FINE SCRIPT PARTE 2

**Durata stimata**: 40-45 minuti
**Parole totali**: ~5000
**Velocità lettura**: 120 parole/min
**Piattaforma**: Solo sito simonsilvercaldaie.it (a pagamento)
