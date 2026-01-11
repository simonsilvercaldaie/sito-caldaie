# SCRIPT VIDEO 09 - POMPE E CIRCOLAZIONE
## Parte 2 Premium | Durata: 45 minuti | Target: 5500 parole
### CORSO INTERMEDIO — Scuola Tecnico Caldaie A-Z

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

# INTRO E RECAP (3 minuti)

Bentornato. [PAUSA]

Questa è la **Parte 2** su pompe e circolazione. Il video completo per tecnici professionisti. [PAUSA]

Se hai visto la Parte 1 su YouTube, sai già cos'è un circolatore, le tre generazioni — velocità fissa, modulanti 0-10V, e PWM — i sintomi classici di guasto, e il trucco dello sblocco manuale. [PAUSA]

Ora andiamo **in profondità**. [PAUSA]

In questo video vedrai: [PAUSA]

**Primo**: teoria avanzata — come funziona davvero un circolatore modulante, cosa significa PWM nel dettaglio, e perché alcuni modelli usano il BUS di comunicazione. [PAUSA]

**Secondo**: evoluzione tecnologica — dalla prima generazione anni Novanta ai moderni circolatori a magneti permanenti di classe A. [PAUSA]

**Terzo**: diagnosi strumentale completa — test alimentazione, misura assorbimento, verifica segnale PWM, e controllo circolazione effettiva. [PAUSA]

**Quarto**: procedura di sostituzione passo-passo — svuotamento, smontaggio, guarnizioni, rimontaggio, spurgo corretto. [PAUSA]

**Quinto**: casi reali dal campo — tre guasti complessi con step-by-step della risoluzione. [PAUSA]

Prendi gli appunti. Queste sono cose che non trovi nei manuali. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 1: TEORIA AVANZATA (12 minuti)

## 1.1 Principio Fisico del Circolatore

[IMMAGINE: Sezione completa circolatore con flusso]

Un circolatore è una **pompa centrifuga** a bassa prevalenza. [PAUSA]

L'acqua entra dal centro della girante — il cosiddetto **occhio** — e viene spinta verso l'esterno dalla forza centrifuga. [PAUSA]

[IMMAGINE: Diagramma flusso girante centrifuga]

La forma della girante converte la velocità dell'acqua in pressione. L'acqua esce dalla voluta — la camera a spirale intorno alla girante — con una pressione maggiore rispetto all'ingresso. [PAUSA]

Questa differenza di pressione è la **prevalenza**, misurata in **metri di colonna d'acqua** o in **kPa**. [PAUSA]

Un circolatore domestico tipico ha una prevalenza tra **4 e 6 metri** — sufficienti per vincere le perdite di carico di un impianto di una villetta su due piani. [PAUSA]

### Curva caratteristica

[IMMAGINE: Curva prevalenza-portata circolatore]

Ogni circolatore ha una **curva caratteristica** che mostra la relazione tra portata e prevalenza. [PAUSA]

A portata zero — circolatore che gira ma valvole chiuse — la prevalenza è massima. [PAUSA]

A prevalenza zero — tubo libero senza resistenza — la portata è massima. [PAUSA]

In mezzo c'è il **punto di lavoro** — dove la curva del circolatore incrocia la curva dell'impianto. [PAUSA]

I circolatori modulanti spostano dinamicamente il punto di lavoro modificando la velocità di rotazione. Così si adattano alle condizioni reali dell'impianto. [PAUSA]

## 1.2 Il Motore Elettrico

[IMMAGINE: Statore e rotore circolatore tradizionale]

Nei circolatori tradizionali il motore è **asincrono monofase a rotore schermato**. [PAUSA]

Cosa significa? [PAUSA]

**Asincrono**: il rotore gira a una velocità leggermente inferiore al campo magnetico rotante dello statore. La differenza si chiama **scorrimento**. [PAUSA]

**Monofase**: alimentato a 230V AC, con un condensatore che crea la sfasatura necessaria per generare il campo rotante. [PAUSA]

**Rotore schermato**: non c'è tenuta meccanica tra motore e girante. L'acqua dell'impianto bagna direttamente il rotore, che è racchiuso in un involucro metallico sottile — lo **schermo**. [PAUSA]

[IMMAGINE: Schema rotore schermato bagnato dall'acqua]

Questo design elimina la tenuta meccanica — che nei circolatori vecchi era un punto debole — ma espone il rotore alle impurità dell'acqua. [PAUSA]

Se l'impianto è sporco di **magnetite** — polvere nera di ferro — questa si deposita sul rotore e col tempo lo blocca. [PAUSA]

### Motori a magneti permanenti

[IMMAGINE: Confronto rotore asincrono vs magneti permanenti]

Nei circolatori moderni di classe A il motore è a **magneti permanenti**. [PAUSA]

Il rotore contiene magneti al neodimio che seguono il campo magnetico rotante dello statore. Non c'è scorrimento — il rotore gira esattamente alla velocità comandata. [PAUSA]

**Vantaggi**: [PAUSA]
- Efficienza superiore: consumi sotto i 25W invece di 80-100W
- Coppia elevata anche a basse velocità
- Controllo preciso della velocità
- Meno calore generato [PAUSA]

**Svantaggi**: [PAUSA]
- Costo maggiore
- Sensibilità ai magneti che si degradano ad alte temperature
- Elettronica di controllo integrata che può guastarsi [PAUSA]

## 1.3 Il Segnale PWM nel Dettaglio

[IMMAGINE: Oscillogramma segnale PWM]

PWM — Pulse Width Modulation — è il metodo di controllo standard per i circolatori moderni. [PAUSA]

La scheda caldaia genera un segnale digitale che alterna stati **HIGH** e **LOW** a una frequenza fissa — tipicamente tra **500 Hz e 2 kHz**. [PAUSA]

[IMMAGINE: Duty cycle 20%, 50%, 80%]

La percentuale di tempo in cui il segnale è HIGH rispetto al periodo totale si chiama **duty cycle**. [PAUSA]

- Duty cycle 0%: segnale sempre LOW — circolatore fermo o velocità minima
- Duty cycle 50%: HIGH e LOW uguali — velocità media
- Duty cycle 100%: segnale sempre HIGH — velocità massima [PAUSA]

### Livelli di tensione

[IMMAGINE: Schema elettrico segnale PWM]

Il segnale PWM è tipicamente a **0-5V** o **0-10V** a seconda del protocollo. [PAUSA]

**Attenzione**: non confondere il segnale PWM con il segnale analogico 0-10V. [PAUSA]

Nel segnale **analogico 0-10V**, la tensione varia continuamente — 2V per velocità bassa, 8V per velocità alta. [PAUSA]

Nel segnale **PWM**, la tensione è sempre la stessa (5V o 10V), ma cambia il duty cycle. [PAUSA]

Per misurare correttamente il PWM con un multimetro, devi usare la **funzione frequenza** o **duty cycle** se il tuo strumento la ha. Se misuri in DC volt, vedrai un valore medio che non ti dice nulla di preciso. [PAUSA]

### Comunicazione su BUS

[IMMAGINE: Schema BUS digitale caldaia]

Alcuni circolatori moderni, specialmente quelli OEM integrati nelle caldaie premium, comunicano su **BUS digitale**. [PAUSA]

Significa che la scheda caldaia e il circolatore si scambiano dati bidirezionali — non solo il comando di velocità, ma anche informazioni di stato, allarmi, diagnostica. [PAUSA]

Protocolli comuni: **eBUS** su Vaillant, **BUS proprietario** su alcune caldaie Viessmann e Buderus. [PAUSA]

**Conseguenza per il tecnico**: non puoi misurare il comando con un multimetro. Se sospetti un problema di comunicazione, devi usare il **menù di diagnostica** della caldaia o collegare uno strumento specifico. [PAUSA]

## 1.4 Specifiche Tecniche per Marca

[IMMAGINE: Tabella specifiche circolatori]

Ecco i valori tipici che trovi nelle caldaie domestiche: [PAUSA]

| Marca circolatore | Modello comune | Potenza max | Tipo comando |
|-------------------|----------------|-------------|--------------|
| Grundfos | UPM3/UPS2 | 25-45W | PWM 0-10V |
| Wilo | Para 25/6 | 25-45W | PWM 0-10V |
| DAB | Evosta | 40W | PWM 0-10V |
| Vaillant OEM | integrato | 30-40W | eBUS |
| Ariston OEM | integrato | 35-45W | 0-10V |
| Immergas OEM | integrato | 35-40W | 0-10V |
| Beretta/Riello | integrato | 35-45W | PWM |

[PAUSA]

Questi valori ti servono per la diagnosi — se un circolatore assorbe 80W invece di 40W, c'è qualcosa che non va. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 2: EVOLUZIONE TECNOLOGICA (6 minuti)

## 2.1 Prima Generazione: Anni '80-'90

[IMMAGINE: Circolatore Grundfos UPS vintage]

I primi circolatori domestici erano derivati da quelli industriali. [PAUSA]

Motore asincrono a tre velocità selezionabili con un selettore rotativo o dei ponticelli. [PAUSA]

Consumo: **60-100W** fissi, indipendente dal carico. [PAUSA]

Non c'era alcun controllo dalla scheda caldaia. Il circolatore girava sempre alla velocità impostata quando la caldaia era in funzione. [PAUSA]

**Problemi tipici**: [PAUSA]
- Blocco per magnetite dopo anni di servizio
- Cuscinetti rumorosi
- Condensatore di avviamento guasto — il circolatore ronza ma non parte [PAUSA]

## 2.2 Seconda Generazione: 2000-2010

[IMMAGINE: Circolatore elettronico prima generazione]

Con le prime normative sull'efficienza energetica, i costruttori passano ai circolatori a velocità variabile. [PAUSA]

Prima versione: comando **analogico 0-10V**. [PAUSA]

La scheda caldaia manda una tensione continua che il circolatore traduce in velocità. [PAUSA]

Consumo: **30-60W** variabile. [PAUSA]

Questi circolatori hanno già un'elettronica interna, ma è semplice — principalmente un regolatore di velocità. [PAUSA]

**Problemi tipici**: [PAUSA]
- Mancata risposta al segnale 0-10V per connettore ossidato
- Deriva dell'elettronica interna — il circolatore non regola più correttamente
- Cavi segnale che si danneggiano [PAUSA]

## 2.3 Terza Generazione: 2010-oggi

[IMMAGINE: Circolatore classe A moderno]

Con la normativa **ErP** (Energy related Products), i circolatori devono essere almeno di **classe A**. [PAUSA]

Questo significa motore a magneti permanenti, controllo PWM, e consumo sotto i **22W** in condizioni tipiche. [PAUSA]

I modelli top consumano **3-6W** al minimo — meno di una lampadina LED. [PAUSA]

Molti hanno anche funzioni avanzate: [PAUSA]
- **Autoadattamento**: il circolatore calcola automaticamente la curva ottimale
- **Deaerazione**: programma automatico di sfogo aria all'avvio
- **Autoapprendimento**: memorizza le condizioni dell'impianto [PAUSA]

**Problemi tipici**: [PAUSA]
- Scheda elettronica interna guasta — il circolatore è morto elettricamente
- Incompatibilità di segnale tra scheda caldaia e circolatore aftermarket
- Sensibilità ai disturbi elettrici sulla linea [PAUSA]

## 2.4 Compatibilità tra Generazioni

[IMMAGINE: Confronto connettori circolatori]

Quando sostituisci un circolatore, devi verificare la **compatibilità del comando**. [PAUSA]

Un circolatore PWM non funziona correttamente se la scheda manda solo 0-10V. Potrebbe girare al minimo o al massimo, ma non modulare. [PAUSA]

Alcuni circolatori universali — come il Grundfos UPM3 Hybrid — accettano sia 0-10V che PWM e si autoconfigurano. [PAUSA]

**Regola**: controlla sempre il tipo di segnale della caldaia prima di ordinare il ricambio. Il manuale tecnico lo indica nella sezione dedicata al circolatore. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 3: DIAGNOSI STRUMENTALE (12 minuti)

## 3.1 Strumenti Necessari

[IMMAGINE: Kit diagnosi circolatore completo]

Per una diagnosi professionale ti servono: [PAUSA]

**Numero uno**: Multimetro digitale con funzione AC Volt e DC Volt. [PAUSA]

**Numero due**: Pinza amperometrica per corrente AC. [PAUSA]

**Numero tre**: Cacciavite a taglio grande per lo sblocco manuale. [PAUSA]

**Numero quattro**: Termometro a contatto o termocamera per misurare delta T. [PAUSA]

Opzionale ma utile: oscilloscopio portatile per vedere la forma d'onda del PWM. [PAUSA]

## 3.2 Test 1: Verifica Alimentazione

[DEMO: Misurazione tensione ai morsetti circolatore]

Prima cosa: il circolatore riceve corrente? [PAUSA]

Metti la caldaia in richiesta riscaldamento — termostato su ON, richiesta attiva. [PAUSA]

Scollega il connettore di alimentazione dal circolatore. [PAUSA]

Metti il multimetro su **AC Volt, scala 600V**. [PAUSA]

Misura tra i due terminali di alimentazione del connettore. [PAUSA]

**Valore atteso**: circa **230V AC** (220-240V è normale). [PAUSA]

[IMMAGINE: Multimetro che mostra 230V]

**Se leggi 0V**: la scheda non sta alimentando il circolatore. Controlla: [PAUSA]
- Fusibili sulla scheda elettronica
- Relè del circolatore — a volte si sente il click ma non chiude
- Connettori intermedi
- Eventuale termostato di sicurezza intervenuto [PAUSA]

**Se leggi 230V ma il circolatore non gira**: il problema è nel circolatore stesso — o è bloccato meccanicamente o è guasto elettricamente. [PAUSA]

## 3.3 Test 2: Misura Assorbimento

[DEMO: Pinza amperometrica sul cavo alimentazione]

Se il circolatore parte, misura quanto assorbe. [PAUSA]

Ricollega l'alimentazione al circolatore. [PAUSA]

Apri la pinza amperometrica e chiudila intorno a **un solo filo** — fase o neutro, non entrambi insieme. [PAUSA]

[IMMAGINE: Pinza amperometrica corretta posizione]

**Valori normali**: [PAUSA]
- A regime: **0.1-0.4 Ampere** per circolatori moderni
- In spunto iniziale: fino a **1 Ampere** per un secondo [PAUSA]

Per circolatori vecchi a tre velocità, i valori sono più alti: **0.4-0.8A** a regime. [PAUSA]

**Valori anomali**: [PAUSA]
- Sempre sopra **0.6A** per circolatore moderno: cuscinetto duro, girante che sfrega
- Assorbimento **zero** con circolatore alimentato: fermo meccanicamente o guasto
- Assorbimento **oscillante**: problema elettrico interno, condensatore inutile [PAUSA]

## 3.4 Test 3: Verifica Segnale Comando

[DEMO: Misurazione segnale PWM con multimetro]

Per circolatori modulanti, devi verificare che la scheda stia comandando correttamente. [PAUSA]

Trova il connettore del segnale di comando — di solito un connettore separato da quello di alimentazione, con fili più sottili. [PAUSA]

[IMMAGINE: Connettore segnale PWM tipico]

Colori tipici: **blu e bianco**, oppure **grigio e marrone**. [PAUSA]

### Per segnale 0-10V

Metti il multimetro su **DC Volt**. Misura tra i due fili del segnale. [PAUSA]

**Richiesta minima** (caldaia a poco carico): circa **1-2V** [PAUSA]
**Richiesta massima** (caldaia a pieno carico): circa **8-10V** [PAUSA]

Se la tensione non varia modificando la richiesta — ad esempio chiudendo valvole termostatiche — c'è un problema sulla scheda o sui parametri. [PAUSA]

### Per segnale PWM

Misurare il PWM con un multimetro standard è approssimativo. [PAUSA]

In DC Volt vedrai un valore medio che può andare da **1.5V a 4V** — non è un numero preciso. [PAUSA]

Se il tuo multimetro ha la funzione **duty cycle**, usala. Vedrai una percentuale. [PAUSA]

Per una diagnosi precisa serve un oscilloscopio, ma nella pratica quotidiana basta verificare che: [PAUSA]
- Esista un segnale (non 0V fisso)
- Il segnale vari con la richiesta di calore [PAUSA]

**Se il segnale è sempre 0V**: la scheda non sta comandando. Controlla parametri, connettori, eventuale scheda guasta. [PAUSA]

**Se il segnale è sempre fisso**: potrebbe essere un problema di parametri caldaia bloccati su "manuale" invece di "auto". [PAUSA]

## 3.5 Test 4: Verifica Circolazione Effettiva

[DEMO: Controllo temperatura mandata/ritorno]

Il circolatore gira, assorbe giusto, riceve il comando... ma l'acqua circola davvero? [PAUSA]

Prendi il termometro a contatto. [PAUSA]

Misura la temperatura dell'acqua: [PAUSA]
- Sul tubo di **mandata**: uscita caldaia verso l'impianto
- Sul tubo di **ritorno**: ingresso caldaia dall'impianto [PAUSA]

[IMMAGINE: Posizione corretta misura mandata e ritorno]

Aspetta che la caldaia sia a regime — almeno 5 minuti di funzionamento continuo. [PAUSA]

**Delta T normale**: **15-20 gradi**. [PAUSA]

Esempio: mandata **60°C**, ritorno **42°C** — differenza **18°C**, tutto ok. [PAUSA]

**Delta T troppo alto** (oltre 25°C): [PAUSA]
- Circolatore che gira troppo piano
- Ostruzione nell'impianto — valvole chiuse, fanghi
- Dimensionamento sbagliato [PAUSA]

**Delta T troppo basso** (sotto 8°C): [PAUSA]
- Circolatore che gira troppo veloce rispetto alla potenza caldaia
- Bypass aperto che manda acqua calda direttamente al ritorno [PAUSA]

**Delta T quasi zero** (mandata e ritorno uguali): [PAUSA]
- Il circolatore non sta spingendo
- Girante staccata dall'albero
- Ostruzione totale [PAUSA]

## 3.6 Tabella Riassuntiva Diagnosi

[IMMAGINE: Tabella riassuntiva diagnosi]

| Sintomo | Alimentazione | Assorbimento | Segnale | Delta T | Causa probabile |
|---------|---------------|--------------|---------|---------|-----------------|
| Radiatori freddi | 230V | 0A | OK | 0°C | Circolatore bloccato |
| Radiatori freddi | 0V | - | - | - | Scheda non alimenta |
| Ronzio senza rotazione | 230V | Alto | OK | 0°C | Bloccato meccanicamente |
| Ronzio rotazione lenta | 230V | 0.1A fisso | 0V | Alto | Scheda non comanda PWM |
| Gira ma no calore | 230V | 0.3A | OK | 0°C | Girante staccata |
| Rumore cuscinetti | 230V | Alto oscillante | OK | OK | Cuscinetto usurato |

[PAUSA LUNGA]

---

# MODULO 4: PROCEDURE PASSO-PASSO (10 minuti)

## 4.1 Quando Sostituire vs Quando Riparare

[IMMAGINE: Circolatore usurato aperto]

**Sostituire** se: [PAUSA]
- Bloccato meccanicamente e non si libera con lo sblocco
- Cuscinetti rumorosi anche dopo sblocco
- Assorbimento anomalo persistente
- Visibilmente corroso
- Perdite d'acqua dal corpo pompa
- Elettronica interna guasta [PAUSA]

**Riparare/pulire** se: [PAUSA]
- Solo bloccato da fermo estivo — sblocco manuale
- Aria intrappolata — spurgo
- Connettore ossidato — pulizia e riconnessione
- Parametri caldaia errati — riprogrammazione [PAUSA]

## 4.2 Procedura di Sostituzione Completa

[DEMO: Sostituzione passo-passo]

### Passo 1: Messa in sicurezza

Togli corrente alla caldaia dal sezionatore generale. [PAUSA]

Chiudi il rubinetto del gas. [PAUSA]

Non serve spegnere dal pannello caldaia — devi proprio togliere corrente. [PAUSA]

### Passo 2: Intercettazione acqua

[IMMAGINE: Rubinetti intercettazione circolatore]

Se la caldaia ha rubinetti di intercettazione prima e dopo il circolatore, chiudili. [PAUSA]

Molte caldaie moderne li hanno. Così non devi svuotare tutto l'impianto. [PAUSA]

Se non ci sono rubinetti, devi svuotare l'impianto dal punto più basso — di solito il rubinetto di scarico della caldaia. [PAUSA]

### Passo 3: Scarico pressione residua

[DEMO: Apertura scarico caldaia]

Apri il rubinetto di scarico sotto la caldaia — di solito vicino al vaso di espansione. [PAUSA]

Metti una bacinella sotto. [PAUSA]

Aspetta che la pressione scenda a zero sul manometro. [PAUSA]

Anche con rubinetti chiusi, esce sempre un po' d'acqua residua quando smonti. Tieni pronto uno straccio. [PAUSA]

### Passo 4: Scollegamento elettrico

[DEMO: Scollegamento connettori]

Scollega il connettore di alimentazione — due fili grossi, fase e neutro. [PAUSA]

Se c'è il connettore del segnale PWM, scollegalo — fili più sottili. [PAUSA]

Fai una foto prima di scollegare se hai dubbi sul rimontaggio. [PAUSA]

### Passo 5: Smontaggio meccanico

[DEMO: Smontaggio circolatore]

I circolatori sono fissati con due dadi o due viti sulla flangia. [PAUSA]

Svita in modo alternato — prima un po' a sinistra, poi un po' a destra — per non sforzare le guarnizioni. [PAUSA]

Quando l'ultimo giro, tieni il circolatore con l'altra mano. Esce acqua residua. [PAUSA]

### Passo 6: Verifica guarnizioni

[IMMAGINE: Guarnizioni o-ring circolatore]

Controlla le sedi delle guarnizioni. [PAUSA]

Se le guarnizioni originali sono deteriorate o schiacciate, **usa quelle nuove** in dotazione con il ricambio. [PAUSA]

Pulisci le sedi con uno straccio. Non deve restare sporco o residui che compromettono la tenuta. [PAUSA]

### Passo 7: Montaggio nuovo circolatore

[DEMO: Montaggio nuovo circolatore]

Metti le guarnizioni nuove — una per lato. [PAUSA]

Posiziona il nuovo circolatore. Attenzione alla **freccia del flusso** — deve puntare nella direzione corretta, verso l'impianto. [PAUSA]

[IMMAGINE: Freccia direzione flusso su circolatore]

Avvita a mano i dadi. Poi stringi a croce alternando. [PAUSA]

Non stringere troppo — le guarnizioni in gomma non hanno bisogno di coppia elevata. Se stringi troppo, le schiacci e perdono. [PAUSA]

### Passo 8: Riconnessione elettrica

[DEMO: Riconnessione connettori]

Ricollega il connettore di alimentazione. [PAUSA]

Se c'è polarità indicata — tipo "L" e "N" sul connettore — rispettala. [PAUSA]

Ricollega il connettore PWM se presente. [PAUSA]

### Passo 9: Riempimento e spurgo

[DEMO: Riempimento dal rubinetto di carico]

Apri i rubinetti di intercettazione se li avevi chiusi. [PAUSA]

Apri il rubinetto di carico dell'acqua — di solito sotto la caldaia. [PAUSA]

Riempi lentamente guardando il manometro. Porta la pressione a **1.0-1.2 bar** per ora. [PAUSA]

### Passo 10: Spurgo circolatore

[DEMO: Spurgo vite circolatore]

Prima di dare corrente, **sfoga l'aria** dal circolatore. [PAUSA]

Cerca la vite di sfiato sulla parte superiore del corpo pompa. [PAUSA]

Allentala piano. Esce prima aria — senti il sibilo — poi acqua. [PAUSA]

Quando esce solo acqua senza bolle, richiudi. [PAUSA]

### Passo 11: Avvio e verifica

Ridai corrente alla caldaia. [PAUSA]

Riapri il gas. [PAUSA]

Metti in richiesta riscaldamento e verifica: [PAUSA]
- Il circolatore gira senza rumori strani
- L'assorbimento è nei limiti normali
- La differenza mandata/ritorno è corretta [PAUSA]

Porta la pressione finale a **1.5 bar** dopo aver spurgato anche i radiatori. [PAUSA]

## 4.3 Spurgo Completo Impianto

[DEMO: Spurgo radiatori in sequenza]

Dopo la sostituzione del circolatore, l'aria può essersi spostata nell'impianto. [PAUSA]

**Ordine corretto di spurgo**: [PAUSA]

1. Radiatori al **piano terra**, partendo dal più lontano dalla caldaia
2. Poi **primo piano**
3. Infine sfogo automatico sulla caldaia se presente [PAUSA]

Durante lo spurgo dei radiatori, tieni il circolatore **spento o al minimo**. [PAUSA]

Se gira veloce, l'aria viene trascinata e non riesci a cacciarla. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 5: CASI REALI DAL CAMPO (8 minuti)

## Caso 1: Il Circolatore che Girava a Vuoto

[IMMAGINE: Circolatore con girante staccata dall'albero]

Cliente: radiatori freddi, caldaia che parte e scalda. [PAUSA]

Arrivo. Controllo il circolatore. [PAUSA]

Lo sento ronzare. Misuro l'assorbimento: **0.3A** — nella norma. [PAUSA]

Sembra tutto ok. Ma l'acqua non circola. [PAUSA]

Misuro la differenza mandata/ritorno: **2 gradi**. Praticamente zero. [PAUSA]

Il circolatore gira ma non spinge. [PAUSA]

Smonto. Apro il corpo pompa. [PAUSA]

[IMMAGINE: Girante staccata dall'albero motore]

Ecco il problema: la **girante si era staccata dall'albero**. [PAUSA]

Il motore girava, la girante no. Consumo giusto perché il motore non era sotto sforzo. [PAUSA]

**Lezione**: non fidarti solo del rumore e dell'assorbimento. Verifica sempre la **circolazione effettiva** con il delta T. [PAUSA]

## Caso 2: Il Segnale PWM Mancante

[IMMAGINE: Multimetro che mostra 0V]

Caldaia nuova, installata sei mesi prima. [PAUSA]

Il cliente lamenta che i radiatori si scaldano poco. La caldaia non va mai in blocco, sembra funzionare. [PAUSA]

Arrivo. Il circolatore gira, lo sento. [PAUSA]

Misuro il delta T: **28 gradi**. Troppo alto. Il circolatore gira troppo piano. [PAUSA]

Misuro l'assorbimento: **0.08A**. Troppo basso. [PAUSA]

Il circolatore sta girando al **minimo assoluto**, non modula. [PAUSA]

Controllo il segnale PWM: **0 volt**. Fisso. [PAUSA]

La scheda non stava mandando nessun comando di velocità. [PAUSA]

Verifico i parametri caldaia: tutto ok, impostato su "auto". [PAUSA]

Provo a forzare dal menù tecnico un comando manuale: il circolatore accelera. [PAUSA]

La scheda è in grado di alimentare il circolatore ma ha il driver del segnale PWM guasto. [PAUSA]

Cambio la scheda. Problema risolto. [PAUSA]

**Lezione**: se il circolatore gira ma troppo piano, verifica **sempre** il segnale di comando prima di condannarlo. [PAUSA]

## Caso 3: L'Aria che Tornava Sempre

[IMMAGINE: Sfogo automatico incrostato]

Cliente storico. Chiama ogni due settimane per rumori nell'impianto. [PAUSA]

Ha già spurgato i radiatori dieci volte. Il problema torna sempre. [PAUSA]

Controllo circolatore: ok. Controllo vaso espansione: precarica corretta. [PAUSA]

Tutti i radiatori senza ostruzioni. [PAUSA]

Allora dov'è l'aria che entra? [PAUSA]

Cerco lo sfogo automatico sulla caldaia. Lo trovo in cima, incrostato di calcare. [PAUSA]

[IMMAGINE: Sfogo automatico incrostato interno]

La membrana interna non chiudeva più bene. [PAUSA]

Ogni volta che il circolatore si fermava e la pressione scendeva leggermente, aspirava aria dall'esterno. [PAUSA]

Sostituisco lo sfogo automatico — costa 8 euro. [PAUSA]

Fine dei problemi. [PAUSA]

**Lezione**: quando l'aria torna sempre, cerca il punto di ingresso. Non è sempre il circolatore o i radiatori. [PAUSA]

## Caso 4: Incompatibilità Ricambio

[IMMAGINE: Due circolatori con connettori diversi]

Chiamata per circolatore fermo. [PAUSA]

Verifico: 230V presenti, circolatore morto. Cambio ricambio. [PAUSA]

Il cliente aveva già comprato un ricambio universale online per risparmiare. [PAUSA]

Lo monto. Alimentazione ok. Il circolatore parte... ma non modula. Gira sempre al massimo. [PAUSA]

Controllo la documentazione: la caldaia originale comandava con segnale **0-10V**. [PAUSA]

Il ricambio universale accettava solo **PWM**. [PAUSA]

Non c'era modo di farlo modulare. Il cliente ha dovuto ordinare il ricambio corretto. [PAUSA]

**Lezione**: prima di sostituire un circolatore modulante, **verifica il tipo di segnale**. Il risparmio di 30 euro può costare una doppia uscita. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 6: ERRORI DA EVITARE (3 minuti)

[IMMAGINE: Lista errori comuni]

## Errore 1: Cambiare senza diagnosticare

Il circolatore non gira. Lo cambi. Quello nuovo non gira nemmeno. [PAUSA]

Hai speso 150 euro per scoprire che il problema era la scheda. [PAUSA]

**Sempre** verificare alimentazione e segnale prima di ordinare il ricambio. [PAUSA]

## Errore 2: Stringere troppo i dadi

Le guarnizioni del circolatore sono in gomma morbida. [PAUSA]

Se stringi troppo, le schiacci e iniziano a perdere dopo qualche mese. [PAUSA]

Stringi quanto basta per sentire resistenza. Poi verifica la tenuta con la caldaia in pressione. [PAUSA]

## Errore 3: Dimenticare lo spurgo

Monti il nuovo circolatore, accendi, senti rumori strani. [PAUSA]

È l'aria intrappolata nel corpo pompa. [PAUSA]

**Sempre** sfogare dalla vite di sfiato prima di mettere in funzione. [PAUSA]

## Errore 4: Ignorare la freccia del flusso

Il circolatore ha una freccia stampata che indica la direzione del flusso. [PAUSA]

Se lo monti al contrario, non viene fuori nulla — ma l'acqua circola in senso sbagliato. [PAUSA]

Risultato: mandata e ritorno invertiti, caldaia che fa cose strane. [PAUSA]

## Errore 5: Non verificare la compatibilità elettrica

Circolatore originale: comando 0-10V. [PAUSA]

Ricambio universale: accetta solo PWM. [PAUSA]

Risultato: non modula, gira sempre al massimo o al minimo. [PAUSA]

**Sempre** controllare il tipo di segnale prima di ordinare. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 7: NOTE COMPATIBILITÀ TRA MARCHI (2 minuti)

[IMMAGINE: Loghi costruttori caldaie]

## Caldaie Vaillant

Circolatori integrati con comando su **eBUS**. [PAUSA]

Non puoi mettere un circolatore universale standard — il BUS non parla con lui. [PAUSA]

Devi usare il ricambio originale oppure un circolatore con adattatore eBUS. [PAUSA]

## Caldaie Ariston

Solitamente comando **0-10V**. [PAUSA]

Compatibili con la maggior parte dei circolatori universali tipo Grundfos UPM3 o Wilo Para. [PAUSA]

## Caldaie Immergas

Misto: alcuni modelli 0-10V, alcuni PWM. [PAUSA]

Controlla sul manuale tecnico della caldaia specifica. [PAUSA]

## Caldaie Beretta/Riello

Spesso comando **PWM**. [PAUSA]

Circolatori universali con auto-detect funzionano bene. [PAUSA]

## Caldaie Baxi

Vecchi modelli: tre velocità, nessun comando. [PAUSA]

Modelli recenti: PWM standard. [PAUSA]

**Regola generale**: consulta sempre il manuale tecnico prima di ordinare un ricambio non originale. [PAUSA]

[PAUSA LUNGA]

---

# CHIUSURA (2 minuti)

Ricapitolando. [PAUSA]

Il circolatore è il cuore dell'impianto. Senza circolazione, niente riscaldamento. [PAUSA]

I **quattro test fondamentali**: [PAUSA]
1. Verifica alimentazione 230V
2. Misura assorbimento con pinza
3. Verifica segnale PWM o 0-10V
4. Controllo circolazione effettiva con delta T [PAUSA]

Quando sostituire: [PAUSA]
- Bloccato meccanicamente irreparabile
- Cuscinetti rumorosi
- Elettronica interna guasta
- Girante staccata [PAUSA]

Quando **non** è il circolatore: [PAUSA]
- Segnale di comando assente — è la scheda
- Ostruzione nell'impianto — è l'idraulica
- Aria continua — cerca il punto di ingresso [PAUSA]

Lo spurgo dopo la sostituzione è **fondamentale**. Non saltarlo. [PAUSA]

Hai domande? Scrivimi a info@simonsilvercaldaie.it. [PAUSA]

Nel prossimo video tecnico: la **valvola a 3 vie** — quella che rovina la vita a tanti tecnici. [PAUSA]

Grazie per la fiducia. Ci vediamo al prossimo video. [PAUSA]

[IMMAGINE: Logo + prossimo video preview]

---

# MATERIALI BONUS

## PDF Checklist Diagnosi Circolatore

- [ ] Alimentazione 230V presente
- [ ] Circolatore gira (rumore/vibrazione)
- [ ] Assorbimento normale (0.1-0.4A moderni, 0.4-0.8A vecchi)
- [ ] Segnale comando presente e variabile
- [ ] Circolazione effettiva (delta T 15-20°C)
- [ ] Aria spurgata da circolatore e radiatori
- [ ] Pressione impianto corretta (1.5 bar a freddo)

## Tabella Compatibilità Segnali

| Tipo caldaia | Segnale | Circolatori compatibili |
|--------------|---------|-------------------------|
| Pre-2008 | Nessuno (3 vel.) | Tutti a 3 velocità |
| 2008-2015 | 0-10V | Grundfos UPM3, Wilo Para |
| Post-2015 | PWM | Grundfos UPM3, Wilo Para PWM |
| Vaillant | eBUS | Solo OEM o con adattatore |

---

## FINE SCRIPT PARTE 2

**Durata stimata**: 45 minuti
**Parole totali**: ~5500
**Velocità lettura**: 120 parole/min
**Piattaforma**: simonsilvercaldaie.it (Premium a pagamento)
