import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entity/user.entity';
import { AuthGuard } from './auth.guard';
import * as bcrypt from 'bcrypt';
import { KeycloakAdminService } from 'src/sync/keycloak-admin.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Any } from 'typeorm';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private keycloakAdminService: KeycloakAdminService) {}


  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<any> {
    const user = await this.authService.create(registerDto.email, registerDto.password);
    return { message: 'Usuário criado com sucesso!', user };
  }

  
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    const user = await this.authService.findByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new Error('Credenciais inválidas');
    }
    const token = await this.authService.generateToken(user);
    return { token };
  }

 
  @Get('users')
  async getAllUsers(): Promise<User[]> {
    return await this.authService.findAll();
  }

  @Get('users/:id')
async getUserById(@Param('id') id: number): Promise<User> {
  return await this.authService.findOne(id);
}


@Put('users/:id')
async updateUser(
  @Param('id') id: string,
  @Body() dto: UpdateUserDto,
): Promise<User> {
  try {
    return await this.authService.update(
      Number(id),
      dto.email,
      dto.newPassword,
      dto.currentPassword,
      dto.isActive,
    );
  } catch (err) {
    if (err.message === 'Senha atual incorreta') {
      throw new BadRequestException('Senha atual incorreta');
    }
    throw err;
  }
}
 
 @Delete('users/:id')
async deleteUser(@Param('id') id: number): Promise<void> {
  const user = await this.authService.findOne(id);

  if (user.keycloakId) {
    try {
      await this.keycloakAdminService.deleteUser(user.keycloakId);
    } catch (error) {
      console.error('Erro ao deletar usuário do Keycloak:', error);
      
      throw new InternalServerErrorException('Erro ao deletar do Keycloak');
    }
  }

  await this.authService.delete(id);
}}