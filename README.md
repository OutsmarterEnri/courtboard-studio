# Courtboard

Lavagnetta tattica per il basket, in italiano: disponi giocatori e attrezzi, disegna uno schema, costruisci una sequenza animata ed esportala in video.

## Funzionalità

- Campo proporzionato su dimensioni FIBA, 28 × 15 m.
- Cinque attaccanti, cinque difensori e una palla; cinesini e ostacoli aggiungibili.
- Preset indipendenti: attacco/difesa o solo attacco; campo completo o metà campo offensiva.
- Rotazione a 0°, 90°, 180° e 270°, con titolo e numeri sempre leggibili.
- Trascinamento con mouse o touch; spostamento dell'elemento selezionato con i tasti freccia, anche a campo ruotato.
- Simboli per movimento, passaggio, palleggio, blocco e tiro, secondo le convenzioni grafiche del coaching.
- Sequenza a fasi con durate modificabili, riproduzione, pausa e scorrimento temporale.
- Titolo in alto a sinistra nel campo, incluso nei video.
- Esportazione MP4 o WebM, secondo il supporto del browser.
- Salvataggio e apertura degli schemi in JSON, inclusi preset e rotazione.

## Avvio locale

Richiede Node.js 22 o successivo. L'app non ha dipendenze a runtime e non richiede compilazione.

```sh
npm start
```

Apri `http://127.0.0.1:8765`. Per cambiare porta imposta la variabile d'ambiente `PORT`. È possibile servire la cartella `dist/` anche con un altro server statico, per esempio `python3 -m http.server 8765 --directory dist`.

Per installare gli strumenti di sviluppo e avviare i controlli:

```sh
npm ci
npx playwright install chromium
npm test
npm run format:check
```

Su Linux, se mancano le librerie del browser, usa `npx playwright install --with-deps chromium`.

## Creare uno schema

1. Inserisci il titolo e scegli giocatori, porzione di campo e rotazione.
2. Disponi gli elementi nella prima fase. I tasti freccia muovono l'elemento selezionato di 5 unità; con Maiusc di 20.
3. Aggiungi una fase e sposta gli elementi nelle posizioni di arrivo. La prima fase resta ferma per la sua durata; ogni fase successiva anima lo spostamento dalla precedente.
4. Scegli un simbolo e trascina sul campo per disegnarlo nella fase corrente.
5. Riproduci la sequenza e seleziona **Esporta video**. Mantieni la scheda aperta e visibile durante l'esportazione.
6. Usa **Salva schema** per scaricare il JSON modificabile, e **Apri schema** per recuperarlo.

La rotazione cambia l'inquadratura, senza modificare le coordinate salvate dei giocatori. A 0° la metà offensiva è quella con il canestro a sinistra; ruotando, la stessa metà segue l'orientamento. Gli elementi fuori dalla metà visibile e i difensori nascosti vengono conservati. Tornando al campo completo o ad attacco/difesa riappaiono.

## Video e limiti

- L'esportazione usa Canvas Capture Stream e MediaRecorder: MP4 se disponibile, altrimenti WebM. Non è inclusa una conversione tra formati.
- Il video ha lo stesso orientamento della lavagnetta. Risoluzioni: 1500 × 850 per il campo completo, 800 × 850 per metà campo; a 90° e 270° le dimensioni si scambiano.
- Nessun audio. Registrazione in tempo reale a circa 30 fps; schede in background e dispositivi lenti possono ridurre la fluidità.
- Gli spostamenti tra fasi sono lineari. Per curve o cambi di direzione inserisci fasi intermedie. Le frecce disegnate sono annotazioni, non percorsi automatici.
- Le posizioni non vengono salvate automaticamente: scarica il JSON prima di chiudere o ricaricare la pagina.
- La geometria e i simboli sono strumenti di coaching, non una certificazione FIBA. Riferimento: [manuali FIBA/WABC](https://about.fiba.basketball/en/wabc-documents).

## Struttura

```text
dist/
  index.html          Interfaccia e stile
  app.js              Stato, interazioni, animazione e video
  geometry.js         Trasformazioni tra campo e schermo
scripts/
  serve.cjs           Server statico locale senza dipendenze
tests/
  geometry.test.cjs   Verifiche delle trasformazioni
  browser.test.cjs    Interazioni, salvataggio e video in Chromium
.github/workflows/
  ci.yml              Controlli automatici su push e pull request
```

`dist/` contiene i sorgenti statici e deve essere versionata: non è una cartella generata. Le coordinate dello schema restano nel sistema originale 1500 × 850; la rotazione si applica al rendering e si inverte per gli input. Il formato JSON versione 1 rimane compatibile con i file senza rotazione, che si aprono a 0°.

## Preparazione per GitHub

La copia distribuita non include cronologia Git, credenziali, remoto o identità del sito ospitato. Crea un repository vuoto su GitHub, poi dalla cartella del progetto:

```sh
git init -b main
git add .
git diff --cached --stat
git commit -m "feat: add basketball tactics board with rotation and video export"
git remote add origin https://github.com/UTENTE/REPOSITORY.git
git push -u origin main
```

Sostituisci `UTENTE/REPOSITORY` con il repository scelto. Se hai già clonato un repository, copia i file al suo interno ed evita `git init` e l'aggiunta di un remoto già presente. Nessun repository GitHub viene creato e nessun push viene eseguito da questa preparazione.

## Hosting

Pubblica il contenuto di `dist/` con qualsiasi hosting statico HTTPS. Non servono backend, variabili segrete o database. Per GitHub Pages usa un workflow che carichi `dist/` come artefatto Pages; il workflow incluso esegue solo i controlli e non pubblica automaticamente. La configurazione dell'istanza Sites è specifica del proprietario e non è inclusa nella copia per GitHub.

## Dati e licenza

L'app elabora schema e video nel browser e non integra analytics o servizi esterni. La piattaforma di hosting può gestire accessi e log propri. Gli schemi scaricati rimangono sul dispositivo.

Non è stata scelta una licenza open source. `UNLICENSED` evita di attribuire diritti di riutilizzo non concordati; aggiungi un file `LICENSE` prima di distribuire il progetto con una licenza specifica.
