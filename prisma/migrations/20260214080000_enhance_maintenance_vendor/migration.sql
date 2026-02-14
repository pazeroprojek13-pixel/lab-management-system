-- Vendor Workflow Maintenance Enhancement (Form 005–006)
-- Adds vendor tracking, incident link, soft-delete, and lifecycle status.

-- ─── 1. Replace MaintenanceStatus enum ──────────────────────────────────────
BEGIN;
CREATE TYPE "MaintenanceStatus_new" AS ENUM ('PENDING', 'SENT', 'RETURNED', 'COMPLETED');

-- Drop column default before type conversion
ALTER TABLE "Maintenance" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Maintenance"
  ALTER COLUMN "status" TYPE "MaintenanceStatus_new"
  USING (
    CASE "status"::text
      WHEN 'SCHEDULED'   THEN 'PENDING'
      WHEN 'IN_PROGRESS' THEN 'SENT'
      WHEN 'COMPLETED'   THEN 'COMPLETED'
      WHEN 'CANCELLED'   THEN 'PENDING'
      ELSE 'PENDING'
    END
  )::"MaintenanceStatus_new";

ALTER TYPE "MaintenanceStatus" RENAME TO "MaintenanceStatus_old";
ALTER TYPE "MaintenanceStatus_new" RENAME TO "MaintenanceStatus";
DROP TYPE "MaintenanceStatus_old";

-- Restore default using new enum
ALTER TABLE "Maintenance" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- ─── 2. Drop old FKs and indexes that reference columns being renamed ────────
ALTER TABLE "Maintenance" DROP CONSTRAINT IF EXISTS "Maintenance_campus_id_fkey";
ALTER TABLE "Maintenance" DROP CONSTRAINT IF EXISTS "Maintenance_createdById_fkey";
ALTER TABLE "Maintenance" DROP CONSTRAINT IF EXISTS "Maintenance_equipmentId_fkey";
ALTER TABLE "Maintenance" DROP CONSTRAINT IF EXISTS "Maintenance_labId_fkey";

DROP INDEX IF EXISTS "Maintenance_createdById_idx";
DROP INDEX IF EXISTS "Maintenance_equipmentId_idx";
DROP INDEX IF EXISTS "Maintenance_labId_idx";

-- ─── 3. Add new columns (nullable first to allow data migration) ─────────────
ALTER TABLE "Maintenance"
  ADD COLUMN IF NOT EXISTS "created_by_id"          TEXT,
  ADD COLUMN IF NOT EXISTS "equipment_id"            TEXT,
  ADD COLUMN IF NOT EXISTS "lab_id"                  TEXT,
  ADD COLUMN IF NOT EXISTS "scheduled_date"          TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "completed_date"          TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "incident_id"             TEXT,
  ADD COLUMN IF NOT EXISTS "vendor_name"             TEXT,
  ADD COLUMN IF NOT EXISTS "sent_to_vendor_at"       TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "returned_from_vendor_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cost"                    DECIMAL(65, 30),
  ADD COLUMN IF NOT EXISTS "resolution_notes"        TEXT,
  ADD COLUMN IF NOT EXISTS "is_deleted"              BOOLEAN NOT NULL DEFAULT false;

-- ─── 4. Copy data from camelCase columns to snake_case columns ───────────────
UPDATE "Maintenance" SET
  "created_by_id"   = "createdById",
  "equipment_id"    = "equipmentId",
  "lab_id"          = "labId",
  "scheduled_date"  = "scheduledDate",
  "completed_date"  = "completedDate";

-- ─── 5. Backfill campus_id using equipment's campus for NULL rows ─────────────
UPDATE "Maintenance" m
SET "campus_id" = e."campus_id"
FROM "Equipment" e
WHERE m."equipment_id" = e."id"
  AND m."campus_id" IS NULL;

-- Drop any maintenance rows still without a campus (no valid equipment link)
DELETE FROM "Maintenance" WHERE "campus_id" IS NULL;

-- ─── 6. Drop old camelCase columns ───────────────────────────────────────────
ALTER TABLE "Maintenance"
  DROP COLUMN IF EXISTS "createdById",
  DROP COLUMN IF EXISTS "equipmentId",
  DROP COLUMN IF EXISTS "labId",
  DROP COLUMN IF EXISTS "scheduledDate",
  DROP COLUMN IF EXISTS "completedDate";

-- ─── 7. Apply NOT NULL constraints (after data migration) ────────────────────
ALTER TABLE "Maintenance"
  ALTER COLUMN "created_by_id" SET NOT NULL,
  ALTER COLUMN "campus_id"     SET NOT NULL,
  ALTER COLUMN "description"   DROP NOT NULL;

-- ─── 8. Add new Foreign Keys ─────────────────────────────────────────────────
ALTER TABLE "Maintenance"
  ADD CONSTRAINT "Maintenance_incident_id_fkey"
    FOREIGN KEY ("incident_id") REFERENCES "Incident"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Maintenance"
  ADD CONSTRAINT "Maintenance_equipment_id_fkey"
    FOREIGN KEY ("equipment_id") REFERENCES "Equipment"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Maintenance"
  ADD CONSTRAINT "Maintenance_campus_id_fkey"
    FOREIGN KEY ("campus_id") REFERENCES "Campus"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Maintenance"
  ADD CONSTRAINT "Maintenance_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Maintenance"
  ADD CONSTRAINT "Maintenance_lab_id_fkey"
    FOREIGN KEY ("lab_id") REFERENCES "Lab"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── 9. Create new indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "Maintenance_equipment_id_idx"       ON "Maintenance"("equipment_id");
CREATE INDEX IF NOT EXISTS "Maintenance_incident_id_idx"        ON "Maintenance"("incident_id");
CREATE INDEX IF NOT EXISTS "Maintenance_sent_to_vendor_at_idx"  ON "Maintenance"("sent_to_vendor_at");
CREATE INDEX IF NOT EXISTS "Maintenance_is_deleted_idx"         ON "Maintenance"("is_deleted");
CREATE INDEX IF NOT EXISTS "Maintenance_created_by_id_idx"      ON "Maintenance"("created_by_id");
