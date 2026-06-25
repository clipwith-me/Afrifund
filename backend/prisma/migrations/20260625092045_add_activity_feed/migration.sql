-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CAMPAIGN_LAUNCHED', 'PLEDGE_MADE', 'CAMPAIGN_FUNDED', 'USER_JOINED', 'KYC_VERIFIED', 'CERTIFICATE_EARNED', 'MENTOR_JOINED_PLATFORM', 'MENTOR_SESSION_STARTED');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "userAvatar" TEXT,
    "campaignId" TEXT,
    "campaignTitle" TEXT,
    "pledgeId" TEXT,
    "amount" DECIMAL(65,30),
    "currency" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- CreateIndex
CREATE INDEX "activities_type_createdAt_idx" ON "activities"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_pledgeId_fkey" FOREIGN KEY ("pledgeId") REFERENCES "pledges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
