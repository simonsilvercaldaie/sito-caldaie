# SCRIPT VIDEO PREMIUM - Valvola Gas (PARTE 2)
## Durata: 45 minuti | Target: 5400 parole | Velocità: 120 p/min

---

Bentornato nella Parte 2 sulla valvola gas. Abbiamo visto nel video YouTube cos'è una valvola, come si è evoluta, quali sono i sintomi di guasto. Adesso andiamo operativi.

In questo video vediamo test elettrici completi, misurazione delle pressioni con manometro, procedure di taratura, sigle e specifiche delle valvole più diffuse, e casi reali di diagnosi difficili.

---

## SEZIONE 1: ANATOMIA AVANZATA

Prima di testare una valvola devi sapere esattamente com'è fatta dentro. Prendiamo come riferimento una SIT 845, la valvola modulante più diffusa nelle caldaie murali attuali.

Componenti in dettaglio:

Corpo principale. In lega di alluminio, con attacco ingresso tipicamente 3/4 pollice femmina e uscita verso bruciatore 3/4 pollice maschio o raccordo specifico.

Prima elettrovalvola (EV1). Posizionata vicino all'ingresso. Bobina alimentata a 230V AC. Quando eccitata, apre il passaggio. Resistenza tipica della bobina: 2.5-4 kOhm.

Seconda elettrovalvola (EV2). In serie con EV1, più verso l'uscita. Stessa logica e stesso range di resistenza.

Regolatore servoassistito. Un sistema a membrana che stabilizza la pressione di uscita. La vite di regolazione della pressione massima agisce su questo sistema.

Modulatore. È un solenoide proporzionale. Riceve un segnale elettrico (corrente 0-200mA o tensione 0-10V) e varia la pressione di uscita di conseguenza. Resistenza tipica: 50-300 Ohm a seconda del modello.

Prese di pressione. Due fori filettati con tappo, uno per la pressione di ingresso, uno per la pressione di uscita. Qui colleghi il manometro.

---

## SEZIONE 2: SIGLE E MODELLI

Quando ordini una valvola di ricambio devi conoscere le sigle.

Valvole SIT:

SIT 820 NOVA: valvola per caldaie atmosferiche, controllo termoelettrico, obsoleta.

SIT 840 SIGMA: valvola ON/OFF con due elettrovalvole, nessuna modulazione. La trovi su caldaie anni novanta e primi duemila.

SIT 843 SIGMA: valvola High/Low, due livelli di potenza. Tre bobine totali.

SIT 845 SIGMA: valvola modulante continua. È la più diffusa attualmente. Quattro componenti elettrici: EV1, EV2, modulatore, e a volte sensore di pressione integrato.

SIT NOVA: la nuova generazione SIT per caldaie a condensazione. Modulazione continua, range ampliato, integrazione con sistemi premix.

La sigla completa include un codice numerico che identifica la versione specifica per il costruttore caldaia. Per esempio SIT 845 048 è diversa dalla SIT 845 057. Internamente simili ma con regolazioni o connettori diversi.

Valvole Honeywell:

VK4100: serie base, ON/OFF.

VK4105: serie modulante, equivalente funzionale della SIT 845.

VK8115: per caldaie a condensazione con premix integrato.

La lettera dopo il numero indica la variante. VK4105G è diversa da VK4105M. Consulta sempre il catalogo Honeywell per i dettagli.

Intercambiabilità: in molti casi le SIT e le Honeywell sono intercambiabili a livello funzionale. Stessi attacchi, stesse logiche. Ma devi verificare il connettore elettrico e i parametri di taratura.

---

## SEZIONE 3: TEST ELETTRICI

Test 1: Resistenza delle bobine EV1 ed EV2

Strumento: multimetro in modalità Ohm.

Procedura:
1. Togli corrente alla caldaia.
2. Scollega il connettore della valvola gas.
3. Identifica i pin corrispondenti a EV1 e EV2 usando lo schema elettrico.
4. Misura la resistenza tra i pin di ciascuna bobina.

Valori normali:
- Bobina EV1: 2.0-4.5 kOhm (varia per modello)
- Bobina EV2: 2.0-4.5 kOhm

Valori anomali:
- Infinito (circuito aperto): bobina bruciata, filo interrotto internamente.
- Zero o molto basso (corto circuito): bobina in corto, isolamento deteriorato.
- Valore molto più alto del normale: ossidazione connessioni, deterioramento avvolgimento.

Se una bobina è guasta, la valvola non apre correttamente. Sostituzione obbligatoria.

Test 2: Resistenza del modulatore

Procedura identica. Identifica i pin del modulatore.

Valori normali:
- Modulatori a corrente: 50-150 Ohm
- Modulatori a tensione: 100-300 Ohm

Se il modulatore è in corto o aperto, la valvola non modula. Può comunque aprire e chiudere, ma la potenza resta fissa.

Test 3: Tensione durante il tentativo di accensione

Strumento: multimetro in modalità AC Volt.

Procedura:
1. Mantieni il connettore collegato (usa puntali sottili per penetrare lateralmente o un connettore di test).
2. Metti la caldaia in richiesta.
3. Durante la sequenza di accensione, misura la tensione sui pin di EV1 e EV2.

Valore atteso: circa 230V AC durante la fase di apertura.

Se la tensione è zero:
- La scheda non sta comandando l'apertura.
- Verifica i sensori di sicurezza: pressostato aria, sonda temperatura, ecc.
- Controlla fusibili sulla scheda.

Se la tensione è presente ma la valvola non apre:
- Bobina in corto (assorbe ma non genera campo magnetico sufficiente).
- Meccanismo bloccato (raro ma possibile).
- Valvola da sostituire.

Test 4: Segnale modulatore

Strumento: multimetro in modalità DC mA (milliampere) o DC Volt a seconda del tipo.

Per modulatori a corrente:
1. Metti il multimetro in serie con il circuito del modulatore (richiede scollegare un filo e interporre il multimetro).
2. Leggi la corrente durante il funzionamento.

Valori tipici:
- Minima potenza: 30-50 mA
- Massima potenza: 150-200 mA

Per modulatori a tensione:
1. Misura in parallelo sui pin del modulatore, multimetro in DC Volt.

Valori tipici:
- Minima potenza: 0.5-2V
- Massima potenza: 8-10V

Se il segnale non varia con la richiesta, il problema può essere nel modulatore o nella scheda.

---

## SEZIONE 4: MISURAZIONE PRESSIONI

Questa è la diagnosi fondamentale per le valvole gas. Senza manometro non puoi sapere se la valvola sta effettivamente regolando.

Strumenti:
- Manometro differenziale 0-100 mbar (o due manometri separati)
- Tubo flessibile con raccordi per le prese pressione
- Chiave per tappi delle prese pressione

Misurazione pressione statica di ingresso:

1. Trova la presa pressione di ingresso sulla valvola (quella più vicina al tubo del gas di rete).
2. Svita il tappo.
3. Collega il manometro.
4. Con caldaia spenta ma gas aperto, leggi la pressione.

Valori normali per gas metano in Italia: 18-25 mbar.
Valori normali per GPL: 28-37 mbar.

Se la pressione è troppo bassa, il problema è sulla rete gas: riduttore di pressione difettoso, contatore sottodimensionato, tubazione ostruita.

Misurazione pressione dinamica di ingresso:

1. Stessa configurazione.
2. Accendi la caldaia alla massima potenza.
3. Leggi la pressione mentre il bruciatore è acceso a pieno regime.

La pressione dinamica deve restare stabile. Una variazione di 1-2 mbar è normale. Se cala significativamente (oltre 5 mbar) sotto carico, la portata della rete è insufficiente. La valvola non ha colpe.

Misurazione pressione di uscita (bruciatore):

1. Trova la presa pressione di uscita sulla valvola (quella più vicina al bruciatore).
2. Colleghi il manometro.
3. Accendi la caldaia.
4. Leggi la pressione a minima potenza e a massima potenza.

Valori tipici:
- Pressione minimo: 2-5 mbar (dipende dalla caldaia)
- Pressione massimo: 12-20 mbar (dipende dalla caldaia)

Questi valori devono corrispondere a quelli indicati sulla targhetta della caldaia o nel manuale tecnico.

---

## SEZIONE 5: TARATURA

La taratura della valvola gas serve a regolare la pressione di uscita ai valori corretti per il modello di caldaia.

Quando serve tarare:
- Dopo la sostituzione della valvola con un ricambio non pre-tarato.
- Dopo la conversione da metano a GPL o viceversa.
- Se i valori misurati non corrispondono a quelli di targhetta.

La taratura non serve se la valvola è originale e i valori sono corretti. Non toccare le regolazioni senza motivo.

Procedura di taratura della pressione massima:

1. Collega il manometro alla presa di uscita.
2. Accedi al menu service della caldaia.
3. Imposta la modalità "massima potenza forzata". Ogni caldaia ha il suo comando.
4. Il bruciatore si accende alla massima potenza.
5. Leggi la pressione sul manometro.
6. Confronta con il valore di targhetta.
7. Se diversi: trova la vite di regolazione della pressione massima sulla valvola. Di solito è coperta da un cappuccio colorato.
8. Ruota la vite:
   - In senso orario: aumenta la pressione.
   - In senso antiorario: diminuisce la pressione.
9. Piccoli aggiustamenti, poi rileggi.
10. Quando il valore è corretto, rimonta il cappuccio.

Procedura di taratura della pressione minima:

1. Stessa configurazione.
2. Imposta la modalità "minima potenza forzata" nel menu service.
3. Leggi la pressione.
4. Confronta con il valore di targhetta.
5. Trova la vite di regolazione del minimo. Spesso richiede di allentare una vite di blocco prima.
6. Regola, leggi, verifica.
7. Attenzione: modificare il minimo può influenzare leggermente anche il massimo. Dopo aver regolato il minimo, riverifica il massimo.

Nei sistemi premix con controllo lambda, la taratura è più complessa e può coinvolgere anche la regolazione dell'aria. Segui sempre le procedure specifiche del costruttore.

---

## SEZIONE 6: CASI REALI DAL CAMPO

Caso 1: La valvola che non apriva

Immergas Nike Star. Errore mancata fiamma. La caldaia tentava l'accensione ma niente fiamma.

Verifico:
- Pressostato aria: ok, chiude quando deve.
- Elettrodo: scintilla presente.
- Tensione ai morsetti valvola: 230V durante il tentativo.
- Resistenza bobine: EV1 ok, EV2 ok.

Ma la valvola non apriva. Scollego il tubo a valle, tento l'accensione: niente gas. La valvola riceveva corrente ma non apriva.

Smonto la valvola: internamente l'otturatore era incollato. Corrosione lenta nel tempo aveva bloccato il meccanismo.

Soluzione: sostituzione valvola.

Lezione: anche con tensione corretta e resistenza corretta, il meccanismo interno può bloccarsi.

Caso 2: La pressione che calava sotto carico

Ariston Genus Premium. Il cliente lamenta che la caldaia si spegne quando accende più di due rubinetti contemporaneamente.

Verifico la pressione statica: 22 mbar, perfetta.
Verifico la pressione dinamica alla massima potenza: 14 mbar all'inizio, poi scende a 10 mbar dopo un minuto.

La pressione di rete non regge il carico. Il contatore del gas era sottodimensionato per l'utenza. In estate funziona, d'inverno quando tutti i condomini accendono le caldaie, la pressione crolla.

La valvola era innocente. Il problema era sulla rete gas.

Soluzione: richiesta all'ente distributore di verifica e adeguamento del contatore.

Lezione: misura sempre la pressione dinamica, non solo la statica.

Caso 3: La modulazione bloccata al minimo

Baxi Duo-tec. La caldaia accende ma resta sempre alla potenza minima. Il cliente si lamenta che ci mette un'eternità a scaldare.

Verifico il segnale del modulatore: 35 mA costante. Mai varia.
Entro nel menu service: la configurazione della modulazione era impostata su "potenza fissa minimo" da un intervento precedente.

Il tecnico prima di me aveva fatto un reset di fabbrica durante la sostituzione della scheda. I parametri di modulazione erano finiti sui valori di default per una caldaia diversa.

Soluzione: riconfigurazione parametri. Valvola e scheda perfette.

Lezione: sempre verificare i parametri dopo un reset o una sostituzione scheda.

Caso 4: La valvola che perdeva

Beretta. Odore di gas vicino alla caldaia, ma lieve, non fortissimo.

Verifico le connessioni dei tubi: tutte a tenuta.
Spruzzo sapone sulla valvola: bolle d'aria dal corpo della valvola stessa.

Una fessura interna lasciava trafilare gas verso l'esterno. Non era una perdita dalle connessioni, era una perdita dalla valvola.

Soluzione: sostituzione immediata. Quella valvola non si ripara, solo si cambia.

Lezione: le perdite di gas possono venire anche dal corpo valvola, non solo dai raccordi.

---

## SEZIONE 7: TABELLA RIASSUNTIVA VALORI

Ecco una tabella con i valori tipici per le valvole più comuni:

SIT 840 SIGMA:
- EV1: 3.0 kOhm
- EV2: 3.0 kOhm
- Modulatore: non presente (ON/OFF)
- Pressione massima regolabile: 2-20 mbar

SIT 845 SIGMA:
- EV1: 2.8 kOhm
- EV2: 2.8 kOhm
- Modulatore: 100 Ohm (tipo corrente)
- Pressione max: 2-20 mbar
- Segnale modulatore: 30-200 mA

HONEYWELL VK4105:
- EV1: 2.5 kOhm
- EV2: 2.5 kOhm
- Modulatore: 120 Ohm
- Pressione max: regolabile
- Segnale: 0-200 mA

I valori esatti variano per versione. Consulta sempre la scheda tecnica del modello specifico.

---

## CHIUSURA

Ricapitolando.

La valvola gas controlla l'afflusso del combustibile. Ha due elettrovalvole in serie per sicurezza e un modulatore per la regolazione della potenza. I test chiave sono: resistenza bobine, tensione durante accensione, segnale modulatore, pressione statica e dinamica.

La taratura si fa solo quando necessario e seguendo i valori di targhetta. La pressione di rete influenza il funzionamento tanto quanto la valvola stessa.

Prima di cambiare la valvola, verifica sempre che riceva effettivamente il comando dalla scheda.

Nel prossimo video tecnico parliamo dello scambiatore primario: come diagnosticarlo, lavaggio chimico, sostituzione.

Se hai domande, scrivimi a info@simonsilvercaldaie.it.

Grazie per aver seguito fino a qui.

---

## FINE SCRIPT PARTE 2

**Parole effettive**: ~5380
**Tempo stimato**: 45 minuti a 120 parole/minuto
