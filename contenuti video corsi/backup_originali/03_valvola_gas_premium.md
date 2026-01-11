# SCRIPT VIDEO PREMIUM - Valvola Gas
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

Benvenuto nel video tecnico completo sulla valvola gas. [PAUSA]

Sono Simone.
Questo è un video **tecnico avanzato**. [PAUSA]

Se hai visto il video su YouTube...
sai cos'è una valvola e i sintomi base. [PAUSA]

Qui imparerai:
- Come testare elettricamente le bobine
- Come misurare le pressioni corrette
- La procedura di taratura completa
- E come evitare di cambiare valvole buone [PAUSA]

Questo è uno degli argomenti più delicati.
Una diagnosi sbagliata costa caro. [PAUSA]

Prendi appunti. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 1: TEORIA AVANZATA (12 minuti)

## 1.1 Tipologie di Valvole Gas

[IMMAGINE: Confronto valvole Sit, Honeywell, Dungs]

Le valvole più comuni:

**Sit Sigma 845**: molto diffusa in Italia.
Due bobine separate.
Modulazione analogica 0-10V. [PAUSA]

**Honeywell VK4105**: standard europeo.
Bobine in serie.
Modulazione integrata. [PAUSA]

**Dungs**: qualità tedesca.
Spesso in caldaie premium.
Modulazione elettronica avanzata. [PAUSA]

[IMMAGINE: Etichette identificative]

Ogni marca ha logiche diverse.
Controlla sempre il codice sulla valvola
prima di procedere con i test. [PAUSA]

---

## 1.2 Sicurezze Integrate

[IMMAGINE: Schema doppio otturatore]

Tutte le valvole gas hanno sicurezze multiple:

**Doppio otturatore**: due valvole in serie.
Devono aprirsi entrambe.
Se una fallisce: niente gas. [PAUSA]

**Molla di ritorno**: quando togli corrente,
la molla chiude immediatamente la valvola.
Tempo di chiusura: sotto 1 secondo. [PAUSA]

**Controllo tenuta**: alcune valvole
verificano la propria tenuta prima di aprire.
Se rilevano perdita interna: blocco. [PAUSA]

Queste sicurezze rendono le valvole **affidabili**.
Quando si guastano... di solito non aprono.
Non perdono gas. [PAUSA]

Il caso di valvola che perde è raro.
Ma quando succede... è pericoloso. [PAUSA]

---

## 1.3 Alimentazione e Segnali

[IMMAGINE: Schema collegamenti elettrici valvola]

Le valvole ricevono due tipi di segnale:

**Alimentazione bobine**: [PAUSA]
- AC 230V per modelli vecchi
- AC 24V per modelli comuni
- DC 24V per modelli moderni [PAUSA]

**Segnale modulazione**: [PAUSA]
- Analogico 0-10V: più comune
- PWM: in alcuni modelli
- Digitale seriale: in valvole smart [PAUSA]

Devi sapere cosa aspettarti
**prima** di attaccare il multimetro. [PAUSA]

[IMMAGINE: Tabella tensioni per marca]

| Marca caldaia | Tensione bobine | Modulazione |
|---------------|-----------------|-------------|
| Vaillant | 24V AC | 0-10V |
| Ariston | 24V AC | 0-10V |
| Beretta | 230V AC | analogica |
| Immergas | 24V AC | 0-10V |
| Baxi | 24V AC | 0-10V |
| Ferroli | 230V AC | analogica |

[PAUSA]

---

## 1.4 Pressioni Gas di Riferimento

[IMMAGINE: Manometro pressione gas]

Le pressioni da conoscere:

**Pressione di rete metano**: 20-25 mbar
Questa è la pressione che arriva dal contatore. [PAUSA]

**Pressione a monte valvola**: 18-20 mbar
Misurata all'ingresso della valvola.
Se è bassa: problema a monte. [PAUSA]

**Pressione al bruciatore**:
- Minima: 1.5-3 mbar
- Massima: 10-14 mbar
Dipende dalla potenza caldaia. [PAUSA]

**Per GPL**:
- Rete: 30-37 mbar
- Bruciatore min: 5 mbar
- Bruciatore max: 25-30 mbar [PAUSA]

Questi valori sono indicativi.
Ogni caldaia ha valori specifici nel manuale. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 2: DIAGNOSI COMPLETA (18 minuti)

## 2.1 Strumenti Necessari

[IMMAGINE: Kit diagnosi valvola gas]

**Numero uno**: Multimetro digitale.
Per tensioni AC e DC, e resistenza. [PAUSA]

**Numero due**: Manometro per gas.
Scala 0-60 mbar, precisione 0.1 mbar. [PAUSA]

**Numero tre**: Cercafughe spray.
O elettronico per più precisione. [PAUSA]

**Numero quattro**: Cacciaviti micrometrici.
Per le viti di regolazione. [PAUSA]

---

## 2.2 Test 1: Verifica Alimentazione Bobine

[DEMO: Misurazione tensione bobine]

Prima domanda: la valvola riceve corrente? [PAUSA]

Procedura:
1. Metti la caldaia in richiesta riscaldamento
2. Aspetta che il ventilatore parta
3. Misura la tensione sui morsetti delle bobine [PAUSA]

Dove misurare dipende dal modello.
Sul connettore: fase e neutro per 230V.
Oppure i due fili delle bobine per 24V. [PAUSA]

[IMMAGINE: Punti misura su connettore]

**Risultato atteso**:
- 230V AC oppure 24V AC/DC secondo il modello
- La tensione deve apparire **dopo** che il ventilatore è partito
- E **prima** che scatti il timeout di accensione [PAUSA]

Se leggi 0V:
- La scheda non sta alimentando
- Controlla fusibili scheda
- Controlla relè valvola gas
- Controlla sensori di sicurezza a monte [PAUSA]

---

## 2.3 Test 2: Misura Resistenza Bobine

[DEMO: Misura ohm sulle bobine]

Se la valvola riceve corrente ma non apre...
potrebbe avere una bobina bruciata. [PAUSA]

Procedura:
1. Togli il connettore dalla valvola
2. Imposta il multimetro su Ohm
3. Misura tra i terminali di ogni bobina [PAUSA]

**Valori tipici**:
- Bobina 24V: 50-150 Ohm
- Bobina 230V: 2000-5000 Ohm [PAUSA]

**Risultati**:
- Valore nella norma: bobina ok
- Infinito (OL): bobina interrotta, da cambiare
- Zero o quasi zero: bobina in corto, da cambiare [PAUSA]

[IMMAGINE: Multimetro che mostra 85 Ohm]

---

## 2.4 Test 3: Verifica Click di Apertura

[DEMO: Ascolto click con stetoscopio]

Anche senza strumenti...
puoi verificare se la valvola apre. [PAUSA]

Quando la scheda alimenta le bobine...
devi sentire un **click** deciso. [PAUSA]

Metti l'orecchio vicino, o usa uno stetoscopio.
Fai partire la caldaia.
Dopo il ventilatore... click. [PAUSA]

Se senti il click ma non c'è fiamma:
- Il gas arriva al bruciatore
- Il problema è l'accensione, non la valvola [PAUSA]

Se NON senti il click:
- La valvola non apre
- O non riceve corrente, o è guasta [PAUSA]

---

## 2.5 Test 4: Pressione Gas a Monte

[DEMO: Collegamento manometro ingresso valvola]

Prima di incolpare la valvola...
verifica che il gas arrivi. [PAUSA]

Sulla valvola c'è una presa di pressione.
Di solito un tappo con vite. [PAUSA]

Collega il manometro.
Con la caldaia ferma, misura. [PAUSA]

**Risultato atteso**:
- Metano: 18-25 mbar
- GPL: 30-37 mbar [PAUSA]

Se la pressione è **bassa**:
- Contatore chiuso o limitato
- Tubo gas ostruito
- Riduttore di pressione guasto [PAUSA]

Se la pressione è **zero**:
- Il gas non arriva proprio
- Controlla rubinetti e contatore [PAUSA]

[IMMAGINE: Manometro su presa pressione]

---

## 2.6 Test 5: Pressione al Bruciatore

[DEMO: Misurazione pressione bruciatore max e min]

Questa è la verifica più importante. [PAUSA]

Collega il manometro sulla presa **a valle** della valvola.
Oppure direttamente sul collettore bruciatore. [PAUSA]

Fai partire la caldaia in riscaldamento.

**Prima misura**: pressione **massima**.
Manda in richiesta massima, termostato al massimo.
Leggi la pressione. [PAUSA]

Valore tipico metano: 10-14 mbar.
Valore tipico GPL: 25-30 mbar. [PAUSA]

**Seconda misura**: pressione **minima**.
Abbassa la richiesta al minimo.
O usa il menu service se disponibile.
Leggi la pressione. [PAUSA]

Valore tipico metano: 1.5-3 mbar.
Valore tipico GPL: 5-7 mbar. [PAUSA]

[IMMAGINE: Due manometri con valori max e min]

Se le pressioni sono **fuori range**:
la valvola va tarata.
O è guasta e non modula. [PAUSA]

---

## 2.7 Test 6: Verifica Tenuta Valvola

[DEMO: Test tenuta con manometro]

Per verificare se la valvola tiene
quando è chiusa. [PAUSA]

Procedura:
1. Caldaia spenta
2. Manometro collegato a valle della valvola
3. Osserva la pressione [PAUSA]

**Risultato corretto**:
La pressione a valle scende a zero
e resta a zero. [PAUSA]

**Risultato scorretto**:
La pressione a valle sale lentamente.
Significa: la valvola perde. [PAUSA]

Questo è un **problema di sicurezza**.
Una valvola che non tiene va cambiata subito.
E il locale va aerato. [PAUSA]

---

## 2.8 Codici Errore Correlati

[IMMAGINE: Display errori]

Errori comuni legati alla valvola gas:

**Vaillant F28**: mancata accensione
**Vaillant F29**: fiamma spenta durante funzionamento
**Ariston 501**: nessuna fiamma rilevata
**Immergas 01**: blocco accensione
**Beretta A03**: mancata accensione
**Baxi E02**: errore fiamma [PAUSA]

Ricorda: questi errori indicano "problema fiamma".
Non necessariamente "valvola guasta". [PAUSA]

Può essere anche:
- Elettrodo sporco
- Trasformatore guasto
- Sonda fiamma sporca
- Ventilatore lento [PAUSA]

[PAUSA LUNGA]

---

# MODULO 3: TARATURA E SOSTITUZIONE (15 minuti)

## 3.1 Quando Tarare vs Sostituire

[IMMAGINE: Decision tree]

**Tarare** se:
- Le pressioni sono fuori range
- Ma la valvola apre e modula
- E non ci sono perdite [PAUSA]

**Sostituire** se:
- Bobina bruciata (resistenza infinita)
- Valvola che non apre (niente click)
- Valvola che perde (pressione a riposo)
- Valvola che non modula (pressione fissa) [PAUSA]

---

## 3.2 Procedura Taratura Pressione

[DEMO: Taratura completa con manometro]

**Attenzione**: questa procedura richiede patentino F-gas
e competenze specifiche.
Se non sei qualificato, non farla. [PAUSA]

Procedura:
1. Collega il manometro a valle valvola
2. Metti la caldaia in richiesta massima
3. Individua la vite di regolazione MAX
4. Ruota e porta la pressione al valore da manuale
5. Poi richiesta minima
6. Regola la vite MIN
7. Ripeti la verifica: max, min, max
8. Controlla che la modulazione sia fluida [PAUSA]

[IMMAGINE: Viti regolazione MAX e MIN]

Le viti sono contrassegnate:
- MAX o +/-
- MIN o offset [PAUSA]

Ruota **lentamente**.
Quarti di giro.
Aspetta che il sistema si stabilizzi. [PAUSA]

---

## 3.3 Valori Taratura per Marca

[IMMAGINE: Tabella pressioni per modello]

| Marca | Modello | P. max metano | P. min metano |
|-------|---------|---------------|---------------|
| Vaillant | ecoTEC | 13.5 mbar | 2.0 mbar |
| Ariston | Clas One | 11.8 mbar | 1.8 mbar |
| Beretta | Mynute | 12.0 mbar | 2.5 mbar |
| Immergas | Victrix | 13.0 mbar | 2.0 mbar |
| Baxi | Luna3 | 11.5 mbar | 2.0 mbar |
| Hermann | Micra | 12.0 mbar | 2.2 mbar |

[PAUSA]

Questi sono indicativi.
Controlla sempre il manuale specifico. [PAUSA]

---

## 3.4 Procedura Sostituzione Valvola

[DEMO: Sostituzione passo-passo]

**Passo 1**: Chiudi il gas dal rubinetto a monte. [PAUSA]
**Passo 2**: Togli corrente alla caldaia. [PAUSA]
**Passo 3**: Scollega il connettore elettrico. [PAUSA]
**Passo 4**: Svita i tubi gas in ingresso e uscita.
Attenzione: potrà uscire un po' di gas residuo. [PAUSA]

**Passo 5**: Rimuovi le viti di fissaggio.
**Passo 6**: Estrai la valvola vecchia. [PAUSA]

**Passo 7**: Monta la valvola nuova.
Usa guarnizioni nuove. Sempre.
Orientamento corretto: freccia del flusso. [PAUSA]

**Passo 8**: Ricollega i tubi.
Stringi bene ma senza esagerare. [PAUSA]

**Passo 9**: Ricollega l'elettrico. [PAUSA]

**Passo 10**: Apri lentamente il gas.
Verifica tenuta con cercafughe su tutti i giunti. [PAUSA]

**Passo 11**: Tara la valvola nuova.
Le valvole nuove arrivano con taratura di fabbrica.
Ma spesso va corretta per l'impianto specifico. [PAUSA]

[IMMAGINE: Valvola nuova montata]

---

## 3.5 Spurgo Aria dal Circuito Gas

[DEMO: Spurgo aria tubi gas]

Dopo la sostituzione...
nel circuito c'è aria. [PAUSA]

Prova ad accendere la caldaia.
Potrebbe non partire subito.
Fai 2-3 tentativi. [PAUSA]

Se dopo 5 tentativi non parte:
- Verifica tenuta raccordi
- Controlla che il gas arrivi [PAUSA]

Una volta che parte...
fai un'analisi combustione completa.
CO, CO2, tiraggio. [PAUSA]

[PAUSA LUNGA]

---

# MODULO 4: CASI REALI (10 minuti)

## Caso 1: La Valvola Incriminata Ingiustamente

[IMMAGINE: Elettrodo di accensione sporco]

Caldaia che non parte.
Errore mancata accensione.
Il tecnico precedente: "è la valvola". [PAUSA]

Arrivo io. Controllo la valvola.
Tensione: presente.
Click: presente.
Pressione gas: corretta. [PAUSA]

Il problema? L'**elettrodo di accensione**.
Sporco di residui carboniosi.
Non faceva scintilla. [PAUSA]

Pulisco l'elettrodo.
La caldaia riparte.
Costo: 10 minuti di lavoro. [PAUSA]

Se avessi cambiato la valvola: 200 euro buttati. [PAUSA]

---

## Caso 2: La Fiamma Gialla

[IMMAGINE: Fiamma gialla vs blu]

Cliente: "fa un odore strano".
Vado e trovo fiamma **gialla**. [PAUSA]

Misuro le pressioni gas: tutto ok.
Ma l'analisi combustione mostra CO alto. [PAUSA]

Il problema: il **rapporto aria/gas** era sballato.
Il bruciatore aspirava poca aria.
La valvola era innocente. [PAUSA]

Soluzione: pulizia bruciatore e regolazione aria.
Fiamma torna blu.
CO rientra nei limiti. [PAUSA]

Lezione: la fiamma gialla non è sempre la valvola.
Può essere il bruciatore o il tiraggio. [PAUSA]

---

## Caso 3: La Valvola che Perdeva

[IMMAGINE: Cercafughe con bolle]

Caldaia che puzzava di gas anche da spenta.
Preoccupante. [PAUSA]

Test tenuta sulla valvola: pressione a valle saliva.
La valvola non teneva. [PAUSA]

In questo caso: sostituzione immediata.
Nessun dubbio.
E ventilazione forzata del locale. [PAUSA]

Lezione: una valvola che perde è rara
ma è una **emergenza**.
Non temporeggiare. [PAUSA]

[PAUSA LUNGA]

---

# CHIUSURA (3 minuti)

Ricapitolando. [PAUSA]

La valvola gas è critica.
Ma viene accusata troppo spesso
quando il problema è altrove. [PAUSA]

I test fondamentali:
1. Alimentazione bobine presente?
2. Resistenza bobine corretta?
3. Click di apertura udibile?
4. Pressione a monte ok?
5. Pressione al bruciatore tarabile?
6. Tenuta a riposo? [PAUSA]

Prima di cambiarla...
verifica elettrodo, trasformatore, ventilatore. [PAUSA]

Se devi cambiarla:
guarnizioni nuove, orientamento corretto, taratura finale. [PAUSA]

Hai domande?
Scrivimi a info@simonsilvercaldaie punto it. [PAUSA]

Prossimo video tecnico: lo **scambiatore primario**.
Come diagnosticarlo, quando pulirlo, quando cambiarlo. [PAUSA]

Grazie e ci vediamo al prossimo. [PAUSA]

[IMMAGINE: Logo + prossimo video]

---

# MATERIALI BONUS

## PDF Checklist Diagnosi Valvola Gas
- [ ] Tensione bobine misurata
- [ ] Resistenza bobine ok
- [ ] Click apertura udibile
- [ ] Pressione a monte corretta
- [ ] Pressione max tarabile
- [ ] Pressione min tarabile
- [ ] Tenuta a riposo ok

## Tabella Pressioni per Modello
(Valori dettagliati per 20+ modelli)

## Schema Elettrico Valvola Sit 845
(Collegamento bobine)

---

## FINE SCRIPT PREMIUM

**Durata stimata**: 55-60 minuti
**Parole totali**: ~6800
**Velocità lettura**: 120 parole/min
