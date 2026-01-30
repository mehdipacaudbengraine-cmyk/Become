-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "q1" TEXT NOT NULL DEFAULT '',
    "q2" TEXT NOT NULL DEFAULT '',
    "q3" TEXT NOT NULL DEFAULT '',
    "q4" TEXT NOT NULL DEFAULT '',
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalEntry_userId_day_idx" ON "JournalEntry"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_userId_day_key" ON "JournalEntry"("userId", "day");

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
