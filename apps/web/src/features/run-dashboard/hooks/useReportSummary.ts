import { useQuery } from '@tanstack/react-query';
import { http } from '../../../shared/api/http';
import type { ReportOverviewDto } from '@gpc/shared';

export function useReportSummary(reportCode: string) {
  return useQuery({
    queryKey: ['report', reportCode],
    queryFn: () => http.get<ReportOverviewDto>(`/reports/${reportCode}`),
    enabled: !!reportCode,
    staleTime: 1000 * 60 * 10,
  });
}
