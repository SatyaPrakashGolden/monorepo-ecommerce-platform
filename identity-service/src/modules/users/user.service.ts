import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { RegisterLoginDto } from './dto/register-login.dto';
import redisClient from '../../redis/redisClient';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerOrLogin(
    registerLoginDto: RegisterLoginDto,
  ): Promise<{
    message: string;
    user: { id: number; emailId: string };
    accessToken: string;
    refreshToken: string;
  }> {
    const { emailId, uniqueId } = registerLoginDto;

    let user = await this.userRepository.findOne({
      where: [{ emailId }, { uniqueId }],
    });

    if (!user) {
      try {
        user = this.userRepository.create(registerLoginDto as Partial<User>);
        user = await this.userRepository.save(user);

        return await this.generateTokensAndReturn(user, 'User registered successfully');
      } catch (error) {
        throw new BadRequestException('User registration failed');
      }
    }

    return await this.generateTokensAndReturn(user, 'User logged in successfully');
  }

  private async generateTokensAndReturn(
    user: User,
    message: string,
  ): Promise<{
    message: string;
    user: { id: number; emailId: string };
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = { id: user.id, emailId: user.emailId };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '30h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    try {
      await redisClient.set(`refreshToken:${user.id}`, refreshToken, {
        EX: 7 * 24 * 60 * 60, // 7 days
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to store refresh token in Redis');
    }

    return {
      message,
      user: { id: user.id, emailId: user.emailId },
      accessToken,
      refreshToken,
    };
  }

  async logout(requestUser: { id: number }): Promise<{ message: string }> {
    if (!requestUser?.id) {
      throw new UnauthorizedException('User ID not found in token');
    }

    const redisKey = `refreshToken:${requestUser.id}`;
    const tokenExists = await redisClient.exists(redisKey);

    if (!tokenExists) {
      return { message: 'Logged out successfully (no active session found)' };
    }

    const deleted = await redisClient.del(redisKey);

    if (deleted === 1) {
      return { message: 'Logged out successfully' };
    }

    throw new InternalServerErrorException('Logout failed: token deletion error');
  }

  async findAll(): Promise<{ msg: string; data: User[] }> {
    const users = await this.userRepository.find();
    return {
      msg: 'success',
      data: users,
    };
  }
}
