-- CreateTable
CREATE TABLE "Tag" (
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "ownerID" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,

    PRIMARY KEY ("name","guildID")
);
