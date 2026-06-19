import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RaiderIoClientService {
  private readonly logger = new Logger(RaiderIoClientService.name);

  constructor(private readonly config: ConfigService) {}

  // Fase 4: enrich player cards with M+ score, best runs, gear, talent context
  async getCharacterProfile(input: { region: string; realm: string; name: string }): Promise<unknown> {
    const baseUrl = this.config.getOrThrow<string>('RAIDERIO_BASE_URL');

    const url = new URL(`${baseUrl}/characters/profile`);
    url.searchParams.set('region', input.region);
    url.searchParams.set('realm', input.realm);
    url.searchParams.set('name', input.name);
    url.searchParams.set('fields', 'mythic_plus_scores_by_season:current,mythic_plus_best_runs,raid_progression,gear,talents');

    this.logger.log(`Fetching Raider.IO profile: ${input.name}-${input.realm}-${input.region}`);

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    return res.json();
  }
}
