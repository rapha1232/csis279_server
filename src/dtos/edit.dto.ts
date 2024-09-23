import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: "The user's id.",
    example: '1',
  })
  public UserID: number;

  @ApiProperty({
    description: 'The new first name of the user.',
    example: 'John',
    minLength: 2,
    maxLength: 30,
  })
  public FirstName: string;

  @ApiProperty({
    description: 'The new last name of the user.',
    example: 'Doe',
    minLength: 2,
    maxLength: 30,
  })
  public LastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The new password of the user.',
    example: 'password123',
    minLength: 6,
    maxLength: 32,
  })
  public Password: string;
}

export class UpdateEventDto {
  @ApiProperty({
    description: "The event's id.",
    example: '1',
  })
  public EventID: number;

  @ApiProperty({
    description: 'The new title of the event.',
    example: 'Title 1',
    minLength: 2,
    maxLength: 40,
  })
  public Title: string;

  @ApiProperty({
    description: 'The new description of the event.',
    example: 'Description 12345',
    minLength: 10,
    maxLength: 2000,
  })
  public Description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The new date of the event.',
    example: new Date().toISOString(),
  })
  public Date: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The new location of the event.',
    example: 'New York',
    minLength: 2,
    maxLength: 40,
  })
  public Location: string;
}

export class UpdateTopicDto {
  @ApiProperty({
    description: "The topic's id.",
    example: '1',
  })
  public TopicID: number;

  @ApiProperty({
    description: 'The new title of the topic.',
    example: 'Title 1',
    minLength: 2,
    maxLength: 40,
  })
  public Title: string;

  @ApiProperty({
    description: 'The new content of the topic.',
    example: 'Content 12345',
    minLength: 10,
    maxLength: 2000,
  })
  public Content: string;
}

export class UpdateQuestionDto {
  @ApiProperty({
    description: "The question's id.",
    example: '1',
  })
  public QuestionID: number;

  @ApiProperty({
    description: 'The new title of the question.',
    example: 'Title 1',
    minLength: 2,
    maxLength: 40,
  })
  public Title: string;

  @ApiProperty({
    description: 'The new content of the question.',
    example: 'Content 12345',
    minLength: 10,
    maxLength: 2000,
  })
  public Content: string;
}

export class UpdateReplyDto {
  @ApiProperty({
    description: "The reply's id.",
    example: '1',
  })
  public ReplyID: number;

  @ApiProperty({
    description: 'The new content of the reply.',
    example: 'Content 1',
    minLength: 2,
    maxLength: 40,
  })
  public Content: string;
}
