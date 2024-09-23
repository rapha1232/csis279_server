// events.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Events } from '@prisma/client';
import { CreateEventDto } from 'src/dtos/create.dto';
import { UpdateEventDto } from 'src/dtos/edit.dto';
import { EventInteractionDTO } from 'src/dtos/interactions.dto';
import { EventsService } from './events.service';

@Controller('events')
@ApiUnauthorizedResponse({
  description: 'Unauthorized. Token was not sent in the header.',
})
@ApiInternalServerErrorResponse({
  description:
    'Internal Server Error. An error occurred while processing the request.',
})
@ApiBearerAuth()
@ApiHeader({
  name: 'autorization',
  description: 'The token we need for auth.',
  required: true,
  schema: {
    type: 'string',
    example: `Bearer {token}`,
  },
})
@ApiTags('Events')
export class EventsController {
  constructor(private readonly e: EventsService) {}

  /**
   * Retrieves all events.
   * @returns {Promise<Events[]>} A promise that resolves to an array of events.
   */
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Returns an array of events.',
  })
  @Get('getAllEvents')
  async getAll(): Promise<Events[]> {
    return this.e.getAll();
  }

  /**
   * Likes a event.
   * @param {EventInteractionDTO} interactionDto - The info of the event to be liked.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: EventInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Event liked successfully.',
  })
  @Post('likeEvent')
  @HttpCode(HttpStatus.CREATED)
  async likeEvent(@Body() interactionDto: EventInteractionDTO): Promise<void> {
    return this.e.likeEvent(
      Number(interactionDto.EventID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Unlikes a event.
   * @param {EventInteractionDTO} interactionDto - The info of the event to be unliked.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: EventInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Event unliked successfully.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('unlikeEvent')
  async unlikeEvent(
    @Body() interactionDto: EventInteractionDTO,
  ): Promise<void> {
    return this.e.unlikeEvent(
      Number(interactionDto.EventID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Saves a event.
   * @param {EventInteractionDTO} interactionDto - The info of the event to be saved.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: EventInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Event saved successfully.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('saveEvent')
  async saveEvent(@Body() interactionDto: EventInteractionDTO): Promise<void> {
    return this.e.saveEvent(
      Number(interactionDto.EventID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Unsaves a event.
   * @param {EventInteractionDTO} interactionDto - The info of the event to be unsaved.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: EventInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Event unsaved successfully.',
  })
  @Post('unsaveEvent')
  async unsaveEvent(
    @Body() interactionDto: EventInteractionDTO,
  ): Promise<void> {
    return this.e.unsaveEvent(
      Number(interactionDto.EventID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Retrieves all events with desired filters.
   * @param {string} q - The filter to be applied.
   * @param {string} search - The search term to be applied.
   * @returns {Promise<Events[]>} A promise that resolves to an array of events.
   */
  @ApiParam({
    name: 'q',
    description: 'Filter to be applied.',
    example: 'all',
  })
  @ApiParam({
    name: 'search',
    description: 'Search term to be applied.',
    example: 'search term',
  })
  @ApiOkResponse({
    description: 'Returns an array of filtered events.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Query Parameter.',
  })
  @Get('getAllEventsWithFilters')
  async filtered(
    @Query('q') q: string,
    @Query('search') search: string,
  ): Promise<Events[]> {
    if (
      q === 'all' ||
      q === 'popular' ||
      q === 'recent' ||
      q === 'name' ||
      q === 'old'
    ) {
      return this.e.filtered(q, String(search));
    } else {
      throw new BadRequestException('Invalid Query Parameter');
    }
  }

  /**
   * Creates a new event.
   * @param {CreateEventDto} createEventDto - The data of the event to be created.
   * @returns {Promise<Events>} A promise that resolves to the created event.
   */
  @ApiCreatedResponse({
    description: 'Event created successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Missing Data in Request.',
  })
  @ApiBody({
    description: 'Data of the event to be created.',
    type: CreateEventDto,
  })
  @Post('createEvent')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEventDto: CreateEventDto): Promise<Events> {
    return this.e.create(createEventDto);
  }

  /**
   * Deletes selected event.
   * @param {number} EventID - The ID of the event to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is successfull.
   */
  @ApiOkResponse({
    description: 'Event deleted successfully.',
  })
  @ApiParam({
    name: 'EventID',
    description: 'ID of the event to be deleted.',
    example: '1',
  })
  @ApiNotFoundResponse({
    description: 'Event not found.',
  })
  @Delete('deleteEvent')
  async delete(@Query('EventID') EventID: number): Promise<void> {
    return this.e.delete(Number(EventID));
  }

  /**
   * Updates event info.
   * @param {UpdateEventDto} editDto - The new event info.
   * @returns {Promise<Events>} A promise that resolves to the updated event.
   */
  @ApiOkResponse({
    description: 'Event updated successfully.',
  })
  @ApiBody({
    type: UpdateEventDto,
  })
  @ApiNotFoundResponse({
    description: 'Event not found.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put('updateEvent')
  async update(@Body() editDto: UpdateEventDto): Promise<Events> {
    return this.e.updateEvent(editDto);
  }
}
