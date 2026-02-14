-- ISO-ready Incident module enhancement
-- Adds full lifecycle, severity, problem scope, ISO resolution fields,
-- soft-delete, campus/lab/equipment relations, and proper indexes.

-- 1. Add new enum types
CREATE TYPE "ProblemScope" AS ENUM ('EQUIPMENT', 'LAB', 'INFRASTRUCTURE', 'OTHER');
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- 2. Extend IncidentStatus with ASSIGNED and VERIFIED states
ALTER TYPE "IncidentStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "IncidentStatus" ADD VALUE 'VERIFIED';

-- 3. Rename EquipmentStatus values to match domain language
--    (PostgreSQL: drop DEFAULT first, cast column, restore DEFAULT, rename type)
CREATE TYPE "EquipmentStatus_new" AS ENUM ('ACTIVE', 'DAMAGED', 'MAINTENANCE', 'RETIRED');

-- Drop the old default so the cast can proceed
ALTER TABLE "Equipment" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Equipment"
  ALTER COLUMN "status" TYPE "EquipmentStatus_new"
  USING (
    CASE "status"::text
      WHEN 'AVAILABLE'         THEN 'ACTIVE'
      WHEN 'IN_USE'            THEN 'ACTIVE'
      WHEN 'BROKEN'            THEN 'DAMAGED'
      WHEN 'UNDER_MAINTENANCE' THEN 'MAINTENANCE'
      ELSE 'ACTIVE'
    END
  )::"EquipmentStatus_new";

-- Restore the default using the new type
ALTER TABLE "Equipment" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"EquipmentStatus_new";

DROP TYPE "EquipmentStatus";
ALTER TYPE "EquipmentStatus_new" RENAME TO "EquipmentStatus";

-- 4. Add missing columns to Campus
ALTER TABLE "Campus" ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- 5. Add missing columns to Lab
ALTER TABLE "Lab"
  ADD COLUMN "type"       TEXT,
  ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Lab"
  ALTER COLUMN "campus_id" SET NOT NULL;

-- 6. Add missing columns to Equipment
ALTER TABLE "Equipment"
  ADD COLUMN "brand"            TEXT,
  ADD COLUMN "serial_number"    TEXT,
  ADD COLUMN "purchase_date"    TIMESTAMP(3),
  ADD COLUMN "warranty_end_date" TIMESTAMP(3),
  ADD COLUMN "condition"        TEXT,
  ADD COLUMN "is_deleted"       BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Equipment"
  ALTER COLUMN "campus_id" SET NOT NULL;

-- 7. Rebuild Incident table to match ISO-ready schema
--    Drop old columns, add new ones, enforce campus relation

ALTER TABLE "Incident"
  DROP COLUMN IF EXISTS "title",
  DROP COLUMN IF EXISTS "resolution";

ALTER TABLE "Incident"
  ADD COLUMN IF NOT EXISTS "problem_scope"       "ProblemScope" NOT NULL DEFAULT 'OTHER',
  ADD COLUMN IF NOT EXISTS "category"            TEXT,
  ADD COLUMN IF NOT EXISTS "severity"            "Severity" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS "root_cause"          TEXT,
  ADD COLUMN IF NOT EXISTS "corrective_action"   TEXT,
  ADD COLUMN IF NOT EXISTS "preventive_action"   TEXT,
  ADD COLUMN IF NOT EXISTS "resolved_at"         TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "verified_at"         TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "assigned_to_id"      TEXT,
  ADD COLUMN IF NOT EXISTS "reported_by_id_new"  TEXT,
  ADD COLUMN IF NOT EXISTS "is_deleted"          BOOLEAN NOT NULL DEFAULT false;

-- Migrate reportedById -> reported_by_id (column rename already handled by Prisma @map)
-- campus_id: make NOT NULL (set default for any NULLs first, then constrain)
UPDATE "Incident" SET "campus_id" = (SELECT id FROM "Campus" LIMIT 1) WHERE "campus_id" IS NULL;
ALTER TABLE "Incident" ALTER COLUMN "campus_id" SET NOT NULL;

-- category: backfill from description for any existing rows
UPDATE "Incident" SET "category" = 'GENERAL' WHERE "category" IS NULL;
ALTER TABLE "Incident" ALTER COLUMN "category" SET NOT NULL;

-- 8. Add foreign key for assignedToId
ALTER TABLE "Incident"
  ADD CONSTRAINT "Incident_assigned_to_id_fkey"
  FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 9. Add missing unique constraints
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_campus_id_code_key" UNIQUE ("campus_id", "code");
ALTER TABLE "Lab" ADD CONSTRAINT "Lab_campus_id_code_key" UNIQUE ("campus_id", "code");

-- 10. Add additional indexes on Incident
CREATE INDEX IF NOT EXISTS "Incident_status_idx"       ON "Incident"("status");
CREATE INDEX IF NOT EXISTS "Incident_severity_idx"     ON "Incident"("severity");
CREATE INDEX IF NOT EXISTS "Incident_resolved_at_idx"  ON "Incident"("resolved_at");
CREATE INDEX IF NOT EXISTS "Incident_is_deleted_idx"   ON "Incident"("is_deleted");
CREATE INDEX IF NOT EXISTS "Incident_assigned_to_id_idx" ON "Incident"("assigned_to_id");

-- 11. Additional Equipment indexes
CREATE INDEX IF NOT EXISTS "Equipment_status_idx"          ON "Equipment"("status");
CREATE INDEX IF NOT EXISTS "Equipment_warranty_end_date_idx" ON "Equipment"("warranty_end_date");
CREATE INDEX IF NOT EXISTS "Equipment_is_deleted_idx"      ON "Equipment"("is_deleted");

-- 12. Campus / Lab is_deleted indexes
CREATE INDEX IF NOT EXISTS "Campus_is_deleted_idx" ON "Campus"("is_deleted");
CREATE INDEX IF NOT EXISTS "Lab_is_deleted_idx"    ON "Lab"("is_deleted");
