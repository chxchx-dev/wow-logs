interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400">
      <div className="h-5 w-5 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
