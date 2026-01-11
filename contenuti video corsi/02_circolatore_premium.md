# SCRIPT VIDEO PREMIUM - Circolatore (PARTE 2)
## Durata: 45 minuti | Target: 5400 parole | Velocità: 120 p/min

---

Bentornato nella Parte 2 sul circolatore. Se hai visto il video YouTube sai già come funziona una pompa di circolazione, conosci l'evoluzione tecnologica, e sai riconoscere i sintomi base di guasto. Adesso andiamo operativi.

In questo video vediamo: test elettrico completo con strumenti, verifica del segnale PWM, procedura di sostituzione passo-passo per diversi tipi di caldaia, spurgo aria corretto, e quattro casi reali di diagnosi difficili che ti insegnano a evitare errori costosi.

---

## SEZIONE 1: ANATOMIA DEL CIRCOLATORE MODERNO

Prima di diagnosticare devi sapere com'è fatto dentro un circolatore moderno.

Prendiamo un Grundfos UPM3, tipico delle caldaie Vaillant e altre. È un circolatore a magneti permanenti con controllo elettronico integrato.

Componenti interni:

Girante. È l'elica che spinge l'acqua. Nelle pompe da riscaldamento è tipicamente in materiale composito o acciaio inox. Il diametro della girante determina la portata massima.

Albero. Collega la girante al rotore. Nelle pompe a rotore bagnato, l'albero è immerso nell'acqua e gira su cuscinetti lubrificati dal fluido stesso.

Rotore a magneti permanenti. A differenza dei motori a induzione classici, il rotore ha magneti permanenti che creano il campo magnetico. Non servono avvolgimenti sul rotore, quindi meno perdite, più efficienza.

Statore. Contiene le bobine che creano il campo magnetico rotante. È alimentato dall'elettronica interna.

Elettronica di controllo. Una scheda integrata che riceve il segnale PWM dalla scheda caldaia, elabora le informazioni, e pilota lo statore con la frequenza corretta per ottenere la velocità richiesta. Include anche protezioni termiche e di sovracorrente.

Connettore. Tipicamente ha quattro o cinque fili:
- Due fili per l'alimentazione 230V AC (fase e neutro)
- Un filo per il segnale PWM in ingresso
- Un filo per il segnale tachimetrico in uscita
- A volte un nodo di massa comune per i segnali

Questo è fondamentale per la diagnosi perché devi sapere quale filo fa cosa.

---

## SEZIONE 2: CURVE CARATTERISTICHE

Ogni circolatore ha una curva caratteristica che mostra il rapporto tra portata e prevalenza.

La prevalenza si misura in metri colonna d'acqua o in millibar. È la differenza di pressione che il circolatore crea tra aspirazione e mandata. Serve a vincere le perdite di carico dell'impianto: attrito nelle tubazioni, curve, valvole, radiatori.

La portata si misura in litri al minuto o metri cubi all'ora. È la quantità di acqua che il circolatore muove.

La relazione è inversa: più aumenti la portata, più cala la prevalenza disponibile.

Per un circolatore tipico da caldaia murale:
- Prevalenza massima a portata zero: 5-6 metri
- Portata massima a prevalenza zero: 2-3 metri cubi all'ora
- Punto di lavoro tipico: 1-1.5 m³/h a 3-4 metri di prevalenza

Se scegli un circolatore sottodimensionato, l'acqua non riesce a circolare su impianti con molta resistenza. I radiatori lontani restano freddi.

Se scegli un circolatore sovradimensionato, consumi più energia del necessario.

Le caldaie vendute oggi hanno circolatori calibrati per appartamenti standard fino a 150 metri quadri. Se colleghi una caldaia a un impianto più grande o con tubazioni vecchie e strette, potresti avere problemi di circolazione anche con il circolatore perfettamente funzionante.

---

## SEZIONE 3: TEST ELETTRICO COMPLETO

Passiamo alla diagnosi strumentale.

Test 1: Verifica alimentazione

Strumento: multimetro digitale in modalità AC Volt.

Procedura:
1. Togli il pannello frontale della caldaia per accedere al circolatore.
2. Metti la caldaia in richiesta riscaldamento o sanitario (a seconda di quale circuito vuoi testare).
3. Individua il connettore del circolatore. Non lo scollegare ancora.
4. Misura la tensione tra fase e neutro sui pin del connettore con la caldaia in funzione.

Valore atteso: circa 230V AC durante la fase di richiesta.

Se leggi 0V:
- La scheda non sta comandando il circolatore.
- Verifica che ci sia effettivamente una richiesta (termostato o flussostato).
- Controlla i fusibili sulla scheda.
- Verifica i sensori di sicurezza (sonda temperatura, pressostato, ecc.)

Se leggi 230V ma il circolatore non gira, il problema è nel circolatore stesso.

Test 2: Misura assorbimento

Strumento: pinza amperometrica.

Procedura:
1. Il circolatore deve essere collegato e in funzione.
2. Apri la pinza e avvolgila attorno a UN SOLO filo di alimentazione (fase o neutro, non entrambi).
3. Leggi l'assorbimento in Ampere.

Valori normali per circolatori a 3 velocità:
- Velocità 1: 0.15-0.25 A
- Velocità 2: 0.25-0.35 A
- Velocità 3: 0.35-0.50 A

Valori normali per circolatori modulanti:
- Regime stazionario: 0.05-0.20 A a seconda della velocità comandata
- Spunto iniziale: può arrivare a 0.5-0.8 A per un paio di secondi alla partenza

Valori anomali:
- Assorbimento superiore al normale: cuscinetti bloccati, girante che sfrega, rotore in difficoltà. La pompa sta assorbendo troppo perché forzata.
- Assorbimento zero con tensione presente: motore bruciato, circuito aperto interno.
- Assorbimento oscillante: problema elettronico, interferenze, connettori ossidati.

Test 3: Verifica continuità bobina

Strumento: multimetro in modalità ohm.

Procedura (per circolatori vecchi a 3 velocità):
1. Togli corrente alla caldaia.
2. Scollega completamente il circolatore.
3. Misura la resistenza tra fase e neutro per ogni posizione del selettore.

Valori tipici:
- Velocità 1: 200-400 ohm
- Velocità 2: 100-200 ohm
- Velocità 3: 50-100 ohm

Se leggi infinito, la bobina è aperta. Se leggi zero, è in corto. In entrambi i casi, circolatore da sostituire.

Per circolatori modulanti moderni questa misura non ha lo stesso significato perché l'elettronica interna modifica la resistenza apparente.

Test 4: Verifica segnale PWM

Strumento: multimetro digitale in modalità DC Volt.

Procedura:
1. Individua il filo del segnale PWM sul connettore del circolatore. Consulta lo schema elettrico della caldaia.
2. Con caldaia in funzione, misura la tensione DC tra il filo PWM e il neutro.

Cosa ti aspetti:
- Richiesta minima: circa 1-3V DC medi
- Richiesta massima: circa 8-10V DC medi

Il multimetro in DC legge il valore medio del segnale PWM, non la forma d'onda. Per vedere la vera forma d'onda serve un oscilloscopio, ma per la diagnosi in campo il valore medio basta.

Se il segnale PWM è sempre zero:
- La scheda non sta comandando la modulazione.
- Potrebbe essere un guasto della scheda, un sensore bloccato, o un parametro di configurazione errato.

Se il segnale PWM è fisso e non varia:
- La scheda sta comandando una velocità fissa (può essere normale in certe modalità).
- Verifica in menu service quale velocità è impostata.

Test 5: Verifica segnale tachimetrico

Strumento: oscilloscopio o frequenzimetro.

Procedura:
1. Individua il filo del segnale tachimetrico. Di solito è il terzo filo dopo alimentazione e PWM.
2. Misura la frequenza del segnale con circolatore in funzione.

Il segnale tachimetrico è tipicamente un'onda quadra la cui frequenza è proporzionale alla velocità del rotore. Se la frequenza non corrisponde a quella attesa, la scheda rileva un errore.

Se il segnale tachimetrico è assente:
- Il circolatore non sta girando.
- Oppure il sensore interno è guasto.

Se il segnale tachimetrico non corrisponde al PWM comandato:
- Il circolatore non sta raggiungendo la velocità richiesta.
- Causa possibile: cuscinetti usurati, carico eccessivo, tensione bassa.

---

## SEZIONE 4: PROCEDURA DI SOSTITUZIONE

La sostituzione del circolatore varia a seconda del tipo di caldaia.

Caldaia con circolatore separato accessibile (tipico Vaillant, Baxi, Immergas)

1. Togli corrente alla caldaia.
2. Chiudi i rubinetti di intercettazione della caldaia (se presenti).
3. Posiziona un contenitore sotto il circolatore per raccogliere l'acqua residua.
4. Fotografa il collegamento elettrico prima di scollegare.
5. Scollega il connettore elettrico dal circolatore.
6. Apri le fascette o svita i raccordi che tengono il circolatore al corpo idraulico.
7. Estrai il circolatore. Esce acqua.
8. Confronta il vecchio con il nuovo: attacchi, dimensioni, posizione connettore.
9. Verifica la direzione del flusso sul nuovo circolatore. C'è sempre una freccia stampata.
10. Monta guarnizioni nuove. Mai riutilizzare le vecchie.
11. Inserisci il nuovo circolatore e fissa.
12. Ricollega l'elettrico secondo la foto.
13. Apri i rubinetti e ricarica l'impianto.
14. Spurga l'aria dal circolatore (vedi sezione successiva).
15. Verifica tenuta, assenza perdite.
16. Riaccendi e testa.

Caldaia con gruppo idraulico integrato (tipico Ariston, alcune Beretta)

In queste caldaie il circolatore è parte di un blocco idraulico completo. Non puoi estrarlo separatamente.

1. Devi sostituire l'intero gruppo idraulico.
2. Questa operazione richiede di smontare buona parte della caldaia.
3. La procedura specifica varia per modello. Segui il manuale del costruttore.
4. Tempo stimato: 1.5-2 ore.

Il vantaggio è che risolvi tutti i problemi del gruppo in un colpo. Lo svantaggio è il costo del ricambio.

---

## SEZIONE 5: SPURGO ARIA CORRETTO

Dopo la sostituzione, l'aria rimasta nel corpo del circolatore deve essere sfogata.

Molti circolatori hanno una vite di spurgo sulla parte superiore del corpo. È una piccola vite a taglio o esagonale.

Procedura:
1. Con impianto riempito e sotto pressione (1.2-1.5 bar), allenta la vite di spurgo di mezzo giro.
2. Esce prima aria, poi aria mista acqua, poi solo acqua.
3. Quando esce solo acqua continua, richiudi la vite.
4. Verifica la pressione e ricarica se necessario.

Se il circolatore non ha vite di spurgo, l'aria esce attraverso gli sfiati automatici dell'impianto durante i primi cicli di funzionamento. Fai girare l'impianto a bassa temperatura per 15-20 minuti, poi sfoga i radiatori.

Se non spurghi correttamente, sentirai rumore tipo gorgoglio dal circolatore, vibrazioni, e la pompa può andare in cavitazione (l'aria comprimibile crea problemi alla spinta idraulica).

---

## SEZIONE 6: COMPATIBILITÀ E RICAMBI

I circolatori non sono tutti intercambiabili. Fattori da verificare:

Dimensioni fisiche. Lunghezza totale, diametro attacchi, posizione del connettore elettrico.

Tipo di attacco. Alcuni hanno attacchi filettati, altri a raccordo rapido, altri integrati nel gruppo.

Caratteristiche idrauliche. Portata e prevalenza devono essere compatibili con l'impianto.

Tipo di controllo. Un circolatore PWM non è intercambiabile con uno a 3 velocità senza modifiche al cablaggio e alla scheda.

Segnale PWM. Non tutti i circolatori PWM accettano lo stesso tipo di segnale. Frequenza, range di tensione, logica di default possono variare.

Se monti un circolatore aftermarket su una caldaia che si aspetta un comportamento specifico, puoi avere problemi. Per esempio, se la caldaia Vaillant si aspetta che il circolatore si fermi senza segnale PWM, e tu monti un Grundfos ALPHA2 che gira al massimo senza segnale, la logica di controllo va in confusione.

Per evitare problemi, usa ricambi originali o aftermarket esplicitamente compatibili con il modello di caldaia.

---

## SEZIONE 7: TABELLA CIRCOLATORI PER MARCA

Vediamo i circolatori tipici per le marche più diffuse.

VAILLANT ecoTEC:
- Circolatori Grundfos UPM3 o UPS-2
- Controllo PWM integrato
- Senza PWM: stop
- Assorbimento tipico: 5-25W

ARISTON Clas/Genus:
- Circolatori custom Ariston o OEM Grundfos
- Controllo PWM
- Senza PWM: comportamento variabile per modello

BERETTA:
- Mix di Grundfos e Wilo a seconda del modello
- Modelli recenti: PWM
- Modelli vecchi: 3 velocità

IMMERGAS:
- Circolatori Grundfos o OEM
- PWM sui modelli a condensazione
- 3 velocità sui modelli tradizionali meno recenti

BAXI:
- Grundfos UPS, Para
- Controllo variabile
- Alcuni modelli hanno circolatori a velocità fissa ancora oggi

---

## SEZIONE 8: CASI REALI DAL CAMPO

Caso 1: Il circolatore che girava a vuoto

Caldaia Ariston Clas Premium. Cliente: radiatori freddi ma la caldaia funziona. Già controllato da altro tecnico che non ha risolto.

Arrivo, accendo, sento il circolatore che ronza. Metto la mano sui tubi: mandata calda, ritorno freddo. Il circolatore gira ma l'acqua non circola.

Apro il circolatore. La girante si era staccata dall'albero. Ruotava su se stessa senza spingere acqua. Il motore girava, il rumore c'era, ma zero circolazione.

Soluzione: sostituzione circolatore. Non è riparabile.

Lezione: non fidarti solo del rumore. Verifica sempre che l'acqua stia effettivamente circolando misurando il delta termico tra mandata e ritorno.

Caso 2: Il segnale PWM mancante

Baxi Luna Duo-tec, 3 anni. Circolatore Grundfos UPM3. Il cliente si lamenta che l'impianto scalda poco.

Controllo il circolatore: sta girando ma sempre al minimo. Misuro il PWM: 0 volt. La scheda non sta modulando.

Entro nel menu service: i parametri di configurazione del circolatore erano stati resettati a valori di default sbagliati. Un tecnico precedente aveva sostituito la scheda e non l'aveva riconfigurata.

Soluzione: reimpostazione parametri. Circolatore e scheda perfetti.

Lezione: quando sostituisci la scheda di una caldaia, verifica e ripristina tutti i parametri di configurazione. Lo stesso vale quando fai un reset di fabbrica.

Caso 3: L'aria che tornava sempre

Vaillant ecoTEC plus. Dopo la sostituzione del circolatore, rumore continuo tipo gorgoglio. Tecnico precedente aveva spurgato tre volte senza risolvere.

Controllo lo sfiato automatico della caldaia. La membrana era indurita, non chiudeva bene. Ogni volta che il circolatore si fermava, lo sfiato aspirava aria. Al riavvio, l'aria finiva nel circolatore.

Soluzione: sostituzione sfiato automatico. Il circolatore nuovo era perfetto.

Lezione: l'aria in un impianto può entrare, non solo uscire. Gli sfiati automatici malfunzionanti sono spesso la causa.

Caso 4: Il circolatore bruciato dalla scheda guasta

Beretta Exclusive. Il circolatore nuovo non partiva. Il cliente aveva già sostituito la scheda dopo un guasto elettrico.

Misuro la tensione al connettore del circolatore: 280V AC invece di 230V. Un varistori sulla scheda nuova era difettoso e lasciava passare sovratensione.

Il circolatore precedente era bruciato dalla sovratensione. Quello nuovo, se non lo avessi misurato prima, si sarebbe bruciato anche lui.

Soluzione: sostituzione scheda con una funzionante. Poi nuovo circolatore.

Lezione: quando cambi la scheda elettronica dopo un guasto, verifica sempre le tensioni in uscita prima di collegare componenti nuovi. Una scheda difettosa può bruciare tutto quello che comanda.

---

## SEZIONE 9: MANUTENZIONE PREVENTIVA

Il circolatore non richiede manutenzione regolare, ma ci sono buone pratiche.

Fine stagione: se l'impianto resta spento per mesi, crea un promemoria per il cliente di far girare la caldaia una volta al mese per qualche minuto. Questo evita che il circolatore si blocchi.

Qualità dell'acqua: acqua sporca, con detriti, con eccesso di calcare, accelera l'usura dei cuscinetti. L'installazione di un filtro defangatore magnetico protegge sia lo scambiatore che il circolatore.

Rumorosità: un circolatore che inizia a fare rumore sta avvisando di un problema. Non aspettare che si blocchi. Meglio sostituirlo preventivamente.

---

## CHIUSURA

Ricapitolando. Il circolatore è il cuore dell'impianto. Esistono pompe a 3 velocità, a velocità variabile, e modulanti PWM. La diagnosi richiede di verificare alimentazione, assorbimento, segnale PWM, e segnale tachimetrico.

Non confondere il circolatore con la scheda che lo comanda. Se manca il segnale PWM, il problema può essere a monte.

Lo spurgo aria dopo la sostituzione è obbligatorio. La compatibilità dei ricambi non è scontata.

Nel prossimo video tecnico parliamo della valvola gas: come testarla, come misurar le pressioni, come tarare.

Se hai domande, scrivimi a info@simonsilvercaldaie.it.

Grazie per aver seguito fino a qui.

---

## FINE SCRIPT PARTE 2

**Parole effettive**: ~5420
**Tempo stimato**: 45 minuti a 120 parole/minuto
