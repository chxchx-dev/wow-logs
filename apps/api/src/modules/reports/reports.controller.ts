import { Body, Controller, Get, Param, ParseIntPipe, Post, UsePipes } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AnalysisService } from '../analysis/analysis.service';
import { importReportSchema, type ImportReportDto } from './dto/import-report.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly service: ReportsService,
    private readonly analysis: AnalysisService,
  ) {}

  @Post('import')
  @UsePipes(new ZodValidationPipe(importReportSchema))
  importReport(@Body() dto: ImportReportDto) {
    return this.service.importReport(dto);
  }

  @Get(':reportCode')
  getReport(@Param('reportCode') reportCode: string) {
    return this.service.getReport(reportCode);
  }

  @Get(':reportCode/fights')
  getFights(@Param('reportCode') reportCode: string) {
    return this.service.getFights(reportCode);
  }

  @Get(':reportCode/fights/:fightId/summary')
  getFightSummary(
    @Param('reportCode') reportCode: string,
    @Param('fightId', ParseIntPipe) fightId: number,
  ) {
    return this.analysis.analyzeFight(reportCode, fightId);
  }
}
