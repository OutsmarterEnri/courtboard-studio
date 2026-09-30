const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../dist");
const files = {
  "/": "index.html",
  "/index.html": "index.html",
  "/app.js": "app.js",
  "/geometry.js": "geometry.js",
  "/styles.css": "styles.css",
  "/local-store.js": "local-store.js",
  "/offline.js": "offline.js",
  "/sw.js": "sw.js",
  "/manifest.webmanifest": "manifest.webmanifest",
  "/icons/icon-192.png": "icons/icon-192.png",
  "/icons/icon-512.png": "icons/icon-512.png",
  "/icons/apple-touch-icon.png": "icons/apple-touch-icon.png",
};
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};
const handler = (req, res) => {
  const file = files[new URL(req.url, "http://localhost").pathname];
  if (!file || !["GET", "HEAD"].includes(req.method)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, {
    "Content-Type": types[path.extname(file)],
    "Cache-Control": "no-store",
  });
  if (req.method === "HEAD") res.end();
  else fs.createReadStream(path.join(root, file)).pipe(res);
};
const useTLS = Boolean(process.env.TLS_CERT && process.env.TLS_KEY);
const server = useTLS
  ? require("node:https").createServer(
      {
        cert: fs.readFileSync(process.env.TLS_CERT),
        key: fs.readFileSync(process.env.TLS_KEY),
      },
      handler,
    )
  : http.createServer(handler);
server.listen(
  Number(process.env.PORT || 8765),
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      `Courtboard: ${useTLS ? "https" : "http"}://${process.env.HOST || "127.0.0.1"}:${server.address().port}`,
    ),
);
