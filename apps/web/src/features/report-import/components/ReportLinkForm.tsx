import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseWarcraftLogsUrl } from '../utils/parseWarcraftLogsUrl';
import { useImportReport } from '../hooks/useImportReport';

export function ReportLinkForm() {
  const [value, setValue] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { mutate, isPending, error: apiError } = useImportReport();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setParseError(null);

    let reportCode: string;
    try {
      const parsed = parseWarcraftLogsUrl(value);
      reportCode = parsed.reportCode;
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Link inválido');
      return;
    }

    mutate(reportCode, {
      onSuccess: () => navigate(`/report/${reportCode}`),
    });
  }

  const displayError = parseError ?? (apiError instanceof Error ? apiError.message : null);

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
      <label className="block text-sm font-medium text-slate-300">
        Link de Warcraft Logs
      </label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://www.warcraftlogs.com/reports/..."
        disabled={isPending}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400 disabled:opacity-50"
      />
      {displayError && <p className="text-sm text-red-400">{displayError}</p>}
      <button
        type="submit"
        disabled={isPending || !value.trim()}
        className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Analizando...' : 'Analizar run'}
      </button>
    </form>
  );
}
