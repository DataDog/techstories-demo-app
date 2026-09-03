import NextAuth from "next-auth";

import { authConfig } from "~/server/auth.config";

const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = { matcher: ["/posts/new"] };
