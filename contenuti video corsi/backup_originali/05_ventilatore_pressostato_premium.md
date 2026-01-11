# SCRIPT VIDEO PREMIUM - Ventilatore e Pressostato Fumi
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

Benvenuto nel video tecnico completo su ventilatore e pressostato fumi. [PAUSA]

Sono Simone.
Questo è un video **per professionisti**. [PAUSA]

Se hai visto YouTube, conosci i sintomi base.
Qui imparerai le diagnosi tecniche. [PAUSA]

Vedrai:
- Come testare il ventilatore elettricamente
- Come misurare la depressione corretta
- Come verificare il pressostato
- E come diagnosticare problemi di scarico [PAUSA]

Questi componenti di sicurezza sono fondamentali.
Una diagnosi precisa salva tempo e credibilità. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 1: TEORIA AVANZATA (12 minuti)

## 1.1 Tipologie di Ventilatori

[IMMAGINE: Confronto ventilatori centrifughi vs assiali]

**Ventilatori centrifughi**: i più comuni.
L'aria entra al centro e esce lateralmente.
Creano buona depressione.
Robusti e silenziosi. [PAUSA]

**Ventilatori assiali**: più rari nelle caldaie murali.
L'aria entra e esce nello stesso asse.
Meno depressione, più portata. [PAUSA]

Nelle caldaie a condensazione moderne...
quasi tutti sono **centrifughi a velocità variabile**. [PAUSA]

[IMMAGINE: Ventilatore PWM modulante]

La scheda controlla la velocità via PWM.
In base alla potenza richiesta. [PAUSA]

Fiamma alta = ventilatore veloce.
Fiamma bassa = ventilatore lento.
Questo ottimizza la combustione. [PAUSA]

---

## 1.2 Il Principio della Depressione

[IMMAGINE: Schema depressione nella camera fumi]

Il ventilatore crea una **depressione**.
Cioè una pressione inferiore a quella atmosferica. [PAUSA]

Questa depressione:
- Aspira l'aria comburente dall'esterno
- Aspira i fumi dalla camera di combustione
- Li spinge verso lo scarico [PAUSA]

La depressione si misura in **Pascal** (Pa).
O in **millibar** (mbar). [PAUSA]

1 mbar = 100 Pascal [PAUSA]

**Valori tipici di depressione**:
- Minimo per consenso: 20-50 Pa
- A regime: 50-150 Pa
- Dipende dal modello [PAUSA]

[IMMAGINE: Grafico depressione vs velocità ventilatore]

---

## 1.3 Come Funziona il Pressostato

[IMMAGINE: Sezione interna pressostato]

Il pressostato è un **microinterruttore a membrana**. [PAUSA]

Ha due camere separate da una membrana.
Una camera è collegata alla zona di depressione.
L'altra è a pressione ambiente. [PAUSA]

Quando la depressione supera la soglia...
la membrana si sposta.
E chiude (o apre) un contatto elettrico. [PAUSA]

[IMMAGINE: Schema contatto NC / NO]

Tipi di contatti:
- **NC (Normalmente Chiuso)**: apre se c'è problema
- **NO (Normalmente Aperto)**: chiude quando tutto ok [PAUSA]

La maggior parte delle caldaie usa pressostati NO.
Che chiudono il contatto quando il tiraggio è ok. [PAUSA]

---

## 1.4 Soglie di Intervento

[IMMAGINE: Taratura pressostato]

Ogni pressostato ha una soglia di intervento.
Espressa in Pascal o mbar. [PAUSA]

Esempio:
- Intervento a 50 Pa
- Rilascio a 40 Pa [PAUSA]

Questo significa:
- Se la depressione supera 50 Pa → contatto chiude
- Se scende sotto 40 Pa → contatto riapre [PAUSA]

Questa **isteresi** evita oscillazioni.
Se fosse la stessa soglia, scatterebbe continuamente. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 2: DIAGNOSI COMPLETA (18 minuti)

## 2.1 Strumenti Necessari

[IMMAGINE: Kit diagnosi ventilatore/pressostato]

**Numero uno**: Multimetro digitale.
Per tensioni, continuità, resistenza. [PAUSA]

**Numero due**: Manometro differenziale digitale.
Per misurare la depressione in Pascal.
Scala: 0-1000 Pa. [PAUSA]

**Numero tre**: Pinza amperometrica.
Per misurare l'assorbimento del ventilatore. [PAUSA]

**Numero quattro**: Tachimetro ottico.
Opzionale. Per misurare i giri del ventilatore. [PAUSA]

---

## 2.2 Test 1: Verifica Tubicini

[DEMO: Controllo visivo e funzionale tubicini]

Prima di tutto: i tubicini. [PAUSA]

Trova il pressostato.
Di solito ha due tubicini in silicone:
- Uno alla camera di depressione (Venturi)
- Uno a pressione ambiente [PAUSA]

Controlla:
- Sono collegati? Non staccati?
- Sono integri? Non crepati?
- Sono liberi? Non piegati? [PAUSA]

[IMMAGINE: Tubicino staccato vs collegato]

Controlla se c'è **acqua** dentro.
In caldaie a condensazione, può succedere.
Svuota il tubicino. [PAUSA]

---

## 2.3 Test 2: Verifica Funzionamento Pressostato

[DEMO: Test soffiando nel tubicino]

Scollega un tubicino dal pressostato.
Soffia leggermente.
Ascolta il **click**. [PAUSA]

Se senti click → contatto funziona.
Se non senti click → pressostato probabilmente guasto. [PAUSA]

[IMMAGINE: Schema test soffio]

Test più preciso con multimetro:
1. Imposta su continuità
2. Collega ai terminali del pressostato
3. Soffia
4. Il multimetro deve suonare quando soffi [PAUSA]

Se non suona = contatto guasto. [PAUSA]

---

## 2.4 Test 3: Verifica Alimentazione Ventilatore

[DEMO: Misurazione tensione ai morsetti ventilatore]

Il ventilatore riceve corrente? [PAUSA]

Trova il connettore del ventilatore.
Di solito 3 fili:
- Fase (marrone o nero)
- Neutro (blu)
- Segnale PWM (se presente) [PAUSA]

Metti la caldaia in richiesta.
Misura tra fase e neutro:
- AC 230V per ventilatori diretti
- DC variabile per ventilatori modulanti [PAUSA]

[IMMAGINE: Multimetro su morsetti ventilatore]

Se leggi 0V → la scheda non alimenta.
Problema a monte. [PAUSA]

Se leggi tensione ma il ventilatore non gira → ventilatore guasto. [PAUSA]

---

## 2.5 Test 4: Misura Assorbimento Ventilatore

[DEMO: Pinza amperometrica sul filo]

Quanto assorbe il ventilatore? [PAUSA]

Pinza amperometrica sul filo di fase.
Leggi durante il funzionamento. [PAUSA]

**Valori normali**:
- A regime basso: 0.1-0.3 A
- A regime alto: 0.3-0.8 A [PAUSA]

**Valori anomali**:
- Troppo alto → cuscinetti duri, girante sfrega
- Troppo basso o zero → motore non lavora
- Oscillante → problema elettrico [PAUSA]

[IMMAGINE: Display pinza con valore normale]

---

## 2.6 Test 5: Misura Depressione

[DEMO: Manometro differenziale collegato]

Questo è il test definitivo. [PAUSA]

Collega il manometro differenziale
alla presa di depressione del pressostato.
O al tubo Venturi. [PAUSA]

Avvia la caldaia in richiesta.
Leggi la depressione. [PAUSA]

**Valori tipici**:
- Soglia minima: 20-50 Pa
- A regime: 50-150 Pa [PAUSA]

[IMMAGINE: Manometro che mostra 80 Pa]

Se la depressione è **troppo bassa**:
- Ventilatore lento
- Scarico ostruito
- Aspirazione bloccata [PAUSA]

Se la depressione è **ok** ma il pressostato non scatta:
- Pressostato guasto
- O soglia tarata male [PAUSA]

---

## 2.7 Test 6: Verifica Condensatore Ventilatore

[DEMO: Test condensatore con multimetro]

Molti ventilatori hanno un **condensatore di spunto**. [PAUSA]

È quello cilindrico metallico vicino al ventilatore.
Se è guasto, il ventilatore non parte o parte piano. [PAUSA]

Test:
1. Togli il condensatore
2. Imposta il multimetro su capacità (uF)
3. Misura [PAUSA]

Valore tipico: 2-5 uF.
Se leggi molto meno o zero → condensatore guasto. [PAUSA]

[IMMAGINE: Condensatore e multimetro]

Sostituire un condensatore costa 5-10 euro.
E spesso risolve il problema senza cambiare il ventilatore. [PAUSA]

---

## 2.8 Verifica Scarico Fumi

[DEMO: Controllo terminale esterno]

Se tutto sembra ok ma c'è ancora errore...
controlla lo **scarico fumi**. [PAUSA]

Una ostruzione parziale riduce il tiraggio.
Il pressostato non rileva abbastanza depressione. [PAUSA]

Cause comuni:
- Nido di volatili nel tubo
- Ghiaccio in inverno
- Terminale coperto o ostruito
- Tubo schiacciato [PAUSA]

[IMMAGINE: Terminale esterno ostruito da nido]

Vai a controllare il terminale esterno.
È spesso la causa di errori intermittenti. [PAUSA]

---

## 2.9 Codici Errore Correlati

[IMMAGINE: Display con codici errore]

Errori tipici legati a ventilatore/pressostato:

**Vaillant F33**: consenso fumi assente
**Vaillant F32**: giri ventilatore fuori range
**Ariston 6P1**: mancanza tiraggio
**Immergas blocco**: problema pressostato
**Beretta 05A**: errore ventilatore
**Baxi E25**: consenso fumi [PAUSA]

Quando vedi questi errori...
segui la sequenza diagnostica.
Non cambiare al primo sospetto. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 3: SOSTITUZIONE (12 minuti)

## 3.1 Sostituzione Pressostato

[DEMO: Cambio pressostato passo-passo]

**Passo 1**: Spegni la caldaia. [PAUSA]
**Passo 2**: Scollega i tubicini. Segna quale va dove. [PAUSA]
**Passo 3**: Scollega il connettore elettrico. [PAUSA]
**Passo 4**: Svita il pressostato dal supporto. [PAUSA]
**Passo 5**: Monta il nuovo pressostato.
Verifica che la soglia sia identica. [PAUSA]
**Passo 6**: Ricollega tubicini e elettrico. [PAUSA]
**Passo 7**: Prova accensione. [PAUSA]

[IMMAGINE: Pressostato nuovo installato]

I pressostati sono relativamente economici: 20-40 euro.
Ma assicurati di comprare quello con la soglia giusta.
50 Pa non è uguale a 100 Pa. [PAUSA]

---

## 3.2 Sostituzione Ventilatore

[DEMO: Cambio ventilatore passo-passo]

**Passo 1**: Spegni gas e corrente. [PAUSA]
**Passo 2**: Smonta il pannello di accesso. [PAUSA]
**Passo 3**: Scollega il connettore elettrico. [PAUSA]
**Passo 4**: Svita le viti di fissaggio.
Di solito 3-4 viti. [PAUSA]
**Passo 5**: Scollega l'attacco allo scarico fumi.
Attenzione alla guarnizione. [PAUSA]
**Passo 6**: Estrai il ventilatore vecchio. [PAUSA]
**Passo 7**: Monta il nuovo con guarnizione nuova. [PAUSA]
**Passo 8**: Fissa le viti.
**Passo 9**: Ricollega l'elettrico. [PAUSA]
**Passo 10**: Prova accensione.
Ascolta i rumori. Verifica assorbimento. [PAUSA]

[IMMAGINE: Ventilatore nuovo montato]

I ventilatori costano 100-250 euro.
Cambiare solo il condensatore può risolvere a 10 euro. [PAUSA]

---

## 3.3 Sostituzione Condensatore

[DEMO: Cambio condensatore]

Se il test capacità dice che è guasto...
puoi cambiare solo il condensatore. [PAUSA]

**Passo 1**: Togli il vecchio.
Annota i valori: uF e tensione. [PAUSA]
**Passo 2**: Compra l'identico.
Online o presso i rivenditori. [PAUSA]
**Passo 3**: Collega il nuovo.
La polarità di solito non conta. [PAUSA]
**Passo 4**: Fissa e prova. [PAUSA]

Economico ed efficace.
Molti tecnici cambiano l'intero ventilatore senza provarci. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 4: CASI REALI (8 minuti)

## Caso 1: Il Tubicino Scollegato

[IMMAGINE: Tubicino scollegato dal pressostato]

Cliente: errore fumi, caldaia non parte.
Tecnico precedente: "va cambiato il pressostato". [PAUSA]

Arrivo io.
Apro.
Il tubicino era staccato. [PAUSA]

Lo ricollego.
Fine del problema.
Costo: 5 minuti. [PAUSA]

Lezione: controlla sempre prima i tubicini. [PAUSA]

---

## Caso 2: Il Condensatore Secco

[IMMAGINE: Condensatore gonfio]

Caldaia: il ventilatore partiva lentissimo.
Poi si bloccava per errore fumi. [PAUSA]

Test: assorbimento altissimo.
Sospetto condensatore. [PAUSA]

Misuro: doveva essere 3 uF, risultava 0.8 uF.
Condensatore esaurito. [PAUSA]

Cambio condensatore: 8 euro.
Problema risolto. [PAUSA]

Lezione: prima il condensatore, poi il ventilatore. [PAUSA]

---

## Caso 3: Il Nido nel Tubo

[IMMAGINE: Nido dentro scarico fumi]

Cliente: blocchi solo in primavera.
Tutto l'inverno ok. [PAUSA]

Strano.
Vado a controllare il terminale esterno.
Dentro: un nido iniziato da volatili. [PAUSA]

Pulisco.
Problema risolto. [PAUSA]

Lezione: i blocchi stagionali suggeriscono cause esterne.
Controlla sempre lo scarico. [PAUSA]

[PAUSA LUNGA]

---

# CHIUSURA (3 minuti)

Ricapitolando. [PAUSA]

Ventilatore e pressostato formano il sistema di sicurezza fumi.
Se uno non funziona, la caldaia non parte. [PAUSA]

Sequenza diagnostica:
1. Tubicini integri e collegati?
2. Pressostato scatta soffiando?
3. Ventilatore alimentato?
4. Assorbimento normale?
5. Depressione sufficiente?
6. Scarico libero? [PAUSA]

Prima il condensatore.
Poi il pressostato.
Poi il ventilatore.
Infine lo scarico esterno. [PAUSA]

Hai domande?
info@simonsilvercaldaie punto it. [PAUSA]

Prossimo video: **bruciatore e sistema di accensione**.
Ci vediamo. [PAUSA]

[IMMAGINE: Logo + prossimo video]

---

# MATERIALI BONUS

## PDF Checklist Diagnosi Ventilatore/Pressostato
(Stampabile per il furgone)

## Tabella Soglie Pressostato per Modello
(Valori in Pascal per 20+ caldaie)

## Schema Elettrico Ventilatore
(Collegamento tipico con PWM)

---

## FINE SCRIPT PREMIUM

**Durata stimata**: 55 minuti
**Parole totali**: ~6600
**Velocità lettura**: 120 parole/min
