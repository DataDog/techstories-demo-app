import { prisma } from "~/server/db";
import users from "../../prisma/users.json";

console.log("Seeding...");

export default async function main() {
  const userPromises = users.map((user) => {
    return prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        posts: {
          create: user.posts,
        },
      },
    });
  });

  await Promise.all(userPromises);
}
