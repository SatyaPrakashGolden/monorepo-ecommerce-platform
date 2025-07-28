import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserAuthGuard } from '../../auth/user.middleware';
import { errorResponse, successResponse } from '../../utils/error.util';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'register' })
  async registerMessage(@Payload() registerDto: RegisterUserDto) {
    try {
      const result = await this.userService.register(registerDto);
      return result;
    } catch (error) {
      throw errorResponse(error, 'User registration failed', 400, true);
    }
  }

  @MessagePattern({ cmd: 'login' })
  async loginMessage(@Payload() loginDto: LoginUserDto) {
    try {
      const result = await this.userService.login(loginDto);
      return result;
    } catch (error) {
      throw errorResponse(error, 'Login failed', 401, true);
    }
  }

  @MessagePattern({ cmd: 'logout' })
  async logoutMessagePattern(@Payload() data: { id: number }) {
    try {
      const result = await this.userService.logout(data);
      return result;
    } catch (error) {
      throw errorResponse(error, 'Logout failed', 500, true);
    }
  }
}
