// replies.controller.ts
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
import { Replies } from '@prisma/client';
import { CreateReplyDto } from 'src/dtos/create.dto';
import { UpdateReplyDto } from 'src/dtos/edit.dto';
import { ReplyInteractionDTO } from 'src/dtos/interactions.dto';
import { RepliesService } from './replies.service';

@Controller('replies')
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
@ApiTags('Replies')
export class RepliesController {
  constructor(private readonly r: RepliesService) {}

  /**
   * Likes a reply.
   * @param {ReplyInteractionDTO} interactionDto - The info of the reply to be liked.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: ReplyInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Reply liked successfully.',
  })
  @Post('likeReply')
  @HttpCode(HttpStatus.CREATED)
  async likeTopic(@Body() interactionDto: ReplyInteractionDTO): Promise<void> {
    return this.r.likeReply(
      Number(interactionDto.ReplyID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Unlikes a reply.
   * @param {ReplyInteractionDTO} interactionDto - The info of the reply to be unliked.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: ReplyInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Reply unliked successfully.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('unlikeReply')
  async unlikeReply(
    @Body() interactionDto: ReplyInteractionDTO,
  ): Promise<void> {
    return this.r.unlikeReply(
      Number(interactionDto.ReplyID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Retrieves all replies from specific Discussion Topic with desired filters.
   * @param {string} q - The filter to be applied.
   * @param {number} TopicID - The ID of the replies' topic.
   * @returns {Promise<Replies[]>} A promise that resolves to an array of topics.
   */
  @ApiParam({
    name: 'q',
    description: 'Filter to be applied.',
    example: 'all',
  })
  @ApiParam({
    name: 'TopicID',
    description: "The ID of the replies' topic.",
    example: 1,
  })
  @ApiOkResponse({
    description: 'Returns an array of filtered replies.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Query Parameter.',
  })
  @Get('getAllRepliesForTopicWithFilters')
  async filteredForTopic(
    @Query('q') q: string,
    @Query('TopicID') TopicID: number,
  ): Promise<Replies[]> {
    if (
      q === 'all' ||
      q === 'popular' ||
      q === 'recent' ||
      q === 'name' ||
      q === 'old'
    ) {
      return this.r.filteredForTopic(q, Number(TopicID));
    } else {
      throw new BadRequestException('Invalid Query Parameter');
    }
  }

  /**
   * Retrieves all replies from specific Question with desired filters.
   * @param {string} q - The filter to be applied.
   * @param {number} QuestionID - The ID of the replies' question.
   * @returns {Promise<Replies[]>} A promise that resolves to an array of replies.
   */
  @ApiParam({
    name: 'q',
    description: 'Filter to be applied.',
    example: 'all',
  })
  @ApiParam({
    name: 'QuestionID',
    description: "The ID of the replies' question.",
    example: 1,
  })
  @ApiOkResponse({
    description: 'Returns an array of filtered replies.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Query Parameter.',
  })
  @Get('getAllRepliesForQuestionWithFilters')
  async filteredForQuestion(
    @Query('q') q: string,
    @Query('QuestionID') QuestionID: number,
  ): Promise<Replies[]> {
    if (
      q === 'all' ||
      q === 'popular' ||
      q === 'recent' ||
      q === 'name' ||
      q === 'old'
    ) {
      return this.r.filteredForQuestion(q, Number(QuestionID));
    } else {
      throw new BadRequestException('Invalid Query Parameter');
    }
  }

  /**
   * Creates a new reply for a topic.
   * @param {CreateReplyDto} createReplyDto - The data of the topic to be created.
   * @returns {Promise<Replies>} A promise that resolves to the created reply.
   */
  @ApiCreatedResponse({
    description: 'Reply created successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Missing Data in Request.',
  })
  @ApiBody({
    description: 'Data of the reply to be created.',
    type: CreateReplyDto,
  })
  @Post('createReplyForTopic')
  @HttpCode(HttpStatus.CREATED)
  async createForTopic(
    @Body() createReplyDto: CreateReplyDto,
  ): Promise<Replies> {
    return this.r.createForTopic(createReplyDto);
  }

  /**
   * Creates a new reply for a question.
   * @param {CreateReplyDto} createReplyDto - The data of the question to be created.
   * @returns {Promise<Replies>} A promise that resolves to the created reply.
   */
  @ApiCreatedResponse({
    description: 'Reply created successfully!',
  })
  @ApiBadRequestResponse({
    description: 'Missing Data in Request.',
  })
  @ApiBody({
    description: 'Data of the reply to be created.',
    type: CreateReplyDto,
  })
  @Post('createReplyForQuestion')
  @HttpCode(HttpStatus.CREATED)
  async createForQuestion(
    @Body() createReplyDto: CreateReplyDto,
  ): Promise<Replies> {
    return this.r.createForQuestion(createReplyDto);
  }

  /**
   * Deletes selected reply.
   * @param {number} ReplyID - The ID of the reply to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is successfull.
   */
  @ApiOkResponse({
    description: 'Reply deleted successfully.',
  })
  @ApiParam({
    name: 'ReplyID',
    description: 'ID of the reply to be deleted.',
    example: '1',
  })
  @ApiNotFoundResponse({
    description: 'Reply not found.',
  })
  @Delete('deleteReply')
  async delete(@Query('ReplyID') ReplyID: number): Promise<void> {
    return this.r.delete(Number(ReplyID));
  }

  /**
   * Updates reply info.
   * @param {UpdateReplyDto} editDto - The new reply info.
   * @returns {Promise<Replys>} A promise that resolves to the updated reply.
   */
  @ApiOkResponse({
    description: 'Reply updated successfully.',
  })
  @ApiBody({
    type: UpdateReplyDto,
  })
  @ApiNotFoundResponse({
    description: 'Reply not found.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put('updateReply')
  async update(@Body() editDto: UpdateReplyDto): Promise<Replies> {
    return this.r.updateReply(editDto);
  }
}
