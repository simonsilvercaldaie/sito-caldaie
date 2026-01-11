# SCRIPT VIDEO YOUTUBE - Scheda Elettronica (PARTE 1)
## Durata: 15 minuti | Target: 1950 parole | Velocità: 130 p/min

---

Vaillant ecoTEC plus, cliente mi chiama. La caldaia mostra errore F28, mancata accensione. Gli dico al telefono: hai già fatto controllare? Sì, un tecnico è passato ieri, ha detto che è la scheda e bisogna cambiarla. Trecentocinquanta euro. Voglio un secondo parere.

Arrivo, tolgo il pannello. Faccio partire la caldaia. Errore F28. Osservo la sequenza: il ventilatore parte, il pressostato chiude, le scintille scoccano, sento il gas che arriva. Ma la fiamma non parte.

Misuro la pressione gas: 12 mbar. Troppo bassa. Dovrebbe essere almeno 18-20 mbar. Esco, controllo il contatore del gas: chiuso. Il cliente aveva dimenticato di riattivarlo dopo una vacanza.

Riapro il contatore, pressione gas normale, caldaia funziona perfettamente.

La scheda elettronica stava facendo esattamente il suo lavoro: segnalava che la fiamma non partiva. Non era guasta, stava dicendo la verità.

Morale: la scheda è il messaggero, non il colpevole. Prima di cambiarla, ascolta cosa sta cercando di dirti.

---

Sono Simone, tecnico caldaista da oltre vent'anni. In questo video parliamo della scheda elettronica: il cervello della caldaia, il componente più costoso, e quello più spesso cambiato senza motivo.

La scheda elettronica controlla tutto. Riceve informazioni dai sensori, le elabora, comanda gli attuatori. Gestisce la sequenza di accensione, la modulazione della potenza, le sicurezze, la diagnostica.

Quando qualcosa non va, la scheda mostra un codice errore. Ma quel codice non dice "la scheda è guasta". Dice "questo sensore o questa condizione ha un problema". Capire la differenza ti salva da sostituzioni inutili.

---

Vediamo cosa gestisce la scheda.

Input - cosa riceve:

Sonda temperatura mandata. Misura la temperatura dell'acqua che va ai radiatori. Di solito è una NTC, una resistenza che varia con la temperatura.

Sonda temperatura ritorno. Misura la temperatura dell'acqua che torna alla caldaia. Serve per calcolare la potenza erogata e controllare la condensazione.

Sonda temperatura sanitario. Per caldaie combinate, misura la temperatura dell'acqua calda.

Sonda temperatura esterna. Se presente, permette la compensazione climatica.

Pressostato acqua o trasduttore di pressione. Rileva la pressione dell'impianto. Blocca se la pressione è troppo bassa o troppo alta.

Pressostato aria. Conferma che il ventilatore sta creando la depressione per la combustione.

Flussostato o sensore di flusso. Rileva quando c'è richiesta di acqua calda sanitaria.

Corrente di ionizzazione. Segnale dall'elettrodo che conferma la presenza della fiamma.

Termostato ambiente o segnale BUS. La richiesta di calore dall'appartamento.

Output - cosa comanda:

Valvola gas. Apertura e modulazione.

Ventilatore. Velocità variabile per il controllo della combustione.

Circolatore. Velocità variabile per la circolazione.

Valvola tre vie. Commutazione tra riscaldamento e sanitario.

Trasformatore di accensione. Le scintille per accendere.

Display e LED. Comunicazione con l'utente e il tecnico.

---

Parliamo dei tipi di schede.

Schede analogiche. Le trovi sulle caldaie vecchie, anni ottanta e novanta. Circuiti discreti con transistor, relè meccanici, potenziometri per le regolazioni. Nessun display, solo spie LED. La diagnostica era rudimentale: lampeggi di un LED per indicare il tipo di errore.

Queste schede erano più semplici e a volte riparabili. Un relè bruciato, un condensatore gonfio, potevano essere sostituiti. Oggi sono obsolete ma ce ne sono ancora in circolazione.

Schede digitali con microprocessore. La tecnologia standard da vent'anni. Un microcontrollore elabora le informazioni, un display mostra codici errore dettagliati, un menu tecnico permette configurazioni. Componenti SMD miniaturizzati, non riparabili in campo.

Schede con comunicazione BUS. La tecnologia attuale sui modelli premium. Comunicano con termostati intelligenti, possono essere diagnosticate da remoto, si integrano con sistemi domotici. Protocolli: eBUS (Vaillant), OpenTherm, Modbus.

---

Adesso parliamo dei codici errore.

Il codice errore è un indizio, non una diagnosi. Ti dice quale circuito o quale condizione la scheda ha rilevato come anomala.

Esempio: F28 su Vaillant significa mancata accensione. Cause possibili:
- Manca gas
- Valvola gas guasta
- Elettrodo sporco o guasto
- Trasformatore accensione guasto
- Pressostato aria non chiude
- Ventilatore non funziona
- Scheda guasta

Nota che "scheda guasta" è solo una delle tante possibilità, e nemmeno la più probabile. Prima di accusare la scheda, verifica tutti i componenti che potrebbero causare quel sintomo.

Lo stesso vale per tutti i codici. Errore sonda? Controlla prima la sonda. Errore pressione? Controlla prima la pressione. Errore ionizzazione? Controlla prima l'elettrodo.

---

Quando la scheda è davvero guasta?

Ci sono casi in cui la scheda è effettivamente il problema. Ecco i segnali:

Componenti visibilmente bruciati. Apri la caldaia, guardi la scheda, e vedi tracce nere, condensatori gonfi, chip che si sono sciolti. Danno fisico evidente.

Display completamente spento. Nessun segno di vita. Ma prima verifica che arrivi corrente alla scheda.

Uscite che non funzionano nonostante il comando. La scheda comanda la valvola gas (LED acceso o segnale presente) ma la tensione sull'uscita è zero. Il relè interno non scatta o i suoi contatti sono bruciati.

Comportamento erratico. Errori che non hanno senso. La caldaia fa cose a caso. Accende e spegne senza logica.

In tutti questi casi verifica prima l'alimentazione, i fusibili, le connessioni. Poi, se proprio non c'è altra spiegazione, considera la scheda.

---

Parliamo dei controlli da fare prima di sostituire la scheda.

Controllo uno: alimentazione. La scheda riceve 230V? Misura la tensione in ingresso.

Controllo due: fusibili. Molte schede hanno fusibili, a volte più di uno. Controllali con il multimetro.

Controllo tre: connettori. Sono tutti inseriti? Ossidati? Un connettore ossidato può causare problemi intermittenti.

Controllo quattro: il componente segnalato dall'errore. L'errore dice "sonda"? Controlla la sonda. Dice "valvola gas"? Controlla la valvola gas. Dice "ionizzazione"? Controlla l'elettrodo.

Non cambiare mai la scheda come primo tentativo. È il componente più costoso, quello che richiede riconfigurazioni dopo la sostituzione, quello che spesso viene buttato senza motivo.

---

Parliamo di errori diagnostici comuni.

Primo errore: cambiare la scheda perché l'errore indica un componente che sembra ok. Il pressostato sembra chiudere, quindi dev'essere la scheda che non lo rileva. Ma hai misurato effettivamente la continuità del contatto? Hai verificato che il filo non sia interrotto?

Secondo errore: cambiare la scheda dopo aver cambiato tutto il resto. Hai già sostituito valvola gas, elettrodo, pressostato, il problema c'è ancora, quindi sarà la scheda. Ma hai verificato le cose banali? Connettori, alimentazione, pressione gas?

Terzo errore: non verificare l'alimentazione della scheda. La scheda sembra morta? Prima di ordinarla, verifica che arrivi corrente. Un interruttore guasto, un fusibile bruciato, un cavo tagliato possono simulare una scheda morta.

---

Questo è quello che ti serve per capire se la scheda è davvero il problema. Ma per testare i relè, misurare le uscite, verificare i sensori collegati, interpretare le informazioni del menu service, ti serve la Parte 2.

Nel video premium su simonsilvercaldaie.it trovi:
- Test elettrico completo delle uscite della scheda
- Come verificare i sensori NTC
- Come accedere e usare il menu service
- Procedura di sostituzione e configurazione scheda
- Tre casi dove sembrava la scheda e non lo era

Il link è in descrizione. Ti aspetto nella Parte 2.

---

## FINE SCRIPT PARTE 1

**Parole effettive**: ~1950
**Tempo stimato**: 15 minuti a 130 parole/minuto
