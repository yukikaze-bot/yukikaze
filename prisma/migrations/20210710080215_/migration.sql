/*
  Warnings:

  - Added the required column `title` to the `Timer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Timer" ADD COLUMN     "title" TEXT NOT NULL;
