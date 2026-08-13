-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");
