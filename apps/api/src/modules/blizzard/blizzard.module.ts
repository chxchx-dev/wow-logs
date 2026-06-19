import { Module } from '@nestjs/common';
import { BlizzardAuthService } from './blizzard-auth.service';
import { BlizzardClientService } from './blizzard-client.service';

@Module({
  providers: [BlizzardAuthService, BlizzardClientService],
  exports: [BlizzardAuthService, BlizzardClientService],
})
export class BlizzardModule {}
