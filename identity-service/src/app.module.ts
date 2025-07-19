import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/database.config';

import { DatabaseModule } from './database/database.module';

import { UserModule } from './modules/users/user.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),


    DatabaseModule,

    UserModule
  ],
})
export class AppModule {}

