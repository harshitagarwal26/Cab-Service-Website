-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "hashedPassword" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "CabType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "luggage" INTEGER NOT NULL,
    "image" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cabTypeId" TEXT NOT NULL,
    "baseFare" INTEGER NOT NULL,
    "perKm" INTEGER NOT NULL,
    "perMinute" INTEGER NOT NULL,
    "minKmPerDay" INTEGER NOT NULL DEFAULT 0,
    "surgeJson" JSONB,
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PricingRule_cabTypeId_fkey" FOREIGN KEY ("cabTypeId") REFERENCES "CabType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromCityId" TEXT NOT NULL,
    "toCityId" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "cabTypeId" TEXT NOT NULL,
    "distanceKm" INTEGER NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "priceQuote" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "pickupAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_fromCityId_fkey" FOREIGN KEY ("fromCityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_toCityId_fkey" FOREIGN KEY ("toCityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_cabTypeId_fkey" FOREIGN KEY ("cabTypeId") REFERENCES "CabType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "City_name_state_idx" ON "City"("name", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
