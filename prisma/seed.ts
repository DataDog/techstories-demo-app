import { prisma } from "~/server/db";
import users from "./users.json";
import bcrypt from "bcrypt";

console.log("Seeding...");

async function main() {
  // empty database before seeding (cascading delete)
  await prisma.user.deleteMany();

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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
