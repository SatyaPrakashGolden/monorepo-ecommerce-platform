

import { Module } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

import { ClientsModule, Transport, } from '@nestjs/microservices';


@Module({
  providers: [
    {
      provide: 'KAFKA_SERVICE',
      useFactory: () => {
        return new ClientKafka({
          client: {
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'order-service-group',
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        });
      },
    },
  ],
  exports: ['KAFKA_SERVICE'], // 
})
export class KafkaModule {}
