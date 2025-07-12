// /home/satya/nest-elastic-app/src/kafka/kafka.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport, ClientKafka } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE', 
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'inventory-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'inventory-consumer',
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],  
})
export class KafkaModule {}
