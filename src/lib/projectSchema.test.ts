import { describe, it, expect } from 'vitest';
import { projectSchema } from './projectSchema';

const valid = {
  title: 'After-Sales BI Platform', order: 1, status: 'production',
  year: '2024', stack: ['Azure','dbt'], summary: 'x', role: 'the backbone', featured: true,
  domain: 'data',
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
  it('defaults featured to false when omitted (flagships opt in)', () => {
    const { featured, ...rest } = valid;
    expect(projectSchema.parse(rest).featured).toBe(false);
  });
  it('requires a known domain', () => {
    const { domain, ...rest } = valid;
    expect(projectSchema.safeParse(rest).success).toBe(false);
    expect(projectSchema.safeParse({ ...valid, domain: 'crypto' }).success).toBe(false);
  });
  it('defaults context to personal and reviewed to false', () => {
    const parsed = projectSchema.parse(valid);
    expect(parsed.context).toBe('personal');
    expect(parsed.reviewed).toBe(false);
  });
  it('accepts an optional fieldNote', () => {
    expect(projectSchema.parse({ ...valid, fieldNote: 'note' }).fieldNote).toBe('note');
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
