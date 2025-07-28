import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { User } from '../modules/users/entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'satya',
  password: process.env.DB_PASSWORD || 'Satya@123',
  database: process.env.DB_NAME || 'fashion_store',
  entities: [ User],
  synchronize: true,
};
