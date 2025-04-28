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
import bcrypt from 'bcrypt';

// initialize the Datadog tracer
const tracer = require('dd-trace').init();

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
  debug: true,
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
        console.log("Got user", user);
        console.log(user);

        // Trace successful user authentication event before returning token
        tracer.appsec.trackUserLoginSuccessEvent({id: user.id, email: user.email, name: user.name}) 
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
        let userExists = false;

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // Check if user is on ASM Denylist
        console.log(`Checking if user ${user?.id} is blocked`);
        
        if (tracer.appsec.isUserBlocked({id: user?.id, email: credentials.email})) { 
          console.log(`User ${user?.id} is blocked`);
          return tracer.appsec.blockRequest(); // Send blocking response 
        }

        // Compare the provided password with the hashed password in the database  
        if (user && user.password) {
          userExists = true;
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (isValidPassword) {
            console.log("found user", user);
            return user;
          }
        }

        tracer.appsec.trackUserLoginFailureEvent(credentials.email, userExists)

        // Return null if user data could not be retrieved
        return null;
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
