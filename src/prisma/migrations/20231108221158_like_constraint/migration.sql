/*
  Warnings:

  - A unique constraint covering the columns `[ReplyID,UserID]` on the table `Likes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_reply_like" ON "Likes"("ReplyID", "UserID");
