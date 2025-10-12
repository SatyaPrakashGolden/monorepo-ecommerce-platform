// src/modules/users/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../../auth/auth.module';
import { NotificationModule } from '../notification/notification.module'; // ✅ imported module

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    NotificationModule, // ✅ include it here so NotificationService is available
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
