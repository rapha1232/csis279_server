import { ApiProperty } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({
    description: 'Title of the topic',
    example: 'My first topic',
  })
  public Title: string;

  @ApiProperty({
    description: 'Content of the topic',
    example: 'This is my first topic',
  })
  public Content: string;

  @ApiProperty({
    description: 'Timestamp of the topic creation',
    example: '2021-04-01T00:00:00.000Z',
  })
  public CreatedAt: string;

  @ApiProperty({
    description: 'ID of the user creating the topic',
    example: '1',
  })
  public CreatorID: number;
}

export class CreateEventDto {
  @ApiProperty({
    description: 'Title of the event',
    example: 'My first event',
  })
  public Title: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'This is my first event',
  })
  public Description: string;

  @ApiProperty({
    description: 'Date of the event',
    example: '2021-04-01T00:00:00.000Z',
  })
  public Date: string;

  @ApiProperty({
    description: 'Location of the event',
    example: 'My house',
  })
  public Location: string;

  @ApiProperty({
    description: 'ID of the user creating the event',
    example: '1',
  })
  public CreatorID: number;
}

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Title of the question',
    example: 'My first question',
  })
  public Title: string;

  @ApiProperty({
    description: 'Content of the question',
    example: 'This is my first question',
  })
  public Content: string;

  @ApiProperty({
    description: 'Timestamp of the question creation',
    example: '2021-04-01T00:00:00.000Z',
  })
  public CreatedAt: string;

  @ApiProperty({
    description: 'ID of the user creating the question',
    example: '1',
  })
  public CreatorID: number;
}

export class CreateReplyDto {
  @ApiProperty({
    description: 'Content of the reply',
    example: 'My first reply',
  })
  public Content: string;

  @ApiProperty({
    description: 'Timestamp of the reply creation',
    example: '2021-04-01T00:00:00.000Z',
  })
  public CreatedAt: string;

  @ApiProperty({
    description: 'ID of the user creating the reply',
    example: '1',
  })
  public CreatorID: number;

  @ApiProperty({
    description: 'ID of the Topic/Question being replied to',
    example: '1',
  })
  public TargetID: number;
}
