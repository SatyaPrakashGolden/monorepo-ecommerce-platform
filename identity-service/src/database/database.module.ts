// database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { UserRepository } from './repositories/user.repository';

import { DatabaseService } from './database.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [DatabaseService, UserRepository],
  exports: [DatabaseService, UserRepository],
})
export class DatabaseModule {}