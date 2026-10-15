import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { request } from "node:http";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { brotliDecompressSync, gunzipSync } from "node:zlib";

test("Le serveur compresse les textes, valide le cache et sert les logos sans exposer les sources internes", async (t) => {
  const child = spawn(
    process.execPath,
    [new URL("../server.mjs", import.meta.url).pathname],
    {
      env: { ...process.env, PORT: "0", HOST: "127.0.0.1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  t.after(async () => {
    child.kill();
    await once(child, "exit");
  });
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Serveur non démarré")),
      5000,
    );
    child.once("error", reject);
    child.stdout.on("data", (data) => {
      const m = String(data).match(/port (\d+)/);
      if (m) {
        clearTimeout(timer);
        resolve(Number(m[1]));
      }
    });
  });
  function get(path, headers = {}, method = "GET") {
    return new Promise((resolve, reject) => {
      const req = request(
        { hostname: "127.0.0.1", port, path, headers, method },
        (res) => {
          const chunks = [];
          res.on("data", (d) => chunks.push(d));
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: Buffer.concat(chunks),
            }),
          );
        },
      );
      req.on("error", reject);
      req.end();
    });
  }
  const expected = readFileSync(new URL("../style.css", import.meta.url));
  for (const [encoding, decode] of [
    ["br", brotliDecompressSync],
    ["gzip", gunzipSync],
  ]) {
    const response = await get("/style.css", { "accept-encoding": encoding });
    assert.equal(response.status, 200);
    assert.equal(response.headers["content-encoding"], encoding);
    assert.deepEqual(decode(response.body), expected);
    assert.ok(response.body.length < expected.length * 0.5);
    const cached = await get("/style.css", {
      "accept-encoding": encoding,
      "if-none-match": response.headers.etag,
    });
    assert.equal(cached.status, 304);
    assert.equal(cached.body.length, 0);
    const head = await get(
      "/style.css",
      { "accept-encoding": encoding },
      "HEAD",
    );
    assert.equal(head.body.length, 0);
    assert.equal(Number(head.headers["content-length"]), response.body.length);
  }
  const plain = await get("/style.css", {
    "accept-encoding": "gzip;q=0, br;q=0",
  });
  assert.equal(plain.headers["content-encoding"], undefined);
  assert.deepEqual(plain.body, expected);
  for (const brand of ["anydesk", "teamviewer"]) {
    const logo = await get(`/assets/brands/${brand}.svg`);
    assert.equal(logo.status, 200);
    assert.equal(logo.headers["content-type"], "image/svg+xml");
    assert.match(logo.body.toString(), /<svg/);
  }
  assert.equal((await get("/catalogue.js")).status, 200);
  assert.equal((await get("/.git/config")).status, 404);
  assert.equal((await get("/test/server.test.mjs")).status, 404);
  assert.equal((await get("/", {}, "POST")).status, 405);
});
