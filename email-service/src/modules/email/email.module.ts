// email.module.ts
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { KafkaModule } from '../../kafka/kafka.module';

@Module({
  imports: [KafkaModule],             
  controllers: [EmailController],  
  providers: [EmailService],       
  exports: [EmailService],         
})
export class EmailModule {}
