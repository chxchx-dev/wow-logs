interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'Sin datos' }: EmptyStateProps) {
  return (
    <div className="flex h-40 items-center justify-center text-slate-500">
      {message}
    </div>
  );
}
