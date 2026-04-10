import { defineConfig } from 'prisma';

export default defineConfig({
  schema: './prisma/schema.prisma',
  seed: 'ts-node prisma/seed.ts',
});
