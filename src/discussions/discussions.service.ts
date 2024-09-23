// discussions.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, Topics } from '@prisma/client';
import { CreateTopicDto } from 'src/dtos/create.dto';
import { UpdateTopicDto } from 'src/dtos/edit.dto';

/**
 * Service responsible for handling discussions-related operations.
 */
@Injectable()
export class DiscussionsService {
  private readonly topics = new PrismaClient().topics;
  private readonly likes = new PrismaClient().likes;
  private readonly saved = new PrismaClient().saved;
  private readonly logger = new Logger(DiscussionsService.name);

  /**
   * Retrieves all topics.
   * @returns A promise that resolves to an array of topics.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async getAll(): Promise<Topics[]> {
    try {
      return await this.topics.findMany({
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
          Saved: { include: { User: true } },
          _count: { select: { Replies: true } },
        },
        orderBy: { Title: 'asc' },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Likes a topic.
   * @param {number} TopicID - The ID of the topic to be liked.
   * @param {number} UserID - The ID of the user liking the topic.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async likeTopic(TopicID: number, UserID: number): Promise<void> {
    try {
      await this.topics.update({
        where: { TopicID: TopicID },
        data: { LikesNb: { increment: 1 } },
      });

      await this.likes.create({
        data: { TopicID: TopicID, UserID: UserID },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Unlikes a topic.
   * @param {number} TopicID - The ID of the topic to be unliked.
   * @param {number} UserID - The ID of the user unliking the topic.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async unlikeTopic(TopicID: number, UserID: number): Promise<void> {
    try {
      await this.topics.update({
        where: { TopicID: TopicID },
        data: { LikesNb: { decrement: 1 } },
      });

      await this.likes.delete({
        where: { TopicID_UserID: { TopicID: TopicID, UserID: UserID } },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Saves a topic.
   * @param {number} TopicID - The ID of the topic to be Saved.
   * @param {number} UserID - The ID of the user saving the topic.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async saveTopic(TopicID: number, UserID: number): Promise<void> {
    try {
      await this.saved.create({
        data: { TopicID: TopicID, UserID: UserID },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Saves a topic.
   * @param {number} TopicID - The ID of the topic to be Saved.
   * @param {number} UserID - The ID of the user saving the topic.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async unsaveTopic(TopicID: number, UserID: number): Promise<void> {
    try {
      await this.saved.delete({
        where: { TopicID_UserID: { TopicID: TopicID, UserID: UserID } },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Retrieves all topics with specified query parameters.
   * @param {string} q - The query parameter.
   * @param {string} search - The search parameter.
   * @returns A promise that resolves to an array of topics.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async filtered(
    q: 'all' | 'popular' | 'recent' | 'name' | 'old',
    search: string,
  ): Promise<Topics[]> {
    try {
      const alltopics: Topics[] = await this.topics.findMany({
        where: {
          Title: { contains: search, mode: 'insensitive' },
        },
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
          Saved: { include: { User: true } },
          _count: { select: { Replies: true } },
        },
      });

      switch (q) {
        case 'all':
          // No sorting needed
          break;
        case 'popular':
          alltopics.sort((a, b) => b.LikesNb - a.LikesNb);
          break;
        case 'recent':
          alltopics.sort(
            (a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime(),
          );
          break;
        case 'name':
          alltopics.sort((a, b) => a.Title.localeCompare(b.Title));
          break;
        case 'old':
          alltopics.sort(
            (a, b) => a.CreatedAt.getTime() - b.CreatedAt.getTime(),
          );
          break;
      }

      return alltopics;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Creates a topic.
   * @param {CreateTopicDto} createTopicDto - The info of the topic to be created.
   * @returns A promise that resolves to the created topic.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {BadRequestException} If the request body is missing data.
   */
  async create(createTopicDto: CreateTopicDto): Promise<Topics> {
    if (
      !createTopicDto.CreatedAt ||
      !createTopicDto.CreatorID ||
      !createTopicDto.Title ||
      !createTopicDto.Content
    ) {
      throw new BadRequestException('Missing Data');
    }
    try {
      return this.topics.create({
        data: {
          Title: createTopicDto.Title,
          Content: createTopicDto.Content,
          CreatedAt: createTopicDto.CreatedAt,
          CreatorID: Number(createTopicDto.CreatorID),
        },
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
          Saved: { include: { User: true } },
          _count: { select: { Replies: true } },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Gets a single desired topic.
   * @param {number} TopicID - The ID of the topic to be selected.
   * @returns A promise that resolves to the desired topics.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the topic is not found.
   */
  async getOne(TopicID: number): Promise<Topics> {
    try {
      const topic: Topics | null = await this.topics.findUnique({
        where: { TopicID: Number(TopicID) },
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
          Saved: { include: { User: true } },
          _count: { select: { Replies: true } },
        },
      });

      if (!topic) {
        throw new NotFoundException('Topic not found');
      }

      return topic;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Deletes selected topic.
   * @param {number} TopicID - The ID of the topic to delete.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the topic is not found.
   */
  async delete(TopicID: number): Promise<void> {
    try {
      const topic: Topics | null = await this.topics.findUnique({
        where: { TopicID: Number(TopicID) },
      });

      if (!topic) {
        throw new NotFoundException('Topic not found');
      }

      await this.topics.delete({ where: { TopicID: Number(TopicID) } });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Updates topic info.
   * @param {UpdateTopicDto} editDto - The new topic info.
   * @returns A promise that resolves to the new topic.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the topic is not found.
   */
  async updateTopic(editDto: UpdateTopicDto): Promise<Topics> {
    try {
      const topic: Topics | null = await this.topics.findUnique({
        where: { TopicID: Number(editDto.TopicID) },
      });

      if (!topic) {
        throw new NotFoundException('Topic not found');
      }

      return this.topics.update({
        where: { TopicID: Number(editDto.TopicID) },
        data: {
          Title: editDto.Title,
          Content: editDto.Content,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
