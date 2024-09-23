import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { JwtClaims } from './middleware.types';

// An interface that allows the request to have a user property.
export interface RequestWithUser extends Request {
  userEntity: User;
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  // Inject the JwtService and PrismaService to use their objects.
  constructor(
    private jwtService: JwtService,
    private users = new PrismaClient().user,
  ) {}

  // Define the use function for NestMiddleware
  async use(req: RequestWithUser, _: Response, next: NextFunction) {
    // Get the token from the request header and check if missing.
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Verify the token and decode it and attach it to the request.
    try {
      const claims = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      }) as JwtClaims;

      // Assuming you have a Prisma model named User and a corresponding service method
      const user = await this.users.findUnique({
        where: { UserID: claims.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User does not exist.');
      }

      req.userEntity = user;
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
