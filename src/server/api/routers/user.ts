import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  // examples
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getUsers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getUsersPosts: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: {
        posts: true,
      },
    });
  }),

  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
        include: {
          posts: true,
          comments: true,
        },
      });
    }),

  createUser: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      });
    }),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const exists = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hashedPassword,
        },
      });

      return { success: true };
    }),
});
