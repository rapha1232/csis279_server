// questions.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, Questions } from '@prisma/client';
import { CreateQuestionDto } from 'src/dtos/create.dto';
import { UpdateQuestionDto } from 'src/dtos/edit.dto';

/**
 * Service responsible for handling questions-related operations.
 */
@Injectable()
export class QuestionsService {
  private readonly questions = new PrismaClient().questions;
  private readonly likes = new PrismaClient().likes;
  private readonly saved = new PrismaClient().saved;
  private readonly logger = new Logger(QuestionsService.name);

  /**
   * Retrieves all questions.
   * @returns A promise that resolves to an array of questions.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async getAll(): Promise<Questions[]> {
    try {
      return await this.questions.findMany({
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
      throw new InternalServerErrorException();
    }
  }

  /**
   * Likes a question.
   * @param {number} QuestionID - The ID of the question to be liked.
   * @param {number} UserID - The ID of the user liking the question.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async likeQuestion(QuestionID: number, UserID: number): Promise<void> {
    try {
      await this.questions.update({
        where: { QuestionID: QuestionID },
        data: { LikesNb: { increment: 1 } },
      });

      await this.likes.create({
        data: { QuestionID: QuestionID, UserID: UserID },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Unlikes a question.
   * @param {number} QuestionID - The ID of the question to be unliked.
   * @param {number} UserID - The ID of the user unliking the question.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async unlikeQuestion(QuestionID: number, UserID: number): Promise<void> {
    try {
      await this.questions.update({
        where: { QuestionID: QuestionID },
        data: { LikesNb: { decrement: 1 } },
      });

      await this.likes.delete({
        where: {
          QuestionID_UserID: { QuestionID: QuestionID, UserID: UserID },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Saves a question.
   * @param {number} QuestionID - The ID of the question to be Saved.
   * @param {number} UserID - The ID of the user saving the question.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async saveQuestion(QuestionID: number, UserID: number): Promise<void> {
    try {
      await this.saved.create({
        data: { QuestionID: QuestionID, UserID: UserID },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Saves a question.
   * @param {number} QuestionID - The ID of the question to be Saved.
   * @param {number} UserID - The ID of the user saving the question.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async unsaveQuestion(QuestionID: number, UserID: number): Promise<void> {
    try {
      await this.saved.delete({
        where: {
          QuestionID_UserID: { QuestionID: QuestionID, UserID: UserID },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Retrieves all questions with specified query parameters.
   * @param {string} q - The query parameter.
   * @param {string} search - The search parameter.
   * @returns A promise that resolves to an array of questions.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async filtered(
    q: 'all' | 'popular' | 'recent' | 'name' | 'old',
    search: string,
  ): Promise<Questions[]> {
    try {
      const allquestions: Questions[] = await this.questions.findMany({
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
          allquestions.sort((a, b) => b.LikesNb - a.LikesNb);
          break;
        case 'recent':
          allquestions.sort(
            (a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime(),
          );
          break;
        case 'name':
          allquestions.sort((a, b) => a.Title.localeCompare(b.Title));
          break;
        case 'old':
          allquestions.sort(
            (a, b) => a.CreatedAt.getTime() - b.CreatedAt.getTime(),
          );
          break;
      }

      return allquestions;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Creates a question.
   * @param {CreateQuestionDto} createQuestionDto - The info of the question to be created.
   * @returns A promise that resolves to the created question.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {BadRequestException} If the request body is missing data.
   */
  async create(createQuestionDto: CreateQuestionDto): Promise<Questions> {
    if (
      !createQuestionDto.CreatedAt ||
      !createQuestionDto.CreatorID ||
      !createQuestionDto.Title ||
      !createQuestionDto.Content
    ) {
      throw new BadRequestException('Missing Data');
    }
    try {
      return this.questions.create({
        data: {
          Title: createQuestionDto.Title,
          Content: createQuestionDto.Content,
          CreatedAt: createQuestionDto.CreatedAt,
          CreatorID: Number(createQuestionDto.CreatorID),
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
      throw new InternalServerErrorException();
    }
  }

  /**
   * Gets a single desired question.
   * @param {number} QuestionID - The ID of the question to be selected.
   * @returns A promise that resolves to the desired questions.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the question is not found.
   */
  async getOne(QuestionID: number): Promise<Questions> {
    try {
      const question: Questions | null = await this.questions.findUnique({
        where: { QuestionID: QuestionID },
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
          Saved: { include: { User: true } },
          _count: { select: { Replies: true } },
        },
      });

      if (!question) {
        throw new NotFoundException('Question not found');
      }

      return question;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Deletes selected question.
   * @param {number} QuestionID - The ID of the question to delete.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the question is not found.
   */
  async delete(QuestionID: number): Promise<void> {
    try {
      const question: Questions | null = await this.questions.findUnique({
        where: { QuestionID: Number(QuestionID) },
      });

      if (!question) {
        throw new NotFoundException('Question not found');
      }

      await this.questions.delete({
        where: { QuestionID: Number(QuestionID) },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Updates question info.
   * @param {UpdateQuestionDto} editDto - The new question info.
   * @returns A promise that resolves to the new question.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the question is not found.
   */
  async updateQuestion(editDto: UpdateQuestionDto): Promise<Questions> {
    try {
      const question: Questions | null = await this.questions.findUnique({
        where: { QuestionID: Number(editDto.QuestionID) },
      });

      if (!question) {
        throw new NotFoundException('Question not found');
      }

      return this.questions.update({
        where: { QuestionID: Number(editDto.QuestionID) },
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
