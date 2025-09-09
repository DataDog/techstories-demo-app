/**
 * @jest-environment node
 */

import { PrismaClient, VotesOnPosts, Prisma } from "@prisma/client";

// Flaky integration tests for Post and Comment models

describe("Post and Comment Integration", () => {
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

  test("can create a post", async () => {
    const shouldTimeout = Math.random() > 0.5;
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

  test("can create a comment", async () => {
    // Ensure post exists
    if (!testPostId) {
      const post = await prisma.post.create({
        data: {
          title: "Test Post",
          content: "Test post for comments.",
          slug: `test-post-${Date.now()}`,
          authorId: testUserId,
        },
      });
      testPostId = post.id;
    }

    const comment = await prisma.comment.create({
      data: {
        content: "Test comment.",
        postId: testPostId,
        authorId: testUserId,
      },
    });
    testCommentId = comment.id;
    expect(comment).not.toBeNull();
  });

  test("can vote on a post", async () => {
    // Ensure post exists
    if (!testPostId) {
      const post = await prisma.post.create({
        data: {
          title: "Test Post",
          content: "Test post for voting.",
          slug: `test-post-${Date.now()}`,
          authorId: testUserId,
        },
      });
      testPostId = post.id;
    }

    // Create multiple vote operations simultaneously
    const votePromises = Array(3)
      .fill(null)
      .map(
        () =>
          prisma.votesOnPosts
            .create({
              data: {
                postId: testPostId,
                userId: testUserId,
              },
            })
            .catch((e): null => null) // Type-safe error handling
      );

    const results = await Promise.all(votePromises);
    const successfulVotes = results.filter(
      (vote): vote is VotesOnPosts => vote !== null
    );
    expect(successfulVotes).toHaveLength(1);
  });

  test("can vote on a comment", async () => {
    // Ensure comment exists
    if (!testCommentId) {
      const comment = await prisma.comment.create({
        data: {
          content: "Test comment.",
          postId: testPostId,
          authorId: testUserId,
        },
      });
      testCommentId = comment.id;
    }

    const vote = await prisma.votesOnComments.create({
      data: {
        commentId: testCommentId,
        userId: testUserId,
      },
    });
    expect(vote).not.toBeNull();
  });

  test("fails with invalid comment data", async () => {
    // Try to create a comment with invalid data
    const invalidData: Prisma.CommentCreateInput = {
      content: undefined as unknown as string, // TypeScript-safe way to create invalid data
      post: {
        connect: { id: testPostId },
      },
      author: {
        connect: { id: testUserId },
      },
    };

    const invalidCommentPromise = prisma.comment.create({
      data: invalidData,
    });

    await expect(invalidCommentPromise).rejects.toThrow();
  });
});
