// lib/prisma.js
// Standard Next.js Prisma singleton -- avoids exhausting DB connections
// from hot-reloading in dev, where every file save would otherwise spin
// up a brand new PrismaClient.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
