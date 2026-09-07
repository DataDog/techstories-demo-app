import { PrismaClient } from "~/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

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

export function createTestPrismaClient() {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://user:password@127.0.0.1:5432/db?schema=techstories";
  const pool = createPgPool(connectionString);
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}
