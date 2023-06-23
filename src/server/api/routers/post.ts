import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getPosts: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany({
      include: {
        author: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getPostBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.post.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          comments: {
            include: {
              author: true,
            },
          },
          author: true,
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
      });
    }),

  createPost: protectedProcedure
    .input(
      z.object({ title: z.string(), content: z.string(), slug: z.string() })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          slug: input.slug,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),

  addVote: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(({ ctx, input }) => {
      console.log(ctx.session.user);
      return ctx.prisma.votesOnPosts.create({
        data: {
          post: {
            connect: {
              id: input.postId,
            },
          },
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),

  removeVote: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.votesOnPosts.deleteMany({
        where: {
          postId: input.postId,
          userId: ctx.session.user.id,
        },
      });
    }),

  // check if user has voted on post
  hasVoted: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.votesOnPosts.count({
        where: {
          userId: ctx.session.user.id,
          postId: input.postId,
        },
      });
    }),
});
