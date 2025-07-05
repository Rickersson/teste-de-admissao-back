// src/auth/dto/update-user.dto.ts
import { IsEmail, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  currentPassword?: string

  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
