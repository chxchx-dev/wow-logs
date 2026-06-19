import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { DamageCalculator } from './calculators/damage.calculator';
import { DeathsCalculator } from './calculators/deaths.calculator';
import { InterruptsCalculator } from './calculators/interrupts.calculator';
import { DefensivesCalculator } from './calculators/defensives.calculator';
import { AugEvokerCalculator } from './calculators/aug-evoker.calculator';
import { ScoreCalculator } from './calculators/score.calculator';
import { WarcraftLogsModule } from '../warcraftlogs/warcraftlogs.module';

@Module({
  imports: [WarcraftLogsModule],
  providers: [
    AnalysisService,
    DamageCalculator,
    DeathsCalculator,
    InterruptsCalculator,
    DefensivesCalculator,
    AugEvokerCalculator,
    ScoreCalculator,
  ],
  exports: [AnalysisService],
})
export class AnalysisModule {}
