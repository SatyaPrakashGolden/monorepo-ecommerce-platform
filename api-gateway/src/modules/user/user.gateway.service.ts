import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterUserDto } from './dto/create-user.dto';

@Injectable()
export class UserGatewayService {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly ratingClient: ClientProxy,
  ) { }

  async createUser(createUserDto: RegisterUserDto) {
    return await firstValueFrom(
      this.ratingClient.send({ cmd: 'register' }, createUserDto),
    );
  }

  async login(login: any) {
    return await firstValueFrom(
      this.ratingClient.send({ cmd: 'login' }, login),
    );
  }

}


