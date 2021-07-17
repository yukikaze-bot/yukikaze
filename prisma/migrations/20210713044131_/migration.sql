-- CreateTable
CREATE TABLE "Starboard" (
    "guildID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "messageID" TEXT NOT NULL,
    "channelID" TEXT NOT NULL,
    "starMessageID" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,

    PRIMARY KEY ("guildID")
);
