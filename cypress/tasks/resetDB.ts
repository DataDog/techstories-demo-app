import { prisma } from "~/server/db";

console.log("resetting database...");

export default async function main() {
  // empty database before seeding (cascading delete)
  await prisma.user.deleteMany();
}
