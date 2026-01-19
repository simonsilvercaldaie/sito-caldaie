-- SEEDING SCRIPT for Educational Resources
-- Generated at: 2026-01-19T17:29:22.882Z


INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '01',
  'caso_studio',
  'base',
  'La Caldaia Muta',
  '{"meta":{"level":"Base","id":"CS-01","title":"La Caldaia Muta","target_skills":["PROC-001","DIAG-006","SKILL-001"]},"content":{"scenario":{"context":"Sei stato chiamato da un nuovo cliente. È il primo freddo autunnale. Il cliente dice: ''Ho acceso il termostato ma la caldaia non fa nulla, è morta''.","initial_obs":["Display acceso, nessun errore visualizzato.","Nessun rumore proveniente dalla macchina.","Termostato ambiente in richiesta (icona fiamma accesa).","Pressione manometro analogo: 0.6 bar."]},"investigation":[{"step":1,"action":"Ascolto","result":"Silenzio assoluto. Niente pompa, niente ventola."},{"step":2,"action":"Lettura Schema (Mentale)","result":"Siamo all''INIZIO della catena. La richiesta c''è (TA), ma la sequenza non parte."}],"challenge":"Qual è la causa più probabile del blocco, basandoti sulla Logica di Priorità (Video 01)?","options":[{"id":"A","text":"Il ventilatore è bloccato.","feedback":"Errato. Se fosse il ventilatore, la pompa partirebbe prima. Qui è tutto fermo."},{"id":"B","text":"La pressione dell''acqua è sotto la soglia di consenso (0.6 < 0.8 bar).","feedback":"Corretto! La caldaia legge una pressione insufficiente tramite il trasduttore e inibisce tutto per proteggere il circolatore.","is_correct":true},{"id":"C","text":"Manca Gas.","feedback":"Errato. La mancanza gas darebbe errore accensione (F28) dopo il tentativo. Qui non prova nemmeno."}],"resolution":"Caricare l''impianto a 1.2 bar. La caldaia parte immediatamente."}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '01',
  'checklist',
  'base',
  'Checklist Video 01',
  '{"meta":{"video_id":"01","type":"checklist","title":"Checklist Video 01","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: VERIFICHE ESTERNE (A MANTELLO CHIUSO)","steps":[{"id":"chk_01_0_0","label":"Alimentazione Elettrica: Presenza tensione 230V e Polarità corretta?","required":true},{"id":"chk_01_0_1","label":"Gas: Rubinetto gas aperto? Pressione in ingresso presente?","required":true},{"id":"chk_01_0_2","label":"Pressione Acqua: Manometro tra 1.0 e 1.5 bar? (Minimo 0.8 bar)","required":true},{"id":"chk_01_0_3","label":"Richiesta Utente: Termostato Ambiente in chiamata (batterie ok)? Rubinetto ACS chiuso?","required":true}]},{"title":"FASE 2: ANALISI SEQUENZA (ASCOLTO)","steps":[{"id":"chk_01_1_0","label":"Start Pompa: Si sente la vibrazione/rumore circolazione?","required":true},{"id":"chk_01_1_1","label":"Start Ventilatore: Si sente il rumore dell''aria?","required":true},{"id":"chk_01_1_2","label":"Consenso Pressostato: (Solo ventilatore) La sequenza prosegue o stalla qui?","required":true},{"id":"chk_01_1_3","label":"Apertura Valvola Gas: Si sente il \"CLICK\" distinto?","required":true},{"id":"chk_01_1_4","label":"Scintilla: Si sente lo \"SCHIOCCO\" ripetuto dell''accenditore?","required":true},{"id":"chk_01_1_5","label":"Fiamma: Si vede la fiamma o si sente il rumore di combustione?","required":true}]},{"title":"FASE 3: INTERPRETAZIONE BLOCCO","steps":[{"id":"chk_01_2_0","label":"Blocco PRE-VENTILATORE: Problema Pressione Acqua, Alimentazione, Fusibili, o Termostato.","required":true},{"id":"chk_01_2_1","label":"Blocco IN VENTILAZIONE: Problema Pressostato, Tubicini, Tiraggio, Diaframma fumi.","required":true},{"id":"chk_01_2_2","label":"Blocco POST-CLICK: Valvola Gas non apre meccanicamente o manca gas.","required":true},{"id":"chk_01_2_3","label":"Blocco POST-FIAMMA: Mancata rilevazione (Fase/Neutro, Elettrodo, Scheda).","required":true}]},{"title":"NOTE TECNICHE","steps":[]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '01',
  'quiz',
  'base',
  'La Logica della Caldaia',
  '{"meta":{"video_id":"01","title":"La Logica della Caldaia","ukts":["PROC-001","COMP-022","DIAG-009"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Qual è la regola fondamentale che governa la priorità delle richieste in una caldaia combinata?","options":["A. La caldaia soddisfa sempre l''ultima richiesta arrivata in ordine di tempo.","B. Il riscaldamento ha la priorità perché serve a mantenere calda la casa.","C. Il Sanitario ha la Priorità Assoluta: qualsiasi richiesta ACS ferma immediatamente il riscaldamento.","D. La caldaia divide la potenza a metà tra sanitario e riscaldamento."],"correct":"C","explanation":"La ''dittatura del sanitario'' è assoluta: l''utente sotto la doccia non può aspettare, i termosifoni sì. Se c''è richiesta ACS, il riscaldamento si ferma."},{"id":"Q2","type":"sintomo","text":"Se la caldaia è ''muta'' (display acceso, ma nessun rumore di pompa o ventola) nonostante il termostato chiami, dove si trova probabilmente l''inghippo?","options":["A. Nella valvola gas che non apre.","B. Nella fase iniziale dei Consensi Preliminari (es. Pressione Acqua bassa o Termostato non collegato bene).","C. Nel pressostato fumi che non chiude.","D. Nell''elettrodo di accensione rotto."],"correct":"B","explanation":"Se fosse un problema di gas o fumi, la pompa e il ventilatore partirebbero. Il silenzio assoluto indica uno stop PRIMA dell''avvio della sequenza."},{"id":"Q3","type":"azione_corretta","text":"Durante la sequenza di avvio, hai sentito il ventilatore partire, ma NON hai sentito il ''click'' della valvola gas. Cosa verifichi subito dopo?","options":["A. Verifico se arriva gas ai fornelli.","B. Cambio la valvola gas.","C. Verifico il sistema di tiraggio (Pressostato/Fumi/Tubicini) perché il consenso non è arrivato.","D. Resetto la caldaia 5 volte."],"correct":"C","explanation":"La logica è sequenziale: Ventilatore ON -> Consenso Pressostato -> Valvola Gas. Se manca il click della valvola, il passaggio mancante è quello intermedio (Tiraggio)."},{"id":"Q4","type":"errore_tipico","text":"Un cliente lamenta radiatori freddi. Trovi la caldaia accesa, ma la mandata riscaldamento è fredda. Qual è l''errore diagnostico più comune?","options":["A. Pensare subito alla pompa rotta, senza controllare se la caldaia è bloccata in modalità Sanitario per un micro incantato.","B. Pensare che manchi gas.","C. Pensare che i radiatori siano pieni d''aria.","D. Sostituire la sonda esterna."],"correct":"A","explanation":"Spesso non è un guasto, ma una priorità ''fantasma''. Un flussometro bloccato o un rubinetto che gocciola tengono la caldaia impegnata sull''acqua calda, inibendo il riscaldamento."},{"id":"Q5","type":"mini_caso","text":"Scenario: Caldaia in blocco. Il cliente dice di averla resettata, parte il ventilatore per 10 secondi e poi va in errore, senza mai fare scintilla. Diagnosi probabile?","options":["A. Valvola gas difettosa (bobina interrotta).","B. Mancata rilevazione fiamma (Elettrodo).","C. Problema di consenso tiraggio (Pressostato non chiude o contatti ossidati).","D. Fusibile bruciato sulla scheda."],"correct":"C","explanation":"Se fa ventilazione ma NON scocca la scintilla, la sequenza si è fermata esattamente nel controllo fumi. Il pressostato non ha dato il via libera alla scheda per procedere."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '01',
  'scheda',
  'base',
  'La Caldaia Non è Stupida',
  '{"meta":{"video_id":"01","title":"La Caldaia Non è Stupida","level":"Base","ukts":["PROC-001","COMP-022","DIAG-009"]},"content":{"objective":"Identificare il punto di interruzione della Catena dei Consensi.","technical_data":[{"component":"Pressione Minima","value":"> 0.5 - 0.8 bar","note":"Soglia inibizione software"},{"component":"Sequenza Avvio","value":"Check Pressione -> Pompa -> Fan -> Pressostato -> Gas -> Fiamma","note":"Ordine rigido"}],"diagnosis_steps":[{"step":1,"question":"PERCHÉ non fa quello che deve?","action":"Ascolta i rumori (Silenzio / Aria / Click / Schiocco)"},{"step":2,"question":"PERCHÉ si è fermata lì?","action":"Identifica lo stadio mancante nella sequenza"},{"step":3,"question":"PERCHÉ quel componente non va?","action":"Verifica elettrica puntuale"}],"pro_tips":["Priorità ACS assoluta: un rubinetto che gocciola ferma il riscaldamento.","Diagnosi a mantello chiuso: ascolta i relè prima di svitare."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '02',
  'checklist',
  'base',
  'Checklist Video 02',
  '{"meta":{"video_id":"02","type":"checklist","title":"Checklist Video 02","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: AVVICINAMENTO (Ambiente)","steps":[{"id":"chk_02_0_0","label":"Tipologia Casa: Impianto vecchio/nuovo? Radiatori Ghisa/Alluminio/Pavimento?","required":true},{"id":"chk_02_0_1","label":"Fumisteria: Terminale libero? Pendenze visibili corrette?","required":true},{"id":"chk_02_0_2","label":"Scarichi: Tubo condensa piegato o ostruito?","required":true},{"id":"chk_02_0_3","label":"Gas: Cucina funziona regolarmente? (Portata contatore)","required":true}]},{"title":"FASE 2: SOTTO LA CALDAIA (Tracce)","steps":[{"id":"chk_02_1_0","label":"Perdite Acqua: Presenza di acqua fresca a terra?","required":true},{"id":"chk_02_1_1","label":"Colore Perdita:","required":true},{"id":"chk_02_1_2","label":"Trasparente (Sifone/Condensa/Sanitario)","required":true},{"id":"chk_02_1_3","label":"Scura/Nera (Impianto Riscaldamento)","required":true},{"id":"chk_02_1_4","label":"Residui Secchi:","required":true},{"id":"chk_02_1_5","label":"Calcare bianco (Valvola sicurezza che ha sfiatato)","required":true},{"id":"chk_02_1_6","label":"Ruggine rossa (Corrosione in atto)","required":true}]},{"title":"FASE 3: MACCHINA (Display & Manometro)","steps":[{"id":"chk_02_2_0","label":"Display: Codice errore attivo?","required":true},{"id":"chk_02_2_1","label":"Pressione Freddo: Tra 1.0 e 1.5 bar?","required":true},{"id":"chk_02_2_2","label":"Pressione Dinamica:","required":true},{"id":"chk_02_2_3","label":"Sale rapida > 2.5 bar (Vaso Scarico)","required":true},{"id":"chk_02_2_4","label":"Stabile (OK)","required":true},{"id":"chk_02_2_5","label":"Oscilla su apertura rubinetti (Aria/Scambiatore)","required":true},{"id":"chk_02_2_6","label":"Rumori: Ascoltare avvio (Gorgoglio / Fischio / Rombo)","required":true}]},{"title":"DOMANDE AL CLIENTE","steps":[{"id":"chk_02_3_0","label":"\"Da quanto tempo lo fa?\" (Improvviso vs Graduale)","required":true},{"id":"chk_02_3_1","label":"\"Cosa è successo PRIMA?\" (Temporali, lavori, blackout)","required":true},{"id":"chk_02_3_2","label":"\"Lo fa sempre o solo a volte?\" (Costante vs Intermittente)","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '02',
  'quiz',
  'base',
  'I Primi 3 Minuti',
  '{"meta":{"video_id":"02","title":"I Primi 3 Minuti","ukts":["PROC-009","DIAG-006","DIAG-002"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Perché i primi 3 minuti di osservazione sono più importanti dello smontaggio?","options":["A. Perché permettono di raccogliere indizi ''a freddo'' (ambiente, display, rumori) che svaniscono appena si tocca la macchina.","B. Perché serve tempo per scaldare gli strumenti.","C. Perché così il cliente vede che sei riflessivo.","D. Perché devi aspettare che la caldaia si resetti da sola."],"correct":"A","explanation":"Aprire il mantello cambia l''acustica, muove i cavi e resetta le condizioni termiche. La diagnosi non invasiva (osservazione) deve venire PRIMA."},{"id":"Q2","type":"sintomo","text":"Durante il funzionamento in riscaldamento, noti che la lancetta del manometro sale rapidamente da 1.2 a 2.8 bar. Cosa indica?","options":["A. Lo scambiatore primario è bucato.","B. Il vaso di espansione è scarico o ha la membrana rotta (non compensa l''aumento di volume).","C. C''è troppa acqua nell''impianto.","D. La pompa gira troppo forte."],"correct":"B","explanation":"È il sintomo classico del vaso inefficace. L''acqua si scalda, espande il volume, e se il vaso non ''ammortizza'', la pressione schizza in alto."},{"id":"Q3","type":"azione_corretta","text":"Vedi una macchia di calcare bianco secco sotto la valvola di sicurezza. Qual è l''azione corretta?","options":["A. Sostituire subito la valvola di sicurezza perché perde.","B. Stringere forte la valvola.","C. Verificare la precarica del vaso di espansione, poiché la valvola ha probabilmente sfiatato per sovrappressione.","D. Mettere un secchio sotto."],"correct":"C","explanation":"La valvola non è rotta, ha fatto il suo dovere. Il colpevole è il vaso che ha lasciato salire la pressione oltre i 3 bar."},{"id":"Q4","type":"errore_tipico","text":"Il display è spento. Molti tecnici cambiano subito la scheda o il display. Cosa avrebbero dovuto controllare prima?","options":["A. Se c''è acqua nella caldaia.","B. L''alimentazione elettrica esterna (spina, interruttore bipolare, contatore).","C. La sonda esterna.","D. Il pressostato aria."],"correct":"B","explanation":"L''errore numero uno è cercare il guasto INTERNO prima di aver escluso quello ESTERNO. Spesso è solo un interruttore spento o una spina staccata."},{"id":"Q5","type":"mini_caso","text":"Scenario: Trovi una pozza d''acqua NERA sotto la caldaia. Il cliente dice che ogni tanto deve caricare l''acqua. Da dove viene la perdita?","options":["A. Dal circuito sanitario (tubo ingresso acqua fredda).","B. Dallo scarico condensa (acqua acida).","C. Dal circuito di riscaldamento (acqua tecnica sporca di magnetite).","D. Dal rubinetto del gas."],"correct":"C","explanation":"Il colore è la firma. L''acqua sanitaria o di condensa è chiara. L''acqua del riscaldamento, girando nei radiatori metallici, diventa nera/scura."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '02',
  'scheda',
  'base',
  'I Primi 3 Minuti',
  '{"meta":{"video_id":"02","title":"I Primi 3 Minuti","level":"Base","ukts":["PROC-009","DIAG-006","DIAG-002"]},"content":{"objective":"Diagnosi non invasiva tramite osservazione ambientale e sensoriale.","technical_data":[{"component":"Pressione Statica","value":"1.0 - 1.5 bar","note":"A freddo"},{"component":"Colore Acqua","value":"Trasparente vs Nera","note":"Distingue circuito sanitario da riscaldamento"}],"diagnosis_steps":[{"step":1,"question":"Cosa dice l''ambiente?","action":"Osserva fumisteria, impianto e chiedi storia recente al cliente."},{"step":2,"question":"Cosa dice il ''sotto'' caldaia?","action":"Cerca tracce di perdite (bianco calcare, rosso ruggine)."},{"step":3,"question":"Cosa dice il manometro in funzione?","action":"Verifica stabilità pressione al variare della temperatura."}],"pro_tips":["Se la cucina ha fiamma bassa mentre la caldaia va, manca gas dal contatore.","Calcare sotto valvola sicurezza = vaso espansione scarico."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '03',
  'checklist',
  'base',
  'Checklist Video 03',
  '{"meta":{"video_id":"03","type":"checklist","title":"Checklist Video 03","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: ORIENTAMENTO (Sullo Schema)","steps":[{"id":"chk_03_0_0","label":"Individua Ingressi: Dove sono Termostato e Alimentazione? (Di solito sinistra/alto)","required":true},{"id":"chk_03_0_1","label":"Individua Uscite: Dove sono Ventilatore, Valvola Gas, Accenditore?","required":true},{"id":"chk_03_0_2","label":"Individua Sicurezze: Dove sono Klixon Limite e Pressostato Fumi?","required":true}]},{"title":"FASE 2: RIDUZIONE (Cosa Escludere)","steps":[{"id":"chk_03_1_0","label":"La caldaia si accende (Display ON)? -> ESCLUDI Alimentazione primaria.","required":true},{"id":"chk_03_1_1","label":"Il Ventilatore gira? -> ESCLUDI tutta la catena consensi pre-ventilazione (H2O, TA).","required":true},{"id":"chk_03_1_2","label":"La Valvola apre (Click)? -> ESCLUDI Pressostato/Tiraggio.","required":true}]},{"title":"FASE 3: TARGETING (Cosa Testare)","steps":[{"id":"chk_03_2_0","label":"Segna con un dito sullo schema il componente che NON parte.","required":true},{"id":"chk_03_2_1","label":"Segui la linea a ritroso fino al primo \"nodo\".","required":true},{"id":"chk_03_2_2","label":"IPOTESI: È lì che devi mettere i puntali del tester.","required":true}]},{"title":"NOTE","steps":[]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '03',
  'quiz',
  'base',
  'Lettura Schema',
  '{"meta":{"video_id":"03","title":"Lettura Schema","ukts":["SKILL-001"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Come va interpretato uno schema funzionale per non perdersi?","options":["A. Come una fotografia esatta di dove sono messi i pezzi.","B. Come un elenco di codici ricambio.","C. Come una mappa del flusso decisionale (Start -> Sviluppo -> Fine).","D. Come un manuale di istruzioni per l''utente."],"correct":"C","explanation":"Lo schema rappresenta la logica. Non importa dove sono fisicamente i pezzi, importa ''chi dà il consenso a chi'' nel flusso operativo."},{"id":"Q2","type":"sintomo","text":"Se la caldaia si blocca con la fiamma che si accende e si spegne subito dopo (pochi secondi), in quale fase del flusso logico siamo?","options":["A. Fase Iniziale (Start).","B. Fase di Sviluppo (Ventilazione/Gas).","C. Fase Finale (Conferma/Rilevazione Fiamma).","D. Fase di Spegnimento."],"correct":"C","explanation":"Tutto il resto ha funzionato (ventilatore, gas, scintilla). Il problema è nell''ultimo miglio: il segnale di ''fiamma presente'' non arriva alla scheda."},{"id":"Q3","type":"azione_corretta","text":"Stai diagnosticando un problema di ventilatore fermo usando lo schema. Qual è l''approccio dell''Esclusione Mentale?","options":["A. Controllo anche i sensori del riscaldamento per sicurezza.","B. Controllo i fusibili dell''alimentazione generale.","C. Mi concentro SOLO sulla linea di comando tra scheda e ventilatore, ignorando i circuiti idraulici o sanitari che non c''entrano.","D. Smonto tutto per vedere meglio."],"correct":"C","explanation":"Ridurre il rumore. Se il problema è il ventilatore, ignora tutto ciò che non fa parte di quel ramo specifico dello schema."},{"id":"Q4","type":"errore_tipico","text":"Lo schema mostra un pressostato ''tondo'' meccanico, ma tu trovi un sensore elettronico ''quadrato''. Cosa fai?","options":["A. Mi fermo perché il manuale è sbagliato.","B. Cerco di adattare il pezzo dello schema alla realtà.","C. Ignoro la differenza grafica e seguo la logica: quel componente serve a controllare i fumi, quindi lo testo come tale.","D. Chiamo l''assistenza."],"correct":"C","explanation":"La funzione vince sulla forma. Entrambi i componenti servono a dare il consenso di tiraggio alla scheda. Il test concettuale è lo stesso."},{"id":"Q5","type":"mini_caso","text":"Scenario: Ventilatore gira, ma niente click valvola gas. Guardi lo schema: tra il simbolo Ventilatore e il simbolo Gas c''è il Pressostato. Dove metti i puntali del tester?","options":["A. Sulla valvola gas.","B. Sul pressostato, per vedere se chiude il contatto (o dà segnale) quando il ventilatore gira.","C. Sull''alimentazione 230V.","D. Sulla pompa."],"correct":"B","explanation":"È il punto intermedio critico. Se il ventilatore gira ma il gas non apre, il ''permesso'' deve venire da lì. Verificare quel punto conferma o smentisce l''ipotesi."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '03',
  'scheda',
  'base',
  'Lettura Schema Funzionale',
  '{"meta":{"video_id":"03","title":"Lettura Schema Funzionale","level":"Base","ukts":["SKILL-001"]},"content":{"objective":"Interpretare lo schema come mappa decisionale.","technical_data":[{"component":"Flusso Logico","value":"Start -> Sviluppo -> Fine","note":"Universale per tutte le marche"}],"diagnosis_steps":[{"step":1,"question":"In che fase si blocca?","action":"Traduci sintomo in posizione schema"},{"step":2,"question":"Cosa c''è prima di questo blocco?","action":"Analizza i consensi a monte del componente fermo"},{"step":3,"question":"L''ipotesi regge?","action":"Verifica strumentale mirata"}],"pro_tips":["Se il ventilatore gira, ignora la parte Termostato/Pressione dello schema.","La logica vince sul disegno: simboli diversi, funzione uguale."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '04',
  'checklist',
  'base',
  'Checklist Video 04',
  '{"meta":{"video_id":"04","type":"checklist","title":"Checklist Video 04","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: CHI COMANDA?","steps":[{"id":"chk_04_0_0","label":"Display: Quale simbolo è attivo? (Rubinetto/Termosifone)","required":true},{"id":"chk_04_0_1","label":"Parametro Stato Valvola: Valore coerente? (Risc / San)","required":true},{"id":"chk_04_0_2","label":"Richiesta Reale: C''è davvero urubinetto aperto o TA attivo?","required":true}]},{"title":"FASE 2: PROVA TATTILE (Cross-Check)","steps":[{"id":"chk_04_1_0","label":"Il tubo Sanitario scotta?","required":true},{"id":"chk_04_1_1","label":"Il tubo Riscaldamento è freddo/tiepido? (Se scotta = Trafilamento 3-Vie)","required":true}]},{"title":"FASE 3: TENUTA SEPARAZIONE","steps":[{"id":"chk_04_2_0","label":"La pressione sale da sola a rubinetti chiusi? (Sì = Scambiatore forato)","required":true},{"id":"chk_04_2_1","label":"La pressione scende aprendo l''acqua calda? (Sì = Scambiatore forato)","required":true},{"id":"chk_04_2_2","label":"I radiatori scaldano anche in Estate? (Sì = 3-Vie bloccata aperta)","required":true}]},{"title":"NOTE","steps":[]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '04',
  'quiz',
  'base',
  'Sanitario vs Riscaldamento',
  '{"meta":{"video_id":"04","title":"Sanitario vs Riscaldamento","ukts":["COMP-010","COMP-002"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Perché in una caldaia combinata la priorità è sempre data all''Acqua Calda Sanitaria (ACS)?","options":["A. Perché l''acqua calda costa di più.","B. Perché il riscaldamento ha un''inerzia termica elevata (ci mette tempo a raffreddarsi), mentre la doccia fredda è un disagio immediato.","C. Perché la valvola gas è più potente in sanitario.","D. È una scelta casuale del produttore."],"correct":"B","explanation":"Comfort utente. 5 minuti senza riscaldamento non li senti. 5 secondi di doccia fredda sì. Perciò il riscaldamento si mette in pausa."},{"id":"Q2","type":"sintomo","text":"Il cliente dice: ''L''acqua calda non arriva mai bollente, è tiepida, ma i radiatori scottano quando faccio la doccia''. Qual è la diagnosi più probabile?","options":["A. Scambiatore sanitario bucato.","B. Valvola 3-vie bloccata in posizione intermedia o che non chiude bene il lato riscaldamento.","C. Pressione gas troppo bassa.","D. Sonda NTC sanitaria rotta."],"correct":"B","explanation":"Se i radiatori si scaldano durante la doccia, la valvola sta ''perdendo'' calore verso l''impianto invece di concentrarlo tutto sullo scambiatore sanitario."},{"id":"Q3","type":"azione_corretta","text":"Dubiti che lo scambiatore a piastre sia forato (comunicazione tra circuiti). Quale test fai per confermarlo?","options":["A. Chiudo l''ingresso acqua fredda alla caldaia la sera e controllo se la pressione è rimasta stabile al mattino.","B. Cambio la valvola di sicurezza.","C. Alzo la temperatura al massimo.","D. Gonfio il vaso di espansione."],"correct":"A","explanation":"Se chiudendo l''ingresso la pressione smette di salire, significa che era la pressione di rete a entrare. Se a rubinetto aperto sale, i circuiti comunica."},{"id":"Q4","type":"errore_tipico","text":"Sostituire lo scambiatore a piastre secondario perché ''l''acqua viene tiepida'', senza aver controllato la valvola 3-vie. Perché è un errore?","options":["A. Perché lo scambiatore costa poco.","B. Perché se la valvola 3-vie non commuta totalmente su sanitario, anche uno scambiatore nuovo riceverà poco calore e l''acqua resterà tiepida.","C. Perché lo scambiatore non si intasa mai.","D. Perché prima bisogna cambiare la scheda."],"correct":"B","explanation":"Lo scambiatore fa il suo lavoro solo se riceve tutta l''acqua del primario. Se la 3-vie ne manda metà ai radiatori, lo scambiatore è innocente."},{"id":"Q5","type":"mini_caso","text":"Scenario: Radiatori freddi d''inverno. Caldaia accesa. Sul display compare fisso il simbolo del ''Rubinetto'', anche se nessuno sta usando l''acqua. Cosa controlli?","options":["A. Il circolatore.","B. Il flussometro (potrebbe essere incastrato su ON o c''è una perdita occulta nell''impianto ACS).","C. La sonda esterna.","D. La pressione del gas."],"correct":"B","explanation":"La caldaia crede che ci sia una richiesta d''acqua calda e, per priorità, tiene fermo il riscaldamento. È un ''falso positivo'' del sensore di flusso."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '04',
  'scheda',
  'base',
  'Sanitario vs Riscaldamento',
  '{"meta":{"video_id":"04","title":"Sanitario vs Riscaldamento","level":"Base","ukts":["COMP-010","COMP-002","DIAG-009"]},"content":{"objective":"Diagnosticare problemi di priorità e interferenza tra circuiti.","technical_data":[{"component":"Valvola 3 Vie (Monitoraggio Stato)","value":"0=Risc, 100=San","note":"Verificare movimento durante richiesta"},{"component":"Priorità","value":"Sanitario > Riscaldamento","note":"Assoluta."}],"diagnosis_steps":[{"step":1,"question":"Cosa dice il Display?","action":"Verifica simbolo attivo (Rubinetto vs Radiatore)"},{"step":2,"question":"Il calore va dove deve?","action":"Tocca i tubi mandata riscaldamento durante prelievo ACS (Devono essere freddi)"},{"step":3,"question":"I circuiti comunicano?","action":"Verifica se pressione sale da sola (Scambiatore forato)"}],"pro_tips":["Chiudi l''ingresso acqua fredda per testare il riscaldamento senza interferenze.","Se il Display dice Sanitario ma l''acqua non commuta, il motore gira a vuoto (perno e otturatore sgranati)."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '05',
  'checklist',
  'base',
  'Checklist Video 05',
  '{"meta":{"video_id":"05","type":"checklist","title":"Checklist Video 05","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: REALITY CHECK (Il Messaggero mente?)","steps":[{"id":"chk_05_0_0","label":"Errore: Leggi codice (es. Sovratemperatura, Pressione).","required":true},{"id":"chk_05_0_1","label":"Verifica: La condizione fisica è reale? (Es. Tubo davvero caldo?).","required":true},{"id":"chk_05_0_2","label":"SÌ -> La sicurezza funziona. NON TOCCARLA.","required":true},{"id":"chk_05_0_3","label":"NO -> La sicurezza è guasta. Sostituiscila.","required":true}]},{"title":"FASE 2: CACCIA AL COLPEVOLE (Se il messaggero dice il vero)","steps":[{"id":"chk_05_1_0","label":"Per Sovratemperatura: Circolatore gira? Aria nell''impianto?","required":true},{"id":"chk_05_1_1","label":"Per Pressione Bassa: Perdita visibile? Vaso scarico?","required":true},{"id":"chk_05_1_2","label":"Per Mancata Accensione: C''è gas? Scocca scintilla?","required":true}]},{"title":"FASE 3: SOLUZIONE DEFINITIVA","steps":[{"id":"chk_05_2_0","label":"Hai riparato la causa a monte? (es. sbloccato pompa).","required":true},{"id":"chk_05_2_1","label":"Hai riarmato la sicurezza? (es. click sul Klixon).","required":true},{"id":"chk_05_2_2","label":"La caldaia completa un ciclo senza blocchi?","required":true}]},{"title":"NOTE","steps":[]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '05',
  'quiz',
  'base',
  'Le Sicurezze come Messaggi',
  '{"meta":{"video_id":"05","title":"Le Sicurezze come Messaggi","ukts":["SIC-001","SIC-005","SIC-006"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Qual è la funzione primaria di una sicurezza (es. Termostato o Pressostato) quando blocca la caldaia?","options":["A. Rompersi per proteggere la scheda.","B. Segnalare che il componente stesso è guasto.","C. Intervenire per proteggere il sistema da una condizione pericolosa (messaggero), indicando dove sta il problema.","D. Obbligare il cliente a chiamare l''assistenza per fare cassa."],"correct":"C","explanation":"Le sicurezze sono sentinelle. Se bloccano, è perché hanno rilevato un pericolo reale (es. assenza acqua o troppo calore)."},{"id":"Q2","type":"sintomo","text":"Codice errore F01 (Sovratemperatura 125°C). Tocchi il tubo di mandata ed è tiepido. Cosa significa?","options":["A. Che il circolatore è rotto.","B. Che la sicurezza (termostato) è probabilmente guasta o starata, perché la realtà fisica (tiepido) smentisce il messaggio (rovente).","C. Che la caldaia è posseduta.","D. Che manca gas."],"correct":"B","explanation":"Se il messaggio (F01) è smentito dalla prova tattile (tubo freddo/tiepido), allora sì, in questo caso il messaggero è colpevole."},{"id":"Q3","type":"azione_corretta","text":"Trovi la caldaia in blocco F01 (Reale). Cosa controlli PRIMA di premere il tasto di riarmo sul termostato?","options":["A. Controllo se c''è acqua e se il circolatore gira liberamente.","B. Cambio subito il termostato.","C. Spengo e riaccendo dall''interruttore.","D. Ordino una scheda nuova."],"correct":"A","explanation":"Se riarmi senza rimuovere la causa (es. pompa bloccata), la caldaia ripartirà, si surriscalderà e si bloccherà di nuovo in 30 secondi."},{"id":"Q4","type":"errore_tipico","text":"Sostituire la Valvola di Sicurezza 3 bar perché ''perde acqua''. Qual è l''errore diagnostico alla base?","options":["A. Non aver messo abbastanza teflon.","B. Non aver controllato il Vaso di Espansione.","C. La valvola di sicurezza non si rompe mai.","D. Bisognava mettere un tappo."],"correct":"B","explanation":"La valvola apre a 3 bar per proteggere la caldaia. Se la pressione è arrivata a 3 bar, la colpa è del vaso di espansione che non ha compensato l''aumento di volume."},{"id":"Q5","type":"mini_caso","text":"Scenario: Caldaia in blocco F22 (Mancanza Acqua). Il cliente ha caricato acqua ieri. Oggi è di nuovo a zero. Dov''è il guasto?","options":["A. Il sensore di pressione è guasto.","B. La scheda legge male.","C. C''è una perdita reale nell''impianto (o vaso scarico che fa intervenire la valvola).","D. L''acqua evapora."],"correct":"C","explanation":"Se l''acqua sparisce fisicamente (manometro a zero), il sensore F22 dice la verità. Il problema è trovare il buco da cui l''acqua esce."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '05',
  'scheda',
  'base',
  'Blocco Sicurezze',
  '{"meta":{"video_id":"05","title":"Blocco Sicurezze","level":"Base","ukts":["SIC-001","SIC-005","SIC-006"]},"content":{"objective":"Interpretare l''errore come sintomo, non come causa.","technical_data":[{"component":"Termostato 125°C","action":"Taglio alimentazione gas","reset":"Manuale (pulsante fisico)"},{"component":"Sensore Pressione","action":"Blocco software Mancanza Acqua","threshold":"< 0.5 bar"}],"diagnosis_steps":[{"step":1,"question":"Il sensore dice il vero?","action":"Confronta Codice Errore con Realtà Fisica (Tocca/Guarda)"},{"step":2,"question":"Perché siamo fuori range?","action":"Indaga componentistica a monte (Circolatore, Vaso, Perdite)"},{"step":3,"question":"Problema risolto?","action":"Solo ora resetta/riarma la sicurezza"}],"pro_tips":["Cambiare una sicurezza ha senso SOLO se scatta quando la condizione fisica è normale.","Il Blocco Termico è quasi sempre un problema di circolazione, non di temperatura."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '06',
  'checklist',
  'base',
  'Checklist Video 06',
  '{"meta":{"video_id":"06","type":"checklist","title":"Checklist Video 06","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: FERMATI E PENSA","steps":[{"id":"chk_06_0_0","label":"Sintomo: Qual è il pezzo che \"sembra\" rotto?","required":true},{"id":"chk_06_0_1","label":"Lista A Monte: Cosa deve funzionare bene affinché quel pezzo vada? (es. per l''elettrodo: Gas, Valvola, Sifone, Trafo).","required":true}]},{"title":"FASE 2: TEST DI INNOCENZA (Parti dal banale)","steps":[{"id":"chk_06_1_0","label":"Il Gas arriva? (SÌ -> Escluso).","required":true},{"id":"chk_06_1_1","label":"La Valvola clicca/apre? (SÌ -> Escluso).","required":true},{"id":"chk_06_1_2","label":"Il Sifone è pieno/libero? (SÌ -> Escluso).","required":true},{"id":"chk_06_1_3","label":"La Tensione arriva al connettore? (SÌ -> Escluso).","required":true}]},{"title":"FASE 3: VERDETTO FINALE","steps":[{"id":"chk_06_2_0","label":"Hai escluso tutto il resto?","required":true},{"id":"chk_06_2_1","label":"Hai misurato il pezzo sospetto (Ohm)? È davvero guasto?","required":true},{"id":"chk_06_2_2","label":"SÌ -> Sostituisci.","required":true},{"id":"chk_06_2_3","label":"NO/DUBBIO -> Cerca ancora, probabilmente ti sfugge qualcosa.","required":true}]},{"title":"NOTE","steps":[]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '06',
  'quiz',
  'base',
  'I Falsi Colpevoli',
  '{"meta":{"video_id":"06","title":"I Falsi Colpevoli","ukts":["SKILL-002","COMP-013"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Cos''è un ''Falso Colpevole'' nella diagnosi di una caldaia?","options":["A. Un pezzo contraffatto non originale.","B. Un componente che mostra il sintomo finale (e viene incolpato) ma sta solo subendo una conseguenza di un problema a monte.","C. Un errore del display che lampeggia.","D. Un tecnico disonesto."],"correct":"B","explanation":"L''elettrodo non rileva fiamma (sintomo), ma la colpa è del gas che non arriva (causa). L''elettrodo è il falso colpevole."},{"id":"Q2","type":"sintomo","text":"La caldaia va in blocco mancata accensione (Errore Fiamma/Gas). L''elettrodo ha la ceramica un po'' sporca. Cosa fai?","options":["A. Lo cambio subito, è sicuramente lui.","B. Pulisco l''elettrodo ma verifico PRIMA se il sifone condensa è vuoto o se la valvola gas apre.","C. Cambio la scheda.","D. Aumento la potenza di accensione."],"correct":"B","explanation":"Lo sporco non è una prova di guasto. Spesso è una coincidenza. Se il sifone tira aria, la fiamma non sta accesa neanche con un elettrodo nuovo."},{"id":"Q3","type":"azione_corretta","text":"Vuoi applicare il ''Metodo dell''Esclusione'' su un presunto guasto alla Valvola Gas. Quale passaggio fai per primo?","options":["A. Ordino la valvola nuova.","B. Smonto la valvola per guardarla dentro.","C. Verifico se arriva tensione alla bobina quando la caldaia tenta di partire.","D. Cambio il cavo."],"correct":"C","explanation":"Se non arriva tensione, la valvola è innocente: è la scheda che non la comanda. Testare l''input scagiona il componente."},{"id":"Q4","type":"errore_tipico","text":"Perché cambiare un pezzo ''perché è vecchio'' è un errore diagnostico?","options":["A. Perché i pezzi vecchi funzionano sempre meglio.","B. Perché l''età non è un guasto. Un pezzo vecchio può funzionare perfettamente, mentre uno nuovo può essere difettoso. Bisogna testare la funzione, non l''anagrafe.","C. Perché il cliente si affeziona.","D. Perché non si trovano i ricambi."],"correct":"B","explanation":"La diagnosi si basa su misure (funziona/non funziona), non sull''estetica o sull''età del componente."},{"id":"Q5","type":"mini_caso","text":"Scenario: Errore Sonda NTC. Hai cambiato la sonda ma l''errore rimane identico. Cosa hai sbagliato?","options":["A. La sonda nuova era difettosa.","B. Hai diagnosticato per abitudine (codice = pezzo), ignorando che l''errore poteva indicare un cavo interrotto, un connettore ossidato o la scheda guasta.","C. Non hai resettato bene.","D. Hai montato la sonda al contrario."],"correct":"B","explanation":"Il codice ''Errore Sonda'' significa ''Il circuito della sonda è aperto o in corto''. Può essere la sonda, ma anche il filo o la scheda."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '06',
  'scheda',
  'base',
  'Falsi Colpevoli',
  '{"meta":{"video_id":"06","title":"Falsi Colpevoli","level":"Base","ukts":["SKILL-002","DIAG-008","COMP-013"]},"content":{"objective":"Evitare la sostituzione inutile di componenti funzionanti.","technical_data":[{"component":"Bobina Valvola Gas","value":"150Ω / 30Ω","note":"Infinito = Guasta. Valore OK = Sana."},{"component":"Sonda NTC (10k)","value":"10kΩ a 25°C","note":"4kΩ a 50°C. Se legge ohm corretti, non cambiarla."}],"diagnosis_steps":[{"step":1,"question":"Cosa c''è a monte del guasto?","action":"Elenca i componenti che influenzano quello ''rotto''."},{"step":2,"question":"Posso escluderli?","action":"Testa i componenti a monte uno a uno (Test più veloce prima)."},{"step":3,"question":"Prova del nove","action":"Se cambi il pezzo, misura quello vecchio. Era davvero rotto?"}],"pro_tips":["Un componente sporco non è necessariamente rotto. Pulisci prima di cambiare.","Il codice errore indica la zona, non il pezzo."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '07',
  'checklist',
  'base',
  'Checklist Video 07',
  '{"meta":{"video_id":"07","type":"checklist","title":"Checklist Video 07","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: SICUREZZE E PREVENZIONE (La Sostanza)","steps":[{"id":"chk_07_0_0","label":"Vaso Espansione: Scaricato caldaia? Misurato precarica? (Target 1 bar).","required":true},{"id":"chk_07_0_1","label":"Sifone Condensa: Smontato e pulito? Riempito prima di ripartire?","required":true},{"id":"chk_07_0_2","label":"Valvola Sicurezza: Non gocciola?","required":true}]},{"title":"FASE 2: ANALISI E RENDIMENTO (La Legge + Diagnosi)","steps":[{"id":"chk_07_1_0","label":"Analisi Fumi: Eseguita a regime (Max Potenza)?","required":true},{"id":"chk_07_1_1","label":"CO2: Valore corretto? (Metano ~9.0%, GPL ~10.0%).","required":true},{"id":"chk_07_1_2","label":"Temperatura Fumi: Confrontata con anno scorso?","required":true}]},{"title":"FASE 3: COMUNICAZIONE (Il Valore)","steps":[{"id":"chk_07_2_0","label":"Segnalazione: Hai detto al cliente cosa hai trovato? (\"Vaso scarico ripristinato\", \"Scambiatore ok\").","required":true},{"id":"chk_07_2_1","label":"Futuro: Hai avvisato di eventuali rumori/usure da monitorare?","required":true}]},{"title":"NOTE","steps":[]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '07',
  'quiz',
  'base',
  'Manutenzione Preventiva',
  '{"meta":{"video_id":"07","title":"Manutenzione Preventiva","ukts":["PROC-009","PROC-002","PROC-007"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Qual è la differenza tra ''manutenzione burocratica'' e ''manutenzione preventiva''?","options":["A. La burocratica costa meno.","B. La burocratica compila i moduli per legge; la preventiva cerca attivamente i guasti futuri (segnali deboli) per evitarli.","C. La preventiva usa attrezzi più costosi.","D. Nessuna, sono sinonimi."],"correct":"B","explanation":"Compilare il libretto è obbligatorio, ma non evita che la caldaia si rompa a Natale. Controllare il vaso d''espansione sì."},{"id":"Q2","type":"sintomo","text":"Durante la manutenzione noti che la temperatura dei fumi è salita di 10°C rispetto all''anno scorso a parità di potenza. Cosa indica questo ''segnale debole''?","options":["A. Che la caldaia sta funzionando meglio.","B. Che lo scambiatore primario si sta sporcando (scambia meno calore, quindi i fumi escono più caldi).","C. Che il gas è più calorico.","D. Che la sonda fumi è rotta."],"correct":"B","explanation":"Se il calore non va nell''acqua, esce dal camino. Temperatura fumi alta = Scambio termico peggiorato."},{"id":"Q3","type":"azione_corretta","text":"Qual è l''unico modo corretto per verificare la precarica del vaso di espansione?","options":["A. Batterci sopra con le nocche.","B. Leggere il manometro della caldaia.","C. Scaricare la pressione dell''acqua della caldaia a zero, e poi misurare la pressione dell''aria sul vaso con un manometro dedicato.","D. Gonfiare finché non diventa duro."],"correct":"C","explanation":"La precarica si misura a vaso ''scarico'' d''acqua. Se c''è pressione d''acqua contro, misurerai quella, non la precarica."},{"id":"Q4","type":"errore_tipico","text":"Ignorare la pulizia del sifone condensa durante la manutenzione annuale. Qual è il rischio?","options":["A. Nessuno.","B. Che il sifone si intasi, la condensa non scarichi, la camera di combustione si allaghi e la caldaia vada in blocco totale (o i fumi rientrino in ambiente).","C. Che la caldaia consumi più elettricità.","D. Che si arrugginisca il mantello."],"correct":"B","explanation":"Il sifone è lo scarico della caldaia. Se si tappa, la caldaia affoga."},{"id":"Q5","type":"mini_caso","text":"Scenario: Cliente dice ''tutto ok''. Tu senti un leggero sferragliamento dalla pompa che l''anno scorso non c''era. Cosa fai?","options":["A. Niente, se funziona non tocco.","B. Lo scrivo nelle note per me.","C. Avviso il cliente: ''Sento un rumore di usura iniziale. Per ora va, ma prepariamoci a dover cambiare la pompa in futuro, magari prima dell''inverno''.","D. Cambio la pompa senza dirlo."],"correct":"C","explanation":"Questa è la prevenzione. Avvisare il cliente di un rischio futuro, trasformando un''emergenza potenziale in una manutenzione programmata."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '07',
  'scheda',
  'base',
  'Manutenzione Preventiva',
  '{"meta":{"video_id":"07","title":"Manutenzione Preventiva","level":"Base","ukts":["PROC-009","PROC-002","PROC-007"]},"content":{"objective":"Prevenire i guasti invernali analizzando i trend durante la manutenzione estiva.","technical_data":[{"component":"Vaso Espansione","check":"Ogni anno a 0 bar idraulici","target":"1.0 bar (o 0.8 min)"},{"component":"Sifone Condensa","check":"Pulizia annuale","risk":"Ritorno fumi o blocco fiamma se intasato"}],"diagnosis_steps":[{"step":1,"question":"Ascolto Attivo","action":"La caldaia ''suona'' diversa dall''anno scorso?"},{"step":2,"question":"Verifica Trend","action":"Confronta T fumi e Delta T con lo storico."},{"step":3,"question":"Intervento Proattivo","action":"Correggi le derive (carica vaso, regola CO2) PRIMA che diventino errori."}],"pro_tips":["Non limitarti a mettere la crocetta sul foglio. La caldaia non legge i fogli.","Un vaso scarico è la causa n.1 di chiamate per ''Pressione Bassa''."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '08',
  'checklist',
  'base',
  'Checklist Video 08',
  '{"meta":{"video_id":"08","type":"checklist","title":"Checklist Video 08","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: ORECCHIO (Ascolto)","steps":[{"id":"chk_08_0_0","label":"Ventilatore: Soffio pulito o fischio/vibrazione?","required":true},{"id":"chk_08_0_1","label":"Pompa: Ronzio elettrico o sferraglio meccanico?","required":true},{"id":"chk_08_0_2","label":"Valvola Gas: Click netto o incerto?","required":true},{"id":"chk_08_0_3","label":"Fiamma: Accensione dolce o ''botto''?","required":true}]},{"title":"FASE 2: OROLOGIO (Tempi)","steps":[{"id":"chk_08_1_0","label":"Accensione: Parte subito o esita?","required":true},{"id":"chk_08_1_1","label":"ACS: Arriva in tempi normali o ci mette una vita?","required":true},{"id":"chk_08_1_2","label":"Spegnimento: Si ferma subito o trascina?","required":true}]},{"title":"FASE 3: INTERVISTA (Il Cliente)","steps":[{"id":"chk_08_2_0","label":"Chesto: \"Rumori nuovi?\"","required":true},{"id":"chk_08_2_1","label":"Chiesto: \"Anomalie random?\"","required":true}]},{"title":"ESIT","steps":[]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '08',
  'quiz',
  'base',
  'Segnali Deboli',
  '{"meta":{"video_id":"08","title":"Segnali Deboli","ukts":["SKILL-003","COMP-008","COMP-007"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Cosa si intende per ''Segnale Debole'' in una caldaia?","options":["A. Un codice di errore che lampeggia piano.","B. Un cambiamento sottile nel comportamento (rumore, tempo, ritmo) che non blocca ancora la caldaia ma annuncia un guasto futuro.","C. La pressione del gas bassa.","D. Un cliente che parla a bassa voce."],"correct":"B","explanation":"È l''avvisaglia. Se la cogli, previeni il guasto. Se la ignori, diventerà un blocco."},{"id":"Q2","type":"sintomo","text":"Ascolti il circolatore e senti un leggero sferragliamento metallico che l''anno scorso non c''era. La caldaia però scalda bene. Cosa fai?","options":["A. Ignoro, finché va lasciala andare.","B. Spruzzo un po'' di svitol.","C. Riconosco il segnale di usura cuscinetti e propongo al cliente una sostituzione programmata prima che si blocchi in inverno.","D. Cambio la scheda elettronica."],"correct":"C","explanation":"Il rumore metallico è il ''grido di dolore'' dei cuscinetti. La morte della pompa è certa, è solo questione di tempo (poco)."},{"id":"Q3","type":"azione_corretta","text":"Perché è fondamentale chiedere al cliente ''Ha notato rumori nuovi o cambiamenti?'' (Intervista Tecnica)?","options":["A. Per fare conversazione.","B. Perché il cliente vive con la caldaia ogni giorno e può aver notato segnali intermittenti che tu, in 30 minuti, potresti non sentire.","C. Per fargli perdere tempo.","D. Per giustificare il prezzo."],"correct":"B","explanation":"Il cliente è un sensore ''sempre acceso'' sulla macchina. Le sue percezioni, se filtrate, sono dati tecnici preziosi."},{"id":"Q4","type":"errore_tipico","text":"La caldaia ci mette 5-6 secondi in più del solito ad accendersi (esitazione), ma alla fine parte. L''errore tipico è:","options":["A. Monitorare la tensione di rete.","B. Ignorare il ritardo perché ''tanto è partita''. (In realtà indica elettrodo sporco, gas instabile o tiraggio al limite).","C. Cambiare subito la valvola gas.","D. Pulire il filtro magnetico."],"correct":"B","explanation":"L''esitazione è il primo stadio del blocco mancata accensione. Se la ignori oggi, domani troverai la caldaia in blocco."},{"id":"Q5","type":"mini_caso","text":"Scenario: Ventilatore che fischia leggermente ad alti giri. Nessun codice errore (Consenso Pressostato ok). Diagnosi?","options":["A. Normale usura o sporcizia sulle pale che le sbilancia.","B. Scheda guasta.","C. Scambiatore bucato.","D. Manca acqua."],"correct":"A","explanation":"Un fischio o vibrazione indica un problema meccanico/fisico sulla ventola. Va pulita o, se i cuscinetti sono andati, sostituita."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '08',
  'scheda',
  'base',
  'Segnali Deboli',
  '{"meta":{"video_id":"08","title":"Segnali Deboli","level":"Base","ukts":["SKILL-003","COMP-008","COMP-007"]},"content":{"objective":"Prevenire i guasti usando i sensi (udito, vista, tatto) e l''intervista cliente.","technical_data":[{"signal":"Rumore metallico Circolatore","meaning":"Cuscinetti in fase finale","action":"Proporre sostituzione programmata"},{"signal":"Ritardo ACS","meaning":"Scambio termico ridotto","action":"Lavaggio chimico (preventivo)"}],"diagnosis_steps":[{"step":1,"question":"Ascolto","action":"Chiudi gli occhi e ascolta la sequenza di avvio. Suona ''pulita''?"},{"step":2,"question":"Intervista","action":"Chiedi al cliente se ha notato cambiamenti (rumori, tempi)."},{"step":3,"question":"Valutazione","action":"Intervento immediato o monitoraggio nel tempo?"}],"pro_tips":["Il cliente vive con la caldaia. Se dice che ''fa un rumore strano'', ha ragione al 90%.","Il ''tempo'' è un parametro tecnico. Se si allunga, l''efficienza cala."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '10',
  'checklist',
  'intermedio',
  'Checklist Video 10',
  '{"meta":{"video_id":"10","type":"checklist","title":"Checklist Video 10","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: PREPARAZIONE E SICUREZZA","steps":[{"id":"chk_10_0_0","label":"Riscaldamento: Caldaia accesa da almeno 5 min?","required":true},{"id":"chk_10_0_1","label":"Modalità Test: Attivato Max Potenza (Spazzacamino)?","required":true},{"id":"chk_10_0_2","label":"Analizzatore: Azzerato in aria pulita prima di inserirlo?","required":true}]},{"title":"FASE 2: MISURA (\"LA VERITÀ\")","steps":[{"id":"chk_10_1_0","label":"CO2 Lettura: ______ % (Target: 9.0 Metano / 10.0 GPL)","required":true},{"id":"chk_10_1_1","label":"CO Lettura: ______ ppm (Deve essere < 50)","required":true},{"id":"chk_10_1_2","label":"Lambda: ______ (Target: 1.20)","required":true},{"id":"chk_10_1_3","label":"Stabilità: I valori sono fermi o oscillano?","required":true}]},{"title":"FASE 3: REGOLAZIONE (Se necessaria)","steps":[{"id":"chk_10_2_0","label":"Agire: Regolato vite/parametro per portare CO2 a target?","required":true},{"id":"chk_10_2_1","label":"Verifica: Il valore rimane stabile dopo la regolazione?","required":true},{"id":"chk_10_2_2","label":"Minimo: Testato anche a potenza minima?","required":true}]},{"title":"NOTE","steps":[]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '10',
  'quiz',
  'intermedio',
  'Instabilità e Modulazione',
  '{"meta":{"video_id":"10","title":"Instabilità e Modulazione","ukts":["PROC-002","DIAG-007","COMP-023"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Perché è VIETATO regolare la valvola gas mentre la caldaia sta modulando (cioè variando la potenza)?","options":["A. Perché ci si scotta le mani.","B. Perché non hai un punto di riferimento fisso. Stai cercando di colpire un bersaglio in movimento. Devi bloccarla alla massima potenza (Spazzacamino) per avere una lettura stabile.","C. Perché la sonda dell''analizzatore si rovina.","D. Perché consumi troppo gas."],"correct":"B","explanation":"La regolazione si fa su punti fissi (Max e Min). Se la potenza cambia mentre regoli, la lettura della CO2 cambia per la modulazione, non per la tua vite."},{"id":"Q2","type":"sintomo","text":"Una caldaia a condensazione ''respira'' (fa un rumore pulsante woo-woo-woo). L''analizzatore segna una CO2 del 8.0% a Metano. Qual è la diagnosi?","options":["A. È troppo magra (troppa aria, poco gas). La fiamma è instabile e rischia di staccarsi.","B. È troppo grassa.","C. È perfetta.","D. Ha il ventilatore rotto."],"correct":"A","explanation":"Il target Metano è 9.0%. Se leggi 8.0% hai troppa aria (o poco gas). Questa miscela magra causa instabilità e risonanza."},{"id":"Q3","type":"azione_corretta","text":"Hai appena pulito lo scambiatore e il bruciatore. Rimonti tutto e accendi. Cosa DEVI fare obbligatoriamente?","options":["A. Andartene veloce.","B. Solo prova tenuta gas.","C. Verificare e ritarare la combustione. La pulizia cambia la permeabilità e quindi il rapporto aria/gas.","D. Resettare gli errori."],"correct":"C","explanation":"Ogni modifica fisica alla camera di combustione (pulizia, sostituzione guarnizioni) altera la fluidodinamica. La taratura vecchia non vale più."},{"id":"Q4","type":"errore_tipico","text":"Qual è l''errore più grave quando si misura la CO2?","options":["A. Non usare la stampante.","B. Dimenticarsi di tappare la presa fumi dopo la misura (rischio CO in ambiente).","C. Usare una sonda vecchia.","D. Non pulire l''analizzatore."],"correct":"B","explanation":"Lasciare la presa fumi aperta significa far uscire monossido di carbonio nel locale dove vive il cliente. È un errore di sicurezza vitale."},{"id":"Q5","type":"mini_caso","text":"Scenario: CO2 ballerina. I valori saltano da 8.5% a 9.5% continuamente, anche alla Max Potenza. Cosa sospetti prima di toccare la vite?","options":["A. La valvola gas è rotta.","B. Ricircolo Fumi. La canna fumaria potrebbe aspirare i suoi stessi fumi di scarico. Prova ad aprire il mantello: se si stabilizza, è la fumisteria.","C. Il gas è sporco.","D. È colpa del vento."],"correct":"B","explanation":"Se la caldaia ''mangia il suo vomito'' (ricircolo), la combustione diventa instabile e impossibile da tarare. Verifica la tenuta dei condotti."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '10',
  'scheda',
  'intermedio',
  'Instabilità e Modulazione',
  '{"meta":{"video_id":"10","title":"Instabilità e Modulazione","level":"Intermedio","ukts":["PROC-002","DIAG-007","COMP-023"]},"content":{"objective":"Risolvere instabilità di fiamma tramite regolazione CO2.","technical_data":[{"gas":"Metano (G20)","co2_target":"9.0% - 9.2%","lambda_target":"1.15 - 1.25"},{"gas":"GPL (G31)","co2_target":"10.0% - 10.2%","lambda_target":"1.10 - 1.20"}],"diagnosis_steps":[{"step":1,"question":"Il motore è caldo?","action":"Attendi 3 minuti di funzionamento prima di misurare."},{"step":2,"question":"Il sistema è bloccato?","action":"Attiva Max Potenza. Se non blocchi la modulazione, insegui un fantasma."},{"step":3,"question":"I fumi sono puliti?","action":"Se CO2 balla, verifica ricircolo fumi (apri camera stagna)."}],"pro_tips":["La Sonda Lambda della caldaia non mente, ma può essere ingannata se aspira scarico.","Regolare a freddo è l''errore n.1 del principiante."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '11',
  'checklist',
  'intermedio',
  'Checklist Video 11',
  '{"meta":{"video_id":"11","type":"checklist","title":"Checklist Video 11","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: I FLUIDI IN INGRESSO (Gas & Acqua)","steps":[{"id":"chk_11_0_0","label":"Gas (Dinamica): Misurato con caldaia accesa? È > 17 mbar?","required":true},{"id":"chk_11_0_1","label":"Pressione Acqua: Manometro stabile? (Non scende da solo).","required":true},{"id":"chk_11_0_2","label":"Aria: Sentito gorgoglii? Spurgato jolly?","required":true}]},{"title":"FASE 2: LO SCARICO (Fumi)","steps":[{"id":"chk_11_1_0","label":"Terminale: Libero da ostruzioni (nidi/foglie)?","required":true},{"id":"chk_11_1_1","label":"Pendenza: La condensa torna in caldaia (ok) o ristagna (no)?","required":true},{"id":"chk_11_1_2","label":"Aspirazione: Non aspira i suoi stessi fumi?","required":true}]},{"title":"FASE 3: LA CIRCOLAZIONE (Impianto)","steps":[{"id":"chk_11_2_0","label":"Valvole: Tutte aperte (Mandata/Ritorno + Radiatori)?","required":true},{"id":"chk_11_2_1","label":"Delta T: La differenza Mandata/Ritorno è accettabile (< 20°C)?","required":true}]},{"title":"ESITO DIAGNOSI","steps":[{"id":"chk_11_3_0","label":"Problema INTERNO: (Es. Pompa rotta, Scheda andata).","required":true},{"id":"chk_11_3_1","label":"Problema ESTERNO: (Es. Contatore gas, Aria impianto). -> STOP LAVORI SU CALDAIA.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '11',
  'quiz',
  'intermedio',
  'Problemi Esterni (Gas/Impianto)',
  '{"meta":{"video_id":"11","title":"Problemi Esterni (Gas/Impianto)","ukts":["DIAG-006","PROC-012","DIAG-009"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Se la caldaia va in blocco, bisogna sempre riparare la caldaia?","options":["A. Sì, è lei che si è fermata.","B. No. Il blocco è spesso una protezione corretta contro un problema esterno (mancanza gas, mancanza acqua, scarico tappato). La caldaia è la vittima, non il colpevole.","C. Sì, bisogna resettarla finché non va.","D. Bisogna cambiare la scheda."],"correct":"B","explanation":"Se manca il gas dalla rete, la caldaia DEVE andare in blocco. Riparare la caldaia è inutile, bisogna chiamare il fornitore del gas."},{"id":"Q2","type":"sintomo","text":"La caldaia tenta di partire, fa la scintilla ma la fiamma non si accende o è piccolissima e si spegne subito. Pressione statica gas: 20 mbar. Pressione dinamica (mentre accende): 11 mbar. Diagnosi?","options":["A. Valvola gas rotta.","B. Problema sulla rete gas a monte (contatore o riduttore). La portata crolla quando c''è richiesta.","C. Scheda elettronica difettosa.","D. Ugelli sporchi."],"correct":"B","explanation":"Una caduta di pressione così violenta (da 20 a 11) indica che il ''tubo'' a monte è strozzato. La statica inganna (misura solo che il tubo è pieno), la dinamica dice la verità (misura quanto gas passa)."},{"id":"Q3","type":"azione_corretta","text":"Senti gorgoglii nei termosifoni e la caldaia sale molto veloce di temperatura, rischiando il blocco. Cosa fai?","options":["A. Abbasso la potenza massima.","B. Cambio il sensore di temperatura.","C. Eseguo lo spurgo aria da tutti i radiatori e verifico il jolly in caldaia.","D. Cambio il circolatore."],"correct":"C","explanation":"L''aria è un isolante e blocca il flusso. Se c''è aria, l''acqua non gira e il calore non viene smaltito. Togliere l''aria è la prima soluzione."},{"id":"Q4","type":"errore_tipico","text":"Un cliente si lamenta che l''ultimo radiatore è freddo. Tu cambi la pompa della caldaia con una più potente. Perché è un errore?","options":["A. Perché costa troppo.","B. Perché probabilmente il problema è il bilanciamento dell''impianto (detentori aperti male) o aria. Aumentare la potenza maschera il problema ma spreca energia e crea rumore.","C. Perché la pompa nuova non ci sta.","D. Perché dovevi cambiare la valvola 3 vie."],"correct":"B","explanation":"La caldaia spinge l''acqua, ma se l''impianto è sbilanciato (tubi preferenziali), l''acqua sceglie la via più facile. Bisogna chiudere un po'' i primi radiatori."},{"id":"Q5","type":"mini_caso","text":"Scenario: Blocco F33 (Pressostato Aria) ricorrente quando c''è vento o piove molto. Ventilatore e pressostato sono nuovi. Chi è il colpevole?","options":["A. La scheda che impazzisce col tempo.","B. La canna fumaria (tiraggio ostruito, ritorno condensa, terminale non antivento).","C. Il gas.","D. La pressione dell''acqua."],"correct":"B","explanation":"Se i componenti interni sono nuovi e il problema è correlato al meteo, la causa è al 100% nella fumisteria esterna."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '11',
  'scheda',
  'intermedio',
  'Problemi Esterni',
  '{"meta":{"video_id":"11","title":"Problemi Esterni","level":"Intermedio","ukts":["DIAG-006","PROC-012","DIAG-009"]},"content":{"objective":"Scagionare la caldaia analizzando le condizioni al contorno (Gas, Acqua, Fumi).","technical_data":[{"test":"Pressione Gas Dinamica","threshold":"< 17 mbar (Metano)","meaning":"Problema contatore o tubazione rete."},{"test":"Circolazione","threshold":"Delta T > 30°C rapido","meaning":"Strozzatura esterna o Aria."}],"diagnosis_steps":[{"step":1,"question":"Gas OK?","action":"Misura dinamica. Statica non conta nulla."},{"step":2,"question":"Aria OK?","action":"Spurgo radiatori e verifica jolly automatico."},{"step":3,"question":"Fumi OK?","action":"Verifica visiva terminale (nidi, ghiaccio)."}],"pro_tips":["Mai cambiare la valvola gas senza aver misurato la pressione in ingresso dinamica.","L''aria è il nemico silenzioso n.1 della circolazione."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '12',
  'checklist',
  'intermedio',
  'Checklist Video 12',
  '{"meta":{"video_id":"12","type":"checklist","title":"Checklist Video 12","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: PRIMARIO (Riscaldamento)","steps":[{"id":"chk_12_0_0","label":"Circolazione: Il ritorno si scalda in tempi ragionevoli? (O resta freddo?)","required":true},{"id":"chk_12_0_1","label":"Fumi: La temperatura fumi è nella norma (50-70°C) o eccessiva (>100°C)?","required":true},{"id":"chk_12_0_2","label":"Filtro Y: Smontato e pulito il filtro sul ritorno impianto?","required":true}]},{"title":"FASE 2: SECONDARIO (Sanitario)","steps":[{"id":"chk_12_1_0","label":"Test Portata: Riducendo il flusso, la temperatura sale?","required":true},{"id":"chk_12_1_1","label":"Test Tatto: Toccato ingresso primario piastre (Bollente) e uscita sanitario (Tiepida)? -> Intasato.","required":true},{"id":"chk_12_1_2","label":"Lavaggio: È possibile tentare un lavaggio chimico prima di sostituire?","required":true}]},{"title":"FASE 3: PREVENZIONE (Post-Intervento)","steps":[{"id":"chk_12_2_0","label":"Acqua Impianto: È scura/nera? (Se sì, serve lavaggio impianto completo).","required":true},{"id":"chk_12_2_1","label":"Dosatore: C''è? È carico?","required":true},{"id":"chk_12_2_2","label":"Defangatore: Presente? Pulito?","required":true}]},{"title":"VERDETTO","steps":[{"id":"chk_12_3_0","label":"Colpevole: Scambiatore intasato internamente.","required":true},{"id":"chk_12_3_1","label":"Innocente: Problema di circolazione (Filtro, Pompa) o portata.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '12',
  'quiz',
  'intermedio',
  'Scambiatore: Colpevole o Capro Espiatorio',
  '{"meta":{"video_id":"12","title":"Scambiatore: Colpevole o Capro Espiatorio","ukts":["COMP-001","COMP-002"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Qual è il sintomo INEQUIVOCABILE che lo scambiatore primario è sporco LATO FUMI (quindi non scambia calore)?","options":["A. La caldaia fa rumore.","B. La temperatura dei fumi di scarico è molto alta (> 90-100°C), perché il calore non è stato assorbito dall''acqua ed è uscito dal camino.","C. La pressione dell''acqua scende.","D. L''acqua sanitaria è fredda."],"correct":"B","explanation":"Se lo scambiatore è ''isolato'' dalla fuliggine, il calore non passa all''acqua e scappa via coi fumi. Alta T fumi = Basso rendimento/Scambio."},{"id":"Q2","type":"sintomo","text":"La caldaia va subito in sovratemperatura (100°C) appena parte. Tocchi la mandata ed è bollente, tocchi il ritorno ed è FREDDO GELIDO. Diagnosi?","options":["A. Scambiatore intasato: bisogna cambiarlo.","B. Circolazione bloccata. Lo scambiatore funziona benissimo (ha scaldato l''acqua all''istante), ma l''acqua non si muove. Controlla pompa, valvole o filtro Y intasato.","C. Sonda NTC rotta.","D. Gas troppo forte."],"correct":"B","explanation":"Se lo scambiatore fosse intasato, farebbe fatica a scaldare. Qui scalda ''troppo''. Il problema è che il calore non viene portato via. È un problema di flusso (pompa/filtro), non di scambio."},{"id":"Q3","type":"azione_corretta","text":"Hai diagnosticato uno scambiatore a piastre intasato dal calcare (acqua tiepida, primario bollente). Cosa conviene fare prima di sostituirlo?","options":["A. Tentare un lavaggio chimico disincrostante con pompa apposita. Spesso recupera il pezzo al 100%.","B. Bucarlo col trapano.","C. Aumentare la temperatura dell''acqua.","D. Cambiare la valvola 3 vie."],"correct":"A","explanation":"Il calcare è solubile negli acidi. Un lavaggio è meno costoso del ricambio e spesso risolutivo. Se invece è bucato, va cambiato."},{"id":"Q4","type":"errore_tipico","text":"Perché cambiare lo scambiatore a piastre ''perché la caldaia è vecchia'' è un errore?","options":["A. Perché i pezzi vecchi sono più robusti.","B. Perché l''età non determina l''intasamento. Uno scambiatore può intasarsi in 3 mesi se l''acqua è dura, o durare 20 anni se trattata. Conta la diagnosi (Delta T), non l''anagrafe.","C. Perché non si trovano i ricambi.","D. Perché è illegale."],"correct":"B","explanation":"La diagnosi si fa sui sintomi e sulle misure. L''età è un fattore di rischio, non una prova di guasto."},{"id":"Q5","type":"mini_caso","text":"Scenario: Acqua sanitaria tiepida. Il Tecnico A dice ''Cambio lo scambiatore''. Il Tecnico B misura la portata al rubinetto: 18 litri al minuto. Chi ha ragione?","options":["A. Tecnico A. È sempre lo scambiatore.","B. Tecnico B. Una caldaia standard da 24kW non può scaldare 18 litri al minuto oltre i 30-35 gradi (limite fisico). Lo scambiatore è innocente, bisogna ridurre la portata d''acqua.","C. Nessuno dei due.","D. Bisogna mettere una caldaia a gasolio."],"correct":"B","explanation":"La fisica non si inganna. 24kW scaldano ~ 11-12 litri/minuto a delta T 30. Se ne chiedi 18, l''acqua sarà per forza tiepida."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '12',
  'scheda',
  'intermedio',
  'Scambiatore: Colpevole o Capro Espiatorio',
  '{"meta":{"video_id":"12","title":"Scambiatore: Colpevole o Capro Espiatorio","level":"Intermedio","ukts":["COMP-001","COMP-002"]},"content":{"objective":"Diagnosticare correttamente lo stato di salute degli scambiatori.","technical_data":[{"component":"Primario","bad_sign":"T Fumi > 90-100°C","false_alarm":"Delta T Mandata/Ritorno > 40°C (indica circolazione ferma, non scambiatore)"},{"component":"Secondario (Piastre)","bad_sign":"Primario a 80°C ma Sanitario a 35°C","action":"Lavaggio chimico o sostituzione"}],"diagnosis_steps":[{"step":1,"question":"Il calore VIENE PORTATO VIA?","action":"Verifica Delta T. Se alto, l''acqua non gira."},{"step":2,"question":"Il calore PASSA?","action":"Verifica T Fumi. Se alta, il calore non passa all''acqua."},{"step":3,"question":"Il secondario SCAMBIA?","action":"Confronta T Primario (ingesso piastre) con T Sanitario (uscita piastre)."}],"pro_tips":["Cambiare uno scambiatore senza lavare l''impianto è garanzia di rottura del pezzo nuovo entro 1 anno.","Gli scambiatori non muoiono di vecchiaia, muoiono soffocati."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '13',
  'checklist',
  'intermedio',
  'Checklist Video 13',
  '{"meta":{"video_id":"13","type":"checklist","title":"Checklist Video 13","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: DIAGNOSI \"A MANI IN TASCA\" (Senza Attrezzi)","steps":[{"id":"chk_13_0_0","label":"Richiesta Sanitaria: Apro l''acqua calda. Sul display compare il simbolo rubinetto?","required":true},{"id":"chk_13_0_1","label":"Parametro Flussometro: Segna litri/minuto (> 2.0)?","required":true},{"id":"chk_13_0_2","label":"Parametro Stato 3-Vie: Passa da 0 a 100?","required":true}]},{"title":"FASE 2: VERIFICA COMPONENTE (Mani Sporche)","steps":[{"id":"chk_13_1_0","label":"Rumore: Si sente il motorino lavorare durante la commutazione?","required":true},{"id":"chk_13_1_1","label":"Test Meccanico: Tolto motore, il perno rientra ed esce spingendolo (molla ok)?","required":true},{"id":"chk_13_1_2","label":"Test Elettrico: Arriva tensione al connettore motore?","required":true}]},{"title":"FASE 3: ESITO","steps":[{"id":"chk_13_2_0","label":"Problema A MONTE: Flussometro non legge o Scheda non comanda. (Valvola OK).","required":true},{"id":"chk_13_2_1","label":"Problema MOTORE: Valvola libera, tensione OK, motore fermo. (Cambio Motore).","required":true},{"id":"chk_13_2_2","label":"Problema CARTUCCIA: Motore gira, perno bloccato/duro. (Cambio Cartuccia o Corpo).","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '13',
  'quiz',
  'intermedio',
  'Valvola 3 Vie Diagnosi',
  '{"meta":{"video_id":"13","title":"Valvola 3 Vie Diagnosi","ukts":["COMP-010","COMP-012"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Se la valvola a 3 vie NON riceve il comando elettrico dalla scheda, di chi è la colpa?","options":["A. Della valvola, che dovrebbe muoversi telepaticamente.","B. Di chi o cosa dovrebbe mandare quel comando (Scheda, Flussometro, Sonde). La valvola è solo un attuatore stupido: se non le dici muoviti, lei sta ferma.","C. Del motore passo-passo.","D. Dell''acqua troppo dura."],"correct":"B","explanation":"La valvola esegue ordini. Se l''ordine non arriva (tensione 0), lei è innocente. Il problema è a monte."},{"id":"Q2","type":"sintomo","text":"Apri l''acqua calda, ma la caldaia resta in silenzio e i termosifoni non si scaldano (niente succede). Il display non mostra il rubinetto. Diagnosi?","options":["A. Valvola 3 vie bloccata.","B. Flussometro guasto (o filtro ingresso acqua tappato). La caldaia non sa che hai aperto l''acqua, quindi non attiva nulla.","C. Scambiatore bucato.","D. Pressione bassa."],"correct":"B","explanation":"Se il display non reagisce, manca input. Il ''sensore'' (flussometro) è il primo indiziato, non l''attuatore (valvola)."},{"id":"Q3","type":"azione_corretta","text":"Il parametro Stato 3-Vie segna 100 (Sanitario), ma la valvola è ferma e l''acqua calda non viene. Hai un tester. Cosa fai?","options":["A. Cambio subito la scheda.","B. Misuro la tensione al connettore del motore. Se c''è tensione e motore fermo -> Motore guasto. Se non c''è tensione -> Scheda o cablaggio.","C. Prendo a martellate la valvola.","D. Chiamo l''idraulico."],"correct":"B","explanation":"La misura elettrica è la prova definitiva. Divide il problema in due: Elettrico (Scheda) vs Meccanico (Motore)."},{"id":"Q4","type":"errore_tipico","text":"Perché non bisogna MAI cambiare tutto il corpo valvola senza aver provato a sbloccarlo o cambiare solo il motore?","options":["A. Perché il corpo valvola non si rompe mai.","B. Perché spesso il blocco è dovuto a sporcizia rimuovibile o a un motore da 20 euro rotto. Svuotare l''impianto per cambiare un corpo in ottone che dura 50 anni è uno spreco inutile.","C. Perché è impossibile da smontare.","D. Perché la plastica è meglio dell''ottone."],"correct":"B","explanation":"La diagnostica a livelli (Motore -> Cartuccia -> Corpo) risparmia tempo e fatica."},{"id":"Q5","type":"mini_caso","text":"Scenario: Rumore ''Trrr-Trrr-Trrr'' (sgranamento) quando apri l''acqua calda. Poi l''acqua arriva. Cos''è?","options":["A. Ingranaggi del motorino sgranati o meccanica valvola indurita che sforza.","B. Ventilatore sporco.","C. Gas nella tubazione.","D. Fantasmi."],"correct":"A","explanation":"Il rumore meccanico durante la commutazione è la firma della valvola che soffre. Probabilmente sta per rompersi del tutto."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '13',
  'scheda',
  'intermedio',
  'Valvola 3 Vie Diagnosi',
  '{"meta":{"video_id":"13","title":"Valvola 3 Vie Diagnosi","level":"Intermedio","ukts":["COMP-010","COMP-012"]},"content":{"objective":"Diagnosticare correttamente la catena di commutazione: Sensore -> Scheda -> Motore -> Valvola.","technical_data":[{"component":"Flussometro","parameter":"Flusso Sanitario","logic":"Deve essere > 0 con rubinetto aperto."},{"component":"Valvola 3 Vie","parameter":"Stato 3-Vie","logic":"0 = Riscaldamento, 100 = Sanitario."}],"diagnosis_steps":[{"step":1,"question":"Il sistema SA che vuoi acqua calda?","action":"Guarda display o Flusso. Se non cambia niente, è il sensore."},{"step":2,"question":"Il comando ARRIVA?","action":"Guarda Stato 3-Vie o misura tensione al connettore."},{"step":3,"question":"Il motore GIRA?","action":"Ascolta ronzio o vibrazione."},{"step":4,"question":"Il perno SCORRE?","action":"Test manuale meccanico spingendo il perno."}],"pro_tips":["Mai sostituire il corpo intero se non hai verificato prima che il perno sia bloccato.","Il motore stepper si muove. Se è morto, spesso è solo lui da cambiare."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '14',
  'checklist',
  'intermedio',
  'Checklist Video 14',
  '{"meta":{"video_id":"14","type":"checklist","title":"Checklist Video 14","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: CHECK VELOCE (Display)","steps":[{"id":"chk_14_0_0","label":"Coerenza: A caldaia ferma, T. Mandata (Display) e T. Ritorno (Display) sono simili?","required":true},{"id":"chk_14_0_1","label":"Reattività: Accendendo il bruciatore, i valori salgono? O restano inchiodati?","required":true},{"id":"chk_14_0_2","label":"Stabilità: I numeri sono stabili o saltano a caso (es. 40 -> 80 -> 45)?","required":true}]},{"title":"FASE 2: VERIFICA FISICA (Tester)","steps":[{"id":"chk_14_1_0","label":"Isolamento: Connettore staccato.","required":true},{"id":"chk_14_1_1","label":"Misura: Resistenza NTC = ________ kΩ.","required":true},{"id":"chk_14_1_2","label":"Stima: La resistenza misurata corrisponde (grosso modo) alla temperatura del tubo? (Es. Tubo freddo = ~10kΩ).","required":true}]},{"title":"FASE 3: MONTAGGIO (Se sostituisci)","steps":[{"id":"chk_14_2_0","label":"Pasta Termica: Applicata? (Obbligatorio per sonde a contatto).","required":true},{"id":"chk_14_2_1","label":"Clip: Fissata bene? La sonda non balla?","required":true},{"id":"chk_14_2_2","label":"Connettore: Contatti puliti (no verde/ossido)?","required":true}]},{"title":"ESITO","steps":[{"id":"chk_14_3_0","label":"Sonda OK: Il problema è altrove (flusso, aria, scheda).","required":true},{"id":"chk_14_3_1","label":"Sonda KO: Sostituita.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '14',
  'quiz',
  'intermedio',
  'Sonde NTC e Diagnostica',
  '{"meta":{"video_id":"14","title":"Sonde NTC e Diagnostica","ukts":["COMP-013","DIAG-003"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Come si comporta la resistenza elettrica di una sonda NTC quando si scalda?","options":["A. Aumenta (Più caldo = Più Ohm).","B. Diminuisce (Più caldo = Meno Ohm). È un coefficiente Negativo.","C. Resta uguale.","D. Diventa zero immediatamente."],"correct":"B","explanation":"NTC sta per Negative Temperature Coefficient. A 25°C è 10kΩ, a 80°C scende a 1.5kΩ."},{"id":"Q2","type":"sintomo","text":"La caldaia non mostra errori, ma l''acqua sanitaria è instabile. Sul display vedi la temperatura che salta continuamente: 45, 52, 43, 58... Diagnosi?","options":["A. Sonda NTC in avaria (instabile) o connettore ossidato/lento.","B. Gas sporco.","C. Pressione acqua bassa.","D. Scambiatore bucato."],"correct":"A","explanation":"I salti improvvisi di valore (glitch) sono tipici di un sensore che sta morendo o di un falso contatto elettrico."},{"id":"Q3","type":"azione_corretta","text":"Devi misurare una sonda NTC col tester. Qual è la procedura corretta?","options":["A. Misuro coi puntali sui contatti mentre la caldaia è accesa.","B. Spengo, stacco il connettore della sonda, e misuro la resistenza (Ohm) direttamente sui pin della sonda isolata.","C. Taglio i fili.","D. La metto nel congelatore."],"correct":"B","explanation":"Se misuri con la sonda collegata, misuri la resistenza del circuito della scheda in parallelo, falsando tutto. La sonda va isolata."},{"id":"Q4","type":"errore_tipico","text":"Sostituisci una sonda a contatto (a clip) sul tubo. Cosa non devi mai dimenticare?","options":["A. Di dire una preghiera.","B. La pasta termoconduttiva. Senza pasta, la sonda non legge bene la temperatura del metallo (c''è aria in mezzo) e la caldaia risponderà in ritardo.","C. Di pulire il tubo con l''alcol.","D. Di resettare l''ora."],"correct":"B","explanation":"Il contatto metallo-sensore deve essere perfetto. L''aria è un isolante termico. La pasta colma i micro-vuoti e assicura lettura immediata."},{"id":"Q5","type":"mini_caso","text":"Scenario: Mattina presto, impianto freddo. Accendi la diagnostica. Mandata: 18°C. Ritorno: 65°C. Cosa deduci?","options":["A. La casa è molto calda.","B. La sonda di ritorno è guasta (starata/in corto parziale). È impossibile che il ritorno sia a 65°C se la caldaia è spenta dalla sera prima.","C. C''è un ritorno di fiamma.","D. La pompa gira al contrario."],"correct":"B","explanation":"A caldaia fredda, tutte le sonde devono segnare la temperatura ambiente (± tolleranza). Una discrepanza così enorme indica guasto certo."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '14',
  'scheda',
  'intermedio',
  'Sonde NTC e Diagnostica',
  '{"meta":{"video_id":"14","title":"Sonde NTC e Diagnostica","level":"Intermedio","ukts":["COMP-013","DIAG-003"]},"content":{"objective":"Verificare l''accuratezza dei sensori di temperatura.","technical_data":[{"sensor_type":"NTC 10k Ohm @ 25°C","behavior":"Resistenza SCENDE se temperatura SALE."},{"check_point_25C":"10 kOhm","check_point_50C":"4 kOhm","check_point_80C":"1.5 kOhm"}],"diagnosis_steps":[{"step":1,"question":"C''è un codice errore (Fxx)?","action":"Sì? Sonda interrotta/corto. No? Problema di deriva o contatto."},{"step":2,"question":"Il valore è coerente col tatto?","action":"Tocca il tubo. Se il display dice 80°C e tu tieni la mano, la sonda mente."},{"step":3,"question":"Misura Resistiva","action":"Stacca connettore. Misura Ohm. Confronta con T stimata."}],"pro_tips":["Le sonde a immersione sono più veloci ma soffrono il calcare. Le sonde a contatto sono più lente ma eterne (se c''è pasta termica).","Il cablaggio ossidato falsa la lettura (aumenta resistenza -> la caldaia legge più freddo)."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '15',
  'checklist',
  'intermedio',
  'Checklist Video 15',
  '{"meta":{"video_id":"15","type":"checklist","title":"Checklist Video 15","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: PRIMA DI CONDANNARE (Diagnosi)","steps":[{"id":"chk_15_0_0","label":"Alimentazione: Arriva la 230V corretta (L-N, Terra ok)?","required":true},{"id":"chk_15_0_1","label":"Fusibili: Controllati i fusibili sulla scheda?","required":true},{"id":"chk_15_0_2","label":"Input: I sensori (NTC, Pressostati) sono integri e sani?","required":true},{"id":"chk_15_0_3","label":"Output: Se la scheda non attiva un carico, hai verificato col tester che NON esca tensione dai morsetti?","required":true}]},{"title":"FASE 2: PRE-SOSTITUZIONE (Backup)","steps":[{"id":"chk_15_1_0","label":"Foto: Foto ai cablaggi originali.","required":true},{"id":"chk_15_1_1","label":"Parametri: Annotati Codice Modello, Max Potenza, Offset Gas, T Max Mandata.","required":true}]},{"title":"FASE 3: POST-SOSTITUZIONE (Configurazione)","steps":[{"id":"chk_15_2_0","label":"Codice Modello: Inserito codice prodotto corretto (Errore Configurazione sparito)?","required":true},{"id":"chk_15_2_1","label":"Reset: Eseguito reset errori se necessario.","required":true},{"id":"chk_15_2_2","label":"Test: Riscaldamento e Sanitario funzionano?","required":true}]},{"title":"ESITO","steps":[{"id":"chk_15_3_0","label":"Scheda Vecchia: Era davvero guasta (es. bruciata, relè incollato).","required":true},{"id":"chk_15_3_1","label":"Configurazione: Nuova scheda operativa e parametrizzata.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '15',
  'quiz',
  'intermedio',
  'Scheda Elettronica Diagnosi',
  '{"meta":{"video_id":"15","title":"Scheda Elettronica Diagnosi","ukts":["PROC-004","DIAG-001"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"La scheda elettronica ''pensa''? Ha coscienza di ciò che accade?","options":["A. Sì, ha un''intelligenza artificiale avanzata.","B. No. È un decisore programmato cieco. Riceve input dai sensori (i suoi ''occhi'') ed esegue output secondo una logica fissa. Se i sensori mentono, la scheda sbaglia.","C. A volte, dipende dall''umore.","D. Solo le schede WiFi pensano."],"correct":"B","explanation":"La scheda è una macchina logica Input -> Processo -> Output. Non può verificare la veridicità degli input."},{"id":"Q2","type":"sintomo","text":"Hai sostituito la scheda principale. Accendi e il display mostra ''F70''. Cosa è successo?","options":["A. La scheda nuova è difettosa di fabbrica.","B. Hai bruciato la scheda montandola male.","C. Manca la configurazione del Codice Prodotto (DSN). La scheda non sa su che modello di caldaia è montata. Devi inserire il codice nel parametro D93.","D. È un errore di pressione."],"correct":"C","explanation":"F70 = Configurazione mancante. È normale su una scheda vergine. Va ''battezzata'' col codice DSN."},{"id":"Q3","type":"azione_corretta","text":"La caldaia dà Errore F1 (Mancanza Fiamma), ma tu vedi attraverso l''oblo che la fiamma si accende regolarmente e poi si spegne dopo 3 secondi. Di chi è la colpa?","options":["A. Della scheda, che spegne la fiamma.","B. Del sistema di rilevazione fiamma (Elettrodo/Cavo). La scheda spegne perché NON le arriva il segnale di ritorno ''fiamma presente''. La scheda sta agendo correttamente in base all''informazione (falsa) che riceve.","C. Del gas.","D. Del ventilatore."],"correct":"B","explanation":"Se la fiamma c''è ma la scheda non la ''vede'', il problema è negli occhi della scheda (elettrodo), non nel cervello."},{"id":"Q4","type":"errore_tipico","text":"Qual è l''errore metodologico più grave quando si sospetta la scheda?","options":["A. Non usare i guanti antistatici.","B. Sostituirla ''per provare'', senza aver prima verificato fusibili, alimentazione e integrità dei sensori. È una diagnosi per disperazione.","C. Pulirla con acqua.","D. Parlarle dolcemente."],"correct":"B","explanation":"Cambiare la scheda è l''ultima spiaggia (costosa). Farlo senza aver escluso il resto è unprofessionalità."},{"id":"Q5","type":"mini_caso","text":"Scenario: Pompa ferma. La scheda riceve la richiesta (S01), tutte le sicurezze sono ok. Misuri col tester sui morsetti della pompa sulla scheda: 0 Volt. Diagnosi?","options":["A. Pompa bruciata.","B. Scheda guasta (Relè pompa andato). Se la logica dice ''accendi'' ma la tensione non esce, il driver di potenza sulla scheda è rotto.","C. Condensatore pompa.","D. Manca acqua."],"correct":"B","explanation":"Se Input = OK e Logica = OK, ma Output = 0V, allora il guasto è interno allo stadio di potenza della scheda."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '15',
  'scheda',
  'intermedio',
  'Scheda Elettronica Diagnosi',
  '{"meta":{"video_id":"15","title":"Scheda Elettronica Diagnosi","level":"Intermedio","ukts":["PROC-004","DIAG-001"]},"content":{"objective":"Diagnosticare correttamente la scheda elettronica ed evitare sostituzioni inutili.","technical_data":[{"code":"F70","meaning":"Scheda non configurata (Manca DSN in D93)","action":"Inserire codice prodotto"},{"code":"S-Codes","meaning":"Stati operativi (es. S01 = Richiesta Calore)","use":"Verificare se la scheda ''vede'' la richiesta"}],"diagnosis_steps":[{"step":1,"question":"Discrepanza Realtà/Segnale?","action":"Confronta errore display con stato fisico. Se non coincidono = Sensore guasto."},{"step":2,"question":"Input OK, Output KO?","action":"Se tutti i consensi ci sono ma l''attuatore non riceve tensione = Relè scheda guasto."},{"step":3,"question":"Comportamento Erratico?","action":"Display che sfarfalla, caratteri strani, riavvii = Guasto Scheda."}],"pro_tips":["Annota sempre i parametri (D00, D52, D93) PRIMA di smontare la vecchia scheda.","L''errore F70 non è un guasto, è una dimenticanza dell''installatore."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '16',
  'checklist',
  'intermedio',
  'Checklist Video 16',
  '{"meta":{"video_id":"16","type":"checklist","title":"Checklist Video 16","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: OSSERVAZIONE VISIVA (Il Campione)","steps":[{"id":"chk_16_0_0","label":"Prelievo: Spurgando un radiatore o dal filtro, com''è l''acqua?","required":true},{"id":"chk_16_0_1","label":"Limpida","required":true},{"id":"chk_16_0_2","label":"Torbida","required":true},{"id":"chk_16_0_3","label":"Nera (Magnetite)","required":true},{"id":"chk_16_0_4","label":"Odore: Puzza di uovo marcio/gas? (Batteri/Gas in formazione).","required":true}]},{"title":"FASE 2: VERIFICA PROTEZIONI","steps":[{"id":"chk_16_1_0","label":"Dosatore Polifosfati: Presente? C''è polvere/liquido dentro?","required":true},{"id":"chk_16_1_1","label":"Defangatore Magnetico: Presente? È stato pulito nell''ultimo anno?","required":true},{"id":"chk_16_1_2","label":"Filtro Y: Pulito?","required":true}]},{"title":"FASE 3: DIAGNOSI RICORRENZA","steps":[{"id":"chk_16_2_0","label":"Storico: Questo cliente ha già cambiato lo scambiatore a piastre di recente?","required":true},{"id":"chk_16_2_1","label":"Verdetto: Se l''acqua è sporca, prescrivere lavaggio impianto ORA.","required":true}]},{"title":"AZIONE","steps":[{"id":"chk_16_3_0","label":"Lavaggio non necessario.","required":true},{"id":"chk_16_3_1","label":"Lavaggio prescritto.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '16',
  'quiz',
  'intermedio',
  'Calcare e Magnetite',
  '{"meta":{"video_id":"16","title":"Calcare e Magnetite","ukts":["PROC-011","COMP-009"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Qual è la differenza tra un guasto meccanico e un guasto ambientale?","options":["A. Il guasto meccanico costa meno.","B. Il guasto meccanico riguarda il pezzo che si rompe una volta. Il guasto ambientale (acqua sporca) continua a rompere i pezzi nuovi finché non tratti l''acqua.","C. Il guasto ambientale dipende dal meteo.","D. Non c''è differenza."],"correct":"B","explanation":"Se non risolvi l''ambiente (pulizia impianto), la sostituzione del ricambio è solo una tregua temporanea."},{"id":"Q2","type":"sintomo","text":"Apri la valvola di scarico o il filtro e l''acqua esce nera come inchiostro. Cosa significa?","options":["A. Che l''impianto è pieno di petrolio.","B. Presenza massiccia di Magnetite (Ossido di ferro). I termosifoni si stanno corrodendo dall''interno. Serve lavaggio e defangatore magnetico.","C. Che l''acqua è molto pulita.","D. È normale."],"correct":"B","explanation":"L''acqua nera è il segno inequivocabile della corrosione ferrosa. È veleno per le pompe moderne e gli scambiatori."},{"id":"Q3","type":"azione_corretta","text":"Devi sostituire un circolatore elettronico moderno su un impianto vecchio di 30 anni con acqua sporca. Cosa DEVI fare assolutamente prima?","options":["A. Pregare.","B. Lavare l''impianto (o installare un filtro magnetico serio). Altrimenti la pompa nuova attirerà tutto lo sporco magnetico e si bloccherà in pochi mesi.","C. Nulla, la pompa nuova è più forte.","D. Mettere acqua distillata."],"correct":"B","explanation":"Le pompe elettroniche a magneti permanenti funzionano come calamite per lo sporco ferroso. Senza protezione, hanno vita brevissima."},{"id":"Q4","type":"errore_tipico","text":"Perché cambiare lo scambiatore a piastre intasato dal calcare senza installare un dosatore di polifosfati è un errore?","options":["A. Perché costa troppo.","B. Perché non risolvi la causa. L''acqua dura continuerà a depositare calcare e tra 6-12 mesi il nuovo scambiatore sarà identico al vecchio.","C. Perché il dosatore è brutto.","D. Perché la legge lo vieta."],"correct":"B","explanation":"Durezza alta + Acqua calda = Calcare. È chimica. Se non trattieni il calcare a monte, si depositerà a valle."},{"id":"Q5","type":"mini_caso","text":"Scenario: Cliente si lamenta che alcuni termosifoni sono freddi in basso. Hai spurgato l''aria ma non cambia nulla. Diagnosi?","options":["A. Aria nel sistema.","B. Accumulo di fanghi pesanti sul fondo del radiatore che impediscono la circolazione. Serve lavaggio ad alta portata.","C. Caldaia troppo piccola.","D. Termosifoni montati al contrario."],"correct":"B","explanation":"Se fosse aria, sarebbero freddi in ALTO. Se sono freddi in BASSO, è fango che si deposita per gravità."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '16',
  'scheda',
  'intermedio',
  'Calcare e Magnetite',
  '{"meta":{"video_id":"16","title":"Calcare e Magnetite","level":"Intermedio","ukts":["PROC-011","COMP-009"]},"content":{"objective":"Prevenire i guasti ambientali trattando l''acqua.","technical_data":[{"pollutant":"Magnetite","origin":"Corrosione termosifoni (ferro) + Acqua non trattata","effect":"Rompe pompe elettroniche, intasa scambiatori"},{"pollutant":"Calcare","origin":"Durezza acqua di rete (>25°F)","effect":"Riduce scambio termico scambiatore sanitario"}],"diagnosis_steps":[{"step":1,"question":"Colore Acqua?","action":"Preleva un campione. Nera = Magnetite. Limpida = OK."},{"step":2,"question":"Frequenza Guasti?","action":"Se cambi lo stesso pezzo (es. scambiatore) ogni anno, il problema è l''acqua."},{"step":3,"question":"Protezioni Presenti?","action":"C''è il dosatore? C''è il defangatore? Sono carichi/puliti?"}],"pro_tips":["Il defangatore magnetico non è un optional su caldaie a condensazione, è un salvavita.","L''inibitore chimico va rabboccato periodicamente, non dura in eterno."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '17',
  'checklist',
  'intermedio',
  'Checklist Video 17',
  '{"meta":{"video_id":"17","type":"checklist","title":"Checklist Video 17","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: INTERVISTA STORICA","steps":[{"id":"chk_17_0_0","label":"Ricorrenza: \"Quante volte è già successo?\" (> 2 volte = Allarme).","required":true},{"id":"chk_17_0_1","label":"Esordio: \"Da quando succede?\" (Da sempre = Allarme).","required":true}]},{"title":"FASE 2: VERIFICA CONFIGURAZIONE","steps":[{"id":"chk_17_1_0","label":"Gas: Parametro Gas corretto (G20/G31)? (UKT-PROC-003)","required":true},{"id":"chk_17_1_1","label":"DSN: Codice configurazione (Codice Modello) corretto?","required":true},{"id":"chk_17_1_2","label":"Potenza: Potenza max riscaldamento (Max Potenza) regolata sull''appartamento (es. 12-15kW) o lasciata al massimo (24kW)?","required":true}]},{"title":"FASE 3: VERIFICA AMBIENTALE","steps":[{"id":"chk_17_2_0","label":"Scarico Fumi: Lunghezza/Curve rispettano il manuale? Pendenza verso caldaia (per condensa)?","required":true},{"id":"chk_17_2_1","label":"Locale: Caldaia protetta da gelo/pioggia (se esterna)?","required":true}]},{"title":"ESITO","steps":[{"id":"chk_17_3_0","label":"Guasto Occasionale: Procedo riparazione.","required":true},{"id":"chk_17_3_1","label":"Difetto Strutturale: Segnalo al cliente la necessità di correzione (scarico, potenza, trattamento).","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '17',
  'quiz',
  'intermedio',
  'Errori di Installazione',
  '{"meta":{"video_id":"17","title":"Errori di Installazione","ukts":["PROC-003","SIC-004"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Qual è la differenza fondamentale tra un Guasto e un Difetto Strutturale?","options":["A. Il guasto arriva all''improvviso e si risolve riparando. Il difetto c''è dall''inizio (installazione sbagliata) e torna sempre anche se ripari.","B. Il difetto è più economico.","C. Il guasto è colpa del cliente.","D. Nessuna."],"correct":"A","explanation":"Capire questa differenza ti salva dal ''loop'' delle riparazioni infinite e garanzie contestate."},{"id":"Q2","type":"sintomo","text":"Una caldaia da 28kW installata in un piccolo appartamento da 50mq si accende e spegne ogni 40 secondi (pendolamento). Cosa deduci?","options":["A. Che la caldaia è potente e quindi scalda meglio.","B. Che è sovradimensionata. Non riesce a modulare abbastanza in basso per il piccolo carico termico. Si usurerà precocemente.","C. Che manca gas.","D. Che il termostato è rotto."],"correct":"B","explanation":"L''oversizing (sovradimensionamento) è un errore classico. La caldaia lavora male (on-off) e consuma di più."},{"id":"Q3","type":"azione_corretta","text":"Se scopri che un guasto ricorrente è causato da una canna fumaria installata male (troppe curve), qual è l''unica azione professionale corretta?","options":["A. Cambiare l''elettrodo ogni 3 mesi e non dire nulla.","B. Segnalare il difetto strutturale al cliente, spiegare che le riparazioni sono inutili a lungo termine, e proporre la modifica della canna fumaria.","C. Dare la colpa alla marca della caldaia.","D. Staccare il sensore fumi."],"correct":"B","explanation":"Devi trasformarti da ''riparatore di pezzi'' a ''consulente tecnico''. Risolvere la causa, non il sintomo."},{"id":"Q4","type":"errore_tipico","text":"Quale errore di configurazione viene spesso commesso durante il cambio gas (Metano -> GPL)?","options":["A. Cambiare gli ugelli.","B. Dimenticare di cambiare il parametro elettronico del tipo gas sulla scheda. La caldaia tenterà di funzionare con la logica sbagliata.","C. Chiudere il gas.","D. Usare attrezzi in pollici."],"correct":"B","explanation":"Sulle caldaie moderne, l''elettronica deve ''sapere'' che gas sta bruciando per gestire la combustione. Solo l''ugello non basta."},{"id":"Q5","type":"mini_caso","text":"Scenario: Cliente ti chiama per la quarta volta in un anno per ''Blocco Mancanza Fiamma''. Hai già cambiato elettrodo e scheda. Cosa fai?","options":["A. Cambio la valvola gas.","B. Mi fermo. C''è un pattern. Controllo lo scarico fumi (ricircolo?), la massa a terra, e la stabilità della pressione gas di rete. È un problema ambientale/strutturale.","C. Scappo e cambio numero di telefono.","D. Dico che è sfortunato."],"correct":"B","explanation":"Al terzo/quarto intervento uguale, la probabilità che sia colpa dei ricambi è zero. È l''ambiente."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '17',
  'scheda',
  'intermedio',
  'Errori di Installazione',
  '{"meta":{"video_id":"17","title":"Errori di Installazione","level":"Intermedio","ukts":["PROC-003","SIC-004"]},"content":{"objective":"Identificare i difetti strutturali dell''impianto che causano guasti ricorrenti.","technical_data":[{"type":"Pendolamento (Cycling)","cause":"Caldaia sovradimensionata (>30kW su appartamento) o Minimo troppo alto","effect":"Usura precoce valvola gas e accenditore"},{"type":"Condensa Eccessiva","cause":"Installazione in esterno non protetto o scarico fumi errato","effect":"Corrosione elettronica"}],"diagnosis_steps":[{"step":1,"question":"Storia Clinica?","action":"Chiedi: ''È la prima volta o succede spesso?''. Se spesso = Strutturale."},{"step":2,"question":"Parametri Installazione?","action":"Verifica Codice Gas (G20/G31), DSN, Potenza massima (D00)."},{"step":3,"question":"Analisi Visiva Contesto?","action":"Guarda canna fumaria, prese d''aria, luogo installazione."}],"pro_tips":["Documenta sempre i difetti strutturali sul rapporto. ''Si consiglia modifica scarico fumi per evitare recidive''. Ti protegge legalmente.","Le caldaie moderne ''compensano'' gli errori finché non muoiono. La tolleranza maschera il difetto per i primi anni."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '18',
  'checklist',
  'intermedio',
  'Checklist Video 18',
  '{"meta":{"video_id":"18","type":"checklist","title":"Checklist Video 18","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: RACCOLTA INDIZI (Senza smontare)","steps":[{"id":"chk_18_0_0","label":"Ascolto: Rumori anomali (Relè che cliccano, ronzii)?","required":true},{"id":"chk_18_0_1","label":"Vista: Display (Errori), Perdite, Bruciature?","required":true},{"id":"chk_18_0_2","label":"Storia: \"È già successo?\" (Ricorrenza).","required":true}]},{"title":"FASE 2: LISTA DEGLI INNOCENTI (Assoluzione)","steps":[{"id":"chk_18_1_0","label":"Elettricità: C''è? (Assolvo rete).","required":true},{"id":"chk_18_1_1","label":"Fluidi: Acqua e Gas ci sono? (Assolvo forniture).","required":true},{"id":"chk_18_1_2","label":"Pre-Check: La caldaia fa il check iniziale? (Assolvo logica base).","required":true}]},{"title":"FASE 3: IL BLOCCO (Il Colpevole)","steps":[{"id":"chk_18_2_0","label":"Punto di stop: La sequenza si è fermata ESATTAMENTE a...","required":true},{"id":"chk_18_2_1","label":"Input mancante: Cosa serviva per procedere? (es. Consenso pressione aria).","required":true},{"id":"chk_18_2_2","label":"Verifica mirata: Testare SOLO il componente che doveva dare quel consenso.","required":true}]},{"title":"ESITO","steps":[{"id":"chk_18_3_0","label":"Guasto identificato logicamente.","required":true},{"id":"chk_18_3_1","label":"Componente isolato e testato.","required":true},{"id":"chk_18_3_2","label":"Nessun pezzo cambiato a caso.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '18',
  'quiz',
  'intermedio',
  'Metodo Esclusione',
  '{"meta":{"video_id":"18","title":"Metodo Esclusione","ukts":["SKILL-002"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"In cosa consiste il Metodo dell''Esclusione?","options":["A. Cambiare tutti i pezzi finché la caldaia non parte.","B. Non cercare direttamente il colpevole, ma eliminare sistematicamente (assolvere) i componenti che funzionano, riducendo le possibilità finché non resta solo la causa vera.","C. Escludere il cliente dalla stanza.","D. Spegnere la caldaia."],"correct":"B","explanation":"È come ''Indovina Chi?''. Abbassi le caselle degli innocenti. Chi resta in piedi è il colpevole."},{"id":"Q2","type":"sintomo","text":"La caldaia non parte. Il ventilatore gira. Cosa hai appena escluso (assolto)?","options":["A. La valvola gas.","B. La scheda (parte alimentazione/relè ventola), i fusibili, l''alimentazione elettrica e il motore del ventilatore stesso. Funzionano tutti.","C. Il pressostato fumi.","D. Nulla."],"correct":"B","explanation":"Se il ventilatore gira, tutta la catena a monte (corrente -> fusibile -> scheda -> relè) è sana. Non perdere tempo lì."},{"id":"Q3","type":"azione_corretta","text":"Hai il dubbio tra Scheda e Valvola Gas. La valvola riceve 230V ma non apre. Chi cambi?","options":["A. La scheda.","B. La valvola gas. La scheda è innocente perché ha fatto il suo dovere (mandare 230V). È la valvola che non ha eseguito l''ordine.","C. Entrambe per sicurezza.","D. Chiamo l''assistenza."],"correct":"B","explanation":"Input OK + Output KO = Componente guasto. Input KO = Componente innocente (problema a monte)."},{"id":"Q4","type":"errore_tipico","text":"Qual è il rischio maggiore della ''Diagnosi a Memoria'' (Bias di conferma)?","options":["A. Si fa troppo in fretta.","B. Ignori gli indizi reali che contraddicono la tua ipotesi. Smetti di guardare la realtà e vedi solo quello che vuoi vedere (es. ''È senz''altro la scheda'').","C. Ti dimentichi il cacciavite.","D. Nessuno, la memoria è infallibile."],"correct":"B","explanation":"Anche se 99 volte su 100 è la scheda, la centesima volta sarà il cavo. Se agisci a memoria, sbaglierai."},{"id":"Q5","type":"mini_caso","text":"Scenario: Intervento risolto ripristinando un faston ossidato. Nessun pezzo cambiato. Il cliente chiede: ''Ma non hai cambiato nulla?''. Cosa rispondi?","options":["A. ''No, è gratis''.","B. Spieghi che hai diagnosticato un guasto elettrico invisibile e lo hai riparato professionalmente, risparmiandogli la sostituzione inutile di una scheda costosa.","C. ''Mi dispiace''.","D. Gli vendi un pezzo a caso."],"correct":"B","explanation":"Il valore è nella competenza diagnostica, non nel pezzo di ricambio. Va comunicato con orgoglio."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '18',
  'scheda',
  'intermedio',
  'Metodo Esclusione',
  '{"meta":{"video_id":"18","title":"Metodo Esclusione","level":"Intermedio","ukts":["SKILL-002"]},"content":{"objective":"Applicare la logica deduttiva per diagnosticare senza sostituire componenti a caso.","technical_data":[{"concept":"Certezza Negativa","definition":"È più facile provare che un componente funziona (assolvendolo) che provare che è guasto senza cambiarlo."},{"concept":"Sequenza di Avvio","definition":"La mappa per l''esclusione. Se si ferma al punto 3, il problema è tra 2 e 3."}],"diagnosis_steps":[{"step":1,"question":"Cosa Funziona?","action":"Elenca tutto ciò che sta andando bene (es. Display acceso, Pompa gira). Assolvi questi componenti."},{"step":2,"question":"Dove si Ferma?","action":"Identifica il punto esatto della sequenza in cui il processo si interrompe."},{"step":3,"question":"Chi manca?","action":"Quale input manca per passare allo step successivo? Concentrati solo su quello."}],"pro_tips":["Cambiare pezzi per provare (Swaptronics) è da dilettanti. Il professionista misura e deduce.","Documenta sempre la diagnosi logica sul rapporto, specialmente se non hai cambiato pezzi fisici."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '19',
  'checklist',
  'avanzato',
  'Checklist Video 19',
  '{"meta":{"video_id":"19","type":"checklist","title":"Checklist Video 19","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: PREPARAZIONE (Safety First)","steps":[{"id":"chk_19_0_0","label":"Riscaldamento: Caldaia accesa da > 5 minuti?","required":true},{"id":"chk_19_0_1","label":"Sifone: Sifone condensa pieno e libero? (Se è vuoto, escono fumi!).","required":true},{"id":"chk_19_0_2","label":"Setup: Analizzatore azzerato in aria pulita?","required":true}]},{"title":"FASE 2: ANALISI SOTTO STRESS (Min/Max)","steps":[{"id":"chk_19_1_0","label":"Test MINIMO (Potenza Minima):","required":true},{"id":"chk_19_1_1","label":"CO2 target (es. 9.0%)?","required":true},{"id":"chk_19_1_2","label":"Fiamma stabile (non stacca)?","required":true},{"id":"chk_19_1_3","label":"Test MASSIMO (Potenza Massima):","required":true},{"id":"chk_19_1_4","label":"CO2 target?","required":true},{"id":"chk_19_1_5","label":"CO stabile (< 100ppm)? (Se schizza a 1000 = Manca Aria).","required":true},{"id":"chk_19_1_6","label":"Test TRANSIZIONE: Rumori/Vibrazioni nel passaggio Min-Max?","required":true}]},{"title":"FASE 3: VERDETTO","steps":[{"id":"chk_19_2_0","label":"Combustione OK: Valori stabili in tutto il range.","required":true},{"id":"chk_19_2_1","label":"Necessaria Regolazione: Solo se fuori target (>0.5% diff).","required":true},{"id":"chk_19_2_2","label":"Necessaria Pulizia: Se CO alto nonostante regolazione.","required":true}]},{"title":"REGISTRAZIONE","steps":[{"id":"chk_19_3_0","label":"Rapporto compilato e firmato.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '19',
  'quiz',
  'avanzato',
  'Combustione Dinamica',
  '{"meta":{"video_id":"19","title":"Combustione Dinamica","ukts":["DIAG-007","PROC-002"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Perché la combustione è definita ''Dinamica''?","options":["A. Perché le fiamme si muovono.","B. Perché la caldaia risponde continuamente a richieste variabili (modulazione). Una regolazione perfetta al 50% potrebbe essere disastrosa al minimo o al massimo. Bisogna verificare tutto il range.","C. Perché cambia con la stagione.","D. È un termine di marketing."],"correct":"B","explanation":"La caldaia è un sistema vivo che ''respira'' diversamente a seconda dello sforzo. L''analisi statica è cieca ai problemi di transizione."},{"id":"Q2","type":"sintomo","text":"Analisi a potenza intermedia perfetta. Ma il cliente lamenta odore di gas e blocchi occasionali. Metti la caldaia al Minimo Assoluto e vedi la CO salire a 300ppm. Diagnosi?","options":["A. La valvola gas è starata al minimo (troppo gas) oppure c''è ricircolo fumi.","B. È colpa del vento.","C. La scheda elettronica è guasta.","D. Il cliente ha un olfatto troppo sensibile."],"correct":"A","explanation":"I difetti di carburazione emergono spesso agli estremi (Minimo o Massimo). Al 50% la caldaia riesce spesso a compensare."},{"id":"Q3","type":"azione_corretta","text":"Stai facendo l''analisi. Al massimo regime (P01), la CO2 è bassa (8.5%) e il CO sta salendo. Cosa controlli PRIMA di toccare la valvola gas?","options":["A. La pressione dell''acqua.","B. La pulizia del ventilatore, del bruciatore e dello scambiatore. Se manca aria (componenti sporchi), arricchire la miscela toccando la valvola gas è l''errore fatale.","C. Cambio la valvola gas.","D. Pulisco i vetri."],"correct":"B","explanation":"Regolare la valvola su una macchina sporca è come ingrassare la carburazione a un atleta con la polmonite. Prima curi i polmoni (pulizia), poi regoli."},{"id":"Q4","type":"errore_tipico","text":"Qual è l''errore del ''Tecnico Musicista''?","options":["A. Cantare mentre lavora.","B. Regolare la valvola gas ''a orecchio'' o ''a occhio'' senza analizzatore. Nelle caldaie a condensazione a premiscelazione totale, la fiamma è invisibile e l''orecchio non basta. Serve l''analisi strumentale.","C. Usare il diapason.","D. Ascoltare la pompa."],"correct":"B","explanation":"Le caldaie a condensazione sono spietate. Se regoli a occhio, rischi di creare CO letale o di distruggere lo scambiatore."},{"id":"Q5","type":"mini_caso","text":"Scenario: Caldaia che ''botta'' (esplosione ritardata) all''accensione. Analisi ai regimi: Perfetta. Cosa controlli?","options":["A. La distanza dell''elettrodo di accensione e la fase di ''Rampa'' (Start). La miscela potrebbe essere errata solo nei primi 3 secondi di accensione.","B. La pompa di circolazione.","C. La temperatura esterna.","D. Aggiungo ritardo accensione."],"correct":"A","explanation":"L''analisi a regime non vede la fase di start. Se ''botta'', l''innesco è ritardato o la miscela iniziale è errata."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '19',
  'scheda',
  'avanzato',
  'Combustione Dinamica',
  '{"meta":{"video_id":"19","title":"Combustione Dinamica","level":"Avanzato","ukts":["DIAG-007","PROC-002"]},"content":{"objective":"Eseguire un''analisi che sveli i problemi nascosti, non solo per ''pulire la coscienza'' burocratica.","technical_data":[{"parameter":"Lambda (Eccesso Aria)","safe_range":"1.20 - 1.30","danger_zone":"< 1.10 (Rischio CO mortale) o > 1.60 (Distacco fiamma)"},{"parameter":"Ppm CO (Monossido)","limit":"100 ppm","action_limit":"Sopra 100 ppm STOP immediato e pulizia"}],"diagnosis_steps":[{"step":1,"question":"Minimo OK?","action":"Forza caldaia al minimo (P02). Verifica stabilità fiamma e valore CO2."},{"step":2,"question":"Massimo OK?","action":"Forza caldaia al massimo (P01). Verifica che il ventilatore spinga abbastanza aria (CO non deve salire)."},{"step":3,"question":"Modulazione Fluida?","action":"Osserva il passaggio Min->Max. Non ci devono essere scoppiettii o picchi di CO."}],"pro_tips":["Non regolare mai una caldaia se prima non hai pulito ventilatore e sifone condensa.","L''odore conta: il naso umano sente il gas incombusto prima dell''analizzatore."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '20',
  'checklist',
  'avanzato',
  'Checklist Video 20',
  '{"meta":{"video_id":"20","type":"checklist","title":"Checklist Video 20","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: RACCOLTA PROVE (CSI)","steps":[{"id":"chk_20_0_0","label":"Storico: Ultimo Errore (Menu Storico) letto e annotato?","required":true},{"id":"chk_20_0_1","label":"Frequenza: \"Quante volte settimana?\" \"Sempre alla stessa ora?\"","required":true},{"id":"chk_20_0_2","label":"Contesto: \"Pioveva?\" \"C''erano altri elettrodomestici accesi?\"","required":true}]},{"title":"FASE 2: ISPEZIONE FISICA (Cerca anomalie latenti)","steps":[{"id":"chk_20_1_0","label":"Cablaggi: Tira leggermente i fili. C''è qualcosa di lento?","required":true},{"id":"chk_20_1_1","label":"Umidità: Tracce di condensa su scheda o ventilatore?","required":true},{"id":"chk_20_1_2","label":"Scarico: Il terminale è libero?","required":true}]},{"title":"FASE 3: STRESS TEST (Provocazione)","steps":[{"id":"chk_20_2_0","label":"Minimo: Fai andare al minimo per 10 minuti (stabilità).","required":true},{"id":"chk_20_2_1","label":"Massimo: Fai andare al massimo per 10 minuti (surriscaldamento).","required":true},{"id":"chk_20_2_2","label":"On/Off: Accendi/Spegni 10 volte di fila (fase start).","required":true}]},{"title":"RECUPERO DATI","steps":[{"id":"chk_20_3_0","label":"Diario: Istruito cliente su come annotare il prossimo blocco.","required":true},{"id":"chk_20_3_1","label":"Decisione: Monitoraggio (se raro) O Intervento mirato (se pericoloso).","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '20',
  'quiz',
  'avanzato',
  'Guasti Intermittenti',
  '{"meta":{"video_id":"20","title":"Guasti Intermittenti","ukts":["DIAG-002","SIC-004"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Un guasto intermittente è un guasto ''casuale''?","options":["A. Sì, capita a caso.","B. No, è un guasto CONDIZIONATO. Si verifica solo quando certe condizioni (Trigger) sono presenti. Il tuo lavoro è scoprire quali sono.","C. Dipende dalla sfortuna del cliente.","D. È un guasto immaginario."],"correct":"B","explanation":"Se fosse casuale sarebbe impossibile da diagnosticare. Siccome è condizionato, se trovi la condizione trovi la causa."},{"id":"Q2","type":"sintomo","text":"Il cliente dice: ''La caldaia va in blocco, ma solo nelle notti molto ventose''. Cosa sospetti?","options":["A. La valvola gas.","B. Il sistema di scarico fumi. Il vento crea una contropressione che fa scattare il pressostato o instabilià di fiamma. È un problema ambientale/installativo.","C. La scheda teme il buio.","D. Bassa pressione acqua."],"correct":"B","explanation":"Correlazione diretta Vento -> Blocco. Indiziato numero 1: Canna fumaria."},{"id":"Q3","type":"azione_corretta","text":"Arrivi su un guasto intermittente ma la caldaia ora funziona. Cosa fai?","options":["A. Cambio la scheda per sicurezza.","B. Leggo lo storico errori (D64), interrogo il cliente sui dettagli dell''accaduto e faccio uno stress test per provare a riprodurlo.","C. Resetto tutto e vado via.","D. Prego."],"correct":"B","explanation":"L''analisi post-mortem (storico) e l''intervista sono le uniche armi quando il ''corpo del reato'' non c''è."},{"id":"Q4","type":"errore_tipico","text":"Qual è l''errore peggiore con un guasto intermittente?","options":["A. Arrivare in ritardo.","B. Resettare la memoria errori APPENA arrivi. Hai appena cancellato le uniche prove oggettive che la caldaia aveva registrato per te.","C. Non avere il tester.","D. Bere il caffè del cliente."],"correct":"B","explanation":"Il D64 è la scatola nera. Se la cancelli, voli alla cieca."},{"id":"Q5","type":"mini_caso","text":"Scenario: F28 (Mancata accensione) intermittente. Lo storico dice che succede ogni mattina alle 06:00. Ipotesi?","options":["A. La scheda ha sonno.","B. Condensa/Umidità accumulata nella notte sull''elettrodo o nel sifone, oppure pressione gas di rete bassa al mattino (picco richieste).","C. È il gatto."],"correct":"B","explanation":"Il pattern orario fisso suggerisce una causa ambientale ciclica (T, Umidità) o di rete (Pressione gas)."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '20',
  'scheda',
  'avanzato',
  'Guasti Intermittenti',
  '{"meta":{"video_id":"20","title":"Guasti Intermittenti","level":"Avanzato","ukts":["DIAG-002","SIC-004"]},"content":{"objective":"Trasformare un guasto ''casuale'' in un guasto ''riproducibile'' identificando il trigger.","technical_data":[{"tool":"Storico Errori (D64)","use":"Mappa temporale del guasto. Ci sono pattern orari?"},{"strategy":"Stress Test","description":"Portare la caldaia ai limiti (Max T, Max Pressione, Minima portata) per forzare il difetto."}],"diagnosis_steps":[{"step":1,"question":"Cosa dice lo storico?","action":"Leggi D64-D73. Se vuoto, chiedi al cliente se resetta lui."},{"step":2,"question":"Qual è il Trigger?","action":"Meteo? Orario? Utilizzo specifico? Cerca la correlazione."},{"step":3,"question":"Posso riprodurlo?","action":"Prova a ricreare le condizioni del Trigger. Se ci riesci, hai vinto."}],"pro_tips":["Mai cambiare pezzi ''per provare'' su un intermittenza. Aggiungi variabili incognite a un sistema già caotico.","L''assenza del guasto durante la tua visita È un''informazione: le condizioni attuali sono sicure."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '21',
  'checklist',
  'avanzato',
  'Checklist Video 21',
  '{"meta":{"video_id":"21","type":"checklist","title":"Checklist Video 21","last_updated":"2026-01-19"},"content":{"phases":[{"title":"LE 5 DOMANDE FONDAMENTALI","steps":[{"id":"chk_21_0_0","label":"1. QUANDO? (C''è un paattern orario/meteo?)","required":true},{"id":"chk_21_0_1","label":"2. COSA STAVI FACENDO? (Doccia, Piatti, Nulla?)","required":true},{"id":"chk_21_0_2","label":"3. COSA È SUCCESSO PRIMA/DOPO? (Rumori, Odori, Luci che saltano?)","required":true},{"id":"chk_21_0_3","label":"4. COME SI MANIFESTA? (Descrivi il sintomo con parole tue)","required":true},{"id":"chk_21_0_4","label":"5. QUALCOS''ALTRO? (Eventi recenti, lavori, vacanze?)","required":true}]},{"title":"FILTRO INFORMAZIONI","steps":[{"id":"chk_21_1_0","label":"Scartare: Opinioni tecniche del cliente (\"È la scheda\").","required":true},{"id":"chk_21_1_1","label":"Tenere: Fatti osservati (\"Ho visto una scintilla\").","required":true},{"id":"chk_21_1_2","label":"Tradurre: \"Acqua fredda\" -> Verifica T mandata/uscita.","required":true}]},{"title":"ESITO INTERVISTA","steps":[{"id":"chk_21_2_0","label":"Idea chiara: Ho una pista da seguire.","required":true},{"id":"chk_21_2_1","label":"Idea vaga: Procedo con test standard ma con attenzione ai dettagli citati.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '21',
  'quiz',
  'avanzato',
  'Intervista Cliente',
  '{"meta":{"video_id":"21","title":"Intervista Cliente","ukts":["SKILL-003"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Perché il cliente è definito un ''sensore imperfetto''?","options":["A. Perché non capisce nulla.","B. Perché ha registrato l''evento (era presente) ma lo descrive con linguaggio impreciso. Il tuo compito è decodificare i dati utili.","C. Perché mente sempre.","D. Perché non è collegato in Wi-Fi."],"correct":"B","explanation":"L''informazione c''è (lui ha visto il guasto), ma è criptata nel linguaggio quotidiano. Devi decrittarla."},{"id":"Q2","type":"sintomo","text":"Il cliente dice: ''L''acqua viene fredda''. Qual è la traduzione tecnica che devi verificare?","options":["A. La caldaia è spenta.","B. Verifica la definizione di ''fredda'' (è a temperatura di rete o è tiepida 30°C?) e il contesto (doccia, lavandino?). Potrebbe essere un problema di miscelazione e non di caldaia.","C. Il cliente ha le mani fredde.","D. Manca il gas."],"correct":"B","explanation":"Spesso ''fredda'' per il cliente significa ''non abbastanza calda per la doccia'' (es. 35°C), che tecnicamente è molto diverso da ''spenta''."},{"id":"Q3","type":"azione_corretta","text":"Qual è la domanda ''Jolly'' che sblocca spesso le situazioni misteriose?","options":["A. ''Ha pagato la bolletta?''","B. ''C''è qualcos''altro che è successo di recente in casa o nel palazzo? (Lavori, temporali, vacanze)''.","C. ''Posso usare il bagno?''","D. ''Chi ha installato questa roba?''"],"correct":"B","explanation":"Spesso il cliente dimentica di dirti che ''hanno appena riparato un tubo in strada''. Quella è la causa (sporco/aria), ma lui non la collega."},{"id":"Q4","type":"errore_tipico","text":"Il cliente afferma con certezza: ''È la pompa, me l''ha detto mio cugino''. Cosa fai?","options":["A. Cambio la pompa.","B. Ignoro l''opinione tecnica (non è un fatto osservato) e chiedo: ''Capisco, ma lei cosa ha VISTO o SENTITO esattamente per pensare che sia la pompa?''. Torno ai fatti.","C. Insulto il cugino.","D. Vado via."],"correct":"B","explanation":"Mai accettare la diagnosi del paziente. Accetta solo la descrizione dei sintomi."},{"id":"Q5","type":"mini_caso","text":"Scenario: Guasto intermittente ''strano''. Alla domanda ''Cosa stavi facendo?'', il cliente risponde: ''Nulla, eravamo a letto, erano le 3 di notte''. Cosa deduci?","options":["A. La caldaia soffre di insonnia.","B. Escludi l''uso di Acqua Sanitaria. Il problema è legato al Riscaldamento (o antigelo) e a fattori ambientali notturni (minime temperature/tensione rete).","C. Il cliente mente.","D. È un poltergeist."],"correct":"B","explanation":"L''orario e l''attività (dormire) eliminano il 50% delle cause possibili (uso sanitario, stress da picco)."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '21',
  'scheda',
  'avanzato',
  'Intervista Cliente',
  '{"meta":{"video_id":"21","title":"Intervista Cliente","level":"Avanzato","ukts":["SKILL-003"]},"content":{"objective":"Usare l''intervista strutturata per ridurre del 50% il tempo di ricerca guasto.","technical_data":[{"concept":"Sensore Imperfetto","description":"Il cliente è un sensore che ha registrato l''evento (guasto) ma con bassa risoluzione. Va decodificato."}],"diagnosis_steps":[{"step":1,"question":"QUANDO?","action":"Stabilisci se il guasto è legato al tempo (mattina/notte) o all''uso."},{"step":2,"question":"COSA FACEVI?","action":"Stabilisci il contesto operativo (ACS vs Risc)."},{"step":3,"question":"ALTRO?","action":"Cerca le variabili nascoste (lavori, eventi esterni)."}],"pro_tips":["Non chiedere mai ''Fa rumore?''. Chiedi ''Che rumore fa?''. Evita le domande Sì/No che suggeriscono la risposta.","Se il cliente è aggressivo o ansioso, l''intervista tecnica lo calma perché vede professionalità."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '22',
  'checklist',
  'avanzato',
  'Checklist Video 22',
  '{"meta":{"video_id":"22","type":"checklist","title":"Checklist Video 22","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: CHECK SENSORIALE (Mano vs Display)","steps":[{"id":"chk_22_0_0","label":"Mandata: T. Mandata (Display) dice X°C. Toccando il tubo, sembra vero?","required":true},{"id":"chk_22_0_1","label":"Ritorno: T. Ritorno (Display) dice Y°C. Toccando il tubo, sembra vero?","required":true},{"id":"chk_22_0_2","label":"Delta T: La differenza Mandata-Ritorno è coerente con quello che senti? (Es. Tubi entrambi caldi ma DT display = 20°C -> Sonda starata).","required":true}]},{"title":"FASE 2: ANALISI DINAMICA (Il Film)","steps":[{"id":"chk_22_1_0","label":"Salita T: Accendi riscaldamento. La T sale gradualmente (OK) o schizza su in 5 secondi (KO - No circolazione)?","required":true},{"id":"chk_22_1_1","label":"Stato S: Codice Stato corrisponde all''azione? (Riscaldamento Attivo = Bruciatore deve rombare).","required":true}]},{"title":"FASE 3: DIAGNOSTICA PROFONDA","steps":[{"id":"chk_22_2_0","label":"Offset Gas: Valore letto \\_\\_\\_. È vicino al limite Tolleranza? (Se sì -> Pulizia/Verifica Gas).","required":true}]},{"title":"ESITO","steps":[{"id":"chk_22_3_0","label":"Coerente: L''elettronica dice il vero.","required":true},{"id":"chk_22_3_1","label":"Incoerente: Sensore guasto O problema idraulico che inganna il sensore.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '22',
  'quiz',
  'avanzato',
  'Parametri vs Realtà',
  '{"meta":{"video_id":"22","title":"Parametri vs Realtà","ukts":["DIAG-003","TECH-009"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Cosa significa ''Normalità Apparente''?","options":["A. Che la caldaia è bella.","B. Che tutti i valori (parametri) sono tecnicamente nel range, non ci sono errori sul display, ma la caldaia non sta scaldando come dovrebbe (prestazione scadente).","C. Che il cliente si immagina i problemi.","D. Che è tutto a posto."],"correct":"B","explanation":"I parametri sono ''cecchi'' rispetto a certi problemi idraulici o di contesto. Se il sensore legge 60°C ma l''acqua non gira, per la scheda è tutto normale."},{"id":"Q2","type":"sintomo","text":"Parametro T. Mandata sale da 30°C a 80°C in 5 secondi. La pompa è alimentata (Attiva). Diagnosi?","options":["A. La caldaia è potentissima.","B. Manca circolazione (Aria, Pompa bloccata, Filtro intasato). L''acqua ferma nello scambiatore bolle subito. Il sensore legge il picco e la scheda spegne (o modula). I radiatori restano freddi.","C. È finito il gas.","D. La sonda esterna è rotta."],"correct":"B","explanation":"Una salita così rapida è fisicamente impossibile con portata d''acqua corretta. È il sintomo classico di ''poca acqua''."},{"id":"Q3","type":"azione_corretta","text":"Il display non dà errori. Il cliente dice che i radiatori sono tiepidi. Mandata=70°C, Ritorno=65°C. Tocchi i tubi sotto caldaia: Mandata Bollente, Ritorno Freddo. Cosa concludi?","options":["A. La sonda Ritorno è starata o non fa contatto bene col tubo. Legge una temperatura fantasma (magari per conduzione dal metallo vicino) falsando la modulazione.","B. Hai le mani fredde.","C. È colpa delle valvole termostatiche.","D. Bisogna alzare la curva climatica."],"correct":"A","explanation":"Se il tubo è freddo e il sensore dice caldo, il sensore mente. La scheda vede Delta T basso (70-65=5) e modula al minimo inutilmente."},{"id":"Q4","type":"errore_tipico","text":"Cosa indica un valore di Offset Gas molto vicino al limite massimo?","options":["A. Che la caldaia sta lavorando benissimo.","B. Che il sistema ADA (auto-adattamento) sta compensando al massimo delle sue capacità una deriva (valvola sporca, gas scarso, elettronica usurata). È un pre-allarme di guasto imminente.","C. Che bisogna cambiare il display.","D. Nulla."],"correct":"B","explanation":"La scheda lavora ''sotto sforzo''. Tecnicamente funziona, ma al primo imprevisto andrà in blocco definitivo (Mancata Accensione)."},{"id":"Q5","type":"mini_caso","text":"Scenario: Caldaia in ''pendolamento'' (On-Off continui). Parametri OK. Nessun errore. Tocchi la mandata: rovente. Tocchi il ritorno: rovente. I radiatori: freddi. Cosa succede?","options":["A. Magia nera.","B. Cortocircuito idraulico: Bypass aperto o Valvola 3 vie che trafila o Impianto chiuso. L''acqua gira solo dentro la caldaia.","C. Scambiatore bucato.","D. Termostato ambiente rotto."],"correct":"B","explanation":"Se Mandata e Ritorno sono caldi ma l''impianto è freddo, l''acqua non sta uscendo dalla caldaia. Sta girando su se stessa (bypass)."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '22',
  'scheda',
  'avanzato',
  'Parametri vs Realtà',
  '{"meta":{"video_id":"22","title":"Parametri vs Realtà","level":"Avanzato","ukts":["DIAG-001","DIAG-003","TECH-009"]},"content":{"objective":"Identificare i guasti dove l''elettronica non dà errore (Falsi Negativi) perché i parametri rientrano nella tolleranza.","technical_data":[{"parameter":"D52 (Offset ADA)","meaning":"Compensazione elettronica della deriva.","warning":"Valori alti indicano che il sistema è al limite fisico."},{"phenomenon":"Cortocircuito Idraulico","symptoms":"Mandata calda, Ritorno caldo, Radiatori freddi.","parameter_trap":"La caldaia vede T corretta e spegne il bruciatore (ciclaggio)."}],"diagnosis_steps":[{"step":1,"question":"Confronto Sensoriale?","action":"Confronta D40/D41 (Display) con T reale tubi (Mano/Termometro contatto)."},{"step":2,"question":"Velocità Reazione?","action":"Cronometra quanto ci mette a salire la T. Se troppo veloce (<10s) = Poca acqua."},{"step":3,"question":"Controllo Offset?","action":"Verifica D52. Se vicino al limite, prevedi manutenzione profonda."}],"pro_tips":["Se il display dice che sta pompando (S00->S02) ma non senti vibrazione, il rotore è bloccato o il condensatore è andato.","Non fidarti mai di un sensore NTC vecchio di 10 anni. Hanno deriva resistiva."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '23',
  'checklist',
  'avanzato',
  'Checklist Video 23',
  '{"meta":{"video_id":"23","type":"checklist","title":"Checklist Video 23","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: ESCLUSIONE VASO (Il Colpevole N.1)","steps":[{"id":"chk_23_0_0","label":"Oscillazione: Accendi riscaldamento al massimo. La pressione sale molto (>0.5 bar)?","required":true},{"id":"chk_23_0_1","label":"Test Valvolina: Premi spillo vaso. Esce aria (OK) o Acqua (KO)?","required":true},{"id":"chk_23_0_2","label":"Precarica (Se serve): Misurata a caldaia scarica (0 bar)? Target 1.0 bar.","required":true}]},{"title":"FASE 2: VERIFICA SCARICHI","steps":[{"id":"chk_23_1_0","label":"Valvola 3 bar: Asciutta o umida?","required":true},{"id":"chk_23_1_1","label":"Sifone Condensa: Riempimento anomalo? (Raro, scambiatore primario bucato).","required":true}]},{"title":"FASE 3: ISOLAMENTO (Se FASE 1 e 2 OK)","steps":[{"id":"chk_23_2_0","label":"Sezionamento: Chiuse mandate/ritorno. Attesa test (1h o notturno).","required":true},{"id":"chk_23_2_1","label":"Esito:","required":true},{"id":"chk_23_2_2","label":"Pressione Caldaia scesa -> Perdita interna (Scambiatore/Raccordi).","required":true},{"id":"chk_23_2_3","label":"Pressione Caldaia stagna -> Perdita impianto (Muro/Collettori).","required":true}]},{"title":"AZIONE","steps":[{"id":"chk_23_3_0","label":"Sostituzione vaso / Gonfiaggio.","required":true},{"id":"chk_23_3_1","label":"Ricerca perdita impianto (strumentale/visiva).","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '23',
  'quiz',
  'avanzato',
  'Perdite Invisibili',
  '{"meta":{"video_id":"23","title":"Perdite Invisibili","ukts":["DIAG-F22","COMP-014"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Se la pressione sale a 3 bar con i radiatori caldi e scende a 0 bar quando si raffreddano, cosa sta succedendo?","options":["A. Hai una perdita enorme.","B. Il vaso di espansione è scarico o rotto. Manca il ''polmone'' che assorbe la dilatazione dell''acqua. La perdita è solo una conseguenza dello scarico della valvola di sicurezza.","C. L''acqua evapora.","D. Il vicino ruba l''acqua."],"correct":"B","explanation":"È il comportamento classico del vaso KO. L''oscillazione termica della pressione è la firma inconfondibile."},{"id":"Q2","type":"sintomo","text":"Premi lo spillo della valvola del vaso di espansione ed esce acqua. Diagnosi?","options":["A. Tutto ok, il vaso è pieno.","B. Membrana rotta. Il vaso è da sostituire immediatamente. L''acqua ha invaso la camera d''aria.","C. Bisogna gonfiare con azoto.","D. È condensa."],"correct":"B","explanation":"Dal lato aria deve uscire solo aria. Se esce acqua, la barriera di gomma è fallita."},{"id":"Q3","type":"azione_corretta","text":"Come si misura CORRETTAMENTE la precarica del vaso di espansione?","options":["A. Durante il funzionamento.","B. A caldaia spenta e pressione dell''impianto SCARICATA a ZERO. Se c''è acqua in pressione nel circuito, falserà la lettura del vaso.","C. Gonfiando a caso.","D. Col manometro della caldaia."],"correct":"B","explanation":"È come misurare la pressione delle gomme. Non puoi farlo se c''è un martinetto che preme sulla gomma (pressione acqua)."},{"id":"Q4","type":"errore_tipico","text":"Perché rabboccare continuamente un impianto che perde è dannoso?","options":["A. Perché costa fatica.","B. Perché l''acqua nuova porta ossigeno -> corrosione -> magnetite -> scambiatori bucati. Stai avvelenando l''impianto.","C. Perché l''acqua costa.","D. Non è dannoso."],"correct":"B","explanation":"Il rabbocco cronico è la prima causa di morte degli scambiatori. Risolvere la perdita è imperativo."},{"id":"Q5","type":"mini_caso","text":"Scenario: Pressione cala di 0.5 bar al giorno. Vaso OK. Valvola OK. Nessuna macchia sui muri. Chiudi i rubinetti di mandata/ritorno la sera. La mattina la caldaia è ancora in pressione. Dove è la perdita?","options":["A. Nella caldaia.","B. Nell''impianto (tubi sotto pavimento, collettori). Avendo isolato la caldaia e vedendo che tiene, hai scagionato la macchina.","C. Nello scambiatore.","D. È evaporata."],"correct":"B","explanation":"Il test di sezionamento è infallibile. Se la caldaia isolata tiene, il colpevole è fuori."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '23',
  'scheda',
  'avanzato',
  'Perdite Invisibili',
  '{"meta":{"video_id":"23","title":"Perdite Invisibili","level":"Avanzato","ukts":["DIAG-F22","COMP-014"]},"content":{"objective":"Diagnosticare le perdite d''acqua non visibili ad occhio nudo seguendo la logica idraulica.","technical_data":[{"component":"Vaso Espansione","role":"Compensazione volume.","failure_mode":"Membrana bucata = Vaso pieno d''acqua = Pressione incontrollabile."},{"component":"Valvola 3 Bar","mode":"Scarico sovrappressione.","warning":"Spesso gocciola solo quando la caldaia è al massimo (80°C), quindi non vedi l''acqua a terra a freddo."}],"diagnosis_steps":[{"step":1,"question":"Il manometro ''balla''?","action":"Se la pressione oscilla > 1 bar durante il riscaldamento, il vaso è KO. Non cercare perdite."},{"step":2,"question":"Sezioni OK?","action":"Isola la caldaia dall''impianto (chiudi valvole) per una notte. Chi perde pressione è il colpevole."},{"step":3,"question":"Valvola Sicurezza?","action":"Tocca lo scarico o metti un foglio di carta sotto. Deve essere secco come il deserto."}],"pro_tips":["Ricaricare il vaso d''espansione senza svuotare l''impianto a zero è inutile (comprimi l''acqua). Devi portare la pressione caldaia a zero prima di gonfiare."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '24',
  'checklist',
  'avanzato',
  'Checklist Video 24',
  '{"meta":{"video_id":"24","type":"checklist","title":"Checklist Video 24","last_updated":"2026-01-19"},"content":{"phases":[{"title":"FASE 1: RACCOLTA INDIZI (C.S.I.)","steps":[{"id":"chk_24_0_0","label":"Intervista: Modifiche recenti alla casa o all''impianto?","required":true},{"id":"chk_24_0_1","label":"Storico: Il problema c''era anche l''anno scorso? O è nuovo?","required":true},{"id":"chk_24_0_2","label":"Pattern: Succede solo quando fa molto freddo? O sempre?","required":true}]},{"title":"FASE 2: ANALISI IDRAULICA","steps":[{"id":"chk_24_1_0","label":"Filtro Ritorno: Smontare e ispezionare. Pulito o pieno di magnetite?","required":true},{"id":"chk_24_1_1","label":"Test Tattile: Mandata vs Ritorno sotto caldaia (Delta T).","required":true},{"id":"chk_24_1_2","label":"Valvole: Controllare che detentori e testine non siano tutti chiusi/strozzati.","required":true}]},{"title":"FASE 3: VERIFICA POTENZA","steps":[{"id":"chk_24_2_0","label":"Parametri: La potenza massima riscaldamento (es. Max Potenza) è regolata correttamente per i mq della casa?","required":true},{"id":"chk_24_2_1","label":"Salita Temperatura: La temperatura sale troppo in fretta (>1°C al secondo)? -> Poca circolazione.","required":true}]},{"title":"AZIONE CORRETTIVA","steps":[{"id":"chk_24_3_0","label":"Lavaggio Impianto / Installazione Defangatore.","required":true},{"id":"chk_24_3_1","label":"Bilanciamento Radiatori (Regolazione detentori).","required":true},{"id":"chk_24_3_2","label":"Taratura Potenza Caldaia.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '24',
  'quiz',
  'avanzato',
  'Guasti Sistemici',
  '{"meta":{"video_id":"24","title":"Guasti Sistemici","ukts":["PROC-011","COMP-002"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Cos''è un ''Guasto Sistemico''?","options":["A. Quando si rompe la scheda madre.","B. Uno squilibrio tra le parti del sistema (Caldaia, Impianto, Utilizzo) dove nessun singolo componente è necessariamente rotto.","C. Un guasto che colpisce tutte le caldaie del quartiere.","D. Un errore del software."],"correct":"B","explanation":"È il sistema che non funziona come insieme, anche se i singoli ''giocatori'' (componenti) sono integri."},{"id":"Q2","type":"sintomo","text":"La caldaia va continuamente in limitazione o sovratemperatura. Hai già cambiato la sonda NTC e la scheda, ma non è cambiato nulla. Qual è la causa più probabile?","options":["A. La caldaia è difettosa di fabbrica.","B. Manca gas.","C. L''impianto non smaltisce il calore (filtro sporco, aria, circolazione insufficiente). La caldaia è la vittima.","D. Tensione elettrica instabile."],"correct":"C","explanation":"Se la caldaia produce calore ma l''acqua non lo porta via, la temperatura sale. È idraulica, non elettronica."},{"id":"Q3","type":"azione_corretta","text":"Alcuni radiatori sono bollenti, altri freddi. La pompa gira regolarmente. Cosa fai?","options":["A. Sostituisci la pompa con una più potente.","B. Esegui il bilanciamento dell''impianto agendo sui detentori dei radiatori caldi (chiudendoli un po'').","C. Aumenti la temperatura a 80°C.","D. Cambi la valvola gas."],"correct":"B","explanation":"L''acqua è pigra: va dove c''è meno resistenza. Devi forzarla verso i radiatori lontani strozzando quelli vicini."},{"id":"Q4","type":"errore_tipico","text":"Qual è l''errore classico del ''Tecnico Riparatore di Pezzi'' di fronte a uno scambiatore bucato?","options":["A. Analizzare l''acqua.","B. Cambiare lo scambiatore senza chiedersi PERCHÉ si è bucato (senza lavare l''impianto o mettere inibitori).","C. Controllare la garanzia.","D. Pulire il filtro."],"correct":"B","explanation":"Se cambi la vittima (scambiatore) senza eliminare il killer (acqua acida/sporca), il killer colpirà ancora."},{"id":"Q5","type":"mini_caso","text":"Scenario: Cliente lamenta consumi alti e casa fredda. Caldaia sempre accesa al massimo. Impianto vecchio in ghisa, nessuna regolazione, serramenti vecchi. Cosa proponi?","options":["A. Cambio caldaia immediato.","B. Sostituzione valvola gas.","C. Non è un guasto, è uno squilibrio energetico. Proponi verifica isolamento, lavaggio impianto e installazione termostato evoluto.","D. Aumenti la potenza minima."],"correct":"C","explanation":"Non c''è nulla di rotto. L''edificio disperde più di quanto l''impianto riesca a fornire efficientemente. Serve agire sul sistema."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '24',
  'scheda',
  'avanzato',
  'Guasti Sistemici',
  '{"meta":{"video_id":"24","title":"Guasti Sistemici","level":"Avanzato","ukts":["PROC-011","COMP-002","COMP-001"]},"content":{"objective":"Identificare i problemi causati dall''interazione tra caldaia e impianto (flow, dirt, balance) invece che da componenti difettosi.","technical_data":[{"component":"Acqua Impianto","role":"Vettore termico.","failure_mode":"Se sporca (> Magnetite) o dura (> Calcare) distrugge gli scambiatori."},{"component":"Impianto Radiatori","role":"Dissipatore.","failure_mode":"Se sbilanciato crea zone fredde e surriscaldamenti in caldaia."}],"diagnosis_steps":[{"step":1,"question":"Storia?","action":"Chiedere cosa è cambiato nell''edificio o nell''utilizzo (es. chiuse stanze, nuovi infissi)."},{"step":2,"question":"Circolazione?","action":"Verificare il Delta T tra mandata e ritorno. Se eccessivo (>20°C) o nullo (<5°C) il problema è idraulico."},{"step":3,"question":"Qualità Fluido?","action":"Controllare filtro defangatore e aspetto dell''acqua."}],"pro_tips":["Non proporre mai la sostituzione della caldaia senza aver prima risolto i problemi dell''impianto (lavaggio/defangatore). La nuova caldaia morirebbe in 6 mesi."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '25',
  'checklist',
  'avanzato',
  'Checklist Video 25',
  '{"meta":{"video_id":"25","type":"checklist","title":"Checklist Video 25","last_updated":"2026-01-19"},"content":{"phases":[{"title":"CHECKLIST SICUREZZA (Bloccante)","steps":[{"id":"chk_25_0_0","label":"C''è odore di gas? (Se sì -> FERMO).","required":true},{"id":"chk_25_0_1","label":"Ci sono perdite di fumi in ambiente? (Se sì -> FERMO).","required":true},{"id":"chk_25_0_2","label":"C''è acqua su parti elettriche? (Se sì -> FERMO).","required":true}]},{"title":"CHECKLIST FATTIBILITÀ (Per Riparare ORA)","steps":[{"id":"chk_25_1_0","label":"Ho identificato il guasto senza dubbi?","required":true},{"id":"chk_25_1_1","label":"Ho il ricambio NUOVO e ORIGINALE nel furgone?","required":true},{"id":"chk_25_1_2","label":"Ho almeno 45 minuti di tempo prima del prossimo appuntamento?","required":true},{"id":"chk_25_1_3","label":"SE TUTTI SÌ -> PROCEDI A RIPARARE.","required":true}]},{"title":"CHECKLIST RINVIO (Se Fattibilità fallisce)","steps":[{"id":"chk_25_2_0","label":"Ho spiegato al cliente che serve il pezzo specifico?","required":true},{"id":"chk_25_2_1","label":"Ho messo la macchina in sicurezza (spenta/chiusa)?","required":true},{"id":"chk_25_2_2","label":"Ho fissato la data del ritorno?","required":true}]},{"title":"COMUNICAZIONE FINALE","steps":[{"id":"chk_25_3_0","label":"Ho spiegato COSA ho fatto/deciso.","required":true},{"id":"chk_25_3_1","label":"Ho spiegato PERCHÉ (Tecnicamente).","required":true},{"id":"chk_25_3_2","label":"Ho scritto tutto sul rapporto (anche i rifiuti del cliente).","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '25',
  'quiz',
  'avanzato',
  'Decision Making',
  '{"meta":{"video_id":"25","title":"Decision Making","ukts":["SKILL-004","SKILL-005"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Quali sono i tre unici esiti accettabili di un intervento tecnico?","options":["A. Riparazione, Preventivo, Sconto.","B. Riparo e Chiudo, Rimando Consapevolmente, Fermo Impianto.","C. Provo a riparare, Chiamo il capo, Scappo.","D. Funziona, Non funziona, Forse funziona."],"correct":"B","explanation":"Ogni intervento deve concludersi in uno di questi tre modi definiti. Non ci sono zone grigie come ''le ho messo una pezza''."},{"id":"Q2","type":"sintomo","text":"Hai il pezzo di ricambio nel furgone, ma è di un modello leggermente diverso. Si adatta con un po'' di nastro isolante. Cosa fai?","options":["A. Lo monto, l''importante è che la caldaia parta.","B. Rimando l''intervento. Non monto pezzi non corretti o adattati.","C. Chiedo al cliente se vuole rischiare.","D. Lo monto provvisoriamente per stasera."],"correct":"B","explanation":"Adattare pezzi sbagliati è la ricetta per disastri e richiami. Torna col pezzo giusto."},{"id":"Q3","type":"azione_corretta","text":"Il cliente insiste per far funzionare la caldaia anche se perde fumi ''solo un pochino''. Fa freddo e ha bambini piccoli. Cosa fai?","options":["A. La lascio andare al minimo.","B. Fermo impianto TASSATIVO. La sicurezza viene prima del comfort, anche coi bambini.","C. Gli faccio firmare uno scarico di responsabilità e la lascio accesa.","D. Apro la finestra e la lascio andare."],"correct":"B","explanation":"La sicurezza non si negozia. Uno scarico di responsabilità non ti protegge penalmente se qualcuno muore."},{"id":"Q4","type":"errore_tipico","text":"Qual è l''errore commesso dal tecnico che dice ''Cosa vuole che faccia, signora?''","options":["A. È troppo gentile.","B. Sta delegando la responsabilità tecnica al cliente, che non ha le competenze per decidere. È una mancanza di professionalità.","C. Sta coinvolgendo il cliente.","D. Nessun errore."],"correct":"B","explanation":"Il tecnico sei tu. Tu proponi le soluzioni tecniche fattibili, il cliente decide solo se accettare la spesa."},{"id":"Q5","type":"mini_caso","text":"Scenario: Sei in ritardo, è venerdì sera. Trovi un guasto complesso (scambiatore intasato). Non hai tempo per il lavaggio. Cosa fai?","options":["A. Faccio un lavaggio veloce di 10 minuti.","B. Cambio lo scambiatore sperando che tenga.","C. Spiego la situazione, metto la caldaia in modalità provvisoria (se sicuro) o la fermo, e fisso un intervento lungo per lunedì.","D. Dico che la caldaia è da buttare."],"correct":"C","explanation":"La fretta porta a decisioni sbagliate. Meglio un disagio organizzato (weekend senza riscaldamento completo) che un lavoro fatto male pagato caro."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '25',
  'scheda',
  'avanzato',
  'Decision Making',
  '{"meta":{"video_id":"25","title":"Decision Making","level":"Avanzato","ukts":["SKILL-004","SKILL-005"]},"content":{"objective":"Gestire la pressione psicologica e prendere decisioni tecniche corrette (Riparo/Rimando/Fermo).","technical_data":[{"component":"Il Tecnico","role":"Decision Maker.","failure_mode":"Cedere alla pressione del cliente facendo lavori affrettati o insicuri."}],"diagnosis_steps":[{"step":1,"question":"Ho il pezzo esatto?","action":"Se NO -> Rimanda. Non adattare pezzi diversi."},{"step":2,"question":"Sono sicuro della diagnosi?","action":"Se NO -> Rimanda/Approfondisci. Non cambiare pezzi a caso."},{"step":3,"question":"È sicuro lasciare acceso?","action":"Se NO -> FERMO IMPIANTO. Nessuna deroga."}],"pro_tips":["Se devi rimandare, spiega chiaramente PERCHÉ. ''Torno domani col pezzo giusto'' è meglio di ''Provo a sistemarla così''."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '26',
  'checklist',
  'avanzato',
  'Checklist Video 26',
  '{"meta":{"video_id":"26","type":"checklist","title":"Checklist Video 26","last_updated":"2026-01-19"},"content":{"phases":[{"title":"INGRESSO (Setting)","steps":[{"id":"chk_26_0_0","label":"Saluto fermo, sguardo negli occhi (niente testa bassa).","required":true},{"id":"chk_26_0_1","label":"Ascolto iniziale del cliente (senza interrompere per 1 minuto).","required":true},{"id":"chk_26_0_2","label":"Presa del comando: \"Ok, ora controllo io.\"","required":true}]},{"title":"DURANTE (Diagnosi)","steps":[{"id":"chk_26_1_0","label":"Evitare il monologo tecnico (Niente \"supercazzole\").","required":true},{"id":"chk_26_1_1","label":"Informare lo step successivo: \"Ho trovato X, ora devo verificare Y.\"","required":true}]},{"title":"USCITA (Chiusura)","steps":[{"id":"chk_26_2_0","label":"Struttura: 1. Problema -> 2. Soluzione -> 3. Costo.","required":true},{"id":"chk_26_2_1","label":"Decisione: Chiedere conferma chiara (\"Procediamo con A o preferisce B?\").","required":true},{"id":"chk_26_2_2","label":"Documentazione: Scrivere tutto sul rapporto, specialmente se il cliente rifiuta lavori consigliati.","required":true},{"id":"chk_26_2_3","label":"Saluto: Professionale, non da \"amico\". \"Resto a disposizione.\"","required":true}]},{"title":"🚫 VIETATO","steps":[{"id":"chk_26_3_0","label":"Dire \"Secondo me...\".","required":true},{"id":"chk_26_3_1","label":"Chiedere \"Cosa vuole fare?\".","required":true},{"id":"chk_26_3_2","label":"Scusarsi per il prezzo dei ricambi.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '26',
  'quiz',
  'avanzato',
  'Gestione Clienti',
  '{"meta":{"video_id":"26","title":"Gestione Clienti","ukts":["SKILL-005"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Qual è la differenza tra un Tecnico Esecutore e un Tecnico Decisore?","options":["A. L''Esecutore lavora meglio.","B. L''Esecutore chiede ''Cosa vuole che faccia?''; il Decisore dice ''Va fatto questo''.","C. Il Decisore costa di più.","D. Nessuna differenza."],"correct":"B","explanation":"Il cliente paga per avere una guida, non per dover decidere lui su cose che non conosce."},{"id":"Q2","type":"errore_tipico","text":"Perché entrare troppo nel dettaglio tecnico (''la curva della NTC fuori range...'') è un errore?","options":["A. Perché il cliente si annoia.","B. Perché il cliente non capisce, si sente stupido o sospetta che lo stai confondendo per fregarlo. Perdi fiducia invece di guadagnarla.","C. Perché sveli i segreti del mestiere.","D. Non è un errore, dimostra competenza."],"correct":"B","explanation":"La vera competenza è rendere semplici le cose complesse. La ''supercazzola'' tecnica crea barriere."},{"id":"Q3","type":"azione_corretta","text":"Il cliente contesta il prezzo: ''È troppo caro!''. Come reagisci?","options":["A. Ti arrabbi e te ne vai.","B. Ti scusi e fai subito uno sconto.","C. Resti calmo. Spieghi che il prezzo riflette la qualità e i ricambi originali. Se insiste, ricordi che è libero di sentire altri pareri.","D. Inizi a litigare."],"correct":"C","explanation":"Mai scusarsi per il prezzo del proprio lavoro (se onesto). La calma disarma l''aggressività."},{"id":"Q4","type":"concetto_chiave","text":"Cosa significa ''Informare non Giustificare''?","options":["A. Significa parlare poco.","B. Significa dire ''Il pezzo costa X'' (fatto) invece di ''Mi spiace che costi X ma sa, la ditta li aumenta...'' (giustificazione).","C. Significa non dire il prezzo.","D. Significa essere maleducati."],"correct":"B","explanation":"Chi si giustifica ammette la colpa. Chi informa dichiara un fatto. Tu non hai colpa se la caldaia è rotta."},{"id":"Q5","type":"mini_caso","text":"Scenario: Devi proporre la sostituzione della caldaia perché la riparazione è antieconomica. Come lo dici?","options":["A. ''Signora la caldaia è da buttare, ne compri una nuova da me.''","B. ''Tecnicamente possiamo ripararla per 500€, ma visto che ha 15 anni, forse non conviene... decida lei.''","C. ''Signora, la riparazione è fattibile ma costa 500€. Una nuova costa 1500€ ma consuma il 30% in meno. La mia raccomandazione tecnica è la sostituzione, ma lascio a lei la scelta finale.''","D. Non dico nulla e riparo."],"correct":"C","explanation":"Struttura logica: Costo A vs Costo B + Raccomandazione Tecnica + Rispetto per la decisione del cliente."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '26',
  'scheda',
  'avanzato',
  'Gestione Clienti',
  '{"meta":{"video_id":"26","title":"Gestione Clienti","level":"Avanzato","ukts":["SKILL-005","SKILL-003"]},"content":{"objective":"Gestire obiezioni, costi e decisioni con autorità tecnica, evitando conflitti e perdite di tempo.","technical_data":[{"component":"Cliente","role":"Utente finale.","failure_mode":"Diventa aggressivo o diffidente se percepisce insicurezza nel tecnico."}],"diagnosis_steps":[{"step":1,"question":"Sto informando o giustificando?","action":"Se ti stai scusando per il prezzo o per il guasto -> STOP. Torna a informare sui fatti."},{"step":2,"question":"Chi guida la conversazione?","action":"Se il cliente fa 100 domande a raffica -> Rispondi a una, poi riprendi il controllo: ''Il punto fondamentale però è...''"},{"step":3,"question":"Ho dato opzioni chiare?","action":"Non lasciare il cliente nel limbo. ''Opzione A o Opzione B''. Sceglia."}],"pro_tips":["Non usare termini tecnici per impressionare (supercazzola). Usa termini semplici per farti capire. La vera competenza è la semplicità."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '27',
  'checklist',
  'avanzato',
  'Checklist Video 27',
  '{"meta":{"video_id":"27","type":"checklist","title":"Checklist Video 27","last_updated":"2026-01-19"},"content":{"phases":[{"title":"IL RITUALE DI INGRESSO","steps":[{"id":"chk_27_0_0","label":"Mani in Tasca: Entro e NON tocco nulla per 120 secondi.","required":true},{"id":"chk_27_0_1","label":"Scansione Ambientale: Prese d''aria? Scarichi? Fughe gas?","required":true},{"id":"chk_27_0_2","label":"Intervista: Ascolto il cliente guardandolo negli occhi.","required":true}]},{"title":"IL RITUALE DI DIAGNOSI","steps":[{"id":"chk_27_1_0","label":"Identificazione: Che macchina è? (Turbo, Condensazione, Bollitore?).","required":true},{"id":"chk_27_1_1","label":"Ipotesi: Formulo 2 o 3 ipotesi basate sui sintomi.","required":true},{"id":"chk_27_1_2","label":"Test: Verifico le ipotesi una alla volta (Metodo Esclusione).","required":true}]},{"title":"IL RITUALE DI USCITA","steps":[{"id":"chk_27_2_0","label":"Verifica: Ho risolto davvero o ho messo una pezza?","required":true},{"id":"chk_27_2_1","label":"Pulizia: Lascio più pulito di come ho trovato.","required":true},{"id":"chk_27_2_2","label":"Saluto: Esco con autorità e cortesia.","required":true}]}]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '27',
  'quiz',
  'avanzato',
  'Il Metodo Finale',
  '{"meta":{"video_id":"27","title":"Il Metodo Finale","ukts":["SKILL-006"]},"questions":[{"id":"Q1","type":"concetto_chiave","text":"Cosa fa il ''Primario'' quando arriva davanti a una caldaia sconosciuta?","options":["A. Va nel panico e chiama l''assistenza tecnica.","B. Dice al cliente che la caldaia è troppo vecchia.","C. Tiene le mani in tasca, osserva la struttura, identifica i componenti fondamentali e ricostruisce la logica di funzionamento prima di toccare qualsiasi cosa.","D. Inizia a svitare il mantello velocemente."],"correct":"C","explanation":"La calma e l''osservazione sono le armi per domare l''ignoto. La logica idraulica non cambia mai."},{"id":"Q2","type":"errore_tipico","text":"Qual è il nemico numero uno del tecnico esperto?","options":["A. La tecnologia a condensazione.","B. La fretta (del cliente, del capo, o propria). La fretta porta a saltare passaggi e a commettere errori evitabili.","C. La ruggine.","D. I topi."],"correct":"B","explanation":"La fretta è la madre di tutti i ritorni. ''Chi va piano (nella diagnosi) va sano e va lontano (nella soluzione)''."},{"id":"Q3","type":"azione_corretta","text":"Ti trovi in un vicolo cieco. Hai provato tutto quello che sapevi ma la caldaia non va. Cosa fai?","options":["A. Cambio la scheda per sicurezza.","B. Mi fermo. Faccio un passo indietro. Azzero le ipotesi e ricomincio l''osservazione da capo, cercando cosa ho dato per scontato.","C. Prendo a calci la caldaia.","D. Vado via di nascosto."],"correct":"B","explanation":"L''ostinazione è dannosa. Se sei bloccato, resetta il processo mentale. Spesso la soluzione è in un dettaglio che hai ignorato."},{"id":"Q4","type":"concetto_chiave","text":"Perché l''umiltà (ammettere di non sapere o chiedere aiuto) è considerata un punto di forza del Primario?","options":["A. Perché fa pena al cliente.","B. Perché evita disastri. Il tecnico arrogante che finge di sapere fa danni costosi e pericolosi. Chi ammette il limite protegge il cliente e sé stesso.","C. Non è un punto di forza, è debolezza.","D. Perché così lavora meno."],"correct":"B","explanation":"L''autorità si basa sulla verità. Ammettere un limite è un atto di verità e responsabilità professionale."},{"id":"Q5","type":"mini_caso","text":"Il corso è finito. Cosa ti porti a casa?","options":["A. Un attestato di carta.","B. Una serie di trucchi per fregare i clienti.","C. Un Metodo. Un modo di vedere, pensare, decidere e comunicare che trasforma ogni intervento in un successo professionale.","D. Niente."],"correct":"C","explanation":"Il Metodo è l''unica cosa che conta. I modelli cambiano, il Metodo resta."}]}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();

INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '27',
  'scheda',
  'avanzato',
  'Il Metodo',
  '{"meta":{"video_id":"27","title":"Il Metodo","level":"Master","ukts":["SKILL-006"]},"content":{"objective":"Consolidare l''approccio mentale corretto per operare su qualsiasi impianto in autonomia e sicurezza.","technical_data":[{"component":"Mindset","role":"Sistema Operativo del Tecnico.","failure_mode":"Fretta, ansia, routine, presunzione."}],"diagnosis_steps":[{"step":1,"question":"Ho osservato almeno 2 minuti ?","action":"Se NO -> Rallenta. Ti sei perso qualcosa."},{"step":2,"question":"Sto procedendo a caso?","action":"Se stai smontando pezzi senza un motivo logico -> FERMATI. Torna alla diagnosi."},{"step":3,"question":"Sono calmo?","action":"Se sei agitato, esci a prendere aria e rientra. Un tecnico agitato fa danni."}],"pro_tips":["Il vero esperto non è quello che sa tutto a memoria. È quello che sa come trovare la soluzione anche quando non la sa a memoria."]}}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();
