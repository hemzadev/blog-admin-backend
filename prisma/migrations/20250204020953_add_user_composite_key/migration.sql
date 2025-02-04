/*
  Warnings:

  - A unique constraint covering the columns `[socialProvider,socialProviderId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_socialProvider_socialProviderId_key" ON "User"("socialProvider", "socialProviderId");
