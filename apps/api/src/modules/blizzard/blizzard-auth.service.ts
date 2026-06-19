import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

@Injectable()
export class BlizzardAuthService {
  private readonly logger = new Logger(BlizzardAuthService.name);
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  // Fase 4: provide Blizzard tokens for character/equipment/roster endpoints
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 30_000) {
      return this.cachedToken.value;
    }

    const clientId = this.config.getOrThrow<string>('BLIZZARD_CLIENT_ID');
    const clientSecret = this.config.getOrThrow<string>('BLIZZARD_CLIENT_SECRET');
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch('https://oauth.battle.net/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      this.logger.error(`Blizzard auth failed: ${res.status}`);
      throw new InternalServerErrorException({ code: 'BLIZZARD_AUTH_FAILED', message: 'Blizzard auth failed.' });
    }

    const data = (await res.json()) as TokenResponse;
    this.cachedToken = { value: data.access_token, expiresAt: now + data.expires_in * 1000 };
    return this.cachedToken.value;
  }
}
