// database.config.ts

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

import { Payment } from '../modules/payment/entities/payment.entity';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql', // changed from 'postgres' to 'mysql'
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306, // default MySQL port
  username: process.env.DB_USERNAME || 'satya', // match your MySQL username
  password: process.env.DB_PASSWORD || 'Satya@123',
  database: process.env.DB_NAME || 'ecommerce_uat',
  entities: [
    Payment,

  ],
  synchronize: true, // Use false in production and manage migrations
};
