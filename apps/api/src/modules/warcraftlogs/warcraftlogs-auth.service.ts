import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class WarcraftLogsAuthService {
  private readonly logger = new Logger(WarcraftLogsAuthService.name);
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  async getToken(): Promise<string> {
    const now = Date.now();

    if (this.cachedToken && this.cachedToken.expiresAt > now + 30_000) {
      return this.cachedToken.value;
    }

    const clientId = this.config.getOrThrow<string>('WARCRAFTLOGS_CLIENT_ID');
    const clientSecret = this.config.getOrThrow<string>('WARCRAFTLOGS_CLIENT_SECRET');
    const tokenUrl = this.config.getOrThrow<string>('WARCRAFTLOGS_TOKEN_URL');

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });

    if (!res.ok) {
      this.logger.error(`WCL auth failed: ${res.status}`);
      throw new InternalServerErrorException({
        code: 'WARCRAFTLOGS_AUTH_FAILED',
        message: 'No se pudo autenticar con Warcraft Logs. Verifica las credenciales.',
      });
    }

    const data = (await res.json()) as TokenResponse;

    this.cachedToken = {
      value: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    };

    this.logger.log('WarcraftLogs token refreshed');
    return this.cachedToken.value;
  }
}
