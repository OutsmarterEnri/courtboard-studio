# Courtboard Studio

[![Controlli automatici](https://github.com/OutsmarterEnri/courtboard-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/OutsmarterEnri/courtboard-studio/actions/workflows/ci.yml)

Lavagnetta tattica per il basket, progettata per computer e tablet. Costruisci sequenze di frame, disegna sul campo ed esporta lo schema come video. L'editor lavora sul dispositivo, con salvataggio locale e supporto offline dopo l'installazione.

## Avvio rapido

Richiede **Node.js 22 o successivo**. Dalla cartella del progetto:

```sh
npm start
```

Apri **http://127.0.0.1:8765**. Su Windows puoi anche fare doppio clic su `Avvia-Courtboard.cmd`. Non servono compilazione, account, database o dipendenze a runtime.

## Funzionalità

- Sequenza dei frame in alto: duplicazione delle posizioni, durata per fase, navigazione e riproduzione.
- Cinque attaccanti, cinque difensori, palla, cinesini e ostacoli.
- Campo completo o metà offensiva, rotazioni di 90°, superficie adattiva e titolo sempre leggibile.
- Barra da disegno con penna libera, gomma, segni tattici, colore, spessore e annulla/ripristina.
- Impostazioni in un pannello a scomparsa; interazioni con mouse, touch e penna.
- Recupero automatico del progetto corrente da IndexedDB e backup JSON trasferibili.
- Esportazione MP4 o WebM, secondo il browser, con anteprima e condivisione quando disponibile.
- Webapp installabile con cache offline. Il primo caricamento su iPad richiede HTTPS.

## Documentazione

| Guida                                               | Contenuto                                           |
| --------------------------------------------------- | --------------------------------------------------- |
| [Uso dell'editor](docs/user-guide.md)               | Frame, disegno, preset, backup e video              |
| [Installazione su iPad](docs/ipad-installation.md)  | Rete locale, HTTPS, Home e modalità offline         |
| [Architettura](docs/architecture.md)                | Responsabilità dei moduli, coordinate e persistenza |
| [Formato degli schemi](docs/project-format.md)      | JSON versione 1, limiti e compatibilità             |
| [Risoluzione dei problemi](docs/troubleshooting.md) | Avvio, aggiornamenti, dati e download               |
| [Contribuire](CONTRIBUTING.md)                      | Ambiente, test e preparazione delle modifiche       |
| [Changelog](CHANGELOG.md)                           | Novità e limiti della versione                      |

## Struttura del repository

```text
dist/                     Sorgenti statici dell'app, pronti da servire
  icons/                  Icone locali della PWA
docs/                     Guide utente e documentazione tecnica
scripts/                  Server HTTP/HTTPS e controlli del progetto
tests/
  unit/                   Trasformazioni geometriche
  browser/                Editor, video, layout e funzionamento offline
.github/                  CI e modelli per issue e pull request
Avvia-Courtboard.cmd       Avvio rapido Windows
```

`dist/` è il sorgente versionato, **non un output rigenerabile**: il progetto non ha un passaggio di build. Mantenere questo nome conserva i percorsi di avvio e distribuzione esistenti.

## Sviluppo

```sh
npm ci
npx playwright install chromium
npm run verify
```

`verify` esegue controlli dei file e dei collegamenti interni, test unitari, prove browser e verifica della formattazione. La CI esegue gli stessi controlli su Linux e Windows. Per formattare: `npm run format`.

## Compatibilità e limiti

I test automatizzati coprono Chromium, compresi layout tablet e ricaricamento offline. Safari e Apple Pencil su un iPad fisico richiedono ancora una verifica dedicata. Il formato video dipende dalle capacità del browser.

Le animazioni interpolano posizioni in linea retta; i segni disegnati non definiscono percorsi automatici. La fascia perimetrale per le rimesse è un riferimento visivo: in questa versione lo spostamento dei giocatori resta limitato al rettangolo interno. I dettagli sono nella [guida d'uso](docs/user-guide.md#limiti-attuali).

## Dati e distribuzione

Nessuna sincronizzazione cloud o analytics nell'app. Il progetto corrente rimane nel browser; conserva backup JSON per trasferirlo o proteggerlo dalla cancellazione dei dati locali. Pubblicare il repository su GitHub non pubblica l'app: la CI non include deployment automatici.

Per distribuire l'app, servi l'intero contenuto di `dist/`. HTTPS è necessario per l'installazione offline su iPad; `localhost` è sufficiente per lo sviluppo sul computer. Consulta la [guida iPad](docs/ipad-installation.md).

## Licenza

Il progetto è `UNLICENSED`: non è stata concessa una licenza open source. La visibilità del repository non attribuisce automaticamente diritti di riutilizzo.
