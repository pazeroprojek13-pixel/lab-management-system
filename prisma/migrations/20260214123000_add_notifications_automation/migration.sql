-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
  'WARRANTY_ALERT',
  'INCIDENT_ESCALATION',
  'MAINTENANCE_OVERDUE'
);

-- CreateTable
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "campus_id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "entity_id" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_campus_id_idx" ON "Notification"("campus_id");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_entity_id_idx" ON "Notification"("entity_id");

-- CreateIndex
CREATE INDEX "Notification_is_read_idx" ON "Notification"("is_read");

-- CreateIndex
CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");

-- AddForeignKey
ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_campus_id_fkey"
  FOREIGN KEY ("campus_id") REFERENCES "Campus"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
