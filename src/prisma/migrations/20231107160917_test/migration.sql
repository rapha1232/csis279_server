-- CreateTable
CREATE TABLE "User" (
    "UserID" SERIAL NOT NULL,
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(100) NOT NULL,
    "Password" VARCHAR(255) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "Saved" (
    "SavedID" SERIAL NOT NULL,
    "UserID" INTEGER NOT NULL,
    "EventID" INTEGER,
    "TopicID" INTEGER,
    "QuestionID" INTEGER,

    CONSTRAINT "Saved_pkey" PRIMARY KEY ("SavedID")
);

-- CreateTable
CREATE TABLE "Events" (
    "EventID" SERIAL NOT NULL,
    "Title" VARCHAR(100),
    "Description" TEXT,
    "Date" DATE,
    "Location" VARCHAR(255),
    "CreatorID" INTEGER NOT NULL,
    "LikesNB" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("EventID")
);

-- CreateTable
CREATE TABLE "Likes" (
    "LikeID" SERIAL NOT NULL,
    "UserID" INTEGER NOT NULL,
    "EventID" INTEGER,
    "TopicID" INTEGER,
    "QuestionID" INTEGER,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("LikeID")
);

-- CreateTable
CREATE TABLE "Topics" (
    "TopicID" SERIAL NOT NULL,
    "Title" VARCHAR(100) NOT NULL,
    "Content" TEXT NOT NULL,
    "CreatedAt" DATE NOT NULL,
    "CreatorID" INTEGER NOT NULL,
    "LikesNb" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Topics_pkey" PRIMARY KEY ("TopicID")
);

-- CreateTable
CREATE TABLE "Questions" (
    "QuestionID" SERIAL NOT NULL,
    "Title" VARCHAR(100) NOT NULL,
    "Content" TEXT NOT NULL,
    "CreatedAt" DATE NOT NULL,
    "CreatorID" INTEGER NOT NULL,
    "LikesNb" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("QuestionID")
);

-- CreateTable
CREATE TABLE "Replies" (
    "ReplyID" SERIAL NOT NULL,
    "Content" TEXT NOT NULL,
    "CreatedAt" DATE NOT NULL,
    "CreatorID" INTEGER NOT NULL,
    "QuestionID" INTEGER,
    "TopicID" INTEGER,
    "Likes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Replies_pkey" PRIMARY KEY ("ReplyID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Email" ON "User"("Email");

-- CreateIndex
CREATE INDEX "EventID_idx" ON "Saved"("EventID");

-- CreateIndex
CREATE INDEX "FK_TopicID_idx" ON "Saved"("TopicID");

-- CreateIndex
CREATE INDEX "UserID_idx" ON "Saved"("UserID");

-- CreateIndex
CREATE INDEX "QuestionID_idx" ON "Saved"("QuestionID");

-- CreateIndex
CREATE UNIQUE INDEX "unique_event_saved" ON "Saved"("EventID", "UserID");

-- CreateIndex
CREATE UNIQUE INDEX "unique_topic_saved" ON "Saved"("TopicID", "UserID");

-- CreateIndex
CREATE UNIQUE INDEX "unique_question_saved" ON "Saved"("QuestionID", "UserID");

-- CreateIndex
CREATE UNIQUE INDEX "unique_event_like" ON "Likes"("EventID", "UserID");

-- CreateIndex
CREATE UNIQUE INDEX "unique_topic_like" ON "Likes"("TopicID", "UserID");

-- CreateIndex
CREATE UNIQUE INDEX "unique_question_like" ON "Likes"("QuestionID", "UserID");

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_EventID_fkey" FOREIGN KEY ("EventID") REFERENCES "Events"("EventID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_TopicID_fkey" FOREIGN KEY ("TopicID") REFERENCES "Topics"("TopicID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_QuestionID_fkey" FOREIGN KEY ("QuestionID") REFERENCES "Questions"("QuestionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_CreatorID_fkey" FOREIGN KEY ("CreatorID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_EventID_fkey" FOREIGN KEY ("EventID") REFERENCES "Events"("EventID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_TopicID_fkey" FOREIGN KEY ("TopicID") REFERENCES "Topics"("TopicID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_QuestionID_fkey" FOREIGN KEY ("QuestionID") REFERENCES "Questions"("QuestionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topics" ADD CONSTRAINT "Topics_CreatorID_fkey" FOREIGN KEY ("CreatorID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_CreatorID_fkey" FOREIGN KEY ("CreatorID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Replies" ADD CONSTRAINT "Replies_CreatorID_fkey" FOREIGN KEY ("CreatorID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Replies" ADD CONSTRAINT "Replies_QuestionID_fkey" FOREIGN KEY ("QuestionID") REFERENCES "Questions"("QuestionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Replies" ADD CONSTRAINT "Replies_TopicID_fkey" FOREIGN KEY ("TopicID") REFERENCES "Topics"("TopicID") ON DELETE SET NULL ON UPDATE CASCADE;
