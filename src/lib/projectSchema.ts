import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string(),
  order: z.number(),
  status: z.enum(['production', 'in-progress', 'research', 'internal']),
  year: z.string(),
  stack: z.array(z.string()),
  summary: z.string(),
  role: z.string(),
  featured: z.boolean().default(true),
  github: z.string().url().optional(),
});

export type Project = z.infer<typeof projectSchema>;
