(async () => {
  const status = document.getElementById("offlineStatus");
  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    status.textContent =
      "Uso locale attivo. Per installare la versione offline apri l’app tramite HTTPS (oppure localhost sul computer).";
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register("./sw.js");
    await navigator.serviceWorker.ready;
    status.textContent =
      "Disponibile offline su questo dispositivo. Puoi aggiungerla alla schermata Home.";
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller)
          status.textContent =
            "Aggiornamento pronto. Chiudi tutte le finestre dell’app e riaprila per applicarlo.";
      });
    });
  } catch {
    status.textContent =
      "Preparazione offline non riuscita. Riprova con una connessione attiva; i dati restano sul dispositivo.";
  }
})();
