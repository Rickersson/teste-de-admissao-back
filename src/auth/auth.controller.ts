import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entity/user.entity';
import { AuthGuard } from './auth.guard';
import * as bcrypt from 'bcrypt';
import { KeycloakAdminService } from 'src/sync/keycloak-admin.service';

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
    @Param('id') id: number,
    @Body() updateUserDto: RegisterDto,
  ): Promise<User> {
    return await this.authService.update(id, updateUserDto.email, updateUserDto.password, updateUserDto.isActive);
  }

 
    @Delete('users/:id')
  async deleteUser(@Param('id') id: number): Promise<void> {
   
    const user = await this.authService.findOne(id);
    
    
    if (user.keycloakId) {
      await this.keycloakAdminService.deleteUser(user.keycloakId);
    }
    
   
    await this.authService.delete(id);
  }
}