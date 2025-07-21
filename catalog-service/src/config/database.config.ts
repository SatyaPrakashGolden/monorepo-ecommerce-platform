import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: 'mongodb+srv://satya:gvddB3fNptw1ABHW@cluster0.4zj2o.mongodb.net/fashion_store',
}));