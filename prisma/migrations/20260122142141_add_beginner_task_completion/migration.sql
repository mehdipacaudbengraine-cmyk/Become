-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingDone" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BeginnerTaskCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "taskIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeginnerTaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeginnerTaskCompletion_userId_day_idx" ON "BeginnerTaskCompletion"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "BeginnerTaskCompletion_userId_day_taskIndex_key" ON "BeginnerTaskCompletion"("userId", "day", "taskIndex");

-- AddForeignKey
ALTER TABLE "BeginnerTaskCompletion" ADD CONSTRAINT "BeginnerTaskCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
