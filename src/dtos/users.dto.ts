import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The first name of the user.',
    example: 'John',
    minLength: 2,
    maxLength: 30,
  })
  public FirstName: string;

  @ApiProperty({
    description: 'The last name of the user.',
    example: 'Doe',
    minLength: 2,
    maxLength: 30,
  })
  public LastName: string;

  @IsEmail()
  @ApiProperty({
    description: 'The email of the user.',
    example: 'john.doe@example.com',
  })
  public Email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The password of the user.',
    example: 'password123',
    minLength: 6,
    maxLength: 32,
  })
  public Password: string;
}

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    description: 'The email of the user.',
    example: 'john.doe@example.com',
  })
  public Email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The password of the user.',
    example: 'password123',
    minLength: 6,
    maxLength: 32,
  })
  public Password: string;
}
