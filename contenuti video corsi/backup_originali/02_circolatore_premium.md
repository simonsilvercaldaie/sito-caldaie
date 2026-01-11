# SCRIPT VIDEO PREMIUM - Circolatore (Pompa)
## Durata: 50-60 minuti | ~7000 parole

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

Benvenuto nel video tecnico completo sul circolatore. [PAUSA]

Sono Simone.
E questo è un video **solo per tecnici professionisti**. [PAUSA]

Se hai visto il mio video su YouTube...
sai già cos'è un circolatore e i sintomi base. [PAUSA]

Qui andiamo in profondità. [PAUSA]

Vedrai:
- Come testare elettricamente il circolatore
- Diagnosi completa del segnale PWM
- Procedura di sostituzione passo-passo
- Sfogo aria e spurgo corretto
- E tre casi reali complicati [PAUSA]

Prendi gli appunti.
Queste sono cose che non trovi nei manuali. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 1: TEORIA AVANZATA (12 minuti)

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

[IMMAGINE: Etichetta circolatore con specifiche]

La differenza è fondamentale per la diagnosi. [PAUSA]

Un circolatore a velocità fissa:
o gira o non gira.
Diagnosi semplice. [PAUSA]

Un circolatore modulante:
può non ricevere il segnale PWM.
Può riceverlo sbagliato.
Può girare ma non alla velocità giusta. [PAUSA]

---

## 1.2 Il Segnale PWM

[IMMAGINE: Forma d'onda PWM su oscilloscopio]

PWM significa Pulse Width Modulation.
Modulazione a larghezza di impulso. [PAUSA]

In pratica: la scheda manda un segnale
che alterna ON e OFF molto velocemente.
La percentuale di tempo ON determina la velocità. [PAUSA]

Duty cycle 100%: massima velocità.
Duty cycle 50%: metà velocità.
Duty cycle 0%: circolatore fermo. [PAUSA]

[IMMAGINE: Graf ico duty cycle vs velocità]

Perché è importante saperlo? [PAUSA]

Perché se il circolatore non gira...
potrebbe essere colpa della scheda,
non del circolatore. [PAUSA]

E se cambi il circolatore senza testare il PWM...
spendi 150 euro per niente. [PAUSA]

---

## 1.3 Specifiche Elettriche

[IMMAGINE: Tabella specifiche circolatori]

I circolatori modulanti moderni:

**Alimentazione**: 230V AC monofase
**Assorbimento**: 4-45W variabile
**Segnale PWM**: 0-10V oppure onda quadra 5V

Valori tipici per marca:

| Marca | Modello comune | Watt max | Tipo PWM |
|-------|----------------|----------|----------|
| Wilo | Para 25/6 | 45W | 0-10V |
| Grundfos | UPM3 | 45W | onda quadra |
| DAB | Evosta | 40W | 0-10V |
| Vaillant OEM | interno | 35W | proprietario |
| Ariston OEM | interno | 40W | 0-10V |

[PAUSA]

Questi valori ti servono per la diagnosi. [PAUSA]

---

## 1.4 Curve di Prevalenza

[IMMAGINE: Curva prevalenza/portata circolatore]

Ogni circolatore ha una curva caratteristica. [PAUSA]

Mostra la relazione tra:
- **Prevalenza**: quanto "spinge" in metri colonna d'acqua
- **Portata**: quanti litri al minuto fa passare [PAUSA]

Per un impianto domestico tipico:
- Prevalenza: 4-6 metri
- Portata: 500-1000 litri/ora [PAUSA]

La curva ti serve quando sostituisci un circolatore.
Il nuovo deve avere caratteristiche simili o superiori.
Mai inferiori. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 2: DIAGNOSI COMPLETA (18 minuti)

## 2.1 Strumenti Necessari

[IMMAGINE: Kit diagnosi circolatore]

Per una diagnosi professionale:

**Numero uno**: Multimetro digitale.
Per misurare tensione e continuità. [PAUSA]

**Numero due**: Pinza amperometrica.
Per misurare l'assorbimento. [PAUSA]

**Numero tre**: Cacciavite a taglio grande.
Per lo sblocco manuale. [PAUSA]

**Numero quattro**: Stetoscopio meccanico.
Opzionale ma utile per sentire se gira. [PAUSA]

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
- Il problema è nel circolatore stesso [PAUSA]

[IMMAGINE: Schema elettrico semplifcato]

---

## 2.3 Test 2: Sblocco Meccanico

[DEMO: Sblocco girante con cacciavite]

Prima di condannare il circolatore...
prova lo sblocco meccanico. [PAUSA]

Togli la vite frontale centrale.
Inserisci un cacciavite a taglio.
Prova a ruotare l'albero. [PAUSA]

Se gira liberamente: ok, non è bloccato.
Se fa resistenza e poi si sblocca: era incollato.
Se non gira per niente: girante grippata. [PAUSA]

[IMMAGINE: Vite centrale e albero interno]

Dopo lo sblocco manuale:
ricollegalo e riprova.
Spesso riparte. [PAUSA]

Ma avvisa il cliente: probabilmente si riblocchera'. [PAUSA]

---

## 2.4 Test 3: Misura Assorbimento

[DEMO: Pinza amperometrica sul cavo alimentazione]

Se il circolatore parte...
misura quanto assorbe. [PAUSA]

Metti la pinza amperometrica sul filo di fase.
Solo uno dei due fili, non entrambi insieme. [PAUSA]

Valori normali:
- A regime: 0.1-0.4 Ampere
- In spunto: fino a 1 Ampere per un secondo [PAUSA]

Valori anomali:
- Sempre sopra 0.5A: cuscinetto duro, resistenza
- Zero: non gira o girante libera sull'albero
- Oscillante: problema elettrico interno [PAUSA]

[IMMAGINE: Pinza con display che mostra 0.3A]

---

## 2.5 Test 4: Verifica Segnale PWM

[DEMO: Misurazione segnale PWM con multimetro]

Per circolatori modulanti. [PAUSA]

Trovi il connettore del segnale PWM.
Di solito un filo separato, spesso blu o grigio.
Riferisciti al manuale della caldaia. [PAUSA]

Con il multimetro su DC Volt:
misura tra il filo PWM e il neutro. [PAUSA]

**Richiesta minima**: circa 1-2V
**Richiesta massima**: circa 8-10V [PAUSA]

Se il segnale non varia:
- Problema sulla scheda elettronica
- O sensore temperatura rotto che non richiede variazione [PAUSA]

Se il segnale è sempre 0V:
- Nessun comando dalla scheda
- Circolatore non modulera' [PAUSA]

[IMMAGINE: Schema collegamento PWM]

---

## 2.6 Test 5: Verifica Circolazione Effettiva

[DEMO: Controllo temperatura mandata/ritorno]

Il circolatore gira... ma l'acqua circola? [PAUSA]

Misura la temperatura dell'acqua:
- Sul tubo di **mandata**: uscita caldaia
- Sul tubo di **ritorno**: ingresso caldaia [PAUSA]

Differenza normale: 15-20 gradi.
Esempio: mandata 60°C, ritorno 42°C. [PAUSA]

Se la differenza è troppo alta (oltre 25°C):
- Il circolatore gira piano
- O c'è un'ostruzione nel circuito [PAUSA]

Se la differenza è quasi zero:
- Il circolatore non sta spingendo
- O c'è un bypass aperto da qualche parte [PAUSA]

[IMMAGINE: Termometro laser su tubi]

---

## 2.7 Codici Errore Correlati

[IMMAGINE: Display errori caldaia]

Errori comuni legati al circolatore:

**Vaillant F20/F28**: temperatura di mandata troppo alta
**Ariston 501**: mancanza circolazione acqua
**Immergas blocco temperatura**: surriscaldamento primario
**Beretta errore 30**: flusso acqua insufficiente [PAUSA]

Quando vedi "surriscaldamento"...
pensa sempre al circolatore. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 3: SOSTITUZIONE E SPURGO (15 minuti)

## 3.1 Quando Sostituire

[IMMAGINE: Circolatore usurato]

Sostituire se:
- Bloccato meccanicamente e non si libera
- Cuscinetti rumorosi anche dopo lubrificazione
- Assorbimento anomalo persistente
- Visibilmente corroso o perdite dall'albero [PAUSA]

Riparare/pulire se:
- Solo bloccato da fermo estivo
- Aria intrappolata
- Connettore ossidato [PAUSA]

---

## 3.2 Scelta del Ricambio

[IMMAGINE: Confronto circolatori compatibili]

Opzioni:

**Ricambio originale**: sicuro ma costoso.
Garantito compatibile al 100%. [PAUSA]

**Ricambio compatibile**: meno costoso.
Verifica: attacchi, prevalenza, segnale PWM. [PAUSA]

**Ricambio universale**: attenzione.
Spesso manca il connettore corretto.
O il segnale PWM non è compatibile. [PAUSA]

Consiglio: per le prime sostituzioni, usa l'originale.
Quando avrai esperienza, potrai valutare i compatibili. [PAUSA]

---

## 3.3 Procedura Sostituzione

[DEMO: Sostituzione passo-passo]

**Passo 1**: Togli corrente e chiudi il gas. [PAUSA]
Sempre. Anche se sembra inutile. [PAUSA]

**Passo 2**: Chiudi i rubinetti di intercettazione. [PAUSA]
Se ci sono, chiudili.
Se non ci sono, devi scaricare tutto l'impianto. [PAUSA]

**Passo 3**: Scarica la pressione. [PAUSA]
Apri uno scarico sotto la caldaia.
Metti una bacinella. Uscirà acqua. [PAUSA]

**Passo 4**: Scollega l'elettrico. [PAUSA]
Togli il connettore di alimentazione.
Togli il connettore PWM se presente. [PAUSA]

**Passo 5**: Svita il circolatore. [PAUSA]
Di solito due dadi o due viti.
Attenzione alle guarnizioni, sono fragili. [PAUSA]

**Passo 6**: Monta il nuovo. [PAUSA]
Usa guarnizioni nuove. Sempre.
Stringi in modo uniforme, a croce. [PAUSA]

**Passo 7**: Ricolega l'elettrico. [PAUSA]
Alimentazione e PWM nei connettori giusti.
Controlla polarità se indicata. [PAUSA]

**Passo 8**: Riempi e sfoga. [PAUSA]
Questa è la parte critica. [PAUSA]

[IMMAGINE: Nuovo circolatore montato]

---

## 3.4 Sfogo Aria dal Circolatore

[DEMO: Sfogo aria circolatore]

Molti circolatori hanno una **vite di spurgo**. [PAUSA]

È quella vite frontale centrale.
Non serve solo per lo sblocco.
Serve anche per far uscire l'aria. [PAUSA]

Procedura:
1. Riempi l'impianto lentamente
2. Porta la pressione a 1.5 bar
3. Allenta la vite di spurgo del circolatore
4. Aspetta che esca prima aria, poi acqua
5. Richiudi [PAUSA]

Se non sfoghi il circolatore...
resta aria dentro.
E sentirai ronzii, vibrazioni.
A volte non parte proprio. [PAUSA]

[IMMAGINE: Vite spurgo con goccia d'acqua]

---

## 3.5 Spurgo Completo Impianto

[DEMO: Spurgo radiatori in sequenza]

Dopo aver sostituito il circolatore...
spurga tutto l'impianto. [PAUSA]

Ordine corretto:
1. Radiatori al piano terra, partendo dal più lontano
2. Poi primo piano, stessa logica
3. Infine sfogo caldaia se presente [PAUSA]

Durante lo spurgo:
- Tieni il circolatore spento se possibile
- O sulla velocità minima
- Così l'aria sale meglio [PAUSA]

Dopo lo spurgo:
verifica la pressione e rabbocca se necessario. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 4: CASI REALI DAL CAMPO (10 minuti)

## Caso 1: Il Circolatore che Girava a Vuoto

[IMMAGINE: Circolatore con girante staccata]

Cliente: radiatori freddi, caldaia che parte. [PAUSA]

Controllo il circolatore: assorbe corrente.
Lo sento ronzare. Sembra che giri. [PAUSA]

Ma l'acqua non circola.
Differenza mandata/ritorno quasi zero. [PAUSA]

Apro il circolatore: la girante si era **staccata** dall'albero.
Il motore girava... ma la girante no. [PAUSA]

Lezione: non fidarti solo del rumore.
Verifica la circolazione effettiva. [PAUSA]

---

## Caso 2: Il Segnale PWM Mancante

[IMMAGINE: Multimetro che mostra 0V sul PWM]

Caldaia nuova, pochi mesi.
Il cliente lamenta che i radiatori non si scaldano bene. [PAUSA]

Il circolatore gira, ma sempre al minimo.
Anche con termostato al massimo. [PAUSA]

Controllo il segnale PWM: *zero volt*. [PAUSA]

La scheda non stava comandando la modulazione.
Un guasto elettronico. [PAUSA]

Cambio la scheda. Problema risolto. [PAUSA]

Se avessi cambiato il circolatore...
avrei speso 150 euro inutilmente. [PAUSA]

Lezione: sempre testare il segnale PWM
prima di condannare il circolatore. [PAUSA]

---

## Caso 3: L'Aria che Tornava Sempre

[IMMAGINE: Sfogo automatico incrostato]

Cliente: rumori nei radiatori dopo ogni accensione.
Ha già spurged dieci volte.
L'aria torna ogni giorno. [PAUSA]

Controllo il circolatore: perfetto.
Controllo il vaso: perfetto. [PAUSA]

Poi noto lo sfogo automatico.
Era incrostato. Non chiudeva bene.
E ad ogni fermata, aspirava aria. [PAUSA]

Sostituisco lo sfogo automatico.
Fine dei problemi. [PAUSA]

Lezione: a volte il problema non è dove pensi.
Ma il circolatore resta il primo sospettato
se non conosci l'impianto. [PAUSA]

[PAUSA LUNGA]

---

# CHIUSURA (3 minuti)

Ricapitolando. [PAUSA]

Il circolatore è il cuore dell'impianto.
Senza circolazione, niente riscaldamento. [PAUSA]

I cinque test fondamentali:
1. Verifica alimentazione 230V
2. Sblocco meccanico
3. Misura assorbimento con pinza
4. Verifica segnale PWM
5. Controllo circolazione effettiva [PAUSA]

Quando sostituire vs riparare:
- Se è solo bloccato: sblocca e avvisa
- Se ha cuscinetti rumorosi: cambia
- Se il PWM manca: è la scheda, non il circolatore [PAUSA]

Lo sfogo aria dopo la sostituzione è **fondamentale**.
Non saltarlo mai. [PAUSA]

Hai domande?
Scrivimi a info@simonsilver caldaie punto it. [PAUSA]

Nel prossimo video tecnico:
la **valvola gas**.
Come testarla, come taraarla,
e i codici errore correlati. [PAUSA]

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

## Schema Sostituzione
(Passo-passo visuale)

---

## FINE SCRIPT PREMIUM

**Durata stimata**: 55-60 minuti
**Parole totali**: ~6900
**Velocità lettura**: 120 parole/min
