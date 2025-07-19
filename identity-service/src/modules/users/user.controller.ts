import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UserService } from './user.service';
import { RegisterLoginDto } from './dto/register-login.dto';
import { User } from './entities/user.entity';
import { UserAuthGuard } from '../../auth/user.middleware';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register-login')
  async registerOrLogin(
    @Body() registerLoginDto: RegisterLoginDto,
  ): Promise<{
    message: string;
    user: { id: number; emailId: string };
    accessToken: string;
    refreshToken: string;
  }> {
    return this.userService.registerOrLogin(registerLoginDto);
  }

  @MessagePattern({ cmd: 'register-login' })
  async registerOrLoginMessagePattern(
    @Payload() registerLoginDto: RegisterLoginDto,
  ): Promise<{
    message: string;
    user: { id: number; emailId: string };
    accessToken: string;
    refreshToken: string;
  }> {
    return this.userService.registerOrLogin(registerLoginDto);
  }

  @MessagePattern({ cmd: 'getallusers' })
  async getAllUsers(): Promise<{ msg: string; data: User[] }> {
    return this.userService.findAll();
  }

  @Post('logout')
  @UseGuards(UserAuthGuard)
  async logout(@Request() req): Promise<{ message: string }> {
    return this.userService.logout(req.user);
  }

  @MessagePattern({ cmd: 'logout' })
  async logoutMessagePattern(
    @Payload() data: { id: number },
  ): Promise<{ message: string }> {
    return this.userService.logout(data);
  }
}
