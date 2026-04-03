const CH_HOST = process.env.CLICKHOUSE_HOST || "clickhouse.ask.surf";
const CH_USER = process.env.CLICKHOUSE_USER || "";
const CH_PASS = process.env.CLICKHOUSE_PASSWORD || "";
const CACHE_TTL = 5 * 60 * 1000; // 5 min

function escapeString(s: string): string {
  return s
    .replace(/\\/g, "")
    .replace(/'/g, "''")
    .replace(/[\x00-\x1f\x7f]/g, "");
}

const cache = new Map<string, { data: unknown; fetchedAt: number }>();

export async function queryClickHouse<T>(
  sql: string,
  database?: string
): Promise<T[]> {
  const key = (database || "") + sql.trim();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.data as T[];
  }

  try {
    const params = new URLSearchParams({
      database: database || process.env.CLICKHOUSE_DB || "polymarket_polygon",
      user: CH_USER,
      password: CH_PASS,
    });
    const url = `https://${CH_HOST}:8443/?${params}`;
    const body = `${sql.replace(/\s+/g, " ").trim()} FORMAT JSONEachRow`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`ClickHouse HTTP ${res.status}: ${errText.slice(0, 500)}`);
      throw new Error(`Query failed (${res.status})`);
    }

    const text = await res.text();
    const rows = text
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as T);

    cache.set(key, { data: rows, fetchedAt: Date.now() });
    return rows;
  } catch (err) {
    console.error("ClickHouse query failed:", err);
    if (cached) return cached.data as T[];
    return [];
  }
}

export { escapeString };
