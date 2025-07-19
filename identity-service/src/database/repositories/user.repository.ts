// User.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';


@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByRole(role: string): Promise<User[]> {
    return this.createQueryBuilder('User')
      .where('User.rolename = :role', { role })
      .getMany();
  }
}
