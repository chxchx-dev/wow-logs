import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CacheService {
  constructor(private readonly prisma: PrismaService) {}

  async get<T>(provider: string, cacheKey: string): Promise<T | null> {
    const entry = await this.prisma.apiCache.findUnique({
      where: { provider_cacheKey: { provider, cacheKey } },
    });

    if (!entry || entry.expiresAt < new Date()) return null;
    return entry.payload as T;
  }

  async set(provider: string, cacheKey: string, payload: unknown, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await this.prisma.apiCache.upsert({
      where: { provider_cacheKey: { provider, cacheKey } },
      create: { provider, cacheKey, payload: payload as object, expiresAt },
      update: { payload: payload as object, expiresAt },
    });
  }

  async evict(provider: string, cacheKey: string): Promise<void> {
    await this.prisma.apiCache.deleteMany({ where: { provider, cacheKey } });
  }

  async evictExpired(): Promise<void> {
    await this.prisma.apiCache.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  }
}
