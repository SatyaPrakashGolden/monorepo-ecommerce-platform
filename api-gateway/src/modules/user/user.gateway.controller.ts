import { Controller, Post, Body } from '@nestjs/common';
import { UserGatewayService } from './user.gateway.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { successResponse, throwHttpFormattedError, errorResponseGateway } from '../../utils/error.util';

@Controller('user')
export class UserController {
  constructor(
    private readonly userGatewayService: UserGatewayService,
  ) { }


  @Post('register-user')
  async addRating(@Body() registerUserData: RegisterUserDto) {
    try {
      const result = await this.userGatewayService.createUser(registerUserData);
      return successResponse(result, 'user created sucessfully');
    } catch (error) {
      throwHttpFormattedError(error);
    }
  }


  @Post('login')
  async login(@Body() loginData: any) {
    try {
      const result = await this.userGatewayService.login(loginData);
      return result;
    } catch (error) {
      throwHttpFormattedError(error);
    }
  }
}