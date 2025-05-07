import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Database Integration", () => {
  const testEmail = "testuser@datadog-demo.com";

  beforeAll(async () => {
    // Seed a user
    await prisma.user.create({
      data: { name: "Datadog Demo", email: testEmail },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  test("can fetch a user from the database", async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Datadog Demo");
  });

  // Intentionally incorrect test: will always fail
  test("always fails: expects a user that does not exist", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "doesnotexist@datadog-demo.com" },
    });
    expect(user).not.toBeNull(); // This will always fail
    // To fix this test, expect user to be null:
    // expect(user).toBeNull();
  });
});
