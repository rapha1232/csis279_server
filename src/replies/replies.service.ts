// replies.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, Replies } from '@prisma/client';
import { CreateReplyDto } from 'src/dtos/create.dto';
import { UpdateReplyDto } from 'src/dtos/edit.dto';

/**
 * Service responsible for handling Replie-related operations.
 */
@Injectable()
export class RepliesService {
  private readonly replies = new PrismaClient().replies;
  private readonly likes = new PrismaClient().likes;
  private readonly logger = new Logger(RepliesService.name);

  /**
   * Likes a reply.
   * @param {number} ReplyID - The ID of the reply to be liked.
   * @param {number} UserID - The ID of the user liking the reply.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async likeReply(ReplyID: number, UserID: number): Promise<void> {
    try {
      await this.replies.update({
        where: { ReplyID: ReplyID },
        data: { LikesNB: { increment: 1 } },
      });

      await this.likes.create({
        data: { ReplyID: ReplyID, UserID: UserID },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Unlikes a reply.
   * @param {number} ReplyID - The ID of the reply to be unliked.
   * @param {number} UserID - The ID of the user unliking the reply.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async unlikeReply(ReplyID: number, UserID: number): Promise<void> {
    try {
      await this.replies.update({
        where: { ReplyID: ReplyID },
        data: { LikesNB: { decrement: 1 } },
      });

      await this.likes.delete({
        where: { ReplyID_UserID: { ReplyID: ReplyID, UserID: UserID } },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Retrieves all replies with specified query parameters.
   * @param {string} q - The query parameter.
   * @param {number} QuestionID - The ID of the question to sort replies.
   * @returns A promise that resolves to an array of replies.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async filteredForQuestion(
    q: 'all' | 'popular' | 'recent' | 'name' | 'old',
    QuestionID: number,
  ): Promise<Replies[]> {
    try {
      const allReplies: Replies[] = await this.replies.findMany({
        where: {
          QuestionID: QuestionID,
        },
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
        },
      });

      switch (q) {
        case 'all':
          // No sorting needed
          break;
        case 'popular':
          allReplies.sort((a, b) => b.LikesNB - a.LikesNB);
          break;
        case 'recent':
          allReplies.sort(
            (a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime(),
          );
          break;
        case 'name':
          allReplies.sort((a, b) => a.Content.localeCompare(b.Content));
          break;
        case 'old':
          allReplies.sort(
            (a, b) => a.CreatedAt.getTime() - b.CreatedAt.getTime(),
          );
          break;
      }

      return allReplies;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Retrieves all replies with specified query parameters.
   * @param {string} q - The query parameter.
   * @param {number} TopicID - The ID of the topic to sort replies.
   * @returns A promise that resolves to an array of replies.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async filteredForTopic(
    q: 'all' | 'popular' | 'recent' | 'name' | 'old',
    TopicID: number,
  ): Promise<Replies[]> {
    try {
      const allReplies: Replies[] = await this.replies.findMany({
        where: {
          TopicID: Number(TopicID),
        },
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
        },
      });

      switch (q) {
        case 'all':
          // No sorting needed
          break;
        case 'popular':
          allReplies.sort((a, b) => b.LikesNB - a.LikesNB);
          break;
        case 'recent':
          allReplies.sort(
            (a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime(),
          );
          break;
        case 'name':
          allReplies.sort((a, b) => a.Content.localeCompare(b.Content));
          break;
        case 'old':
          allReplies.sort(
            (a, b) => a.CreatedAt.getTime() - b.CreatedAt.getTime(),
          );
          break;
      }

      return allReplies;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Creates a reply for a topic.
   * @param {CreateReplyDto} createReplyDto - The info of the reply to be created.
   * @returns A promise that resolves to the created reply.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {BadRequestException} If the request body is missing data.
   */
  async createForTopic(createReplyDto: CreateReplyDto): Promise<Replies> {
    if (
      !createReplyDto.CreatedAt ||
      !createReplyDto.CreatorID ||
      !createReplyDto.Content ||
      !createReplyDto.TargetID
    ) {
      throw new BadRequestException('Missing Data');
    }
    try {
      return this.replies.create({
        data: {
          TopicID: Number(createReplyDto.TargetID),
          Content: createReplyDto.Content,
          CreatedAt: createReplyDto.CreatedAt,
          CreatorID: Number(createReplyDto.CreatorID),
        },
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Creates a reply for a question.
   * @param {CreateReplyDto} createReplyDto - The info of the reply to be created.
   * @returns A promise that resolves to the created reply.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {BadRequestException} If the request body is missing data.
   */
  async createForQuestion(createReplyDto: CreateReplyDto): Promise<Replies> {
    if (
      !createReplyDto.CreatedAt ||
      !createReplyDto.CreatorID ||
      !createReplyDto.Content ||
      !createReplyDto.TargetID
    ) {
      throw new BadRequestException('Missing Data');
    }
    try {
      return this.replies.create({
        data: {
          QuestionID: Number(createReplyDto.TargetID),
          Content: createReplyDto.Content,
          CreatedAt: createReplyDto.CreatedAt,
          CreatorID: Number(createReplyDto.CreatorID),
        },
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Deletes selected reply.
   * @param {number} ReplyID - The ID of the reply to delete.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the reply is not found.
   */
  async delete(ReplyID: number): Promise<void> {
    try {
      const reply: Replies | null = await this.replies.findUnique({
        where: { ReplyID: Number(ReplyID) },
      });

      if (!reply) {
        throw new NotFoundException('Reply not found');
      }

      await this.replies.delete({ where: { ReplyID: Number(ReplyID) } });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Updates reply info.
   * @param {UpdateReplyDto} editDto - The new reply info.
   * @returns A promise that resolves to the new reply.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the reply is not found.
   */
  async updateReply(editDto: UpdateReplyDto): Promise<Replies> {
    try {
      const reply: Replies | null = await this.replies.findUnique({
        where: { ReplyID: Number(editDto.ReplyID) },
      });

      if (!reply) {
        throw new NotFoundException('Reply not found');
      }

      return this.replies.update({
        where: { ReplyID: Number(editDto.ReplyID) },
        data: {
          Content: editDto.Content,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
