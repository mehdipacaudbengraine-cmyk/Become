/*
  Warnings:

  - You are about to drop the column `taskIndex` on the `BeginnerTaskCompletion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,day,taskKey]` on the table `BeginnerTaskCompletion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `taskKey` to the `BeginnerTaskCompletion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BeginnerTaskCompletion` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BeginnerTaskCompletion_userId_day_taskIndex_key";

-- AlterTable
ALTER TABLE "BeginnerTaskCompletion" DROP COLUMN "taskIndex",
ADD COLUMN     "taskKey" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "MorningRoutineCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "taskKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MorningRoutineCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MorningRoutineCompletion_userId_day_idx" ON "MorningRoutineCompletion"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "MorningRoutineCompletion_userId_day_taskKey_key" ON "MorningRoutineCompletion"("userId", "day", "taskKey");

-- CreateIndex
CREATE UNIQUE INDEX "BeginnerTaskCompletion_userId_day_taskKey_key" ON "BeginnerTaskCompletion"("userId", "day", "taskKey");

-- AddForeignKey
ALTER TABLE "MorningRoutineCompletion" ADD CONSTRAINT "MorningRoutineCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
