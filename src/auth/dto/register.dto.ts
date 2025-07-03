import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsBoolean()
  isActive: boolean;
}
