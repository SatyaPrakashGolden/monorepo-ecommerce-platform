import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import redisClient from '../radis/redis-client';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // Check if the user is a Super Admin
      if (decoded.roleId !== 1 && decoded.email !== 'satya@flipitnews.com') {
        throw new ForbiddenException('Access restricted to Super Admin');
      }

      // Check Redis for the Refresh Token
      const refreshTokenKey = `refreshToken:${decoded.id}`;
      const storedRefreshToken = await redisClient.get(refreshTokenKey);

      if (!storedRefreshToken) {
        throw new UnauthorizedException('Session expired. Please log in again.');
      }

      req['user'] = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        roleId: decoded.roleId,
      };

      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}