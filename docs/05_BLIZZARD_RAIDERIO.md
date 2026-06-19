# Blizzard + Raider.IO — Fuentes auxiliares

## Fallo
Meter Blizzard, Raider.IO y Warcraft Logs al mismo tiempo desde el día uno es arquitectura decorativa.

## Por qué duele
Vas a construir clientes API, normalizadores y cachés antes de tener una sola recomendación útil. Eso es colección de conocimiento, no producto.

## Acción
Primero Warcraft Logs. Después usa Blizzard y Raider.IO solo para enriquecer contexto.

---

## Jerarquía de datos

### Fuente 1 — Warcraft Logs
Usar para:
- runs/fights;
- participantes;
- damage/healing;
- deaths;
- casts;
- buffs/debuffs;
- interrupts;
- eventos.

### Fuente 2 — Raider.IO
Usar para:
- score M+;
- mejores runs;
- progreso raid;
- perfil público;
- contexto de experiencia.

### Fuente 3 — Blizzard/Battle.net
Usar para:
- character profile;
- equipment;
- guild/roster;
- media;
- datos estáticos.

---

## Raider.IO Client

Variables:

```env
RAIDERIO_BASE_URL=https://raider.io/api/v1
```

Servicio:

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RaiderIoClientService {
  constructor(private readonly config: ConfigService) {}

  async getCharacterProfile(input: {
    region: string;
    realm: string;
    name: string;
  }) {
    const baseUrl = this.config.getOrThrow<string>('RAIDERIO_BASE_URL');

    const url = new URL(`${baseUrl}/characters/profile`);
    url.searchParams.set('region', input.region);
    url.searchParams.set('realm', input.realm);
    url.searchParams.set('name', input.name);
    url.searchParams.set('fields', 'mythic_plus_scores_by_season:current,mythic_plus_best_runs,raid_progression,gear,talents');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Raider.IO failed: ${response.status}`);
    }

    return response.json();
  }
}
```

---

## Blizzard/Battle.net Auth

Variables:

```env
BLIZZARD_CLIENT_ID=change_me
BLIZZARD_CLIENT_SECRET=change_me
BLIZZARD_REGION=us
```

Token URL por región:

```txt
US: https://oauth.battle.net/token
EU: https://oauth.battle.net/token
KR/TW/CN pueden requerir host regional según documentación vigente.
```

Servicio base:

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlizzardAuthService {
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  async getAccessToken() {
    const now = Date.now();

    if (this.cachedToken && this.cachedToken.expiresAt > now + 30_000) {
      return this.cachedToken.value;
    }

    const clientId = this.config.getOrThrow<string>('BLIZZARD_CLIENT_ID');
    const clientSecret = this.config.getOrThrow<string>('BLIZZARD_CLIENT_SECRET');

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://oauth.battle.net/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });

    if (!response.ok) {
      throw new Error(`Blizzard auth failed: ${response.status}`);
    }

    const data = await response.json();

    this.cachedToken = {
      value: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    };

    return data.access_token;
  }
}
```

---

## Blizzard Client conceptual

```ts
@Injectable()
export class BlizzardClientService {
  constructor(private readonly auth: BlizzardAuthService) {}

  async getCharacterEquipment(input: {
    region: 'us' | 'eu' | 'kr' | 'tw';
    realmSlug: string;
    characterName: string;
    locale?: string;
  }) {
    const token = await this.auth.getAccessToken();
    const locale = input.locale ?? 'en_US';
    const namespace = `profile-${input.region}`;

    const url = `https://${input.region}.api.blizzard.com/profile/wow/character/${input.realmSlug}/${input.characterName.toLowerCase()}/equipment?namespace=${namespace}&locale=${locale}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Blizzard character equipment failed: ${response.status}`);
    }

    return response.json();
  }
}
```

---

## Cuándo usar Raider.IO

Usar después de tener métricas del log.

Ejemplo de enriquecimiento:

```txt
Jugador: Tharok
Score M+: 2850
Rol habitual: Tank
Run analizada: +12
Diagnóstico: El problema no es falta de experiencia. El problema fue mal uso de defensivos en pull 4 y 7.
```

---

## Cuándo usar Blizzard

Usar para contexto de personaje:

```txt
Spec/equipment/ilvl/guild/realm/media
```

No uses Blizzard para explicar una muerte del log. La muerte sale de Warcraft Logs.

---

## Normalización de personaje

Formato interno:

```ts
export interface ExternalCharacterIdentity {
  name: string;
  normalizedName: string;
  realm: string;
  realmSlug: string;
  region: 'us' | 'eu' | 'kr' | 'tw';
}
```

Normalizador:

```ts
export function normalizeWowName(name: string) {
  return name.trim().toLowerCase();
}

export function normalizeRealmSlug(realm: string) {
  return realm.trim().toLowerCase().replace(/\s+/g, '-');
}
```

---

## Plazo
Día 11-13:

- conectar Raider.IO profile;
- conectar Blizzard equipment/profile;
- mostrar contexto en player card;
- no bloquear el análisis si estas APIs fallan.
