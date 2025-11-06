import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient | null {
  // During build, if DATABASE_URL is not set, return null to prevent crashes
  // The API routes will handle this gracefully at runtime
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })
  } catch (error) {
    // If Prisma client creation fails (e.g., invalid DATABASE_URL), return null
    // This allows the build to complete; runtime will handle the error
    console.warn("Failed to create Prisma client:", error)
    return null
  }
}

const prismaClient = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production" && prismaClient) {
  globalThis.prisma = prismaClient
}

// Export - can be null during build, but will be available at runtime when DATABASE_URL is set
export const prisma: PrismaClient | null = prismaClient
