-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('INCIDENT', 'EQUIPMENT', 'MAINTENANCE', 'LAB');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "entity_type" "AuditEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "performed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_campus_id_idx" ON "AuditLog"("campus_id");

-- CreateIndex
CREATE INDEX "AuditLog_entity_type_idx" ON "AuditLog"("entity_type");

-- CreateIndex
CREATE INDEX "AuditLog_entity_id_idx" ON "AuditLog"("entity_id");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_performed_by_idx" ON "AuditLog"("performed_by");

-- CreateIndex
CREATE INDEX "AuditLog_created_at_idx" ON "AuditLog"("created_at");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

