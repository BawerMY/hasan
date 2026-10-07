const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);

  if (url === "/" || url === "/index.html") {
    return fs.readFile(path.join(ROOT, "index.html"), (err, data) => {
      if (err) return send(res, 500, "Sunucu hatası");
      send(res, 200, data, MIME[".html"]);
    });
  }

  if (url.startsWith("/public/")) {
    const filePath = path.normalize(path.join(PUBLIC_DIR, url.slice("/public/".length)));
    // Prevent path traversal outside public/
    if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, "Yasak");

    return fs.readFile(filePath, (err, data) => {
      if (err) return send(res, 404, "Bulunamadı");
      const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "public, max-age=86400" });
      res.end(data);
    });
  }

  send(res, 404, "Bulunamadı");
});

server.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
