import { useQuery } from '@tanstack/react-query';
import { http } from '../../../shared/api/http';
import type { FightAnalysisDto } from '@gpc/shared';

export function useFightSummary(reportCode: string, fightId: string | undefined) {
  return useQuery({
    queryKey: ['fight-summary', reportCode, fightId],
    queryFn: () => http.get<FightAnalysisDto>(`/reports/${reportCode}/fights/${fightId}/summary`),
    enabled: !!reportCode && !!fightId,
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
}
