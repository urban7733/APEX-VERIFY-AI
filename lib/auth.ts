import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import { prisma } from "@/lib/prisma"

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET

if (!googleClientId || !googleClientSecret) {
  throw new Error("Google OAuth credentials are not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.")
}

if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is not configured. Set it in your environment.")
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  events: {
    createUser: async ({ user }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          updatedAt: new Date(),
        },
      })
    },
  },
  secret: nextAuthSecret,
}
