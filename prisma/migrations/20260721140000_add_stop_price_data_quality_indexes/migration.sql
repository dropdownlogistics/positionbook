-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "dataQuality" TEXT,
ADD COLUMN     "stopPrice" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Position_userId_entryDate_idx" ON "Position"("userId", "entryDate");

-- CreateIndex
CREATE INDEX "Position_userId_status_idx" ON "Position"("userId", "status");
