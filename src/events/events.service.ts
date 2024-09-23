// events.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Events, PrismaClient } from '@prisma/client';
import { CreateEventDto } from 'src/dtos/create.dto';
import { UpdateEventDto } from 'src/dtos/edit.dto';

/**
 * Service responsible for handling events-related operations.
 */
@Injectable()
export class EventsService {
  private readonly events = new PrismaClient().events;
  private readonly likes = new PrismaClient().likes;
  private readonly saved = new PrismaClient().saved;
  private readonly logger = new Logger(EventsService.name);

  /**
   * Retrieves all events.
   * @returns A promise that resolves to an array of events.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async getAll(): Promise<Events[]> {
    try {
      return await this.events.findMany({
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
          Saved: { include: { User: true } },
        },
        orderBy: { Title: 'asc' },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Likes an event.
   * @param {number} EventID - The ID of the event to be liked.
   * @param {number} UserID - The ID of the user liking the event.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async likeEvent(EventID: number, UserID: number): Promise<void> {
    try {
      await this.events.update({
        where: { EventID: EventID },
        data: { LikesNB: { increment: 1 } },
      });

      await this.likes.create({
        data: { EventID: EventID, UserID: UserID },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Unlikes an event.
   * @param {number} EventID - The ID of the event to be unliked.
   * @param {number} UserID - The ID of the user unliking the event.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async unlikeEvent(EventID: number, UserID: number): Promise<void> {
    try {
      await this.events.update({
        where: { EventID: EventID },
        data: { LikesNB: { decrement: 1 } },
      });

      await this.likes.delete({
        where: { EventID_UserID: { EventID: EventID, UserID: UserID } },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Saves an event.
   * @param {number} EventID - The ID of the event to be Saved.
   * @param {number} UserID - The ID of the user saving the event.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async saveEvent(EventID: number, UserID: number): Promise<void> {
    try {
      await this.saved.create({
        data: { EventID: EventID, UserID: UserID },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Saves an event.
   * @param {number} EventID - The ID of the event to be Saved.
   * @param {number} UserID - The ID of the user saving the event.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async unsaveEvent(EventID: number, UserID: number): Promise<void> {
    try {
      await this.saved.delete({
        where: { EventID_UserID: { EventID: EventID, UserID: UserID } },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Retrieves all events with specified query parameters.
   * @param {string} q - The query parameter.
   * @param {string} search - The search parameter.
   * @returns A promise that resolves to an array of events.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async filtered(
    q: 'all' | 'popular' | 'recent' | 'name' | 'old',
    search: string,
  ): Promise<Events[]> {
    try {
      const allevents: Events[] = await this.events.findMany({
        where: {
          Title: { contains: search, mode: 'insensitive' },
        },
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
          Saved: { include: { User: true } },
        },
      });

      switch (q) {
        case 'all':
          // No sorting needed
          break;
        case 'popular':
          // Sort by number of likes
          allevents.sort((a, b) => b.LikesNB - a.LikesNB);
          break;
        case 'recent':
          // Sort by date (new to old)
          allevents.sort((a, b) => b.Date.getTime() - a.Date.getTime());
          break;
        case 'name':
          // Sort by name alphabetically
          allevents.sort((a, b) => a.Title.localeCompare(b.Title));
          break;
        case 'old':
          // Sort by date (old to new)
          allevents.sort((a, b) => a.Date.getTime() - b.Date.getTime());
          break;
      }

      return allevents;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Creates an event.
   * @param {CreateEventDto} createEventDto - The info of the event to be created.
   * @returns A promise that resolves to the created event.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {BadRequestException} If the request body is missing data.
   */
  async create(createEventDto: CreateEventDto): Promise<Events> {
    if (
      !createEventDto.Date ||
      !createEventDto.CreatorID ||
      !createEventDto.Title ||
      !createEventDto.Description ||
      !createEventDto.Location
    ) {
      throw new BadRequestException('Missing Data');
    }
    try {
      return this.events.create({
        data: {
          Title: createEventDto.Title,
          Description: createEventDto.Description,
          Date: createEventDto.Date,
          CreatorID: Number(createEventDto.CreatorID),
          Location: createEventDto.Location,
        },
        include: {
          CreatedBy: true,
          Likes: { include: { User: true } },
          Saved: { include: { User: true } },
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Deletes selected event.
   * @param {number} EventID - The ID of the event to delete.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the event is not found.
   */
  async delete(EventID: number): Promise<void> {
    try {
      const event: Events | null = await this.events.findUnique({
        where: { EventID: Number(EventID) },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      await this.events.delete({ where: { EventID: Number(EventID) } });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Updates event info.
   * @param {UpdateEventDto} editDto - The new event info.
   * @returns A promise that resolves to the new event.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the event is not found.
   */
  async updateEvent(editDto: UpdateEventDto): Promise<Events> {
    try {
      const event: Events | null = await this.events.findUnique({
        where: { EventID: Number(editDto.EventID) },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      return this.events.update({
        where: { EventID: Number(editDto.EventID) },
        data: {
          Title: editDto.Title,
          Description: editDto.Description,
          Date: editDto.Date,
          Location: editDto.Location,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
