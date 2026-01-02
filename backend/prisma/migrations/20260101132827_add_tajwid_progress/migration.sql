-- CreateTable
CREATE TABLE "TajwidProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TajwidProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TajwidProgress_userId_idx" ON "TajwidProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TajwidProgress_userId_lessonId_key" ON "TajwidProgress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "TajwidProgress" ADD CONSTRAINT "TajwidProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
