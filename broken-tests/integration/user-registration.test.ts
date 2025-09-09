/**
 * @jest-environment node
 */

import { PrismaClient, type Post } from "@prisma/client";
import bcrypt from "bcrypt";

describe("User Registration Integration", () => {
  const prisma = new PrismaClient();
  const testEmail = "test.signup@example.com";

  beforeEach(async () => {
    // Clean up any existing test user before each test
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await prisma.$disconnect();
  });

  it("should successfully create a new user", async () => {
    const password = "testPassword123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test User",
        password: hashedPassword,
      },
    });

    expect(user).not.toBeNull();
    expect(user.name).toBe("Test User");
    expect(user.email).toBe(testEmail);

    // Verify password was hashed correctly
    const isPasswordValid = await bcrypt.compare(password, user.password);
    expect(isPasswordValid).toBe(true);
  });

  it("should fail to create user with duplicate email", async () => {
    // First create a user
    const password = "testPassword123";
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test User",
        password: hashedPassword,
      },
    });

    // Try to create another user with the same email
    await expect(
      prisma.user.create({
        data: {
          email: testEmail,
          name: "Another User",
          password: hashedPassword,
        },
      })
    ).rejects.toThrow();
  });

  it("should create user with posts and comments", async () => {
    const password = "testPassword123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test User",
        password: hashedPassword,
        posts: {
          create: [
            {
              title: "Test Post",
              content: "Test Content",
              slug: "test-post",
            },
          ],
        },
      },
      include: {
        posts: true,
      },
    });

    expect(user.posts).toHaveLength(1);
    const post = user.posts[0] as Post;
    expect(post.title).toBe("Test Post");

    // Add a comment to the post
    const comment = await prisma.comment.create({
      data: {
        content: "Test Comment",
        postId: post.id,
        authorId: user.id,
      },
    });

    expect(comment.content).toBe("Test Comment");
    expect(comment.authorId).toBe(user.id);
  });

  it("should handle user deletion cascade", async () => {
    const password = "testPassword123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with post and comment
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test User",
        password: hashedPassword,
        posts: {
          create: [
            {
              title: "Test Post",
              content: "Test Content",
              slug: "test-post",
            },
          ],
        },
      },
      include: {
        posts: true,
      },
    });

    expect(user.posts).toHaveLength(1);
    const post = user.posts[0] as Post;

    await prisma.comment.create({
      data: {
        content: "Test Comment",
        postId: post.id,
        authorId: user.id,
      },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Verify cascade deletion
    const deletedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(deletedUser).toBeNull();

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
    });
    expect(posts).toHaveLength(0);

    const comments = await prisma.comment.findMany({
      where: { authorId: user.id },
    });
    expect(comments).toHaveLength(0);
  });

  it("should handle concurrent user operations", async () => {
    const password = "testPassword123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create initial user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test User",
        password: hashedPassword,
      },
    });

    // Simulate race condition with random delays
    const randomDelay = () =>
      new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * 100))
      );

    // Try to perform multiple operations concurrently
    const operations = [
      // Operation 1: Update user name
      (async () => {
        await randomDelay();
        return prisma.user.update({
          where: { id: user.id },
          data: { name: "Updated Name 1" },
        });
      })(),
      // Operation 2: Update user name again
      (async () => {
        await randomDelay();
        return prisma.user.update({
          where: { id: user.id },
          data: { name: "Updated Name 2" },
        });
      })(),
      // Operation 3: Create a post
      (async () => {
        await randomDelay();
        return prisma.post.create({
          data: {
            title: "Concurrent Post",
            content: "Test Content",
            slug: "concurrent-post",
            authorId: user.id,
          },
        });
      })(),
    ];

    // Execute all operations concurrently
    const results = await Promise.all(operations);

    // This assertion will randomly fail because the final name
    // depends on which update operation completed last
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser?.name).toBe("Updated Name 1"); // This will fail randomly
  });
});
