/*
  Warnings:

  - The primary key for the `Timer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `Timer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Timer" DROP CONSTRAINT "Timer_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD PRIMARY KEY ("userID", "channelID", "id");
