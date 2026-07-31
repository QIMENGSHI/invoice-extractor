-- Remove the legacy seed document, which never had an uploaded file.
-- Deliberately leave any other NULL rows untouched so the constraint below
-- fails instead of silently deleting unexpected data.
DELETE FROM "Document"
WHERE "filePath" IS NULL
  AND "fileName" = 'sample_invoice.pdf'
  AND "status" = 'extracted';

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "filePath" SET NOT NULL;
