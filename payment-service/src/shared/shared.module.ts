// shared/shared.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { Partitioners } from 'kafkajs';

import { SagaState } from './entities/saga-state.entity';
import { SagaOrchestratorService } from './services/saga-orchestrator.service';
import { SagaMonitorService } from './services/saga-monitor.service';
import { SagaHealthController } from './controllers/saga-health.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SagaState]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        },
      },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [SagaHealthController],
  providers: [SagaOrchestratorService, SagaMonitorService],
  exports: [SagaOrchestratorService, SagaMonitorService],
})
export class SharedModule {}