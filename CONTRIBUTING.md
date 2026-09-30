# Contribuire a Courtboard

Usa Node.js 22+, installa con `npm ci` e avvia con `npm start`.

Prima di proporre modifiche:

```sh
npx playwright install chromium
npm run format
npm run verify
```

Mantieni le coordinate dei dati nel sistema originale del campo. Le trasformazioni di rotazione appartengono a `dist/geometry.js`; puntatore, tastiera, canvas e video devono usare lo stesso orientamento. Non applicare rotazioni distruttive agli schemi salvati.

Per modifiche all'editor controlla campo completo e metà campo a tutte le rotazioni, attacco/difesa e solo attacco, titolo, salvataggio JSON ed esportazione video. Mantieni leggibili le etichette e accessibili i controlli da tastiera.

Non inserire schemi personali, video, credenziali o configurazioni di hosting private nel repository. Per segnalare un problema indica browser, sistema operativo, passaggi per riprodurlo e comportamento atteso.

## Editor locale e offline

Gli schemi sono salvati in IndexedDB, senza servizi remoti. Non introdurre richieste di rete per salvataggi o analisi. La cache offline contiene soltanto gli asset dell'app: incrementa `CACHE` in `dist/sw.js` dopo le modifiche e includi i nuovi asset in `ASSETS`.

## Struttura e processo

- `dist/` contiene i sorgenti statici versionati: non cancellarla come se fosse un output di build.
- `docs/` ospita guide utente e documentazione tecnica; mantieni il README come punto d'ingresso.
- `tests/unit/` verifica la geometria, `tests/browser/` verifica i flussi nell'app.
- `scripts/check.cjs` verifica sintassi, JSON, asset e collegamenti locali della documentazione.
- La CI esegue `npm run verify` su Node.js 22, Linux e Windows. Non pubblica l'app.

Per una modifica crea un branch, mantieni il diff limitato allo scopo, aggiorna il changelog e descrivi nella pull request il comportamento risultante e le prove eseguite. Non cambiare il formato dei backup senza definire la compatibilità con i file esistenti. Prima del merge esamina i risultati di entrambe le piattaforme in CI.

Per la prima configurazione Linux possono servire le librerie del browser: `npx playwright install --with-deps chromium`. Su Windows puoi usare `npm.cmd` se PowerShell blocca lo script `npm.ps1`.

Per modifiche alla UI esegui anche il test locale/offline incluso in `npm test`. Verifica la tenda modale da tastiera, l'adattamento in verticale/orizzontale e il comportamento di `pointercancel`. Il disegno non deve essere interrotto da un secondo tocco. Certificati HTTPS e chiavi private restano fuori dal repository.
