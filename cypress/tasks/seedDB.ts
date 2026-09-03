import { prisma } from "~/server/db";
import users from "../../prisma/users.json";
import bcrypt from "bcrypt";

console.log("Seeding...");

export default async function main() {
  const userPromises = users.map(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    return prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        posts: {
          create: user.posts,
        },
      },
    });
  });

  await Promise.all(userPromises);
}
