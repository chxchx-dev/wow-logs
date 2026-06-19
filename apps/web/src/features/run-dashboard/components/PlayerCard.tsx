import type { PlayerMetricCardDto, IssueDto } from '@gpc/shared';
import { formatNumber } from '../../../shared/utils/format';

const SEVERITY_RING: Record<string, string> = {
  critical: 'ring-1 ring-red-500/60',
  high: 'ring-1 ring-amber-500/50',
  medium: 'ring-1 ring-yellow-500/40',
  low: '',
};

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-900/60 text-red-400',
  high: 'bg-amber-900/60 text-amber-400',
  medium: 'bg-yellow-900/50 text-yellow-400',
  low: 'bg-slate-800 text-slate-400',
};

const ROLE_COLOR: Record<string, string> = {
  tank: 'text-blue-400',
  healer: 'text-emerald-400',
  dps: 'text-red-400',
  support: 'text-violet-400',
  unknown: 'text-slate-500',
};

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

interface PlayerCardProps {
  player: PlayerMetricCardDto;
  reportCode: string;
  onSelect?: () => void;
}

export function PlayerCard({ player, reportCode, onSelect }: PlayerCardProps) {
  const topIssue = player.topIssue as IssueDto | undefined;
  const ring = topIssue ? (SEVERITY_RING[topIssue.severity] ?? '') : '';

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-xl shadow-black/20 hover:border-cyan-500/50 transition-colors ${ring}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-100 truncate">{player.name}</p>
          <p className={`text-xs mt-0.5 ${ROLE_COLOR[player.role] ?? 'text-slate-500'}`}>
            {player.className ?? player.role}
          </p>
        </div>
        <div className={`text-2xl font-bold tabular-nums shrink-0 ${scoreColor(player.score)}`}>
          {player.score}
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Daño" value={formatNumber(player.damageDone)} />
        <Stat label="Muertes" value={String(player.deaths)} critical={player.deaths > 0} />
        <Stat label="Interrupts" value={String(player.interrupts)} low={player.interrupts === 0} />
      </div>

      {/* Top issue */}
      {topIssue && (
        <div className={`rounded-lg px-3 py-2 text-xs ${SEVERITY_BADGE[topIssue.severity] ?? 'bg-slate-800 text-slate-400'}`}>
          <p className="font-medium leading-snug">{topIssue.title}</p>
          <p className="mt-0.5 text-[11px] opacity-80 leading-snug">{topIssue.action}</p>
        </div>
      )}
    </button>
  );
}

function Stat({ label, value, critical, low }: { label: string; value: string; critical?: boolean; low?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-900/60 px-2 py-1.5 text-center">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${critical ? 'text-red-400' : low ? 'text-amber-400' : 'text-slate-200'}`}>
        {value}
      </p>
    </div>
  );
}
