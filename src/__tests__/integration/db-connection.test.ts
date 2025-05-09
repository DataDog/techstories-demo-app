import { PrismaClient } from "@prisma/client";

describe("Database Integration", () => {
  const prisma = new PrismaClient();
  const testEmail = "testuser@datadog-demo.com";

  beforeAll(async () => {
    // Seed a user
    await prisma.user.create({
      data: { name: "Datadog Demo", email: testEmail, password: "password" },
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
    expect(user && user.name).toBe("Datadog Demo");
  });

  // Flaky: sometimes times out waiting for user (simulates network slowness)
  test("flaky: sometimes times out waiting for user", async () => {
    const shouldTimeout = Math.random() > 0.5;
    const fetchUser = prisma.user.findUnique({ where: { email: testEmail } });
    if (shouldTimeout) {
      await expect(
        Promise.race([
          fetchUser,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 100)
          ),
        ])
      ).rejects.toThrow("Timeout");
    } else {
      const user = await fetchUser;
      expect(user).not.toBeNull();
    }
  });

  // Flaky: sometimes user is not found due to race condition
  test("flaky: sometimes user is not found due to race condition", async () => {
    const shouldDeleteUser = Math.random() > 0.5;
    if (shouldDeleteUser) {
      await prisma.user.deleteMany({ where: { email: testEmail } });
    }
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(user).not.toBeNull(); // Will fail if user was deleted
    // Optionally, re-seed for other tests
    if (shouldDeleteUser) {
      await prisma.user.create({
        data: { name: "Datadog Demo", email: testEmail },
      });
    }
  });
});
