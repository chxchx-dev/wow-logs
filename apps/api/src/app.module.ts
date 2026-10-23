import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { WarcraftLogsModule } from './modules/warcraftlogs/warcraftlogs.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { PlayersModule } from './modules/players/players.module';
import { RaiderIoModule } from './modules/raiderio/raiderio.module';
import { BlizzardModule } from './modules/blizzard/blizzard.module';
import { CacheModule } from './modules/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    PrismaModule,
    WarcraftLogsModule,
    AnalysisModule,
    ReportsModule,
    PlayersModule,
    RaiderIoModule,
    BlizzardModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
