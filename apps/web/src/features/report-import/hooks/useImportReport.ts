import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../../shared/api/http';
import type { ReportOverviewDto } from '@gpc/shared';

export function useImportReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportCode: string) =>
      http.post<ReportOverviewDto>('/reports/import', { reportCode }),
    onSuccess: (data) => {
      queryClient.setQueryData(['report', data.reportCode], data);
    },
  });
}
