import { useState } from 'react';
import { ReportLinkForm } from '../features/report-import/components/ReportLinkForm';
import { Card } from '../shared/components/Card';

export function HomePage() {
  const [showMock, setShowMock] = useState(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_35%),linear-gradient(180deg,_#08111f_0%,_#070a12_55%,_#05070d_100%)] px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-[32px] border border-slate-800/80 bg-slate-950/65 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Modo preview seguro
              </span>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-50 sm:text-5xl">
                Guild Performance Coach
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Pega un link de Warcraft Logs y obtén un diagnóstico en segundos.
                Si quieres, también puedes abrir un mock estático para ver cómo se
                sentiría la experiencia por dentro sin tocar nada real.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowMock((current) => !current)}
                  className="rounded-xl border border-amber-300/35 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:border-amber-200/60 hover:bg-amber-300/15"
                >
                  {showMock ? 'Ocultar mock de prueba' : 'Ver mock de prueba'}
                </button>
              </div>
            </div>

            <Card className="border-cyan-500/20 bg-slate-950/85">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  Entrada real
                </p>
                <h2 className="text-2xl font-bold text-slate-100">
                  Importa un reporte
                </h2>
                <p className="text-sm leading-6 text-slate-400">
                  Este bloque sigue siendo el flujo real. El botón del mock solo
                  muestra una maqueta visual aparte.
                </p>
              </div>
              <div className="mt-6">
                <ReportLinkForm />
              </div>
            </Card>
          </div>
        </section>

        {showMock && (
          <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="overflow-hidden border-emerald-400/15 bg-slate-950/85 p-0">
              <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
                      Mock interno
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-50">
                      Vista previa de una run analizada
                    </h2>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                    Demo
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <MockMetric title="Score del fight" value="87" accent="text-emerald-300" />
                  <MockMetric title="Muertes" value="2" accent="text-rose-300" />
                  <MockMetric title="Interrupts" value="14/18" accent="text-cyan-300" />
                  <MockMetric title="Defensivos" value="76%" accent="text-amber-300" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Reporte</p>
                        <h3 className="mt-1 text-xl font-bold text-slate-100">
                          Echoes of Midnight - Neltharion&apos;s Lair
                        </h3>
                      </div>
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                        Pull 06
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <MockRow
                        name="Tank principal"
                        detail="Buen uso de CDs mayores, faltó cubrir 1 frontal."
                        tone="emerald"
                      />
                      <MockRow
                        name="Healer"
                        detail="Curación estable, pero 2 muertes llegaron sin externo."
                        tone="amber"
                      />
                      <MockRow
                        name="Aug Evoker"
                        detail="Prescience bien repartido, Breath desfasado en el lust."
                        tone="cyan"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Issues top
                    </p>
                    <div className="mt-4 space-y-3">
                      <MockIssue
                        title="Defensivos tardíos"
                        description="3 jugadores usaron mitigación después del daño fuerte."
                        color="rose"
                      />
                      <MockIssue
                        title="Interrupt roto"
                        description="Se perdió el corte del caster en la segunda rotación."
                        color="amber"
                      />
                      <MockIssue
                        title="Ventana de burst"
                        description="El daño de prioridad cayó fuera del lust inicial."
                        color="cyan"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-5">
              <Card className="border-slate-700/80 bg-slate-950/80">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Qué es esto
                </p>
                <h3 className="mt-3 text-xl font-bold text-slate-100">
                  Solo una maqueta visual
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  No llama a la API, no guarda datos y no reemplaza el flujo real.
                  Sirve para revisar el look &amp; feel antes de conectar más partes.
                </p>
              </Card>

              <Card className="border-slate-700/80 bg-slate-950/80">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Próximo paso
                </p>
                <h3 className="mt-3 text-xl font-bold text-slate-100">
                  Listo para iterar
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Si te gusta esta dirección, el siguiente paso sería mover este
                  mock a una página dedicada o conectarlo a datos reales poco a poco.
                </p>
              </Card>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function MockMetric({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`mt-3 text-3xl font-black ${accent}`}>{value}</p>
    </div>
  );
}

function MockRow({
  name,
  detail,
  tone,
}: {
  name: string;
  detail: string;
  tone: 'emerald' | 'amber' | 'cyan';
}) {
  const toneClass = {
    emerald: 'border-emerald-400/20 bg-emerald-400/5 text-emerald-200',
    amber: 'border-amber-400/20 bg-amber-400/5 text-amber-200',
    cyan: 'border-cyan-400/20 bg-cyan-400/5 text-cyan-200',
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-100">{name}</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
          OK
        </span>
      </div>
    </div>
  );
}

function MockIssue({
  title,
  description,
  color,
}: {
  title: string;
  description: string;
  color: 'rose' | 'amber' | 'cyan';
}) {
  const dotClass = {
    rose: 'bg-rose-300',
    amber: 'bg-amber-300',
    cyan: 'bg-cyan-300',
  }[color];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dotClass}`} />
        <div>
          <p className="font-semibold text-slate-100">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}
