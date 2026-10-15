import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer, request } from "node:http";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { createAdminApi } from "../admin-api.mjs";

test("Administration : authentification, origine, CSRF, persistance, déconnexion et limitation des tentatives", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "iq-admin-test-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const password = randomBytes(24).toString("hex");
  let api = await createAdminApi({ dataDir: dir, password });
  const server = createServer((req, res) =>
    api.handle(req, res, new URL(req.url, "http://localhost").pathname),
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const port = server.address().port;
  function call(route, method = "GET", data, headers = {}) {
    return new Promise((resolve, reject) => {
      const req = request(
        {
          host: "127.0.0.1",
          port,
          path: route,
          method,
          headers: {
            Origin: `http://127.0.0.1:${port}`,
            ...(data !== undefined
              ? { "Content-Type": "application/json" }
              : {}),
            ...headers,
          },
        },
        (res) => {
          const chunks = [];
          res.on("data", (b) => chunks.push(b));
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: JSON.parse(Buffer.concat(chunks).toString()),
            }),
          );
        },
      );
      req.on("error", reject);
      if (data !== undefined) req.write(JSON.stringify(data));
      req.end();
    });
  }
  assert.equal((await call("/api/settings")).body.showPrices, true);
  assert.equal(
    (await call("/api/admin/settings", "PATCH", { showPrices: false })).status,
    401,
  );
  assert.equal(
    (
      await call(
        "/api/admin/login",
        "POST",
        { password },
        { Origin: "https://example.invalid" },
      )
    ).status,
    403,
  );
  const login = await call("/api/admin/login", "POST", { password });
  assert.equal(login.status, 200);
  const cookie = login.headers["set-cookie"][0].split(";")[0];
  assert.match(login.headers["set-cookie"][0], /HttpOnly/);
  assert.match(login.headers["set-cookie"][0], /SameSite=Strict/);
  const auth = { Cookie: cookie, "X-CSRF-Token": login.body.csrfToken };
  assert.equal(
    (await call("/api/admin/session", "GET", undefined, { Cookie: cookie }))
      .body.authenticated,
    true,
  );
  assert.equal(
    (
      await call(
        "/api/admin/settings",
        "PATCH",
        { showPrices: false },
        { Cookie: cookie },
      )
    ).status,
    403,
  );
  assert.equal(
    (await call("/api/admin/settings", "PATCH", { showPrices: "false" }, auth))
      .status,
    400,
  );
  assert.equal(
    (
      await call(
        "/api/admin/settings",
        "PATCH",
        { showPrices: false, padding: "x".repeat(5000) },
        auth,
      )
    ).status,
    413,
  );
  const saved = await call(
    "/api/admin/settings",
    "PATCH",
    { showPrices: false },
    auth,
  );
  assert.equal(saved.status, 200);
  const publicSettings = await call("/api/settings");
  assert.equal(publicSettings.body.showPrices, false);
  assert.equal(publicSettings.headers["cache-control"], "no-store");
  assert.equal((await call("/api/admin/logout", "POST", {}, auth)).status, 200);
  assert.equal(
    (await call("/api/admin/settings", "PATCH", { showPrices: true }, auth))
      .status,
    401,
  );
  // A new API instance reads the persisted setting and invalidates prior sessions.
  api = await createAdminApi({ dataDir: dir, password });
  assert.equal((await call("/api/settings")).body.showPrices, false);
  const failures = await Promise.all(
    Array.from({ length: 5 }, () =>
      call("/api/admin/login", "POST", { password: "invalid-password" }),
    ),
  );
  assert.deepEqual(
    failures.map((r) => r.status),
    [401, 401, 401, 401, 401],
  );
  assert.equal(
    (await call("/api/admin/login", "POST", { password })).status,
    429,
  );
});

test("Aucun accès administrateur par défaut ; un mot de passe trop court est refusé", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "iq-admin-disabled-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await assert.rejects(
    () => createAdminApi({ dataDir: dir, password: "short" }),
    /12/,
  );
  const api = await createAdminApi({ dataDir: dir });
  const server = createServer((req, res) =>
    api.handle(req, res, new URL(req.url, "http://localhost").pathname),
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/admin/session`,
  );
  assert.equal((await response.json()).configured, false);
});
