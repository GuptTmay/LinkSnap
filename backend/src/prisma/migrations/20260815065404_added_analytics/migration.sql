/*
  Warnings:

  - You are about to drop the column `clicks` on the `Link` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Link" DROP COLUMN "clicks";

-- CreateTable
CREATE TABLE "LinkClick" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "os" TEXT,
    "country" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkClick_linkId_createdAt_idx" ON "LinkClick"("linkId", "createdAt");

-- AddForeignKey
ALTER TABLE "LinkClick" ADD CONSTRAINT "LinkClick_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
