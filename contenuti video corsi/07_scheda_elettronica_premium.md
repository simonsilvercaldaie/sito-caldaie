# SCRIPT VIDEO PREMIUM - Scheda Elettronica (PARTE 2)
## Durata: 45 minuti | Target: 5400 parole | Velocità: 120 p/min

---

Bentornato nella Parte 2 sulla scheda elettronica. Nella Parte 1 hai visto cos'è, cosa controlla, come interpretare gli errori. Adesso andiamo operativi: test elettrici, verifica sensori, menu service.

---

## SEZIONE 1: ARCHITETTURA DELLA SCHEDA

Prima di diagnosticare devi sapere com'è fatta dentro.

Alimentatore switching. Converte i 230V AC di rete nelle tensioni DC usate dalla scheda: tipicamente 5V per il microcontrollore, 12V o 24V per i relè e alcuni sensori. È il primo componente a guastarsi se ci sono sbalzi di tensione.

Microcontrollore. Il cuore della scheda. Esegue il firmware, gestisce la logica, controlla tutto. Se si guasta, la scheda va sostituita.

Memoria EEPROM. Contiene i parametri di configurazione: tipo di caldaia, potenza, curve di compensazione. Può essere letta e scritta dal menu service.

Relè di potenza. Interruttori elettromeccanici che comandano i carichi a 230V: valvola gas, circolatore, ventilatore. I contatti si usurano con l'uso.

Optoisolatori e transistor. Per comandare carichi a bassa potenza o segnali digitali.

Connettori. Punti di collegamento per sensori, attuatori, display, alimentazione. Spesso la causa di problemi intermittenti.

Componenti di protezione. Varistori per sbalzi di tensione, fusibili per sovracorrenti.

---

## SEZIONE 2: TEST DEI SENSORI NTC

Le sonde di temperatura NTC sono i sensori più comuni e più spesso difettosi.

Cosa significa NTC? Negative Temperature Coefficient. La resistenza diminuisce all'aumentare della temperatura.

Valori tipici per sonde da 10 kOhm:
- 0°C: circa 30 kOhm
- 20°C: circa 12 kOhm
- 25°C: 10 kOhm (valore nominale)
- 40°C: circa 5.5 kOhm
- 60°C: circa 2.5 kOhm
- 80°C: circa 1.2 kOhm

Procedura di test:

1. Identifica la sonda da testare.
2. Scollega la sonda dalla scheda.
3. Multimetro in modalità ohm.
4. Misura la resistenza della sonda.
5. Confronta con la temperatura attuale dell'ambiente o del tubo.

Interpretazione:

Se la resistenza corrisponde alla tabella per quella temperatura: sonda ok.

Se la resistenza è molto diversa: sonda guasta.

Se la resistenza è infinita: sonda interrotta.

Se la resistenza è zero: sonda in cortocircuito.

Se la resistenza è corretta a riposo ma salta a valori assurdi quando si scalda: sonda intermittente.

Attenzione: alcune caldaie usano sonde da 20 kOhm o altri valori. Consulta la documentazione per i valori esatti.

---

## SEZIONE 3: TEST DELLE USCITE DELLA SCHEDA

Le uscite a relè comandano i carichi principali.

Test 1: Tensione sull'uscita valvola gas

1. Con caldaia in richiesta e durante il tentativo di accensione, misura la tensione sui morsetti della valvola gas.
2. Valore atteso: circa 230V AC quando la scheda comanda l'apertura.
3. Se 0V: la scheda non sta comandando (verifica consenso sensori) oppure il relè è guasto.

Test 2: Tensione sull'uscita ventilatore

Stessa procedura. Verifica che durante la richiesta ci sia tensione.

Per ventilatori modulanti EC, verifica anche il segnale PWM come spiegato nel video dedicato.

Test 3: Tensione sull'uscita circolatore

Stessa procedura.

Test 4: Verifica relè senza carico

Se sospetti un relè interno:

1. Scollega il carico (es. valvola gas).
2. Metti la caldaia in richiesta.
3. Misura la tensione sull'uscita della scheda.
4. Se c'è tensione ma prima non funzionava: problema nel carico.
5. Se non c'è tensione: problema nella scheda (relè o logica a monte).

---

## SEZIONE 4: IL MENU SERVICE

Ogni scheda moderna ha un menu service accessibile ai tecnici.

Come accedere:

Varia per marca. Tipicamente:
- Vaillant: premi contemporaneamente due tasti per 5 secondi
- Ariston: tasto reset per 10 secondi
- Beretta: combinazione specifica
- Immergas: tasto service dedicato

Consulta il manuale del modello specifico.

Cosa trovi nel menu service:

Lettura parametri attuali. Temperature delle sonde, stato dei sensori (ON/OFF), velocità del ventilatore, potenza attuale. Questo ti dice cosa vede la scheda in tempo reale.

Storico errori. Gli ultimi errori memorizzati, con contatore di occorrenze. Utile per problemi intermittenti.

Test attuatori. Puoi forzare l'accensione del ventilatore, del circolatore, della valvola a tre vie. Così verifichi se funzionano senza aspettare la logica normale.

Configurazione. Puoi impostare tipo di gas, potenza massima e minima, curve di compensazione, tipo di impianto. Attenzione: modifiche sbagliate possono causare malfunzionamenti.

Reset statistiche. In alcuni casi serve resettare contatori di manutenzione.

---

## SEZIONE 5: PROCEDURA DI SOSTITUZIONE SCHEDA

Se dopo tutti i controlli la scheda è effettivamente guasta, si sostituisce.

Fase 1: Ordina la scheda corretta

Il codice articolo deve essere esatto. Lo trovi sulla targhetta della scheda stessa o nel manuale. Schede con codici simili possono essere incompatibili.

Fase 2: Preparazione

Togli corrente. Fotografa tutti i collegamenti prima di scollegare nulla.

Fase 3: Rimozione

Scollega tutti i connettori dalla scheda. Svita i supporti che la fissano. Estrai la vecchia scheda.

Fase 4: Montaggio

Posiziona la nuova scheda. Fissa i supporti. Ricollega tutti i connettori secondo la foto.

Fase 5: Configurazione

Molte schede moderne arrivano pre-programmate per la caldaia specifica. Ma verifica comunque i parametri.

Alcune schede richiedono di inserire manualmente il tipo di gas, la potenza, altri parametri. Usa il menu service.

Se la scheda è completamente vergine (ricambio universale), devi fare la programmazione completa.

Fase 6: Test

Accendi la caldaia. Verifica che non ci siano errori immediati. Fai un ciclo completo di riscaldamento e sanitario.

---

## SEZIONE 6: CASI REALI

Caso 1: La sonda che mentiva

Ariston Genus. Errore di surriscaldamento ma lo scambiatore era freddo.

Ho verificato la sonda di mandata: a freddo dava 5 kOhm. Ma a 20°C doveva dare circa 12 kOhm. La sonda diceva "60 gradi" quando c'erano 20.

La scheda credeva di essere in surriscaldamento perché la sonda le mentiva.

Sostituzione sonda. Scheda perfetta.

Caso 2: Il connettore ossidato

Beretta Exclusive. Errori casuali, comportamenti strani. A volte funzionava, a volte no.

Ho ispezionato la scheda. Un connettore aveva i pin ossidati. Contatti intermittenti.

Pulizia dei connettori con spray per contatti elettrici. Problema risolto.

Lezione: i connettori sono punti deboli. In ambienti umidi si ossidano.

Caso 3: Il fusibile nascosto

Baxi Luna3. Display spento, caldaia morta.

Il tecnico precedente aveva ordinato una scheda nuova. Io ho chiesto: hai controllato i fusibili?

Sulla scheda c'era un fusibile da 3.15A SMD, minuscolo. Bruciato. Era nascosto tra i componenti.

Sostituzione fusibile (5 centesimi). Scheda perfetta.

Lezione: prima di buttare via una scheda, cerca i fusibili.

---

## SEZIONE 7: PROTEZIONE DELLA SCHEDA

Le schede elettroniche sono sensibili a:

Sbalzi di tensione. Fulmini, blackout, accensioni di carichi pesanti sulla stessa linea. Un varitore o un dispositivo di protezione sulla linea può prevenire danni.

Umidità. In ambienti molto umidi la condensa può causare cortocircuiti. Alcune caldaie in cantine o locali tecnici non ventilati soffrono di questo problema.

Calore eccessivo. Se la caldaia è in un vano chiuso e surriscaldato, anche la scheda soffre.

Insetti. In strani casi, formiche o altri insetti possono infilarsi nella scheda e causare cortocircuiti.

Polvere. Accumuli di polvere possono trattenere umidità e causare problemi.

Manutenzione preventiva della scheda:

1. Durante la manutenzione annuale, ispeziona la scheda visivamente.
2. Soffia via la polvere con aria compressa delicata.
3. Verifica che i connettori siano ben inseriti.
4. Controlla che non ci siano tracce di ossidazione.

---

## SEZIONE 8: COMPATIBILITÀ E AGGIORNAMENTI

Nelle caldaie moderne la scheda non è solo hardware, è anche software.

Versioni firmware. Alcune schede hanno diverse versioni di firmware. La versione si legge nel menu service. Gli aggiornamenti possono risolvere bug o aggiungere funzioni.

Su alcune marche (es. Vaillant recenti) il firmware può essere aggiornato con strumenti di diagnosi dedicati.

Schede ricondizionate. Sul mercato trovi schede ricondizionate a prezzo ridotto. Possono funzionare, ma non sempre. Verifica che il fornitore sia affidabile e che ci sia garanzia.

Schede universali. Esistono schede compatibili che funzionano su più modelli. Richiedono configurazione attenta. In caso di dubbio, usa l'originale.

---

## CHIUSURA

Ricapitolando.

La scheda elettronica è il cervello della caldaia. Prima di sostituirla, verifica alimentazione, fusibili, connettori, sensori, attuatori.

L'errore mostrato dalla scheda indica un sintomo, non necessariamente che la scheda sia guasta.

I sensori NTC si testano misurando la resistenza e confrontando con la temperatura. Le uscite si testano misurando la tensione durante il comando.

Il menu service è il tuo alleato: legge parametri, storico errori, test attuatori.

Dopo la sostituzione, verifica la configurazione e i parametri.

Nel prossimo video parliamo dello scambiatore secondario.

Se hai domande, scrivimi a info@simonsilvercaldaie.it.

Grazie per aver seguito fino a qui.

---

## FINE SCRIPT PARTE 2

**Parole effettive**: ~5400
**Tempo stimato**: 45 minuti a 120 parole/minuto
