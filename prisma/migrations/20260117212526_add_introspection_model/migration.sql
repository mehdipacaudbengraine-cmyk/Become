-- CreateTable
CREATE TABLE "Introspection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "q1" TEXT NOT NULL,
    "q2" TEXT NOT NULL,
    "q3" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Introspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Introspection_userId_key" ON "Introspection"("userId");

-- AddForeignKey
ALTER TABLE "Introspection" ADD CONSTRAINT "Introspection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
