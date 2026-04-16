-- CreateTable
CREATE TABLE "ScheduleConfig" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleConfig_pkey" PRIMARY KEY ("id")
);
