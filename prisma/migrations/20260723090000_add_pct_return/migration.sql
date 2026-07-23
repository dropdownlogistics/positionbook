-- AlterTable
--
-- pctReturn holds the percent return on a closed position, P&L-signed
-- (positive = profitable trade, regardless of side).
--
-- Historical rows had this value stored in `rMultiple`, which was a misnomer:
-- no stopPrice was ever recorded on those rows, so a true R-multiple was never
-- computable. The stored values were also raw price movement — unsigned by
-- trade direction — so all SHORT values were inverted relative to P&L.
-- Verified across all 9 affected rows: every SHORT whose price rose was a loss,
-- every SHORT whose price fell was a win. See scripts/item4-dryrun.mjs.
--
-- rMultiple is reserved for genuine R-multiples computed at close time from a
-- recorded stopPrice (see app/api/positions/[id]/route.ts).

ALTER TABLE "Position" ADD COLUMN     "pctReturn" DOUBLE PRECISION;
