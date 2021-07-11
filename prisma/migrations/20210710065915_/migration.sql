/*
  Warnings:

  - The primary key for the `Timer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `channelID` on the `Timer` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `Timer` table. All the data in the column will be lost.
  - Added the required column `date` to the `Timer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Timer" DROP CONSTRAINT "Timer_pkey",
DROP COLUMN "channelID",
DROP COLUMN "userID",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD PRIMARY KEY ("id");
