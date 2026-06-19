import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WarcraftLogsClientService } from '../warcraftlogs/warcraftlogs-client.service';
import {
  REPORT_METADATA_QUERY,
  REPORT_FIGHTS_QUERY,
  REPORT_MASTER_DATA_QUERY,
} from '../warcraftlogs/queries/report.queries';
import type { ImportReportDto } from './dto/import-report.dto';
import type { ReportOverviewDto, FightSummaryDto } from './dto/report-overview.dto';

interface WclReport {
  code: string;
  title?: string;
  startTime?: number;
  endTime?: number;
  owner?: { name: string };
  zone?: { name: string };
}

interface WclFight {
  id: number;
  name: string;
  startTime: number;
  endTime: number;
  kill?: boolean;
  difficulty?: number;
  encounterID?: number;
}

interface WclActor {
  id: number;
  name: string;
  type: string;
  subType?: string;
  server?: string;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wclClient: WarcraftLogsClientService,
  ) {}

  async importReport(dto: ImportReportDto): Promise<ReportOverviewDto> {
    const existing = await this.prisma.report.findUnique({
      where: { code: dto.reportCode },
      include: { fights: { orderBy: { startTimeMs: 'asc' } } },
    });

    if (existing) {
      this.logger.log(`Report ${dto.reportCode} already in DB, returning cached`);
      return this.toOverviewDto(existing, existing.fights);
    }

    this.logger.log(`Fetching report ${dto.reportCode} from WCL`);

    const [metadataData, fightsData, actorsData] = await Promise.all([
      this.wclClient.query<{ reportData: { report: WclReport } }>(
        REPORT_METADATA_QUERY,
        { code: dto.reportCode },
      ),
      this.wclClient.query<{ reportData: { report: { fights: WclFight[] } } }>(
        REPORT_FIGHTS_QUERY,
        { code: dto.reportCode },
      ),
      this.wclClient.query<{
        reportData: { report: { masterData: { actors: WclActor[] } } };
      }>(REPORT_MASTER_DATA_QUERY, { code: dto.reportCode }),
    ]);

    const wclReport = metadataData.reportData.report;
    const wclFights = fightsData.reportData.report?.fights ?? [];
    const wclActors = actorsData.reportData.report?.masterData?.actors ?? [];

    if (!wclReport) {
      throw new NotFoundException({
        code: 'REPORT_NOT_FOUND',
        message: 'El reporte no existe o no está disponible.',
      });
    }

    const report = await this.prisma.report.create({
      data: {
        code: dto.reportCode,
        title: wclReport.title ?? null,
        ownerName: wclReport.owner?.name ?? null,
        zoneName: wclReport.zone?.name ?? null,
        startTimeMs: wclReport.startTime ? BigInt(Math.round(wclReport.startTime)) : null,
        endTimeMs: wclReport.endTime ? BigInt(Math.round(wclReport.endTime)) : null,
        raw: wclReport as object,
      },
    });

    if (wclFights.length > 0) {
      await this.prisma.fight.createMany({
        data: wclFights.map((f) => ({
          reportId: report.id,
          externalFightId: f.id,
          name: f.name,
          startTimeMs: BigInt(Math.round(f.startTime)),
          endTimeMs: BigInt(Math.round(f.endTime)),
          kill: f.kill ?? null,
          difficulty: f.difficulty ?? null,
          encounterId: f.encounterID ?? null,
          raw: f as object,
        })),
        skipDuplicates: true,
      });
    }

    const playerActors = wclActors.filter((a) => a.type === 'Player');
    if (playerActors.length > 0) {
      await this.prisma.player.createMany({
        data: playerActors.map((a) => ({
          reportId: report.id,
          externalId: a.id,
          name: a.name,
          server: a.server ?? null,
          className: a.subType ?? null,
          raw: a as object,
        })),
        skipDuplicates: true,
      });
    }

    const fights = await this.prisma.fight.findMany({
      where: { reportId: report.id },
      orderBy: { startTimeMs: 'asc' },
    });

    this.logger.log(
      `Imported report ${dto.reportCode}: ${fights.length} fights, ${playerActors.length} players`,
    );

    return this.toOverviewDto(report, fights);
  }

  async getReport(reportCode: string): Promise<ReportOverviewDto> {
    const report = await this.prisma.report.findUnique({
      where: { code: reportCode },
      include: { fights: { orderBy: { startTimeMs: 'asc' } } },
    });

    if (!report) {
      throw new NotFoundException({
        code: 'REPORT_NOT_FOUND',
        message: `El reporte ${reportCode} no está importado. Usa POST /reports/import primero.`,
      });
    }

    return this.toOverviewDto(report, report.fights);
  }

  async getFights(reportCode: string): Promise<FightSummaryDto[]> {
    const report = await this.prisma.report.findUnique({
      where: { code: reportCode },
      include: { fights: { orderBy: { startTimeMs: 'asc' } } },
    });

    if (!report) {
      throw new NotFoundException({
        code: 'REPORT_NOT_FOUND',
        message: `El reporte ${reportCode} no está importado. Usa POST /reports/import primero.`,
      });
    }

    return report.fights.map((f) => ({
      id: f.externalFightId,
      name: f.name,
      startTimeMs: Number(f.startTimeMs),
      endTimeMs: Number(f.endTimeMs),
      kill: f.kill ?? undefined,
      difficulty: f.difficulty ?? undefined,
      encounterID: f.encounterId ?? undefined,
    }));
  }

  private toOverviewDto(
    report: { code: string; title: string | null; zoneName: string | null; ownerName: string | null; startTimeMs: bigint | null; endTimeMs: bigint | null },
    fights: { externalFightId: number; name: string; startTimeMs: bigint; endTimeMs: bigint; kill: boolean | null; difficulty: number | null; encounterId: number | null }[],
  ): ReportOverviewDto {
    const fightDtos: FightSummaryDto[] = fights.map((f) => ({
      id: f.externalFightId,
      name: f.name,
      startTimeMs: Number(f.startTimeMs),
      endTimeMs: Number(f.endTimeMs),
      kill: f.kill ?? undefined,
      difficulty: f.difficulty ?? undefined,
      encounterID: f.encounterId ?? undefined,
    }));

    return {
      reportCode: report.code,
      title: report.title ?? undefined,
      zoneName: report.zoneName ?? undefined,
      ownerName: report.ownerName ?? undefined,
      startTimeMs: report.startTimeMs ? Number(report.startTimeMs) : undefined,
      endTimeMs: report.endTimeMs ? Number(report.endTimeMs) : undefined,
      fights: fightDtos,
    };
  }
}
