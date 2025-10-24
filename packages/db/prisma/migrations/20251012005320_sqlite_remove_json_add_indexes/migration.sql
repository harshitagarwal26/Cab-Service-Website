/*
  Warnings:

  - A unique constraint covering the columns `[name,state]` on the table `City` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "City_name_state_idx";

-- CreateIndex
CREATE UNIQUE INDEX "City_name_state_unique" ON "City"("name", "state");
