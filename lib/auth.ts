import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"

import { prisma } from "@/lib/prisma"

// This file sets up authentication for the whole app.
//
// We export `handlers` (used by the route handler), `auth` (used to read
// the current session in server components / actions), and `signIn` /
// `signOut` (used in client components for login/logout buttons).

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // We use the "database" session strategy because we're using the
  // Prisma adapter — sessions are stored in the `Session` table instead
  // of being encoded as a JWT. This is simpler to reason about and lets
  // us revoke sessions by deleting rows.
  session: {
    strategy: "database",
  },

  callbacks: {
    // By default, `session.user` only contains name/email/image.
    // We add the user's database ID so we can use it in queries
    // like `where: { userId: session.user.id }`.
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },

  pages: {
    signIn: "/login",
  },
})
