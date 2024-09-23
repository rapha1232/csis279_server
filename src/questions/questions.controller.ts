// questions.controller.ts
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
import { Questions } from '@prisma/client';
import { CreateQuestionDto } from 'src/dtos/create.dto';
import { UpdateQuestionDto } from 'src/dtos/edit.dto';
import { QuestionInteractionDTO } from 'src/dtos/interactions.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
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
@ApiTags('Questions')
export class QuestionsController {
  constructor(private readonly q: QuestionsService) {}

  /**
   * Retrieves all questions.
   * @returns {Promise<Questions[]>} A promise that resolves to an array of questions.
   */
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Returns an array of questions.',
  })
  @Get('getAllQuestions')
  async getAll(): Promise<Questions[]> {
    return this.q.getAll();
  }

  /**
   * Likes a question.
   * @param {QuestionInteractionDTO} interactionDto - The info of the question to be liked.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: QuestionInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Question liked successfully.',
  })
  @Post('likeQuestion')
  @HttpCode(HttpStatus.CREATED)
  async likeQuestion(
    @Body() interactionDto: QuestionInteractionDTO,
  ): Promise<void> {
    return this.q.likeQuestion(
      Number(interactionDto.QuestionID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Unlikes a question.
   * @param {QuestionInteractionDTO} interactionDto - The info of the question to be unliked.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: QuestionInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Question unliked successfully.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('unlikeQuestion')
  async unlikeQuestion(
    @Body() interactionDto: QuestionInteractionDTO,
  ): Promise<void> {
    return this.q.unlikeQuestion(
      Number(interactionDto.QuestionID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Saves a question.
   * @param {QuestionInteractionDTO} interactionDto - The info of the question to be saved.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: QuestionInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Question saved successfully.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('saveQuestion')
  async saveQuestion(
    @Body() interactionDto: QuestionInteractionDTO,
  ): Promise<void> {
    return this.q.saveQuestion(
      Number(interactionDto.QuestionID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Unsaves a question.
   * @param {QuestionInteractionDTO} interactionDto - The info of the question to be unsaved.
   * @returns {Promise<void>} A promise that resolves when the operation is successful.
   */
  @ApiBody({
    type: QuestionInteractionDTO,
  })
  @ApiCreatedResponse({
    description: 'Question unsaved successfully.',
  })
  @Post('unsaveQuestion')
  async unsaveQuestion(
    @Body() interactionDto: QuestionInteractionDTO,
  ): Promise<void> {
    return this.q.unsaveQuestion(
      Number(interactionDto.QuestionID),
      Number(interactionDto.UserID),
    );
  }

  /**
   * Retrieves all questions with desired filters.
   * @param {string} q - The filter to be applied.
   * @param {string} search - The search term to be applied.
   * @returns {Promise<Questions[]>} A promise that resolves to an array of questions.
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
    description: 'Returns an array of filtered questions.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Query Parameter.',
  })
  @Get('getAllQuestionsWithFilters')
  async filtered(
    @Query('q') q: string,
    @Query('search') search: string,
  ): Promise<Questions[]> {
    if (
      q === 'all' ||
      q === 'popular' ||
      q === 'recent' ||
      q === 'name' ||
      q === 'old'
    ) {
      return this.q.filtered(q, String(search));
    } else {
      throw new BadRequestException('Invalid Query Parameter');
    }
  }

  /**
   * Creates a new question.
   * @param {CreateQuestionDto} createQuestionDto - The data of the question to be created.
   * @returns {Promise<Questions>} A promise that resolves to the created question.
   */
  @ApiCreatedResponse({
    description: 'Question created successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Missing Data in Request.',
  })
  @ApiBody({
    description: 'Data of the question to be created.',
    type: CreateQuestionDto,
  })
  @Post('createQuestion')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Questions> {
    return this.q.create(createQuestionDto);
  }

  /**
   * Retrieves a single question by ID.
   * @param {number} QuestionID - The ID of the question to be retrieved.
   * @returns {Promise<Questions>} A promise that resolves to the retrieved question.
   */
  @ApiOkResponse({
    description: 'Returns the requested question.',
  })
  @ApiParam({
    name: 'QuestionID',
    description: 'ID of the question to be retrieved.',
    example: '1',
  })
  @ApiNotFoundResponse({
    description: 'Question not found.',
  })
  @Get('getOneQuestion')
  async getOne(@Query('QuestionID') QuestionID: number): Promise<Questions> {
    return this.q.getOne(Number(QuestionID));
  }

  /**
   * Deletes selected question.
   * @param {number} QuestionID - The ID of the question to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is successfull.
   */
  @ApiOkResponse({
    description: 'Question deleted successfully.',
  })
  @ApiParam({
    name: 'QuestionID',
    description: 'ID of the question to be deleted.',
    example: '1',
  })
  @ApiNotFoundResponse({
    description: 'Question not found.',
  })
  @Delete('deleteQuestion')
  async delete(@Query('QuestionID') QuestionID: number): Promise<void> {
    return this.q.delete(Number(QuestionID));
  }

  /**
   * Updates question info.
   * @param {UpdateQuestionDto} editDto - The new question info.
   * @returns {Promise<Questions>} A promise that resolves to the updated question.
   */
  @ApiOkResponse({
    description: 'Question updated successfully.',
  })
  @ApiBody({
    type: UpdateQuestionDto,
  })
  @ApiNotFoundResponse({
    description: 'Question not found.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put('updateQuestion')
  async update(@Body() editDto: UpdateQuestionDto): Promise<Questions> {
    return this.q.updateQuestion(editDto);
  }
}
