// discussions.controller.ts
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
import { Topics } from '@prisma/client';
import { CreateTopicDto } from 'src/dtos/create.dto';
import { UpdateTopicDto } from 'src/dtos/edit.dto';
import { TopicInteractionDTO } from 'src/dtos/interactions.dto';
import { DiscussionsService } from './discussions.service';

@Controller('discussions')
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
@ApiTags('Discussions')
export class DiscussionsController {
  constructor(private readonly d: DiscussionsService) {}

  /**
   * Retrieves all topics.
   * @returns {Promise<Topics[]>} A promise that resolves to an array of topics.
   */
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Returns an array of topics.',
  })
  @Get('getAllTopics')
  async getAll(): Promise<Topics[]> {
    return this.d.getAll();
  }

  /**
   * Likes a topic.
   * @param {TopicInteractionDTO} interactionDto - The info of the topic to be liked.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: TopicInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Topic liked successfully.',
  })
  @Post('likeTopic')
  @HttpCode(HttpStatus.CREATED)
  async likeTopic(@Body() interactionDto: TopicInteractionDTO): Promise<void> {
    return this.d.likeTopic(
      Number(interactionDto.TopicID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Unlikes a topic.
   * @param {TopicInteractionDTO} interactionDto - The info of the topic to be unliked.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: TopicInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Topic unliked successfully.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('unlikeTopic')
  async unlikeTopic(
    @Body() interactionDto: TopicInteractionDTO,
  ): Promise<void> {
    return this.d.unlikeTopic(
      Number(interactionDto.TopicID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Saves a topic.
   * @param {TopicInteractionDTO} interactionDto - The info of the topic to be saved.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: TopicInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Topic saved successfully.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('saveTopic')
  async saveTopic(@Body() interactionDto: TopicInteractionDTO): Promise<void> {
    return this.d.saveTopic(
      Number(interactionDto.TopicID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Unsaves a topic.
   * @param {TopicInteractionDTO} interactionDto - The info of the topic to be unsaved.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: TopicInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Topic unsaved successfully.',
  })
  @Post('unsaveTopic')
  async unsaveTopic(
    @Body() interactionDto: TopicInteractionDTO,
  ): Promise<void> {
    return this.d.unsaveTopic(
      Number(interactionDto.TopicID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Retrieves all topics with desired filters.
   * @param {string} q - The filter to be applied.
   * @param {string} search - The search term to be applied.
   * @returns {Promise<Topics[]>} A promise that resolves to an array of topics.
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
    description: 'Returns an array of filtered topics.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Query Parameter.',
  })
  @Get('getAllTopicsWithFilters')
  async filtered(
    @Query('q') q: string,
    @Query('search') search: string,
  ): Promise<Topics[]> {
    if (
      q === 'all' ||
      q === 'popular' ||
      q === 'recent' ||
      q === 'name' ||
      q === 'old'
    ) {
      return this.d.filtered(q, String(search));
    } else {
      throw new BadRequestException('Invalid Query Parameter');
    }
  }

  /**
   * Creates a new topic.
   * @param {CreateTopicDto} createTopicDto - The data of the topic to be created.
   * @returns {Promise<Topics>} A promise that resolves to the created topic.
   */
  @ApiCreatedResponse({
    description: 'Topic created successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Missing Data in Request.',
  })
  @ApiBody({
    description: 'Data of the topic to be created.',
    type: CreateTopicDto,
  })
  @Post('createTopic')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTopicDto: CreateTopicDto): Promise<Topics> {
    return this.d.create(createTopicDto);
  }

  /**
   * Retrieves a single topic by ID.
   * @param {number} TopicID - The ID of the topic to be retrieved.
   * @returns {Promise<Topics>} A promise that resolves to the retrieved topic.
   */
  @ApiOkResponse({
    description: 'Returns the requested topic.',
  })
  @ApiParam({
    name: 'TopicID',
    description: 'ID of the topic to be retrieved.',
    example: '1',
  })
  @ApiNotFoundResponse({
    description: 'Topic not found.',
  })
  @Get('getOneTopic')
  async getOne(@Query('TopicID') TopicID: number): Promise<Topics> {
    return this.d.getOne(Number(TopicID));
  }

  /**
   * Deletes selected topic.
   * @param {number} TopicID - The ID of the topic to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is successfull.
   */
  @ApiOkResponse({
    description: 'Topic deleted successfully.',
  })
  @ApiParam({
    name: 'TopicID',
    description: 'ID of the topic to be deleted.',
    example: '1',
  })
  @ApiNotFoundResponse({
    description: 'Topic not found.',
  })
  @Delete('deleteTopic')
  async delete(@Query('TopicID') TopicID: number): Promise<void> {
    return this.d.delete(Number(TopicID));
  }

  /**
   * Updates topic info.
   * @param {UpdateTopicDto} editDto - The new topic info.
   * @returns {Promise<Topics>} A promise that resolves to the updated topic.
   */
  @ApiOkResponse({
    description: 'Topic updated successfully.',
  })
  @ApiBody({
    type: UpdateTopicDto,
  })
  @ApiNotFoundResponse({
    description: 'Topic not found.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put('updateTopic')
  async update(@Body() editDto: UpdateTopicDto): Promise<Topics> {
    return this.d.updateTopic(editDto);
  }
}
