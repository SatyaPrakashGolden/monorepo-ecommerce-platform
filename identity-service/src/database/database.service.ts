import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.UserRepository.find();
  }

  async findOneByEmail(emailId: string): Promise<User | null> {
    return this.UserRepository.findOneBy({ emailId });
  }

  async create(UserData: Partial<User>): Promise<User> {
    const User = this.UserRepository.create(UserData);
    return this.UserRepository.save(User);
  }
}
