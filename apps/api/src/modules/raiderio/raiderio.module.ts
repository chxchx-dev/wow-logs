import { Module } from '@nestjs/common';
import { RaiderIoClientService } from './raiderio-client.service';

@Module({
  providers: [RaiderIoClientService],
  exports: [RaiderIoClientService],
})
export class RaiderIoModule {}
