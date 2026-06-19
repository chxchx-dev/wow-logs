import type { IssueDto } from '@gpc/shared';

const SEVERITY_STYLE: Record<string, { dot: string; text: string; bg: string }> = {
  critical: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-950/40 border-red-900/50' },
  high: { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-900/50' },
  medium: { dot: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-950/30 border-yellow-900/50' },
  low: { dot: 'bg-slate-500', text: 'text-slate-400', bg: 'bg-slate-900/60 border-slate-800' },
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'CRÍTICO',
  high: 'ALTO',
  medium: 'MEDIO',
  low: 'BAJO',
};

interface TopIssuesProps {
  issues: IssueDto[];
}

export function TopIssues({ issues }: TopIssuesProps) {
  if (issues.length === 0) return null;

  return (
    <div className="space-y-2">
      {issues.slice(0, 5).map((issue, i) => {
        const style = SEVERITY_STYLE[issue.severity] ?? SEVERITY_STYLE.low;
        return (
          <div key={issue.id ?? i} className={`rounded-xl border px-4 py-3 ${style.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
              <span className={`text-[10px] font-bold tracking-widest ${style.text}`}>
                {SEVERITY_LABEL[issue.severity] ?? issue.severity.toUpperCase()}
              </span>
              {issue.playerName && (
                <span className="text-[10px] text-slate-500">· {issue.playerName}</span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-100">{issue.title}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{issue.action}</p>
          </div>
        );
      })}
    </div>
  );
}
