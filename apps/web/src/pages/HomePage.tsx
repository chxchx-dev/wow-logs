import { ReportLinkForm } from '../features/report-import/components/ReportLinkForm';

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-100">Guild Performance Coach</h1>
        <p className="mt-2 text-slate-400">
          Pega un link de Warcraft Logs y obtén un diagnóstico en segundos.
        </p>
      </div>
      <ReportLinkForm />
    </main>
  );
}
