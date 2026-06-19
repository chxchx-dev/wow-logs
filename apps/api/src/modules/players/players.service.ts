import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayersForReport(reportCode: string) {
    const report = await this.prisma.report.findUnique({ where: { code: reportCode } });
    if (!report) {
      throw new NotFoundException({ code: 'REPORT_NOT_FOUND', message: `Reporte ${reportCode} no importado.` });
    }

    return this.prisma.player.findMany({
      where: { reportId: report.id },
      orderBy: { name: 'asc' },
    });
  }

  async getPlayer(reportCode: string, playerId: string) {
    const report = await this.prisma.report.findUnique({ where: { code: reportCode } });
    if (!report) {
      throw new NotFoundException({ code: 'REPORT_NOT_FOUND', message: `Reporte ${reportCode} no importado.` });
    }

    const player = await this.prisma.player.findFirst({
      where: { id: playerId, reportId: report.id },
      include: {
        metrics: { orderBy: { createdAt: 'desc' } },
        issues: { orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }] },
      },
    });

    if (!player) {
      throw new NotFoundException({ code: 'PLAYER_NOT_FOUND', message: `Jugador ${playerId} no encontrado.` });
    }

    return player;
  }
}
