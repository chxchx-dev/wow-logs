import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WarcraftLogsClientService } from '../warcraftlogs/warcraftlogs-client.service';
import {
  FIGHT_DAMAGE_TABLE_QUERY,
  FIGHT_DEATHS_TABLE_QUERY,
  FIGHT_INTERRUPTS_TABLE_QUERY,
} from '../warcraftlogs/queries/tables.queries';
import { DamageCalculator } from './calculators/damage.calculator';
import { DeathsCalculator } from './calculators/deaths.calculator';
import { InterruptsCalculator } from './calculators/interrupts.calculator';
import { DefensivesCalculator } from './calculators/defensives.calculator';
import { ScoreCalculator } from './calculators/score.calculator';
import { IssueType, IssueSeverity } from '@prisma/client';
import type { FightAnalysisDtoOut, IssueDtoOut, PlayerMetricCardDtoOut, CompositionDtoOut, FightMetricStripDtoOut } from '../reports/dto/fight-analysis.dto';

interface TableResponse {
  reportData: { report: { table: unknown } };
}

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wclClient: WarcraftLogsClientService,
    private readonly damageCalc: DamageCalculator,
    private readonly deathsCalc: DeathsCalculator,
    private readonly interruptsCalc: InterruptsCalculator,
    private readonly defensivesCalc: DefensivesCalculator,
    private readonly scoreCalc: ScoreCalculator,
  ) {}

  async analyzeFight(reportCode: string, externalFightId: number): Promise<FightAnalysisDtoOut> {
    const report = await this.prisma.report.findUnique({ where: { code: reportCode } });
    if (!report) {
      throw new NotFoundException({
        code: 'REPORT_NOT_FOUND',
        message: `El reporte ${reportCode} no está importado. Usa POST /reports/import primero.`,
      });
    }

    const fight = await this.prisma.fight.findUnique({
      where: { reportId_externalFightId: { reportId: report.id, externalFightId } },
    });
    if (!fight) {
      throw new NotFoundException({
        code: 'REPORT_NOT_FOUND',
        message: `Fight ${externalFightId} no encontrado en el reporte ${reportCode}.`,
      });
    }

    const players = await this.prisma.player.findMany({ where: { reportId: report.id } });

    // Return cached metrics if already computed
    const existingMetrics = await this.prisma.playerRunMetric.findMany({
      where: { fightId: fight.id },
      include: { player: true },
    });

    if (existingMetrics.length > 0) {
      const existingIssues = await this.prisma.issue.findMany({
        where: { fightId: fight.id },
        include: { player: true },
      });
      return this.buildDto(reportCode, fight, existingMetrics, existingIssues);
    }

    this.logger.log(`Fetching WCL tables for fight ${externalFightId} of ${reportCode}`);

    const startTime = Number(fight.startTimeMs);
    const endTime = Number(fight.endTimeMs);
    const fightIDs = [externalFightId];
    const vars = { code: reportCode, startTime, endTime, fightIDs };

    const [damageData, deathsData, interruptsData] = await Promise.all([
      this.wclClient.query<TableResponse>(FIGHT_DAMAGE_TABLE_QUERY, vars),
      this.wclClient.query<TableResponse>(FIGHT_DEATHS_TABLE_QUERY, vars),
      this.wclClient.query<TableResponse>(FIGHT_INTERRUPTS_TABLE_QUERY, vars),
    ]);

    const damageMap = this.damageCalc.calculate(damageData.reportData.report.table);
    const deathsResult = this.deathsCalc.calculate(deathsData.reportData.report.table);
    const interruptsResult = this.interruptsCalc.calculate(interruptsData.reportData.report.table);
    const defensivesResult = this.defensivesCalc.calculate(null);

    // Build per-player metrics
    const metricsToSave: Array<{
      playerId: string;
      damageDone: number;
      healingDone: number;
      deaths: number;
      interrupts: number;
      interruptOpportunities: number;
      defensivesUsed: number;
      avoidableDamageTaken: number;
      score: number;
    }> = [];

    const allIssues: Array<{ playerName: string | null; type: string; severity: string; title: string; description: string; action: string; playerId?: string }> = [];

    const allInterruptCounts = players.map(
      (p) => interruptsResult.metrics.get(p.name)?.interrupts ?? 0,
    );
    const groupAvgInterrupts = allInterruptCounts.length
      ? allInterruptCounts.reduce((a, b) => a + b, 0) / allInterruptCounts.length
      : 0;

    for (const player of players) {
      const damage = damageMap.get(player.name);
      const deaths = deathsResult.metrics.get(player.name);
      const interrupts = interruptsResult.metrics.get(player.name);
      const defensives = defensivesResult.metrics.get(player.name);

      const d = {
        damageDone: damage?.damageDone ?? 0,
        healingDone: 0,
        deaths: deaths?.deaths ?? 0,
        interrupts: interrupts?.interrupts ?? 0,
        interruptOpportunities: 0,
        defensivesUsed: defensives?.defensivesUsed ?? 0,
        avoidableDamageTaken: 0,
      };

      const score = this.scoreCalc.calculate({ ...d, groupAvgInterrupts });
      metricsToSave.push({ playerId: player.id, score, ...d });

      const playerIssues = [
        ...deathsResult.issues,
        ...interruptsResult.issues,
        ...defensivesResult.issues,
      ].filter((i) => i.playerName === player.name);

      allIssues.push(...playerIssues.map((i) => ({ ...i, playerId: player.id })));
    }

    await this.prisma.playerRunMetric.createMany({
      data: metricsToSave.map((m) => ({
        fightId: fight.id,
        playerId: m.playerId,
        damageDone: BigInt(m.damageDone),
        healingDone: BigInt(m.healingDone ?? 0),
        deaths: m.deaths,
        interrupts: m.interrupts,
        defensivesUsed: m.defensivesUsed,
        avoidableDamageTaken: BigInt(m.avoidableDamageTaken),
        score: m.score,
      })),
      skipDuplicates: true,
    });

    if (allIssues.length > 0) {
      await this.prisma.issue.createMany({
        data: allIssues.map((i) => ({
          fightId: fight.id,
          playerId: i.playerId ?? null,
          type: i.type as IssueType,
          severity: i.severity as IssueSeverity,
          title: i.title,
          description: i.description,
          action: i.action,
        })),
      });
    }

    const savedMetrics = await this.prisma.playerRunMetric.findMany({
      where: { fightId: fight.id },
      include: { player: true },
    });
    const savedIssues = await this.prisma.issue.findMany({
      where: { fightId: fight.id },
      include: { player: true },
    });

    return this.buildDto(reportCode, fight, savedMetrics, savedIssues);
  }

  private buildDto(
    reportCode: string,
    fight: { externalFightId: number; name: string; startTimeMs: bigint; endTimeMs: bigint; kill: boolean | null; encounterId: number | null },
    metrics: Array<{ score: number; damageDone: bigint; healingDone: bigint; deaths: number; interrupts: number; defensivesUsed: number; avoidableDamageTaken: bigint; player: { id: string; name: string; server: string | null; className: string | null; specName: string | null; role: string } }>,
    issues: Array<{ id: string; type: string; severity: string; title: string; description: string; action: string; timestampMs: bigint | null; playerId: string | null; player: { name: string } | null }>,
  ): FightAnalysisDtoOut {
    const durationMs = Number(fight.endTimeMs) - Number(fight.startTimeMs);
    const isMythicPlus = !fight.encounterId || fight.encounterId === 0;

    let result: 'timed' | 'depleted' | 'kill' | 'wipe' | 'unknown' = 'unknown';
    if (fight.kill === true) result = isMythicPlus ? 'timed' : 'kill';
    else if (fight.kill === false) result = isMythicPlus ? 'depleted' : 'wipe';

    const issueDtos: IssueDtoOut[] = issues.map((i) => ({
      id: i.id,
      playerId: i.playerId ?? undefined,
      playerName: i.player?.name ?? undefined,
      type: i.type,
      severity: i.severity.toLowerCase() as IssueDtoOut['severity'],
      title: i.title,
      description: i.description,
      action: i.action,
      timestampMs: i.timestampMs ? Number(i.timestampMs) : undefined,
    }));

    const playerDtos: PlayerMetricCardDtoOut[] = metrics
      .sort((a, b) => b.score - a.score)
      .map((m) => {
        const topIssue = issueDtos.find((i) => i.playerId === m.player.id);
        return {
          playerId: m.player.id,
          name: m.player.name,
          server: m.player.server ?? undefined,
          className: m.player.className ?? undefined,
          specName: m.player.specName ?? undefined,
          role: m.player.role.toLowerCase(),
          score: m.score,
          damageDone: Number(m.damageDone),
          healingDone: Number(m.healingDone),
          deaths: m.deaths,
          interrupts: m.interrupts,
          defensivesUsed: m.defensivesUsed,
          avoidableDamageTaken: Number(m.avoidableDamageTaken),
          topIssue,
        };
      });

    const topIssues = [...issueDtos]
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
      })
      .slice(0, 5);

    const composition: CompositionDtoOut = { tanks: [], healers: [], dps: [], support: [] };
    for (const m of metrics) {
      const role = m.player.role.toLowerCase();
      if (role === 'tank') composition.tanks.push(m.player.name);
      else if (role === 'healer') composition.healers.push(m.player.name);
      else if (role === 'support') composition.support.push(m.player.name);
      else composition.dps.push(m.player.name);
    }

    const fightMetrics: FightMetricStripDtoOut = {
      totalDeaths: playerDtos.reduce((a, p) => a + p.deaths, 0),
      totalInterrupts: playerDtos.reduce((a, p) => a + p.interrupts, 0),
      totalAvoidableDamage: playerDtos.reduce((a, p) => a + p.avoidableDamageTaken, 0),
      averageScore: playerDtos.length
        ? Math.round(playerDtos.reduce((a, p) => a + p.score, 0) / playerDtos.length)
        : 0,
    };

    return {
      reportCode,
      fightId: fight.externalFightId,
      title: fight.name,
      result,
      durationMs,
      composition,
      metrics: fightMetrics,
      players: playerDtos,
      topIssues,
    };
  }
}
