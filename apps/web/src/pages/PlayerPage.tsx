import { useParams, Link } from 'react-router-dom';
import { usePlayer } from '../features/run-dashboard/hooks/usePlayer';
import { Card } from '../shared/components/Card';
import { LoadingState } from '../shared/components/LoadingState';

const SEVERITY_STYLE: Record<string, { label: string; badge: string }> = {
  critical: { label: 'CRÍTICO', badge: 'bg-red-900/60 text-red-400' },
  high: { label: 'ALTO', badge: 'bg-amber-900/60 text-amber-400' },
  medium: { label: 'MEDIO', badge: 'bg-yellow-900/50 text-yellow-400' },
  low: { label: 'BAJO', badge: 'bg-slate-800 text-slate-400' },
};

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export function PlayerPage() {
  const { reportCode, playerId } = useParams<{ reportCode: string; playerId: string }>();
  const { data: player, isLoading, error } = usePlayer(reportCode ?? '', playerId);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to={`/report/${reportCode}`} className="hover:text-cyan-400 transition-colors">
          ← Volver al reporte
        </Link>
      </div>

      {isLoading && <LoadingState message="Cargando datos del jugador..." />}

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/40 px-5 py-4 text-sm text-red-400">
          {error instanceof Error ? error.message : 'Error al cargar el jugador.'}
        </div>
      )}

      {player && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{player.name}</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {player.className ?? player.role}
                {player.server && ` · ${player.server}`}
              </p>
            </div>
            {player.metrics[0] && (
              <div className="text-right">
                <p className={`text-4xl font-bold tabular-nums ${scoreColor(player.metrics[0].score)}`}>
                  {player.metrics[0].score}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">score / 100</p>
              </div>
            )}
          </div>

          {/* Issues grouped by type */}
          {player.issues.filter((i) => i.type === 'DEATH').length > 0 && (
            <Card>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Lo que te mató
              </p>
              <IssueList issues={player.issues.filter((i) => i.type === 'DEATH')} />
            </Card>
          )}

          {player.issues.filter((i) => i.type === 'INTERRUPT_MISSED').length > 0 && (
            <Card>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Interrupts perdidos
              </p>
              <IssueList issues={player.issues.filter((i) => i.type === 'INTERRUPT_MISSED')} />
            </Card>
          )}

          {player.issues.filter((i) => i.type === 'DEFENSIVE_UNUSED').length > 0 && (
            <Card>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Lo que no usaste
              </p>
              <IssueList issues={player.issues.filter((i) => i.type === 'DEFENSIVE_UNUSED')} />
            </Card>
          )}

          {/* Next run actions */}
          {player.issues.length > 0 && (
            <Card>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Próxima key
              </p>
              <ul className="space-y-2">
                {player.issues.slice(0, 3).map((issue) => (
                  <li key={issue.id} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                    {issue.action}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {player.issues.length === 0 && player.metrics.length === 0 && (
            <Card>
              <p className="text-sm text-slate-400">
                No hay datos de análisis para este jugador todavía. Analiza un fight primero.
              </p>
            </Card>
          )}
        </>
      )}
    </main>
  );
}

function IssueList({ issues }: { issues: Array<{ id: string; severity: string; title: string; description: string; action: string }> }) {
  return (
    <ul className="space-y-2">
      {issues.map((issue) => {
        const style = SEVERITY_STYLE[issue.severity] ?? SEVERITY_STYLE.low;
        return (
          <li key={issue.id} className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${style.badge}`}>
                {style.label}
              </span>
              <span className="text-sm font-medium text-slate-100">{issue.title}</span>
            </div>
            <p className="text-xs text-slate-400 pl-10 leading-snug">{issue.description}</p>
          </li>
        );
      })}
    </ul>
  );
}
