import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; // ✅ IMPORT THIS
import { PaymentModule } from './modules/payment/payment.module';
import { typeOrmConfig } from './config/database.config'; // ✅ Your DB config

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig), // ✅ ADD THIS LINE
    PaymentModule,
  ],
})
export class AppModule {}