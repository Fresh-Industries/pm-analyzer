import { describe, it, expect } from 'vitest';
import { PrismaClient } from '@prisma/client';

describe('Database', () => {
  it('should instantiate Prisma Client', () => {
    const prisma = new PrismaClient();
    expect(prisma).toBeDefined();
    // Verify vector extension is in schema (indirectly via model check if possible, or just basic init)
    expect(prisma.feedback).toBeDefined();
  });
});
