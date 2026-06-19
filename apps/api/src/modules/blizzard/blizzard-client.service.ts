import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlizzardAuthService } from './blizzard-auth.service';

@Injectable()
export class BlizzardClientService {
  private readonly logger = new Logger(BlizzardClientService.name);

  constructor(
    private readonly auth: BlizzardAuthService,
    private readonly config: ConfigService,
  ) {}

  // Fase 4: character profile for spec/ilvl/guild context
  async getCharacterProfile(input: { region: 'us' | 'eu' | 'kr' | 'tw'; realmSlug: string; characterName: string; locale?: string }): Promise<unknown> {
    const token = await this.auth.getAccessToken();
    const locale = input.locale ?? 'en_US';
    const namespace = `profile-${input.region}`;
    const url = `https://${input.region}.api.blizzard.com/profile/wow/character/${input.realmSlug}/${input.characterName.toLowerCase()}?namespace=${namespace}&locale=${locale}`;

    this.logger.log(`Fetching Blizzard profile: ${input.characterName}-${input.realmSlug}`);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;
    return res.json();
  }

  // Fase 4: equipment/ilvl for player card context
  async getCharacterEquipment(input: { region: 'us' | 'eu' | 'kr' | 'tw'; realmSlug: string; characterName: string; locale?: string }): Promise<unknown> {
    const token = await this.auth.getAccessToken();
    const locale = input.locale ?? 'en_US';
    const namespace = `profile-${input.region}`;
    const url = `https://${input.region}.api.blizzard.com/profile/wow/character/${input.realmSlug}/${input.characterName.toLowerCase()}/equipment?namespace=${namespace}&locale=${locale}`;

    this.logger.log(`Fetching Blizzard equipment: ${input.characterName}-${input.realmSlug}`);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;
    return res.json();
  }
}
