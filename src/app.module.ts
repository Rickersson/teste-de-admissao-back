import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncService } from './sync/sync.service';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule, 
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'auth_crud',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }), SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}