// A single shared PrismaClient instance.
//
// Why: Next.js dev mode hot-reloads your code on every save, and each
// reload would otherwise create a brand new PrismaClient (and a brand new
// pool of database connections) without closing the old one. Stashing the
// client on `globalThis` means the same instance survives reloads in
// development. In production, each server instance just creates one client
// normally (globalForPrisma.prisma is unset, so the `??` falls through).
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
