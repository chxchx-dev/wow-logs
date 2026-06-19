import { Controller, Get, Param } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly service: PlayersService) {}

  @Get(':reportCode')
  getPlayers(@Param('reportCode') reportCode: string) {
    return this.service.getPlayersForReport(reportCode);
  }

  @Get(':reportCode/:playerId')
  getPlayer(
    @Param('reportCode') reportCode: string,
    @Param('playerId') playerId: string,
  ) {
    return this.service.getPlayer(reportCode, playerId);
  }
}
