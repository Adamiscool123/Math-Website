import { Pool, neonConfig } from "@neondatabase/serverless";
import type { QueryResultRow } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

declare global {
  var matheyePool: Pool | undefined;
}

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for database access.");
  }
  return connectionString;
}

export function getPool() {
  if (!globalThis.matheyePool) {
    globalThis.matheyePool = new Pool({
      connectionString: getConnectionString(),
    });
  }
  return globalThis.matheyePool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  const result = await getPool().query<T>(text, values);
  return result;
}
