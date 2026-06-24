import { describe, it, expect } from 'vitest';
import { projectSchema } from './projectSchema';

const valid = {
  title: 'After-Sales BI Platform', order: 1, status: 'production',
  year: '2024', stack: ['Azure','dbt'], summary: 'x', role: 'the backbone', featured: true,
};

describe('projectSchema', () => {
  it('accepts a well-formed project', () => {
    expect(projectSchema.safeParse(valid).success).toBe(true);
  });
  it('rejects an unknown status', () => {
    expect(projectSchema.safeParse({ ...valid, status: 'nope' }).success).toBe(false);
  });
  it('requires a numeric order', () => {
    expect(projectSchema.safeParse({ ...valid, order: 'first' }).success).toBe(false);
  });
  it('defaults featured to true when omitted', () => {
    const { featured, ...rest } = valid;
    const parsed = projectSchema.parse(rest);
    expect(parsed.featured).toBe(true);
  });
  it('parses without a github field (optional)', () => {
    expect(projectSchema.safeParse(valid).success).toBe(true);
  });
  it('accepts a valid github URL', () => {
    expect(projectSchema.safeParse({ ...valid, github: 'https://github.com/x/y' }).success).toBe(true);
  });
  it('rejects a github value that is not a URL', () => {
    expect(projectSchema.safeParse({ ...valid, github: 'not-a-url' }).success).toBe(false);
  });
});
