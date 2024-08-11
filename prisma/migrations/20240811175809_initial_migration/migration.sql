-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('REGULAR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "UserRole" "UserRole" NOT NULL DEFAULT 'REGULAR',
    "userAuthLocalId" TEXT,
    "userInformationId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuthLocal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,

    CONSTRAINT "UserAuthLocal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInformation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT,
    "gender" TEXT,

    CONSTRAINT "UserInformation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userAuthLocalId_fkey" FOREIGN KEY ("userAuthLocalId") REFERENCES "UserAuthLocal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userInformationId_fkey" FOREIGN KEY ("userInformationId") REFERENCES "UserInformation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
