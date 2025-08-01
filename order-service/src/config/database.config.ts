import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

import { Order } from '../modules/order/entities/order.entity';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql', // change this to mysql
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306, // MySQL default port
  username: process.env.DB_USERNAME || 'satya', // your MySQL user
  password: process.env.DB_PASSWORD || 'Satya@123',
  database: process.env.DB_NAME || 'ecommerce_uat',
  entities: [
    Order,
  ],
  synchronize: true, // use false in production
};
