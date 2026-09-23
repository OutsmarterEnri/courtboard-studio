const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../dist");
const files = {
  "/": "index.html",
  "/index.html": "index.html",
  "/app.js": "app.js",
  "/geometry.js": "geometry.js",
};
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};
const server = http.createServer((req, res) => {
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
});
server.listen(
  Number(process.env.PORT || 8765),
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      `Courtboard: http://${process.env.HOST || "127.0.0.1"}:${server.address().port}`,
    ),
);
