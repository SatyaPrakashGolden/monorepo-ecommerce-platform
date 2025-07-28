import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {RegisterUserDto} from './dto/create-user.dto'
import {LoginUserDto} from './dto/login-user.dto'
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import redisClient from '../../redis/redisClient';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}



async login(loginDto: LoginUserDto): Promise<{
  message: string;
  user: { id: number; emailId: string };
  accessToken: string;
  refreshToken: string;
}> {
  const { emailId, password } = loginDto;

  const user = await this.userRepository.findOne({ where: { emailId } });

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new UnauthorizedException('Invalid email or password');
  }

  return this.generateTokensAndReturn(user, 'Login successful');
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

   async register(registerDto: RegisterUserDto): Promise<{ message: string; userId: number }> {
    const { emailId, password, ...rest } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { emailId } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const newUser = this.userRepository.create({
      ...rest,
      emailId,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);

    return {
      message: 'User registered successfully',
      userId: savedUser.id,
    };
  }
  
}
