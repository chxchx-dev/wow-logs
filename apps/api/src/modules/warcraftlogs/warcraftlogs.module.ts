import { Module } from '@nestjs/common';
import { WarcraftLogsAuthService } from './warcraftlogs-auth.service';
import { WarcraftLogsClientService } from './warcraftlogs-client.service';

@Module({
  providers: [WarcraftLogsAuthService, WarcraftLogsClientService],
  exports: [WarcraftLogsAuthService, WarcraftLogsClientService],
})
export class WarcraftLogsModule {}
