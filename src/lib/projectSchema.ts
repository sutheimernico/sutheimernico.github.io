import { z } from 'zod';
import { DOMAIN_IDS } from './domains';

export const projectSchema = z.object({
  title: z.string(),
  order: z.number(),
  status: z.enum(['production', 'in-progress', 'research', 'internal']),
  year: z.string(),
  stack: z.array(z.string()),
  summary: z.string(),
  role: z.string(),
  // Featured entries drive the spine + deck; everything else lives in the index.
  // Default false: a new file must opt in, so the flagship set stays curated.
  featured: z.boolean().default(false),
  github: z.url().optional(),
  domain: z.enum(DOMAIN_IDS),
  context: z.enum(['personal', 'work']).default('personal'),
  // Editorial flag only — nothing renders differently. Lets Nico grep what he
  // has not signed off yet without leaking a draft marker onto the live page.
  reviewed: z.boolean().default(false),
  // One or two honest sentences shown as an aside on the detail page.
  fieldNote: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectStatus = Project['status'];
