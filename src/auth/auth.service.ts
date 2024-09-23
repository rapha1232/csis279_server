import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { verify } from 'jsonwebtoken';
import { UpdateUserDto } from 'src/dtos/edit.dto';
import { CreateUserDto } from '../dtos/users.dto';
import { User } from '../interfaces/user.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly users = new PrismaClient().user;
  constructor(private jwtService: JwtService) {}
  async signup(userData: CreateUserDto): Promise<User> {
    /* check for missing data */
    if (!userData.Email || !userData.Password) {
      /* status code is 400 */
      throw new BadRequestException('Missing Data');
    }

    /* check if the email is in use.
     * Note that this check is not necessary,
     * but this is the only way to know whether the email is taken
     *  */
    const userEmail: User | null = await this.users.findUnique({
      where: { Email: userData.Email },
    });

    /* check if already exists */
    if (userEmail) {
      /* status code is 401 */
      throw new UnauthorizedException('Email exists');
    }

    const hashedPassword = await hash(userData.Password, 10);

    try {
      /* try to create user */
      return this.users.create({
        data: { ...userData, Password: hashedPassword },
      });
    } catch (e) {
      this.logger.fatal(e);
      throw new InternalServerErrorException();
    }
  }

  async login(
    Email: string,
    Password: string,
  ): Promise<{ cookie: string; findUser: User }> {
    /* check for missing data */
    if (!Email || !Password) {
      /* status code is 400 */
      throw new BadRequestException('Missing Data');
    }

    /* fetch user */
    const user: User | null = await this.users.findUnique({
      where: { Email: Email },
    });

    /* Check if user exists */
    if (!user) {
      /* status code is 404 */
      throw new NotFoundException('User does not exist');
    }

    /* stores pass and hashed pass comparison */
    let correct: boolean;
    try {
      correct = await compare(Password, user.Password);
    } catch (e) {
      this.logger.fatal(e);
      throw new InternalServerErrorException();
    }
    /* Check for mismatch */
    if (!correct) {
      /* status code is 401 */
      throw new UnauthorizedException('Cannot login with these credentials');
    }
    /* payload to be added to the JWT token */
    const payload = { sub: user.UserID, email: user.Email };

    /* status code defined in controller */
    return {
      cookie: await this.jwtService.signAsync(payload, {
        expiresIn: Date.now() + parseInt(process.env.JWT_DURATION),
      }),
      findUser: user,
    };
  }

  async verifyToken(token: string): Promise<{ UserID: number }> {
    return new Promise((resolve, reject) => {
      verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as { UserID: number });
        }
      });
    });
  }

  /**
   * Gets a single desired user.
   * @param {number} UserID - The ID of the user to be selected.
   * @returns A promise that resolves to the desired user.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the user is not found.
   */
  async getOneUser(UserID: number): Promise<User> {
    try {
      const user: User | null = await this.users.findUnique({
        where: { UserID: Number(UserID) },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Gets a all users.
   * @returns A promise that resolves to the desired users.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const users: User[] | null = await this.users.findMany();

      return users;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Deletes selected user.
   * @param {number} UserID - The ID of the user to delete.
   * @returns A promise that resolves when the operation is successful.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the user is not found.
   */
  async deleteUser(UserID: number): Promise<void> {
    try {
      const user: User | null = await this.users.findUnique({
        where: { UserID: Number(UserID) },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.users.delete({ where: { UserID: Number(UserID) } });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  /**
   * Updates user info.
   * @param {UpdateUserDto} editDto - The new user info.
   * @returns A promise that resolves to the new user.
   * @throws {InternalServerErrorException} If an error occurs during database interaction.
   * @throws {NotFoundException} If the user is not found.
   */
  async updateUser(editDto: UpdateUserDto): Promise<User> {
    try {
      const user: User | null = await this.users.findUnique({
        where: { UserID: Number(editDto.UserID) },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await hash(editDto.Password, 10);

      return this.users.update({
        where: { UserID: Number(editDto.UserID) },
        data: {
          FirstName: editDto.FirstName,
          LastName: editDto.LastName,
          Password: hashedPassword,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
