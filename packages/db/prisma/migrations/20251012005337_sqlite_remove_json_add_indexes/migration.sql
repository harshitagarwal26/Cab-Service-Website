-- DropIndex
DROP INDEX "City_name_state_unique";

-- CreateIndex
CREATE INDEX "City_name_state_idx" ON "City"("name", "state");
