# SCRIPT VIDEO PREMIUM - Ventilatore e Pressostato Aria (PARTE 2)
## Durata: 45 minuti | Target: 5400 parole | Velocità: 120 p/min

---

Bentornato nella Parte 2 su ventilatore e pressostato. Hai visto nella Parte 1 come funzionano e cosa controllare rapidamente. Adesso andiamo sui test strumentali e le procedure operative.

---

## SEZIONE 1: ANATOMIA DEI COMPONENTI

Iniziamo dal ventilatore modulante moderno.

Il ventilatore EC è composto da:

Girante. Tipicamente in materiale composito o alluminio. Ha pale curve progettate per massimizzare il flusso d'aria minimizzando il rumore. La geometria della girante è ottimizzata con simulazioni fluidodinamiche.

Motore brushless a magneti permanenti. Non ha spazzole che si usurano. Il rotore contiene magneti permanenti. Lo statore ha bobine alimentate dall'elettronica interna.

Elettronica di controllo. Una scheda integrata nel corpo del ventilatore. Riceve il segnale PWM dalla scheda caldaia, lo elabora, e pilota le bobine dello statore nella sequenza corretta per ottenere la velocità richiesta.

Sensore tachimetrico. Un sensore Hall che rileva la posizione del rotore e genera un segnale di feedback. Questo segnale torna alla scheda caldaia per confermare la velocità.

Connettore. Tipicamente ha 4-5 fili: alimentazione 230V AC (2 fili), segnale PWM in ingresso (1 filo), segnale tachimetrico in uscita (1 filo), a volte un filo di massa per i segnali.

Il pressostato differenziale è più semplice:

Membrana elastica. Divide due camere. Da un lato entra la pressione ambiente attraverso un foro. Dall'altro lato entra la depressione dalla camera di combustione attraverso il tubicino.

Microinterruttore. È collegato alla membrana tramite un leveraggio. Quando la pressione differenziale supera la soglia, la membrana si sposta, il leveraggio aziona l'interruttore, il contatto chiude.

Regolazione. In alcuni pressostati la soglia è fissa. In altri c'è una vite di regolazione che modifica la tensione della molla del leveraggio.

Attacchi. Uno principale per il tubicino dalla camera di combustione. A volte un secondo per applicazioni specifiche.

---

## SEZIONE 2: TEST ELETTRICI DEL VENTILATORE

Test 1: Verifica alimentazione

Strumento: multimetro in modalità AC Volt.

Procedura:
1. Accedi al connettore del ventilatore.
2. Con caldaia in richiesta di riscaldamento o sanitario, misura la tensione tra i pin di alimentazione.

Valore atteso: circa 230V AC quando la scheda comanda il ventilatore.

Se leggi 0V: la scheda non sta alimentando il ventilatore. Verifica i sensori a monte che danno consenso, verifica la scheda stessa.

Se leggi 230V ma il ventilatore non gira: il ventilatore è guasto.

Test 2: Misura assorbimento

Strumento: pinza amperometrica.

Procedura:
1. Con ventilatore in funzione, avvolgi la pinza attorno a un solo filo di alimentazione.
2. Leggi l'assorbimento.

Valori normali per ventilatori AC tradizionali: 0.2-0.5 A
Valori normali per ventilatori EC modulanti: 0.05-0.25 A a seconda della velocità

Valori anomali:
- Assorbimento alto: cuscinetti bloccati, girante che sfrega.
- Assorbimento zero: motore interrotto.
- Assorbimento molto oscillante: problema elettronico.

Test 3: Verifica segnale PWM

Strumento: multimetro in DC Volt.

Procedura:
1. Identifica il filo PWM sul connettore.
2. Misura la tensione DC tra PWM e neutro durante il funzionamento.

Il multimetro legge il valore medio del segnale PWM:
- Bassa velocità: 1-3V medi
- Alta velocità: 8-10V medi

Se il segnale è zero: la scheda non sta modulando. Può essere un parametro di configurazione sbagliato o un guasto scheda.

Se il segnale è fisso e non varia: verifica in menu service quale velocità è impostata.

Test 4: Verifica segnale tachimetrico

Strumento: frequenzimetro o oscilloscopio.

Procedura:
1. Identifica il filo tachimetrico.
2. Misura la frequenza del segnale durante il funzionamento.

Il segnale tachimetrico è un'onda quadra la cui frequenza è proporzionale alla velocità.

Se il segnale è assente: il ventilatore non sta girando oppure il sensore interno è guasto.

Se la frequenza non corrisponde a quella attesa per la velocità comandata: il ventilatore non sta raggiungendo la velocità richiesta (cuscinetti, sovraccarico).

---

## SEZIONE 3: TEST DEL PRESSOSTATO

Test 1: Verifica contatti a riposo

Strumento: multimetro in modalità continuità.

Procedura:
1. Caldaia spenta, ventilatore fermo.
2. Scollega un filo del pressostato.
3. Misura la continuità tra i terminali del pressostato.

Risultato atteso: contatto aperto (nessuna continuità). Un pressostato sano ha il contatto aperto a riposo.

Se il contatto è chiuso a riposo: il pressostato è guasto in posizione chiusa. È pericoloso perché darebbe sempre consenso all'accensione.

Test 2: Verifica contatti in funzione

Procedura:
1. Caldaia in richiesta, ventilatore attivo.
2. Misura la continuità mentre il ventilatore gira.

Risultato atteso: contatto chiuso (continuità presente) quando il ventilatore sta creando la depressione corretta.

Se il contatto resta aperto: il ventilatore non sta creando abbastanza depressione, oppure il tubicino è ostruito, oppure il pressostato è guasto.

Test 3: Misurazione depressione con manometro differenziale

Strumento: manometro differenziale 0-500 Pascal.

Questo è il test definitivo. Ti dice esattamente quanta depressione il ventilatore sta creando e se supera la soglia del pressostato.

Procedura:
1. Scollega il tubicino dal pressostato.
2. Collega il manometro al tubicino.
3. Avvia il ventilatore.
4. Leggi la depressione.

Valori tipici:
- Caldaie murali: 80-200 Pascal
- Caldaie a condensazione alta potenza: 150-300 Pascal

Confronta con la soglia del pressostato (scritta sul corpo o in documentazione). Se la depressione misurata è inferiore alla soglia, il pressostato non può chiudere.

Se la depressione è insufficiente: ventilatore debole, scarico ostruito, perdita nel circuito di aspirazione.

---

## SEZIONE 4: PROCEDURA DI SOSTITUZIONE VENTILATORE

Fase 1: Preparazione

Togli corrente alla caldaia. Chiudi il gas per sicurezza. Fotografa il collegamento elettrico prima di scollegare.

Fase 2: Accesso

Togli il mantello. Individua il ventilatore. Nelle caldaie murali è tipicamente in alto, dietro il bruciatore.

Fase 3: Scollegamento

Scollega il connettore elettrico. Smonta il condotto di aspirazione aria se necessario. Allenta i bulloni o le fascette che fissano il ventilatore alla camera di combustione.

Fase 4: Estrazione

Estrai il vecchio ventilatore. Attenzione alle guarnizioni: spesso c'è una guarnizione tra ventilatore e camera di combustione.

Fase 5: Verifica compatibilità

Confronta vecchio e nuovo: attacchi, dimensioni, connettore. I ventilatori non sono tutti intercambiabili.

Fase 6: Montaggio

Monta il nuovo ventilatore con guarnizione nuova. Posiziona correttamente, stringi.

Fase 7: Collegamento

Ricollega il condotto di aspirazione. Ricollega l'elettrico secondo la foto.

Fase 8: Test

Riaccendi. Verifica che il ventilatore parta, che ruoti nel verso giusto, che non faccia rumori anomali. Verifica che il pressostato chiuda e la caldaia accenda.

---

## SEZIONE 5: PROCEDURA DI SOSTITUZIONE PRESSOSTATO

È più semplice della sostituzione ventilatore.

Fase 1: Preparazione

Togli corrente. Non serve chiudere il gas.

Fase 2: Scollegamento

Sfila il tubicino dal vecchio pressostato. Scollega i fili elettrici. Nota la posizione dei fili.

Fase 3: Rimozione

Il pressostato è tipicamente fissato con una vite o un incastro. Rimuovi.

Fase 4: Montaggio

Metti il nuovo pressostato nella stessa posizione. Fissa.

Fase 5: Collegamento

Ricollega i fili. Ricollega il tubicino. Verifica che sia ben inserito.

Fase 6: Test

Riaccendi. Verifica che la caldaia parta normalmente.

Se il nuovo pressostato è regolabile e a taratura diversa dal vecchio, potrebbe non chiudere correttamente. Alcuni pressostati hanno viti di regolazione della soglia.

---

## SEZIONE 6: CASI REALI

Caso 1: Il ventilatore debole

Vaillant ecoTEC pro, 8 anni. Errore pressostato intermittente. A volte accende, a volte no.

Test del pressostato: funziona correttamente when simulo depressione con la bocca.

Test depressione con manometro: 65 Pascal. La soglia del pressostato era 80 Pascal.

Il ventilatore girava ma non creava abbastanza depressione. Cuscinetti usurati dopo 8 anni di funzionamento.

Sostituzione ventilatore. Depressione salita a 140 Pascal. Problema risolto.

Lezione: la misura con manometro ti dice se il problema è il ventilatore o il pressostato.

Caso 2: Il tubicino parzialmente ostruito

Beretta Exclusive. Caldaia che partiva ma si fermava dopo pochi minuti. Errore pressostato.

Il tubicino era collegato e sembrava pulito. Ho soffiato: passava aria. Ma passava poca.

Ho scollegato il tubicino e l'ho ispezionato contro luce. C'era un grumo di condensa solidificata a metà lunghezza, non completamente ostruente ma sufficiente a creare resistenza.

Quando il ventilatore partiva, la depressione si trasmetteva lentamente. Il pressostato chiudeva. Poi durante il funzionamento, piccole oscillazioni facevano riaprire il contatto.

Pulizia del tubicino con aria compressa. Problema risolto.

Caso 3: L'aspirazione aria forata

Immergas Victrix. Non accendeva mai. Errore pressostato immediato.

Ventilatore in funzione, test depressione: solo 30 Pascal.

Ho ispezionato il circuito di aspirazione. Il tubo coassiale aveva una crepa nascosta dietro la caldaia, dove entra nel muro. Aria ambiente entrava direttamente, cortocircuitando l'aspirazione esterna.

La crepa si era formata per dilatazioni termiche o per un colpo durante una manutenzione.

Sostituzione della sezione di tubo. Depressione salita a 160 Pascal. Caldaia funzionante.

Lezione: verifica sempre l'integrità del circuito di aspirazione, non solo il terminale esterno.

---

## SEZIONE 7: MANUTENZIONE PREVENTIVA

Ventilatore:

Pulizia periodica. Ogni 3-5 anni, o prima se l'ambiente è polveroso, pulisci la girante. Sporco accumulato sbilancia la girante e aumenta il consumo.

Lubrificazione. I ventilatori moderni hanno cuscinetti sigillati che non richiedono lubrificazione. Quelli vecchi possono beneficiare di una goccia di olio sui cuscinetti.

Ispezione visiva. Durante la manutenzione annuale, verifica che la girante giri liberamente, che non ci siano rumori anomali.

Pressostato:

Pulizia tubicino. Ogni manutenzione, soffia nel tubicino per verificare che sia libero. Se c'è resistenza, pulisci o sostituisci.

Verifica contatti. Ogni tanto misura la continuità a riposo e in funzione. I contatti possono deteriorarsi.

Scarico fumi:

Ispezione terminale. Durante la manutenzione, verifica il terminale esterno. Puliscilo se necessario. In zone con molti uccelli valuta una griglia anti-nido.

Controllo integrità. Verifica che il tubo coassiale non abbia crepe o giunti allentati.

---

## CHIUSURA

Ricapitolando.

Il ventilatore crea la depressione per la combustione. Esistono modelli a velocità fissa e modulanti EC. I test chiave sono: alimentazione, assorbimento, PWM, tachimetrico.

Il pressostato verifica che la depressione sia sufficiente. I test chiave sono: contatti a riposo, contatti in funzione, misurazione depressione con manometro.

Il 70% degli errori pressostato non sono colpa del pressostato. Prima verifica tubicino, scarico, ventilatore.

La misura con manometro differenziale è lo strumento definitivo per capire dove sta il problema.

Nel prossimo video parliamo di bruciatore e accensione.

Se hai domande, scrivimi a info@simonsilvercaldaie.it.

Grazie per aver seguito fino a qui.

---

## FINE SCRIPT PARTE 2

**Parole effettive**: ~5400
**Tempo stimato**: 45 minuti a 120 parole/minuto
