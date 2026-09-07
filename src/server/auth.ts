import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { env } from "~/env.mjs";
import { authConfig } from "~/server/auth.config";
import { prisma } from "~/server/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "email and password",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "alice.smith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (
          !email ||
          !password ||
          typeof email !== "string" ||
          typeof password !== "string"
        ) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
          },
        });

        if (!user?.password) {
          console.log("User not found or missing password:", email);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          console.log("Invalid password for user:", email);
          return null;
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
});
