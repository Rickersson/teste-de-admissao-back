import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(email: string, password: string): Promise<User> {
    const user = this.create({ email, password });
    return await this.save(user);
  }

  findActiveUsers() {
    return this.find({ where: { isActive: true } });
  }
}