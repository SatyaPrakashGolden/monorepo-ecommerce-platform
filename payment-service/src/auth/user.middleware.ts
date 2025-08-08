import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import redisClient from '../radis/redis-client';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
   

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }


    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header format. Expected: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }
    console.log(token)

    let decoded;
    try {
      decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      }
      if (jwtError.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid access token');
      }
      throw new UnauthorizedException('Token verification failed');
    }

    if (!decoded?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }
console.log(decoded)
    try {
      const refreshTokenKey = `refreshToken:${decoded.id}`;
      const storedRefreshToken = await redisClient.get(refreshTokenKey);

      if (!storedRefreshToken) {
        throw new UnauthorizedException('Session expired. Please log in again.');
      }
    } catch (redisError) {
      console.error('Redis error:', redisError);
      throw new UnauthorizedException('Authentication service unavailable');
    }

    // Validate required user fields
    if (!decoded.emailId ) {
      throw new UnauthorizedException('Token missing required user data');
    }

    req['user'] = {
      id: decoded.id,
      emailId: decoded.email
    };

    return true;
  }
}