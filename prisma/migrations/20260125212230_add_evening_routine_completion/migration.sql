-- CreateTable
CREATE TABLE "EveningRoutineCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "taskKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EveningRoutineCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EveningRoutineCompletion_userId_day_idx" ON "EveningRoutineCompletion"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "EveningRoutineCompletion_userId_day_taskKey_key" ON "EveningRoutineCompletion"("userId", "day", "taskKey");

-- AddForeignKey
ALTER TABLE "EveningRoutineCompletion" ADD CONSTRAINT "EveningRoutineCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
