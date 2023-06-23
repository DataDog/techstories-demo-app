import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
  getCommentsByPostId: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.comment.findMany({
        where: {
          postId: input.postId,
        },
        include: {
          post: true,
          author: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
      });
    }),

  createComment: protectedProcedure
    .input(z.object({ postId: z.string(), content: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.comment.create({
        data: {
          content: input.content,
          post: {
            connect: {
              id: input.postId,
            },
          },
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),

  addVote: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.votesOnComments.create({
        data: {
          comment: {
            connect: {
              id: input.commentId,
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
    .input(z.object({ commentId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.votesOnComments.deleteMany({
        where: {
          commentId: input.commentId,
          userId: ctx.session.user.id,
        },
      });
    }),

  hasVoted: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.votesOnComments.count({
        where: {
          commentId: input.commentId,
          userId: ctx.session.user.id,
        },
      });
    }),
});
