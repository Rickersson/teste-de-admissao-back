// keycloak-admin.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KeycloakAdminService {
  public adminToken: string;
  public readonly keycloakUrl: any;
  public readonly realm:any;

  constructor(
    public readonly configService: ConfigService,
    public readonly httpService: HttpService
  ) {
    this.keycloakUrl = this.configService.get('KEYCLOAK_URL');
    this.realm = this.configService.get('KEYCLOAK_REALM');
  }

public async getAdminToken(): Promise<void> {
  const adminUser = this.configService.get<string>('KEYCLOAK_ADMIN_USER');
  const adminPass = this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD');

  if (!adminUser || !adminPass) {
    throw new Error('As variáveis KEYCLOAK_ADMIN_USER e KEYCLOAK_ADMIN_PASSWORD devem estar definidas');
  }

  const params = new URLSearchParams();
  params.append('client_id', 'admin-cli');
  params.append('username', adminUser);
  params.append('password', adminPass);
  params.append('grant_type', 'password');

  const url = `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`;
  const response = await firstValueFrom(
    this.httpService.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  );

  this.adminToken = response.data.access_token;
}


  async deleteUser(keycloakId: string): Promise<void> {
    if (!this.adminToken) {
      await this.getAdminToken();
    }

    await firstValueFrom(
      this.httpService.delete(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${keycloakId}`,
        {
          headers: {
            Authorization: `Bearer ${this.adminToken}`,
          },
        }
      )
    );
  }

   getAdminTokenHeader() {
    if (!this.adminToken) {
      throw new Error('Admin token not available');
    }
    return {
      'Authorization': `Bearer ${this.adminToken}`,
      'Content-Type': 'application/json'
    };
  }
}