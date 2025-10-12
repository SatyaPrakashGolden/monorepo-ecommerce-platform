import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './modules/notification/notification.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    TypeOrmModule.forRoot(typeOrmConfig),
    DatabaseModule,
    UserModule,
    NotificationModule
  ],
})
export class AppModule {}
