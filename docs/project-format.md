# Formato del progetto

[Torna al README](../README.md)

I backup sono JSON UTF-8 con `version: 1`. Le coordinate sono espresse nello spazio originale 1500 × 850, indipendentemente dalla rotazione. Il numero di versione del formato è distinto dalla versione 2.0 dell'app.

```json
{
  "version": 1,
  "title": "Passaggio e taglio",
  "presets": { "teams": "both", "view": "full", "rotation": 0 },
  "preferences": {
    "trails": true,
    "pencilOnly": false,
    "ink": "#f8e7b8",
    "width": 5
  },
  "frames": [
    {
      "duration": 2,
      "items": [
        { "id": "a0", "type": "attack", "n": 1, "x": 620, "y": 425 },
        { "id": "ball", "type": "ball", "x": 654, "y": 443 }
      ],
      "lines": []
    }
  ]
}
```

## Campi

| Campo              | Significato                                          |
| ------------------ | ---------------------------------------------------- |
| `title`            | Stringa, visualizzata fino a 70 caratteri            |
| `presets.teams`    | `both` oppure `attack`                               |
| `presets.view`     | `full` oppure `half`                                 |
| `presets.rotation` | 0, 90, 180 o 270                                     |
| `preferences`      | Visibilità dei segni, input penna, colore e spessore |
| `frames`           | Da 1 a 300 frame                                     |
| `duration`         | Numero finito da 0,5 a 30 secondi                    |
| `items`            | Fino a 200 elementi per frame, ID unici nel frame    |
| `lines`            | Fino a 500 annotazioni per frame                     |

Gli elementi ammettono `attack`, `defend`, `ball`, `cone`, `barrier`. Sono ammessi al massimo cinque attaccanti, cinque difensori e una palla per frame. Attaccanti e difensori richiedono `n` intero da 1 a 5. Le coordinate importabili degli elementi sono `65 ≤ x ≤ 1435` e `65 ≤ y ≤ 785`.

Le annotazioni ammettono `run`, `pass`, `dribble`, `screen`, `shot`, `pen`. Ogni annotazione contiene da 2 a 2000 punti `{x, y}` entro lo spazio 1500 × 850. Un punto può avere `pressure` tra 0 e 2. I campi opzionali `color` e `width` accettano rispettivamente un colore esadecimale `#RRGGBB` e un numero da 1 a 20.

## Compatibilità

I vecchi backup senza `presets` o `preferences` si aprono con valori predefiniti. Conservare gli ID tra frame permette l'interpolazione dei movimenti. I nuovi tratti `pen` richiedono la versione locale aggiornata dell'editor: un vecchio editor può rifiutarli.

L'importazione rifiuta file superiori a 5.000.000 byte e strutture non valide. Non memorizzare nel JSON URL di video o oggetti runtime. Il video viene generato dai dati del progetto e scaricato separatamente.
