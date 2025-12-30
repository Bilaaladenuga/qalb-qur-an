const { PrismaClient } = require('@prisma/client');

// Prisma 7 gets the datasource URL from prisma.config.ts
const prisma = new PrismaClient();

module.exports = prisma;
