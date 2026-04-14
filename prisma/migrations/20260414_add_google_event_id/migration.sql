-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "googleEventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_googleEventId_key" ON "Lead"("googleEventId");

