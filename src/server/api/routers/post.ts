import { z } from "zod";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { ServiceBusClient } from "@azure/service-bus";

// AWS SQS Configuration (default)
const sqs = new SQSClient({ region: "us-east-1" });
const AWS_QUEUE_URL = process.env.INTERNAL_KEYWORD_INSIGHTS_QUEUE_URL;

// Azure Service Bus Configuration (when deployed with Azure module)
const AZURE_CONNECTION_STRING = process.env.AZURE_SERVICEBUS_CONNECTION_STRING;
const AZURE_TOPIC_NAME = process.env.AZURE_SERVICEBUS_TOPIC_NAME || "keyword-insights";

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
    .input(z.object({ title: z.string(), content: z.string(), slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.create({
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

      // Send to message queue for keyword analysis
      const messagePayload = {
        title: input.title,
        content: input.content,
      };

      try {
        if (AZURE_CONNECTION_STRING) {
          // Azure Service Bus (hybrid cloud deployment)
          const serviceBusClient = new ServiceBusClient(AZURE_CONNECTION_STRING);
          const sender = serviceBusClient.createSender(AZURE_TOPIC_NAME);

          await sender.sendMessages({
            body: messagePayload,
            contentType: "application/json",
          });

          await sender.close();
          await serviceBusClient.close();

          console.log("Post sent to Azure Service Bus");
        } else if (AWS_QUEUE_URL) {
          // AWS SQS (original implementation)
          const command = new SendMessageCommand({
            QueueUrl: AWS_QUEUE_URL,
            MessageBody: JSON.stringify(messagePayload),
          });

          await sqs.send(command);
          console.log("Post sent to AWS SQS");
        } else {
          console.warn("No message queue configured - skipping keyword analysis");
        }
      } catch (err) {
        console.error("Failed to send post to message queue:", err);
        // Don't fail the post creation if message queue fails
      }

      return post;
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