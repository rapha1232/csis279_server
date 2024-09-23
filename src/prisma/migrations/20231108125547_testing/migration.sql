/*
  Warnings:

  - You are about to drop the column `Likes` on the `Replies` table. All the data in the column will be lost.
  - Made the column `Title` on table `Events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Description` on table `Events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Date` on table `Events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Location` on table `Events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Events" ALTER COLUMN "Title" SET NOT NULL,
ALTER COLUMN "Description" SET NOT NULL,
ALTER COLUMN "Date" SET NOT NULL,
ALTER COLUMN "Location" SET NOT NULL;

-- AlterTable
ALTER TABLE "Likes" ADD COLUMN     "ReplyID" INTEGER;

-- AlterTable
ALTER TABLE "Replies" DROP COLUMN "Likes",
ADD COLUMN     "LikesNB" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_ReplyID_fkey" FOREIGN KEY ("ReplyID") REFERENCES "Replies"("ReplyID") ON DELETE SET NULL ON UPDATE CASCADE;
