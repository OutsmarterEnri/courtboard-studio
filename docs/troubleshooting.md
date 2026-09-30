# Risoluzione dei problemi

[Torna al README](../README.md)

## Avvio sul computer

- **`node` o `npm` non trovato:** installa Node.js 22+ e riapri il terminale.
- **PowerShell blocca `npm.ps1`:** usa `npm.cmd start` senza cambiare la policy di esecuzione.
- **Porta 8765 occupata:** chiudi il server precedente, oppure esegui `$env:PORT = "8766"` e poi `npm.cmd start`. Apri la nuova porta nel browser; avrà un archivio locale separato.
- **Percorso `/mnt/c/...` non trovato in PowerShell:** usa il percorso Windows `C:\Users\...`, oppure apri PowerShell direttamente nella cartella del progetto.

## iPad non raggiunge il computer

Usa l'indirizzo IPv4 del computer e la stessa rete Wi-Fi. Avvia con `$env:HOST = "0.0.0.0"`; questo è un indirizzo di ascolto, non l'indirizzo da aprire nell'iPad. Consenti il server sulla rete privata nel firewall. Una rete ospiti può impedire la comunicazione tra dispositivi.

## Offline non disponibile

Il service worker richiede HTTPS, oppure localhost sul computer. Un indirizzo HTTP della rete locale non basta. Verifica il certificato e attendi **Disponibile offline**. Dopo l'aggiunta alla Home, avvia la webapp online almeno una volta prima di provare la modalità aereo. Consulta [installazione iPad](ipad-installation.md).

## Compare una versione precedente

Chiudi tutte le finestre di Courtboard, comprese quelle di Safari, poi riapri online. Il nuovo service worker deve essere installato e attivato. Per lo sviluppo, verifica anche che `CACHE` in `dist/sw.js` sia cambiato dopo le modifiche agli asset. Non cancellare i dati del sito prima di aver esportato un backup JSON.

## Schema mancante o salvataggio non disponibile

Controlla di usare lo stesso indirizzo, protocollo, porta e browser. Safari e la webapp della Home possono avere dati separati. Navigazione privata, pulizia dei dati o spazio esaurito possono impedire la persistenza. Importa un backup JSON; senza un backup non è garantito il recupero di dati cancellati dal sistema.

## Video non salvato o non fluido

Mantieni l'app visibile e il dispositivo sbloccato durante la registrazione. Aspetta l'anteprima e premi **Salva video**. Se supportata, la condivisione permette di scegliere File su iPad. Il browser sceglie MP4 o WebM: il formato non è configurabile e non viene convertito dall'app.

## Segnalare un problema

Apri una [issue](https://github.com/OutsmarterEnri/courtboard-studio/issues/new/choose) indicando dispositivo, sistema operativo, browser, modalità campo/rotazione e passaggi riproducibili. Allega solo uno schema di esempio privo di dati personali. Distingui il funzionamento nel browser da quello della webapp installata sulla Home.
