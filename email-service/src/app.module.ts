// app.module.ts
import { Module } from '@nestjs/common';
import { EmailModule } from './modules/email/email.module';
import { KafkaModule } from './kafka/kafka.module'; 

@Module({
  imports: [EmailModule, KafkaModule], 
})
export class AppModule {}
