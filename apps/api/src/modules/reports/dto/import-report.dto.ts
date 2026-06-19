import { z } from 'zod';

export const importReportSchema = z.object({
  reportCode: z.string().regex(/^[a-zA-Z0-9]+$/, 'Invalid report code'),
});

export type ImportReportDto = z.infer<typeof importReportSchema>;
