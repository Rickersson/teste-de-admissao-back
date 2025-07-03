import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SyncService } from 'src/sync/sync.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) 
    private userRepository: Repository<User>,
    private jwtService: JwtService,
     private syncService: SyncService,
  ) {}

 async create(email: string, password: string): Promise<User> {
 
  const keycloakId = await this.syncService.createKeycloakUser(email, password);
  
  
  const hashedPassword = await bcrypt.hash(password, 10); 

  
  const user = this.userRepository.create({
    email,
    password: hashedPassword,
    isActive: true, 
    keycloakId 
  });

  return await this.userRepository.save(user);
}
  
  async findOne(id: number): Promise<User | any> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find(); 
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

 

  async update(id: number, email: string, password: string, isActive: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('Usuário não encontrado');
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  async generateToken(user: User): Promise<string> {
    const payload = { id: user.id, email: user.email };
    return this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET,
    });
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

 
}