-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PricingRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cabTypeId" TEXT NOT NULL,
    "baseFare" INTEGER NOT NULL,
    "perKm" INTEGER NOT NULL,
    "perMinute" INTEGER NOT NULL,
    "minKmPerDay" INTEGER NOT NULL DEFAULT 0,
    "surgeJson" TEXT,
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PricingRule_cabTypeId_fkey" FOREIGN KEY ("cabTypeId") REFERENCES "CabType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PricingRule" ("active", "baseFare", "cabTypeId", "id", "minKmPerDay", "perKm", "perMinute", "surgeJson", "validFrom", "validTo") SELECT "active", "baseFare", "cabTypeId", "id", "minKmPerDay", "perKm", "perMinute", "surgeJson", "validFrom", "validTo" FROM "PricingRule";
DROP TABLE "PricingRule";
ALTER TABLE "new_PricingRule" RENAME TO "PricingRule";
CREATE UNIQUE INDEX "PricingRule_cabTypeId_key" ON "PricingRule"("cabTypeId");
CREATE TABLE "new_Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "valueJson" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Setting" ("id", "key", "updatedAt", "valueJson") SELECT "id", "key", "updatedAt", "valueJson" FROM "Setting";
DROP TABLE "Setting";
ALTER TABLE "new_Setting" RENAME TO "Setting";
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Booking_fromCityId_toCityId_startAt_idx" ON "Booking"("fromCityId", "toCityId", "startAt");

-- CreateIndex
CREATE INDEX "Booking_cabTypeId_idx" ON "Booking"("cabTypeId");
