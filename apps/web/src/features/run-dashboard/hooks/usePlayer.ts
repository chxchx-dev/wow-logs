import { useQuery } from '@tanstack/react-query';
import { http } from '../../../shared/api/http';

export interface PlayerDetail {
  id: string;
  name: string;
  server: string | null;
  className: string | null;
  specName: string | null;
  role: string;
  metrics: Array<{
    id: string;
    score: number;
    damageDone: string;
    deaths: number;
    interrupts: number;
    defensivesUsed: number;
    avoidableDamageTaken: string;
    createdAt: string;
  }>;
  issues: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    description: string;
    action: string;
  }>;
}

export function usePlayer(reportCode: string, playerId: string | undefined) {
  return useQuery({
    queryKey: ['player', reportCode, playerId],
    queryFn: () => http.get<PlayerDetail>(`/players/${reportCode}/${playerId}`),
    enabled: !!reportCode && !!playerId,
    staleTime: 1000 * 60 * 10,
  });
}
