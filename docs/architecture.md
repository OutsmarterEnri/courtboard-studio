# Architettura

[Torna al README](../README.md)

## Moduli

| File                        | Responsabilità                                               |
| --------------------------- | ------------------------------------------------------------ |
| `dist/index.html`           | Struttura, controlli e dialog accessibili                    |
| `dist/styles.css`           | Layout adattivo, barra strumenti e tenda laterale            |
| `dist/app.js`               | Stato dei frame, rendering canvas, input, cronologia e video |
| `dist/geometry.js`          | Trasformazioni invertibili campo/schermo per le rotazioni    |
| `dist/local-store.js`       | Lettura e scrittura del progetto corrente in IndexedDB       |
| `dist/offline.js`           | Registrazione del service worker e stato di disponibilità    |
| `dist/sw.js`                | Installazione, cache degli asset e fallback offline          |
| `dist/manifest.webmanifest` | Identità, scope e icone della webapp                         |
| `scripts/serve.cjs`         | Server statico HTTP/HTTPS locale con percorsi espliciti      |
| `scripts/check.cjs`         | Verifica sintassi, JSON e collegamenti locali                |

I moduli browser vengono caricati in ordine: geometria, archivio locale, editor, registrazione offline. Non ci sono framework, bundler o dipendenze a runtime. Gli strumenti npm sono soltanto di sviluppo.

## Coordinate e rendering

Lo spazio del campo completo è 1500 × 850 unità. Il rettangolo di gioco va da `(50, 50)` a `(1450, 800)`: scala di 50 unità per metro. La metà offensiva usa una vista di 800 × 850; il taglio avviene lungo la linea di metà campo.

Le coordinate dei dati non ruotano. `geometry.js` trasforma il rendering verso lo schermo e inverte la trasformazione per il puntatore. La tastiera usa la stessa trasformazione sui vettori. Il titolo è disegnato dopo il ripristino della trasformazione; i numeri vengono controruotati per restare leggibili.

Un `ResizeObserver` adatta la superficie allo spazio disponibile. La risoluzione logica del canvas resta stabile e viene condivisa con l'esportazione video.

## Stato e durata

Ogni frame contiene `duration`, `items` e `lines`. La riproduzione mantiene fermo il primo frame e interpola gli elementi dei successivi per ID. Un elemento senza corrispondenza nel frame precedente appare direttamente nella posizione del nuovo frame.

La cronologia annulla/ripristina usa snapshot di frame e indice corrente; non è persistita. Titolo e preferenze fanno parte del progetto, ma non degli snapshot della cronologia.

## Persistenza e rete

IndexedDB contiene il database `courtboard-local`, lo store `projects` e la chiave `current`. Dopo il caricamento iniziale, l'editor programma il salvataggio con un breve ritardo e serializza le scritture. In caso di errore invita a esportare un JSON.

Il service worker conserva soltanto file dell'app. Alla nuova attivazione elimina le vecchie cache con prefisso `courtboard-shell-`; non modifica IndexedDB. Le richieste sono limitate all'origine dell'app e non è previsto un endpoint per inviare gli schemi.

## Aggiornamenti

Modificando un asset distribuito, cambia `CACHE` in `dist/sw.js` e mantieni completo `ASSETS`. Il worker nuovo attende che tutte le finestre della versione precedente vengano chiuse. La versione della cache distingue gli asset; la versione npm identifica il rilascio del repository.

## Confini di verifica

I test unitari coprono le trasformazioni. I test browser coprono input, codec video disponibile in Chromium, layout e recupero offline. Un viewport tablet non emula il sistema operativo iPadOS o l'hardware Pencil: la verifica su dispositivo è un controllo separato.
