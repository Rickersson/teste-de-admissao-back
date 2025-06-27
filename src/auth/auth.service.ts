import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>, private jwtService: JwtService
  ) {}

  // Criar usuário
  async create(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: hashedPassword });
    return await this.userRepository.save(user);
  }

  // Listar usuários
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

 async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // Atualizar usuário
  async update(id: number, email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('Usuário não encontrado');
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    return await this.userRepository.save(user);
  }

async generateToken(user: User): Promise<string> {
  const payload = { id: user.id, email: user.email };
  return this.jwtService.sign(payload, {
    expiresIn: '1h',
    secret: process.env.JWT_SECRET,
  });
}

  // Deletar usuário
  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}