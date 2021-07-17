/*
  Warnings:

  - Added the required column `lastUpdated` to the `Starboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Starboard" ADD COLUMN     "lastUpdated" INTEGER NOT NULL;
