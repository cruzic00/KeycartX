// api/_dev/server.ts
// LOCAL DEV ONLY. Emulates just enough of the Vercel Node serverless-function
// runtime (file-based routing under /api, req.query/body, res.status/json)
// to run every api/**.ts handler unchanged with `npm run dev:api`. Vercel
// itself provides the real thing at deploy time — this file never ships.
import http from "http";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { parseCookie as parseCookieHeader } from "cookie";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(API_ROOT, "..");
const PORT = 3001;

// Next.js loads .env.local (highest priority) then .env; mirror that here
// so the ported routes see the same values they did under `next dev`.
for (const file of [".env", ".env.local"]) {
  const p = path.join(REPO_ROOT, file);
  if (existsSync(p)) dotenv.config({ path: p, override: true });
}

type Route = { filePath: string; segments: string[] };

function walk(dir: string, base: string[] = []): Route[] {
  const routes: Route[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "_dev" || entry === "_lib") continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      routes.push(...walk(full, [...base, entry]));
      continue;
    }
    if (!entry.endsWith(".ts")) continue;
    const name = entry.replace(/\.ts$/, "");
    const segments = name === "index" ? base : [...base, name];
    routes.push({ filePath: full, segments });
  }
  return routes;
}

const routes = walk(API_ROOT);

function matchRoute(pathname: string): { route: Route; params: Record<string, string> } | null {
  const parts = pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  for (const route of routes) {
    if (route.segments.length !== parts.length) continue;
    const params: Record<string, string> = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      const seg = route.segments[i];
      if (seg.startsWith("[") && seg.endsWith("]")) {
        params[seg.slice(1, -1)] = decodeURIComponent(parts[i]);
      } else if (seg !== parts[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { route, params };
  }
  return null;
}

function readRawBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function enhanceResponse(res: http.ServerResponse) {
  const r: any = res;
  r.status = (code: number) => {
    res.statusCode = code;
    return r;
  };
  r.json = (body: unknown) => {
    if (!res.getHeader("Content-Type")) res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
    return r;
  };
  r.send = (body: unknown) => {
    res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
    return r;
  };
  return r;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const match = matchRoute(url.pathname);

  const enhanced = enhanceResponse(res);

  if (!match) {
    enhanced.status(404).json({ error: "Not found" });
    return;
  }

  try {
    const mod = await import(pathToFileURL(match.route.filePath).href + `?t=${Date.now()}`);
    const handler = mod.default;
    const bodyParserDisabled = mod.config?.api?.bodyParser === false;

    const query: Record<string, string | string[]> = { ...match.params };
    for (const [key, value] of url.searchParams.entries()) {
      query[key] = value;
    }

    const cookies = req.headers.cookie ? parseCookieHeader(req.headers.cookie) : {};

    let body: any = undefined;
    if (!bodyParserDisabled && req.method !== "GET" && req.method !== "HEAD") {
      const raw = await readRawBody(req);
      const contentType = req.headers["content-type"] ?? "";
      if (raw.length && contentType.includes("application/json")) {
        try {
          body = JSON.parse(raw.toString("utf8"));
        } catch {
          body = undefined;
        }
      }
    }

    const vercelReq: any = req;
    vercelReq.query = query;
    vercelReq.cookies = cookies;
    vercelReq.body = body;

    if (bodyParserDisabled) {
      // formidable (used by the upload route) reads the raw request stream
      // itself, so the body must NOT have been consumed above.
    }

    await handler(vercelReq, enhanced);
  } catch (err) {
    console.error(`[dev-api] ${req.method} ${url.pathname} failed:`, err);
    if (!res.headersSent) {
      enhanced.status(500).json({ error: "Internal dev-server error" });
    }
  }
});

server.listen(PORT, () => {
  console.log(`[dev-api] listening on http://localhost:${PORT} (${routes.length} routes)`);
});
