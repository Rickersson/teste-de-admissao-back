import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token não fornecido');

    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      request.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}