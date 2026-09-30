# Installazione di Courtboard su iPad

Tutte le funzioni lavorano sul dispositivo. Il server distribuisce soltanto i file dell'app per la prima installazione e gli aggiornamenti; non riceve gli schemi.

## 1. Prima prova in rete locale

Sul computer Windows con Node.js 22+, apri PowerShell nella cartella del repository:

```powershell
$env:HOST = "0.0.0.0"
npm start
```

Collega iPad e computer alla stessa rete Wi-Fi. Trova l'indirizzo IPv4 del computer con `ipconfig`, quindi apri `http://INDIRIZZO-DEL-PC:8765` in Safari. Se Windows chiede l'accesso alla rete, consenti la rete privata.

Questa modalità permette di provare campo, frame e disegno mentre il computer è acceso. **HTTP su un indirizzo di rete non abilita il service worker**, quindi non è ancora l'installazione offline. `localhost` sull'iPad identifica l'iPad, non il computer.

## 2. Installazione realmente offline

Occorre distribuire `dist/` attraverso un indirizzo HTTPS con certificato attendibile sull'iPad. Sono possibili un server HTTPS locale o, se lo desideri, un hosting statico HTTPS. Non è stato pubblicato né modificato alcun hosting per questa versione.

Il server incluso supporta certificati locali. Procurati un certificato valido per il nome o l'IP del computer, con la relativa chiave privata, e una catena di fiducia riconosciuta sull'iPad. Metti i file in `certs/`, quindi in PowerShell:

```powershell
$env:HOST = "0.0.0.0"
$env:TLS_CERT = "$PWD\certs\server.pem"
$env:TLS_KEY = "$PWD\certs\server-key.pem"
npm start
```

Apri `https://NOME-O-IP-DEL-CERTIFICATO:8765` dall'iPad. Un certificato non riconosciuto o con nome diverso può impedire la preparazione offline; superare semplicemente un avviso del browser non garantisce il funzionamento del service worker. La creazione e la fiducia del certificato dipendono dalla tua rete e non vengono configurate automaticamente dall'app.

Se usi un hosting statico, carica **tutto il contenuto di `dist/`**, inclusi `sw.js`, manifest e icone. Non sono richiesti account nell'app o backend; gli schemi restano locali anche se i file iniziali arrivano da un hosting.

## 3. Aggiungi alla Home e verifica

1. In Safari, apri l'indirizzo HTTPS.
2. Apri **Impostazioni** nella lavagnetta e attendi **Disponibile offline su questo dispositivo**.
3. Dal menu Condividi di Safari scegli **Aggiungi alla schermata Home**; abilita **Apri come app web**, se disponibile.
4. Apri l'icona Courtboard dalla Home mentre la connessione è ancora attiva. Attendi nuovamente lo stato offline: l'archivio della webapp può essere separato da quello di Safari.
5. Crea un piccolo schema, chiudi l'app, attiva la modalità aereo e riaprila dalla Home. Verifica la presenza dei frame e prova un disegno.
6. Esporta un backup JSON in File. Per il video, dopo la registrazione usa **Salva video** o **Condividi / Salva su File**.

La verifica con modalità aereo conferma l'installazione su quel dispositivo. È possibile che il sistema liberi dati del browser in condizioni di spazio insufficiente: conserva i backup JSON.

## Apple Pencil

La penna utilizza i Pointer Events forniti da Safari. **Impostazioni → Disegna solo con penna / Apple Pencil** evita che il dito disegni. La pressione modula lo spessore dei tratti liberi quando Safari la fornisce. La compatibilità con il modello di iPad e Pencil va verificata sul dispositivo: l'ambiente di sviluppo non dispone di un iPad fisico.

## Aggiornamenti

Ricollegati all'indirizzo originario quando vuoi aggiornare. Se appare **Aggiornamento pronto**, chiudi tutte le finestre della webapp e di Safari che stanno usando Courtboard, quindi riapri l'app. La versione della cache va incrementata insieme agli asset (`dist/sw.js`).

Riferimenti ufficiali: [Aggiungere una webapp alla Home su iPad](https://support.apple.com/guide/ipad/open-as-web-app-ipad8f1f7a29/ipados), [Service worker e contesti sicuri](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).
