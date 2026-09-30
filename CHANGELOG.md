# Changelog

Le versioni del repository e il formato dei backup JSON sono indipendenti. Le voci descrivono il contenuto del codice, non implicano una pubblicazione su App Store o su un hosting.

## 2.0.0 — 2026-09-30

### Aggiunto

- Editor locale per tablet con frame in alto e impostazioni a scomparsa.
- Disegno libero, gomma, colore, spessore e cronologia annulla/ripristina.
- Persistenza IndexedDB del progetto corrente e recupero automatico.
- Manifest, icone e service worker per installazione e uso offline.
- Anteprima video con download esplicito, condivisione supportata e annullamento della registrazione.
- Fascia perimetrale grafica per le rimesse.
- Avvio rapido Windows e supporto HTTPS locale.
- Guide separate, documentazione del formato, test organizzati per livello e CI Linux/Windows.

### Modificato

- Superficie del campo adattata al viewport e all'orientamento.
- Controlli mouse, touch e penna coerenti con la rotazione.
- Cache offline aggiornata per distribuire gli asset più recenti.

### Compatibilità e limiti

- Importazione dei backup JSON versione 1 delle versioni precedenti.
- La fascia rimesse resta visiva; non è ancora possibile posizionare un giocatore oltre il limite interno.
- Safari e Apple Pencil su dispositivo fisico non sono coperti dai test automatizzati.

## 1.0.0 — versione iniziale

- Campo completo e metà campo, attacco/difesa o solo attacco.
- Rotazione 0°, 90°, 180° e 270° con titolo e numeri leggibili.
- Sequenze animate, segnaletica tattica, import/export JSON ed esportazione video.
