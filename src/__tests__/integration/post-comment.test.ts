import { PrismaClient } from "@prisma/client";

// Flaky integration tests for Post and Comment models

describe("Post and Comment Integration (Flaky)", () => {
  const prisma = new PrismaClient();
  const testUserEmail = "flakyuser@datadog-demo.com";
  let testUserId: string;
  let testPostId: string;
  let testCommentId: string;

  beforeAll(async () => {
    // Seed a user
    const user = await prisma.user.create({
      data: { name: "Flaky User", email: testUserEmail, password: "password" },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.comment.deleteMany({ where: { authorId: testUserId } });
    await prisma.post.deleteMany({ where: { authorId: testUserId } });
    await prisma.user.deleteMany({ where: { email: testUserEmail } });
    await prisma.$disconnect();
  });

  test("can create a post (flaky: random timeout)", async () => {
    const shouldTimeout = Math.random() > 0.6;
    const createPost = prisma.post.create({
      data: {
        title: "Flaky Post",
        content: "This is a flaky post.",
        slug: `flaky-post-${Date.now()}`,
        authorId: testUserId,
      },
    });
    if (shouldTimeout) {
      await expect(
        Promise.race([
          createPost,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout creating post")), 80)
          ),
        ])
      ).rejects.toThrow("Timeout creating post");
    } else {
      const post = await createPost;
      expect(post).not.toBeNull();
      testPostId = post.id;
    }
  });

  test("can create a comment (flaky: random failure)", async () => {
    // Ensure post exists
    if (!testPostId) {
      const post = await prisma.post.create({
        data: {
          title: "Backup Flaky Post",
          content: "Backup post for flaky comment.",
          slug: `backup-flaky-post-${Date.now()}`,
          authorId: testUserId,
        },
      });
      testPostId = post.id;
    }
    const shouldFail = Math.random() > 0.7;
    if (shouldFail) {
      // Simulate random DB error
      await expect(
        prisma.comment.create({
          data: {
            content: null as any, // Invalid on purpose
            postId: testPostId,
            authorId: testUserId,
          },
        })
      ).rejects.toThrow();
    } else {
      const comment = await prisma.comment.create({
        data: {
          content: "This is a flaky comment.",
          postId: testPostId,
          authorId: testUserId,
        },
      });
      expect(comment).not.toBeNull();
      testCommentId = comment.id;
    }
  });

  test("can vote on a post (flaky: race condition)", async () => {
    // Ensure post exists
    if (!testPostId) {
      const post = await prisma.post.create({
        data: {
          title: "Another Flaky Post",
          content: "Another post for voting.",
          slug: `another-flaky-post-${Date.now()}`,
          authorId: testUserId,
        },
      });
      testPostId = post.id;
    }
    const shouldDeletePost = Math.random() > 0.5;
    if (shouldDeletePost) {
      await prisma.post.delete({ where: { id: testPostId } });
    }
    const vote = await prisma.votesOnPosts
      .create({
        data: {
          postId: testPostId,
          userId: testUserId,
        },
      })
      .catch((e) => null);
    if (shouldDeletePost) {
      expect(vote).toBeNull(); // Should fail to vote if post was deleted
      // Optionally, re-seed for other tests
      const post = await prisma.post.create({
        data: {
          title: "Reseeded Flaky Post",
          content: "Reseeded post for voting.",
          slug: `reseeded-flaky-post-${Date.now()}`,
          authorId: testUserId,
        },
      });
      testPostId = post.id;
    } else {
      expect(vote).not.toBeNull();
    }
  });

  test("can vote on a comment (flaky: intermittent failure)", async () => {
    // Ensure comment exists
    if (!testCommentId) {
      const comment = await prisma.comment.create({
        data: {
          content: "Backup flaky comment.",
          postId: testPostId,
          authorId: testUserId,
        },
      });
      testCommentId = comment.id;
    }
    const shouldFail = Math.random() > 0.6;
    if (shouldFail) {
      // Simulate random error
      await expect(
        prisma.votesOnComments.create({
          data: {
            commentId: "nonexistent-id",
            userId: testUserId,
          },
        })
      ).rejects.toThrow();
    } else {
      const vote = await prisma.votesOnComments.create({
        data: {
          commentId: testCommentId,
          userId: testUserId,
        },
      });
      expect(vote).not.toBeNull();
    }
  });
});
