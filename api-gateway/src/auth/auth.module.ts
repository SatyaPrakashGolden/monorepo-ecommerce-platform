import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BcryptService } from './bcrypt.service';
import { config } from 'dotenv';

config(); 

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET , 
      signOptions: { expiresIn: '30h' },
    }),
  ],
  providers: [BcryptService],
  exports: [JwtModule, BcryptService],
})
export class AuthModule {}