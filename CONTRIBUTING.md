# Sviluppo

Usa Node.js 22+, installa con `npm ci` e avvia con `npm start`.

Prima di proporre modifiche:

```sh
npx playwright install chromium
npm test
npm run format
npm run format:check
```

Mantieni le coordinate dei dati nel sistema originale del campo. Le trasformazioni di rotazione appartengono a `dist/geometry.js`; puntatore, tastiera, canvas e video devono usare lo stesso orientamento. Non applicare rotazioni distruttive agli schemi salvati.

Per modifiche all'editor controlla campo completo e metà campo a tutte le rotazioni, attacco/difesa e solo attacco, titolo, salvataggio JSON ed esportazione video. Mantieni leggibili le etichette e accessibili i controlli da tastiera.

Non inserire schemi personali, video, credenziali o configurazioni di hosting private nel repository. Per segnalare un problema indica browser, sistema operativo, passaggi per riprodurlo e comportamento atteso.
