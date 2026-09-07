import { PrismaClient } from "~/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: pg.Pool | undefined;
};

function createPgPool(connectionString: string) {
  const url = new URL(connectionString);
  const schema = url.searchParams.get("schema") ?? "public";
  url.searchParams.delete("schema");

  const pool = new pg.Pool({ connectionString: url.toString() });
  pool.on("connect", (client) => {
    void client.query(`SET search_path TO "${schema}"`);
  });
  return pool;
}

const pool = globalForPrisma.pgPool ?? createPgPool(env.DATABASE_URL);
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pool;
}
