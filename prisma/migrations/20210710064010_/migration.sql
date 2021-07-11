-- CreateTable
CREATE TABLE "Timer" (
    "userID" TEXT NOT NULL,
    "channelID" TEXT NOT NULL,

    PRIMARY KEY ("userID","channelID")
);
