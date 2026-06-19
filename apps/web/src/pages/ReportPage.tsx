import { useParams, Link } from 'react-router-dom';
import { useReportSummary } from '../features/run-dashboard/hooks/useReportSummary';
import { LoadingState } from '../shared/components/LoadingState';
import { EmptyState } from '../shared/components/EmptyState';
import { Card } from '../shared/components/Card';
import type { FightSummaryDto } from '@gpc/shared';

function formatDuration(startMs: number, endMs: number): string {
  const totalSecs = Math.round((endMs - startMs) / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function FightRow({ fight, reportCode }: { fight: FightSummaryDto; reportCode: string }) {
  const duration = formatDuration(fight.startTimeMs, fight.endTimeMs);
  const isMythicPlus = !fight.encounterID || fight.encounterID === 0;

  return (
    <Link
      to={`/report/${reportCode}/fight/${fight.id}`}
      className="block rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 hover:border-cyan-400 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-100">{fight.name}</p>
          <p className="text-xs text-slate-500">
            {isMythicPlus ? 'M+' : 'Raid'} · {duration}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {fight.kill === true && (
            <span className="rounded-full bg-emerald-900/60 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              Kill
            </span>
          )}
          {fight.kill === false && (
            <span className="rounded-full bg-red-900/60 px-2.5 py-0.5 text-xs font-medium text-red-400">
              Wipe
            </span>
          )}
          <span className="text-slate-500 text-sm">→</span>
        </div>
      </div>
    </Link>
  );
}

export function ReportPage() {
  const { reportCode } = useParams<{ reportCode: string }>();
  const { data, isLoading, error } = useReportSummary(reportCode ?? '');

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-red-400">{error instanceof Error ? error.message : 'Error desconocido'}</p>
      </main>
    );
  }

  if (!data) return <EmptyState message="Reporte no encontrado." />;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
          {data.zoneName ?? 'Warcraft Logs'}
        </p>
        <h1 className="text-2xl font-bold text-slate-100">
          {data.title ?? data.reportCode}
        </h1>
        {data.ownerName && (
          <p className="text-sm text-slate-400 mt-1">Subido por {data.ownerName}</p>
        )}
      </div>

      <Card>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {data.fights.length} {data.fights.length === 1 ? 'run' : 'runs'}
        </p>
        {data.fights.length === 0 ? (
          <EmptyState message="Sin runs en este reporte." />
        ) : (
          <div className="space-y-2">
            {data.fights.map((fight) => (
              <FightRow key={fight.id} fight={fight} reportCode={reportCode ?? ''} />
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
