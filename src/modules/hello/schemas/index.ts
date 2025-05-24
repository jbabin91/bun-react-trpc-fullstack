import { z } from 'zod/v4';

export const helloInputSchema = z.object({
  method: z.enum(['GET', 'PUT']).optional().default('GET'),
  name: z.string().optional(),
});

export const updateHelloInputSchema = z.object({
  name: z.string().optional(),
});

export type HelloInput = z.infer<typeof helloInputSchema>;
export type UpdateHelloInput = z.infer<typeof updateHelloInputSchema>;
