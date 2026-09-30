/* Only the current play is stored, entirely on this device. */
const LocalProject = (() => {
  let database;
  function open() {
    if (!database)
      database = new Promise((resolve, reject) => {
        const request = indexedDB.open("courtboard-local", 1);
        request.onupgradeneeded = () =>
          request.result.createObjectStore("projects");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("Archivio locale occupato"));
      });
    return database;
  }
  async function load() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("projects", "readonly");
      const request = transaction.objectStore("projects").get("current");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function save(project) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("projects", "readwrite");
      transaction.objectStore("projects").put(project, "current");
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(transaction.error || new Error("Salvataggio interrotto"));
    });
  }
  return { load, save };
})();
