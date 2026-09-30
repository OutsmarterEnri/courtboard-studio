# Guida d'uso

[Torna al README](../README.md)

## Creare una sequenza

1. Apri **Impostazioni** e inserisci il titolo. Scegli giocatori, campo e rotazione.
2. Disponi gli elementi nel frame iniziale usando **Sposta**.
3. Premi **Aggiungi frame**: le posizioni vengono copiate, mentre i segni del nuovo frame partono vuoti.
4. Sposta giocatori e palla nelle posizioni di arrivo e imposta la durata.
5. Aggiungi altri frame e usa **Riproduci** per visualizzare lo schema.

Il primo frame mantiene ferme le posizioni per la propria durata. Ogni frame successivo interpola le posizioni del precedente per il tempo indicato. Puoi tornare a una fase dalla sequenza in alto o con i pulsanti precedente/successivo.

## Disegno e selezione

| Strumento | Effetto                                                               |
| --------- | --------------------------------------------------------------------- |
| Sposta    | Seleziona e trascina giocatori, palla e attrezzi                      |
| Penna     | Disegna un tratto libero; usa la pressione se fornita dal dispositivo |
| Gomma     | Rimuove l'intero segno toccato                                        |
| Taglio    | Freccia di movimento senza palla                                      |
| Passaggio | Freccia tratteggiata                                                  |
| Palleggio | Freccia ondulata                                                      |
| Blocco    | Segmento con terminazione trasversale                                 |
| Tiro      | Doppia linea direzionale                                              |

Colore e spessore si applicano ai segni successivi. La barra scorre orizzontalmente sui display stretti. **Disegna solo con penna / Apple Pencil** ignora mouse e dito per i segni, ma lascia disponibile lo spostamento con il dito.

Le frecce della tastiera spostano l'elemento selezionato di 5 unità; con Maiusc, di 20. La direzione segue lo schermo anche quando il campo è ruotato. Canc elimina l'elemento selezionato. Annulla/ripristina conserva fino a 40 modifiche a frame, posizioni e disegni nella sessione; scorciatoie `Ctrl/Cmd+Z` e `Ctrl/Cmd+Maiusc+Z`.

## Preset e orientamento

**Solo attacco** nasconde i difensori senza cancellarli. **Metà campo** mostra la metà offensiva; a 0° il canestro è a sinistra. Rotazione e selezione del campo cambiano la vista e l'esportazione, senza modificare le coordinate del progetto. Tornando alla vista completa ricompaiono gli elementi nascosti.

## Salvataggio e backup

Il progetto corrente si salva automaticamente in IndexedDB. L'indicatore di stato segnala salvataggio, conferma o errore. Riaprendo la stessa origine nel browser, il progetto viene recuperato.

**Impostazioni → Esporta schema JSON** scarica un backup. **Apri schema JSON** sostituisce il progetto corrente con quello importato. Durante la sessione puoi annullare la sostituzione dei frame; titolo e preferenze non fanno parte della cronologia. Usa il JSON per trasferire uno schema tra browser, Safari e app della Home, o tra dispositivi.

Il browser può cancellare i dati locali: l'autosalvataggio non sostituisce un backup. Cambiare indirizzo, porta o protocollo dell'app crea un'origine diversa e quindi un archivio separato.

## Esportazione video

Premi **Esporta video** e mantieni la scheda visibile e il dispositivo sbloccato. La registrazione dura quanto lo schema. Al termine usa **Salva video** oppure **Condividi / Salva su File**, quando supportato. Puoi interrompere con **Annulla esportazione**.

L'app preferisce MP4 se disponibile, altrimenti WebM; nessuna conversione o traccia audio. Campo completo: 1500 × 850; metà campo: 800 × 850; dimensioni invertite a 90° e 270°. Acquisizione nominale 30 fps, influenzata dalle prestazioni del dispositivo.

## Limiti attuali

- Le traiettorie animate sono lineari. Per curve o cambi di direzione servono frame intermedi.
- Le frecce e i tratti liberi sono annotazioni, non percorsi automatici.
- La fascia esterna per le rimesse è solo grafica: non consente ancora di posizionare il giocatore fuori campo.
- L'app conserva un progetto corrente, senza libreria multiprogetto o sincronizzazione.
- La penna utilizza i Pointer Events del browser; non sono implementati squeeze e doppio tap hardware di Apple Pencil.
- Geometria e segni sono strumenti di coaching, senza certificazione FIBA. Riferimento: [manuali FIBA/WABC](https://about.fiba.basketball/en/wabc-documents).
