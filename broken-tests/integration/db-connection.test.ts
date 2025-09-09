/**
 * @jest-environment node
 */

import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

describe("Database Integration", () => {
  const prisma = new PrismaClient();
  const testEmail = "testuser@datadog-demo.com";

  // Helper function to generate a random email
  const generateEmail = (prefix: string, domain: string): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}@${domain}`;
  };

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

  test("can create a new user in the database", async () => {
    const newUserEmail = "newuser@datadog-demo.com";
    const newUser = {
      name: "New Test User",
      email: newUserEmail,
      password: "testpassword123",
    };

    // Create the user
    const createdUser = await prisma.user.create({
      data: newUser,
    });

    // Verify the user was created with correct data
    expect(createdUser).toMatchObject({
      name: newUser.name,
      email: newUser.email,
    });

    // Verify we can fetch the user
    const fetchedUser = await prisma.user.findUnique({
      where: { email: newUserEmail },
    });
    expect(fetchedUser).not.toBeNull();
    expect(fetchedUser?.name).toBe(newUser.name);

    // Clean up the test user
    await prisma.user.delete({
      where: { email: newUserEmail },
    });
  });

  test("fails to create user with duplicate email", async () => {
    const duplicateUser = {
      name: "Another User",
      email: testEmail, // Using the email that was created in beforeAll()
      password: "password123",
    };

    // Attempt to create user with duplicate email
    await expect(
      prisma.user.create({
        data: duplicateUser,
      })
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });

  test("can fetch a user from the database", async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(user).not.toBeNull();
    expect(user && user.name).toBe("Datadog Demo");
  });

  test("should handleemail uniqueness race condition", async () => {
    const baseEmail = generateEmail("racetest", "datadog-demo.com");

    // Simulate race condition by trying to create two users with same email
    // simultaneously
    const shouldCreateSimultaneously = Math.random() > 0.6;

    const userData = {
      name: "Race Test User",
      email: baseEmail,
      password: "password123",
    };

    if (shouldCreateSimultaneously) {
      // Try to create two users simultaneously
      try {
        await Promise.race([
          prisma.user.create({ data: userData }),
          prisma.user.create({ data: userData }),
        ]);

        // If we get here, something went wrong with our uniqueness constraint
        throw new Error("Both users were created with the same email!");
      } catch (error) {
        // We expect an error about unique constraint
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe(
          "P2002"
        );
      }
    } else {
      // Create users sequentially - this should work
      const firstUser = await prisma.user.create({ data: userData });
      expect(firstUser.email).toBe(baseEmail);
    }

    // Clean up
    await prisma.user.deleteMany({ where: { email: baseEmail } });
  });
});
