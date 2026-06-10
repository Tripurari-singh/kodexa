import { PrismaClient } from "@prisma/client"

// In development, Next.js hot-reloads modules on every file change.
// Without this guard, every reload would create a brand new PrismaClient
// and eventually exhaust the database connection pool.
//
// We attach the client to the global object so it survives hot reloads,
// but only do this outside of production (in production, modules are
// loaded once anyway, so a normal singleton is fine).

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
