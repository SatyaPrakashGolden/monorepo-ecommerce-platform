import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; // ✅ IMPORT THIS
import { PaymentSagaModule } from './modules/payment/payment.module';
import { typeOrmConfig } from './config/database.config'; // ✅ Your DB config
import { PaymentController } from './modules/payment/payment.controller';
import { PaymentService } from './modules/payment/payment.service';
import { PaymentSagaOrchestrator } from './modules/payment/payment-saga-orchestrator.service';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database connection
    TypeOrmModule.forRoot(typeOrmConfig),

    // Application modules
    PaymentSagaModule,
    AuthModule, // Only import if needed globally
  ],
})
export class AppModule {}
