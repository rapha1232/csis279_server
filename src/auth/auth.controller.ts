import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Response } from 'express';
import { UpdateUserDto } from 'src/dtos/edit.dto';
import { RequestWithUser } from 'src/middlewares/token.middleware';
import { CreateUserDto, LoginDto } from '../dtos/users.dto';
import { AuthGuard, SkipAuth } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiInternalServerErrorResponse({
  description:
    'Internal Server Error. An error occurred while processing the request.',
})
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    type: CreateUserDto,
    description: 'User signup credentials.',
  })
  @ApiCreatedResponse({
    description: 'User created successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Missing Data',
  })
  @ApiUnauthorizedResponse({
    description: 'User (email) already exists',
  })
  @Post('signup')
  async signUp(
    @Body() userData: CreateUserDto,
    @Res() res: Response,
  ): Promise<void> {
    const signUpUserData = await this.authService.signup(userData);
    res.status(201).json({ data: signUpUserData, message: 'signup' });
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: LoginDto,
    description: 'User signin credentials.',
  })
  @ApiOkResponse({
    description: 'User logged in successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Missing Data',
  })
  @ApiNotFoundResponse({
    description: 'User does not exist. Sign Up required',
  })
  @ApiUnauthorizedResponse({
    description: 'Wrong Credentials',
  })
  @Post('login')
  async logIn(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    const { cookie, findUser } = await this.authService.login(
      loginDto.Email,
      loginDto.Password,
    );
    res.setHeader('Set-Cookie', [cookie]);
    res.status(200).json({ data: findUser, message: 'login', cookie });
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Token was not sent in the header.',
  })
  @ApiHeader({
    name: 'authorization',
    description: 'The token needed for auth.',
    required: true,
    schema: {
      type: 'string',
      example: `Bearer {token}`,
    },
  })
  @ApiOkResponse({
    description: 'User logged out successfully.',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async logOut(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response<any, Record<string, any>>> {
    req.userEntity = null;
    res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
    return res.json({ message: 'logout' });
  }

  /**
   * Retrieves a single user by ID.
   * @param {number} UserID - The ID of the user to be retrieved.
   * @returns {Promise<User>} A promise that resolves to the retrieved User.
   */
  @Get('getOneUser')
  @ApiParam({
    name: 'UserID',
    description: 'The id of the desired user.',
    example: 1,
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Token was not sent in the header.',
  })
  @ApiOkResponse({
    description: 'User found successfully.',
  })
  @ApiNotFoundResponse({
    description: 'User does not exist.',
  })
  @HttpCode(HttpStatus.OK)
  async getOneUser(@Query('UserID') UserID: number): Promise<User> {
    return this.authService.getOneUser(UserID);
  }

  /**
   * Retrieves all users.
   * @returns {Promise<User[]>} A promise that resolves to the retrieved Users.
   */
  @Get('getAllUsers')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Token was not sent in the header.',
  })
  @ApiOkResponse({
    description: 'Successful request.',
  })
  @HttpCode(HttpStatus.OK)
  async getAllUsers(): Promise<User[]> {
    return this.authService.getAllUsers();
  }

  /**
   * Deletes selected user.
   * @param {number} UserID - The ID of the user to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is successfull.
   */
  @ApiNoContentResponse({
    description: 'User deleted successfully.',
  })
  @ApiParam({
    name: 'UserID',
    description: 'ID of the user to be deleted.',
    example: '1',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('deleteUser')
  async delete(@Query('UserID') UserID: number): Promise<void> {
    return this.authService.deleteUser(Number(UserID));
  }

  /**
   * Updates user info.
   * @param {UpdateUserDto} editDto - The new user info.
   * @returns {Promise<User>} A promise that resolves to the updated user.
   */
  @ApiOkResponse({
    description: 'User updated successfully.',
  })
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put('updateUser')
  async update(@Body() editDto: UpdateUserDto): Promise<User> {
    return this.authService.updateUser(editDto);
  }
}
