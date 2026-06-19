import { useParams, Link } from 'react-router-dom';
import { useFightSummary } from '../features/run-dashboard/hooks/useFightSummary';
import { RunHeader } from '../features/run-dashboard/components/RunHeader';
import { MetricStrip } from '../features/run-dashboard/components/MetricStrip';
import { TopIssues } from '../features/run-dashboard/components/TopIssues';
import { PlayerCardGrid } from '../features/run-dashboard/components/PlayerCardGrid';
import { Card } from '../shared/components/Card';
import { LoadingState } from '../shared/components/LoadingState';

export function FightPage() {
  const { reportCode, fightId } = useParams<{ reportCode: string; fightId: string }>();
  const { data, isLoading, error } = useFightSummary(reportCode ?? '', fightId);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to={`/report/${reportCode}`} className="hover:text-cyan-400 transition-colors">
          ← Volver al reporte
        </Link>
      </div>

      {isLoading && (
        <LoadingState message="Leyendo reporte y calculando errores críticos..." />
      )}

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/40 px-5 py-4 text-sm text-red-400">
          {(error as Error & { code?: string }).code === 'REPORT_PRIVATE_OR_FORBIDDEN'
            ? 'No pude leer este reporte. Es privado, no existe o la app no tiene acceso.'
            : (error instanceof Error ? error.message : 'Error al cargar el análisis.')}
        </div>
      )}

      {data && (
        <>
          <RunHeader analysis={data} />
          <MetricStrip analysis={data} />

          {data.topIssues.length > 0 && (
            <Card>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Top errores que costaron la run
              </p>
              <TopIssues issues={data.topIssues} />
            </Card>
          )}

          <PlayerCardGrid players={data.players} reportCode={reportCode ?? ''} />
        </>
      )}
    </main>
  );
}
