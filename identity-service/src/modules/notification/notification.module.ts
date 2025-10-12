// src/modules/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UserFcmToken } from './entity/user.fcm.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserFcmToken]), // 👈 register the entity here
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
