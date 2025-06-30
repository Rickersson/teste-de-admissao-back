import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class SyncService {

  async syncUserToKeycloak(email: string, plainPassword: string): Promise<void> {
    const response = await fetch(`http://localhost:8080/admin/realms/my-app/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.getAdminToken()}`,
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
    });

    if (!response.ok) {
      console.error(`Falha ao sincronizar usuário ${email}`);
    }
  }

  private async getAdminToken(): Promise<string> {
   const form = new URLSearchParams();
form.append('grant_type', 'password');
form.append('client_id', 'admin-cli');
form.append('username', 'henrique');
form.append('password', process.env.KEYCLOAK_ADMIN_PASSWORD || '41323597');

    const response = await fetch('http://localhost:8080/realms/master/protocol/openid-connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const data: any = await response.json();
    return data.access_token;
  }
}