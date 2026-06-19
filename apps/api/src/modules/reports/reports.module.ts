import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { WarcraftLogsModule } from '../warcraftlogs/warcraftlogs.module';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [WarcraftLogsModule, AnalysisModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
