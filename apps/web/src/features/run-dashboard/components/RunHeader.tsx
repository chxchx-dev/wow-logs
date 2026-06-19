import type { FightAnalysisDto } from '@gpc/shared';
import { formatDuration } from '../../../shared/utils/format';

const RESULT_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  timed: { label: 'Timed', color: 'text-emerald-400', bg: 'bg-emerald-900/40' },
  depleted: { label: 'Depleted', color: 'text-red-400', bg: 'bg-red-900/40' },
  kill: { label: 'Kill', color: 'text-emerald-400', bg: 'bg-emerald-900/40' },
  wipe: { label: 'Wipe', color: 'text-red-400', bg: 'bg-red-900/40' },
  unknown: { label: 'Unknown', color: 'text-slate-400', bg: 'bg-slate-800' },
};

interface RunHeaderProps {
  analysis: FightAnalysisDto;
}

export function RunHeader({ analysis }: RunHeaderProps) {
  const result = RESULT_STYLE[analysis.result] ?? RESULT_STYLE.unknown;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{analysis.title}</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {formatDuration(analysis.durationMs)} · Fight #{analysis.fightId}
        </p>
      </div>
      <span className={`self-start sm:self-auto rounded-full px-3 py-1 text-sm font-semibold ${result.color} ${result.bg}`}>
        {result.label}
      </span>
    </div>
  );
}
