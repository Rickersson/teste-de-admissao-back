import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { KeycloakAdminService } from './keycloak-admin.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HttpModule, ConfigModule],
  controllers: [SyncController],
  providers: [SyncService, KeycloakAdminService],
  exports: [SyncService, KeycloakAdminService] 
})
export class SyncModule {}