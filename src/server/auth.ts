import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { randomUUID, randomBytes } from "crypto";
import bcrypt from "bcrypt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 2 * 24 * 60 * 60, // 2 days
    updateAge: 24 * 60 * 60, // 24 hours
    generateSessionToken: () => {
      return randomUUID() ?? randomBytes(32).toString("hex");
    },
  },

  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "email and password",
      credentials: {
        email: {
          label: "Email",
          type: "string",
          placeholder: "alice.smith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials = { email: "", password: "" }, req) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        const user = (await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
          },
        })) as {
          id: string;
          email: string;
          name: string;
          password: string;
        } | null;

        if (!user || !user.password) {
          console.log("User not found or missing password:", credentials.email);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          console.log("Invalid password for user:", credentials.email);
          return null;
        }

        // Return user object without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
