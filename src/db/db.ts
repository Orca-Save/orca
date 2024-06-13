import { PrismaClient } from '@prisma/client';
import { loggingExtension } from './middleware/prismaLogger';

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();
  if (process.env.NODE_ENV === 'production') prisma.$extends(loggingExtension);

  return prisma;
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
