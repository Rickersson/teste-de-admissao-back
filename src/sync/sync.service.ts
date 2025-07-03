import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { firstValueFrom } from 'rxjs';
import { KeycloakAdminService } from './keycloak-admin.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly keycloakAdminService: KeycloakAdminService,
  ) {}

  async syncUserToKeycloak(
    email: string,
    plainPassword: string,
  ): Promise<void> {
    const response = await fetch(
      `http://localhost:8080/admin/realms/my-app/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.keycloakAdminService.getAdminToken()}`,
        },
        body: JSON.stringify({
          username: email,
          email: email,
          enabled: true,
          credentials: [
            {
              type: 'password',
              value: plainPassword,
              temporary: false,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      console.error(`Falha ao sincronizar usuário ${email}`);
    }
  }

 async createKeycloakUser(email: string, password: string): Promise<string> {
  this.logger.log('Iniciando criação de usuário no Keycloak', { email });

  
  this.logger.debug('Solicitando novo adminToken ao Keycloak...');
  await this.keycloakAdminService.getAdminToken();
  this.logger.debug('adminToken recebido:', this.keycloakAdminService.adminToken?.slice(0, 20) + '...');

  const userData = {
    username: email,
    email,
    enabled: true,
    credentials: [{ type: 'password', value: password, temporary: false }]
  };
  this.logger.debug('Payload enviado ao Keycloak:', userData);

  const url = `${this.configService.get('KEYCLOAK_URL')}/admin/realms/${this.configService.get('KEYCLOAK_REALM')}/users`;
  this.logger.debug('URL de criação de usuário:', url);

  try {
   
    const response = await firstValueFrom(
      this.keycloakAdminService.httpService.post(
        url,
        userData,
        { headers: this.keycloakAdminService.getAdminTokenHeader() }
      )
    );

    this.logger.log('Resposta do Keycloak recebida', { status: response.status });
    const location = response.headers['location'];
    if (!location) {
      this.logger.error('Location header ausente na resposta do Keycloak', response.headers);
      throw new BadGatewayException('Resposta inesperada do Keycloak (sem location header)');
    }

    const newId = location.split('/').pop();
    this.logger.log('Usuário criado no Keycloak com ID:', newId);
    return newId;
  } catch (e) {
    this.logger.error('Erro ao criar usuário no Keycloak', {
      message: e.message,
      status: e.response?.status,
      data: e.response?.data
    });

    if (e.response?.status === 401) {
      throw new UnauthorizedException('Token de admin do Keycloak inválido ou expirou');
    }
    throw new BadGatewayException('Falha ao comunicar com Keycloak');
  }
}

}
