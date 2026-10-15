import {
  randomBytes,
  scrypt as scryptCallback,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";
const scrypt = promisify(scryptCallback);
export async function createAdminApi({
  dataDir,
  password = "",
  publicOrigin = "",
}) {
  if (password && (password.length < 12 || password.length > 256))
    throw new Error("ADMIN_PASSWORD doit contenir entre 12 et 256 caractères.");
  const expectedOrigin = publicOrigin ? new URL(publicOrigin).origin : null;
  if (expectedOrigin && !/^https?:\/\//.test(expectedOrigin))
    throw new Error("PUBLIC_ORIGIN doit être une origine HTTP(S).");
  const filename = path.join(dataDir, "settings.json");
  let settings = { showPrices: true };
  try {
    const saved = JSON.parse(await readFile(filename, "utf8"));
    if (typeof saved.showPrices !== "boolean")
      throw new Error("Réglages invalides");
    settings = { showPrices: saved.showPrices };
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const salt = randomBytes(16),
    passwordHash = password ? scryptSync(password, salt, 64) : null;
  const sessions = new Map(),
    attempts = new Map();
  let writes = Promise.resolve();
  const lifetime = 8 * 60 * 60 * 1000;
  const equal = (a, b) => {
    const aa = Buffer.from(String(a)),
      bb = Buffer.from(String(b));
    return aa.length === bb.length && timingSafeEqual(aa, bb);
  };
  function json(res, status, value, extra = {}) {
    const body = JSON.stringify(value);
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    });
    res.end(body);
  }
  function session(req) {
    const token = String(req.headers.cookie || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("iq_admin="))
      ?.slice(9);
    const found = token && sessions.get(token);
    if (found && found.expires > Date.now()) return { ...found, token };
    if (token) sessions.delete(token);
    return null;
  }
  function cookie(req, token, maxAge = 28800) {
    const secure =
      expectedOrigin?.startsWith("https:") ||
      req.socket.encrypted ||
      req.headers["x-forwarded-proto"] === "https";
    return `iq_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
  }
  async function body(req) {
    if (
      !String(req.headers["content-type"] || "").startsWith("application/json")
    )
      throw Object.assign(new Error("Corps JSON requis."), { status: 415 });
    const chunks = [];
    let size = 0;
    for await (const chunk of req.iterator({ destroyOnReturn: false })) {
      size += chunk.length;
      if (size > 4096) {
        req.resume();
        throw Object.assign(new Error("Requête trop volumineuse."), {
          status: 413,
        });
      }
      chunks.push(chunk);
    }
    try {
      const value = JSON.parse(Buffer.concat(chunks).toString());
      if (!value || typeof value !== "object" || Array.isArray(value))
        throw new Error("Objet requis");
      return value;
    } catch {
      throw Object.assign(new Error("JSON invalide."), { status: 400 });
    }
  }
  function validOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return req.headers["sec-fetch-site"] !== "cross-site";
    if (expectedOrigin) return origin === expectedOrigin;
    try {
      return new URL(origin).host === req.headers.host;
    } catch {
      return false;
    }
  }
  async function handle(req, res, pathname) {
    if (!pathname.startsWith("/api/")) return false;
    try {
      if (pathname === "/api/settings" && req.method === "GET") {
        json(res, 200, settings);
        return true;
      }
      const current = session(req);
      if (pathname === "/api/admin/session" && req.method === "GET") {
        json(res, 200, {
          configured: Boolean(passwordHash),
          authenticated: Boolean(current),
          ...(current ? { csrfToken: current.csrf } : {}),
        });
        return true;
      }
      if (!validOrigin(req)) {
        json(res, 403, { error: "Origine non autorisée." });
        return true;
      }
      if (pathname === "/api/admin/login" && req.method === "POST") {
        if (!passwordHash) {
          json(res, 503, {
            error: "Administration non activée sur cet hébergement.",
          });
          return true;
        }
        const ip = req.socket.remoteAddress || "unknown",
          now = Date.now();
        for (const [key, entry] of attempts)
          if (entry.until <= now) attempts.delete(key);
        for (const [token, value] of sessions)
          if (value.expires <= now) sessions.delete(token);
        const failed = attempts.get(ip);
        if (failed?.count >= 5 && failed.until > now) {
          json(
            res,
            429,
            { error: "Trop de tentatives. Réessayez dans 15 minutes." },
            { "Retry-After": "900" },
          );
          return true;
        }
        attempts.set(ip, {
          count: (failed?.count || 0) + 1,
          until: failed?.until || now + 900000,
        });
        const input = await body(req);
        const candidate =
          typeof input.password === "string" && input.password.length <= 256
            ? input.password
            : "";
        const hash = await scrypt(candidate, salt, 64);
        if (!timingSafeEqual(passwordHash, hash)) {
          json(res, 401, { error: "Mot de passe incorrect." });
          return true;
        }
        attempts.delete(ip);
        if (current) sessions.delete(current.token);
        const token = randomBytes(32).toString("hex"),
          csrf = randomBytes(32).toString("hex");
        sessions.set(token, { csrf, expires: Date.now() + lifetime });
        json(
          res,
          200,
          { authenticated: true, csrfToken: csrf },
          { "Set-Cookie": cookie(req, token) },
        );
        return true;
      }
      if (
        (pathname === "/api/admin/settings" && req.method === "PATCH") ||
        (pathname === "/api/admin/logout" && req.method === "POST")
      ) {
        if (!current) {
          json(res, 401, { error: "Connexion administrateur requise." });
          return true;
        }
        if (!equal(req.headers["x-csrf-token"] || "", current.csrf)) {
          json(res, 403, { error: "Session invalide. Reconnectez-vous." });
          return true;
        }
        if (pathname.endsWith("/logout")) {
          sessions.delete(current.token);
          json(
            res,
            200,
            { authenticated: false },
            { "Set-Cookie": cookie(req, "", 0) },
          );
          return true;
        }
        const input = await body(req);
        if (typeof input.showPrices !== "boolean") {
          json(res, 400, { error: "Le réglage doit être un booléen." });
          return true;
        }
        const next = { showPrices: input.showPrices };
        const write = writes
          .catch(() => {})
          .then(async () => {
            await mkdir(dataDir, { recursive: true, mode: 0o700 });
            const temporary =
              filename + "." + randomBytes(8).toString("hex") + ".tmp";
            await writeFile(temporary, JSON.stringify(next) + "\n", {
              mode: 0o600,
            });
            await rename(temporary, filename);
            settings = next;
          });
        writes = write;
        await write;
        json(res, 200, next);
        return true;
      }
      json(res, 404, { error: "Accès introuvable." });
      return true;
    } catch (error) {
      json(res, error.status || 500, {
        error: error.status
          ? error.message
          : "Impossible d’enregistrer les réglages. Réessayez.",
      });
      return true;
    }
  }
  return { handle };
}
