import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const appDirectory = path.resolve(scriptDirectory, "..");
const defaultApiDirectory = path.resolve(
  appDirectory,
  "../../..",
  "core-ecommerce-api",
);
const apiDirectory = path.resolve(process.argv[2] ?? defaultApiDirectory);
const apiEnvironmentPath = path.join(apiDirectory, ".env");
const appEnvironmentPath = path.join(appDirectory, ".env.local");

function parseEnvironment(contents) {
  const values = new Map();
  for (const rawLine of contents.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values.set(key, value);
  }
  return values;
}

function replaceEnvironmentValue(contents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&")}=.*$`, "mu");
  if (pattern.test(contents)) return contents.replace(pattern, line);
  return `${contents.trimEnd()}\n${line}\n`;
}

async function jsonResponse(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.error_message ||
      payload?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

const [apiEnvironmentContents, appEnvironmentContents] = await Promise.all([
  readFile(apiEnvironmentPath, "utf8"),
  readFile(appEnvironmentPath, "utf8"),
]);
const apiEnvironment = parseEnvironment(apiEnvironmentContents);
const appEnvironment = parseEnvironment(appEnvironmentContents);

const email = apiEnvironment.get("SEED_ADMIN_EMAIL") || "admin@example.com";
const password = apiEnvironment.get("SEED_ADMIN_PASSWORD") || "password";
const apiBaseUrl =
  appEnvironment.get("API_BASE_URL") ||
  "http://127.0.0.1:8000/api/v1/admin";

const login = await jsonResponse(
  await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }),
);
const token = login?.data?.item?.access_token;
if (typeof token !== "string" || token.length === 0) {
  throw new Error("The commerce API login response did not contain an access token.");
}

const catalog = await jsonResponse(
  await fetch(`${apiBaseUrl}/catalog/products?per_page=1`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  }),
);

await writeFile(
  appEnvironmentPath,
  replaceEnvironmentValue(appEnvironmentContents, "ECOMMERCE_API_TOKEN", token),
  "utf8",
);

const total = catalog?.data?.meta?.total ?? 0;
console.log(
  `Connected admin-web to core-ecommerce-api. Authenticated catalog total: ${total}. Token stored in ignored .env.local.`,
);
