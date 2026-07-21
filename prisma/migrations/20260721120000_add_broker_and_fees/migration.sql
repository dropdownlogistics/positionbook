-- AlterTable
--
-- Reconciles migration history with the live database.
--
-- `broker` and `fees` were added to prisma/schema.prisma on 2026-04-12 (commit
-- 1fdd3a2) and applied to Neon via `prisma db push`, which writes no migration
-- file. Introspection on 2026-07-21 confirmed both columns exist in production,
-- physically ordered after "updatedAt" — the signature of an ADD COLUMN applied
-- post-CREATE. Migration history did not record them, so `migrate deploy`
-- against any fresh environment produced a "Position" table missing both.
--
-- IF NOT EXISTS makes this statement safe to replay against the production
-- database, which already has these columns. No `migrate resolve` required.
--
-- Note: the preceding migration directory (20260319061835_add_broker_fees) is
-- misnamed — its SQL is the initial CREATE TABLE baseline and contains neither
-- of these columns. Do not rename it; Prisma matches applied migrations by
-- directory name against the _prisma_migrations table.

ALTER TABLE "Position" ADD COLUMN IF NOT EXISTS "broker" TEXT,
ADD COLUMN IF NOT EXISTS "fees" DOUBLE PRECISION;
