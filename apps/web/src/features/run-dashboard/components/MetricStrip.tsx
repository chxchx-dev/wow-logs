import type { FightAnalysisDto } from '@gpc/shared';

interface MetricStripProps {
  analysis: FightAnalysisDto;
}

export function MetricStrip({ analysis }: MetricStripProps) {
  const { metrics } = analysis;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <MetricTile
        label="Score grupo"
        value={`${metrics.averageScore}`}
        unit="/100"
        accent={metrics.averageScore >= 70 ? 'emerald' : metrics.averageScore >= 50 ? 'amber' : 'red'}
      />
      <MetricTile
        label="Muertes"
        value={`${metrics.totalDeaths}`}
        accent={metrics.totalDeaths === 0 ? 'emerald' : metrics.totalDeaths <= 2 ? 'amber' : 'red'}
      />
      <MetricTile
        label="Interrupts"
        value={`${metrics.totalInterrupts}`}
        accent={metrics.totalInterrupts > 0 ? 'cyan' : 'amber'}
      />
      <MetricTile
        label="Issues críticos"
        value={`${analysis.topIssues.filter((i) => i.severity === 'critical' || i.severity === 'high').length}`}
        accent={
          analysis.topIssues.filter((i) => i.severity === 'critical' || i.severity === 'high').length === 0
            ? 'emerald'
            : 'red'
        }
      />
    </div>
  );
}

const ACCENT_COLOR: Record<string, string> = {
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
  cyan: 'text-cyan-400',
};

function MetricTile({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-center">
      <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${ACCENT_COLOR[accent] ?? 'text-slate-200'}`}>
        {value}
        {unit && <span className="text-xs text-slate-500 ml-0.5 font-normal">{unit}</span>}
      </p>
    </div>
  );
}
