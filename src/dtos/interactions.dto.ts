import { ApiProperty } from '@nestjs/swagger';

export class TopicInteractionDTO {
  @ApiProperty({
    name: 'TopicID',
    description: 'ID of the Topic to be liked/saved',
    example: '1',
  })
  public TopicID: number;

  @ApiProperty({
    name: 'UserID',
    description: 'ID of the user making the like/save interaction',
    example: '2',
  })
  public UserID: number;
}

export class EventInteractionDTO {
  @ApiProperty({
    name: 'EventID',
    description: 'ID of the Event to be liked/saved',
    example: '1',
  })
  public EventID: number;

  @ApiProperty({
    name: 'UserID',
    description: 'ID of the user making the like/save interaction',
    example: '2',
  })
  public UserID: number;
}

export class QuestionInteractionDTO {
  @ApiProperty({
    name: 'QuestionID',
    description: 'ID of the Question to be liked/saved',
    example: '1',
  })
  public QuestionID: number;

  @ApiProperty({
    name: 'UserID',
    description: 'ID of the user making the like/save interaction',
    example: '2',
  })
  public UserID: number;
}

export class ReplyInteractionDTO {
  @ApiProperty({
    name: 'ReplyID',
    description: 'ID of the Reply to be liked',
    example: '1',
  })
  public ReplyID: number;

  @ApiProperty({
    name: 'UserID',
    description: 'ID of the user making the like/save interaction',
    example: '2',
  })
  public UserID: number;
}
