import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { SyncModule } from 'src/sync/sync.module'; 
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    SyncModule, 
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),ConfigModule.forRoot(),
    HttpModule,
    
  ],
  providers: [AuthService],
  controllers: [AuthController],exports:[AuthService]
})
export class AuthModule {}