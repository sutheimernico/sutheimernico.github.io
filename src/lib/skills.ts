/**
 * Skill areas for the landing's Skills chapter. Tools are what I list on the CV; `match` are
 * the stack labels (as written in project front-matter) that count as evidence for the area.
 * Which projects show up is derived from the content collection, never hard-coded.
 */
export interface SkillArea {
  id: string;
  label: string;
  blurb: string;
  tools: string[];
  match: string[];
}

export const SKILL_AREAS: SkillArea[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    blurb: 'Interfaces people read every day: typed React, accessible markup, and pages measured for speed instead of assumed fast.',
    tools: ['React', 'TypeScript', 'Astro', 'Vue 3', 'React Native', 'Vite', 'Three.js'],
    match: ['React', 'React 19', 'React PWA', 'TypeScript', 'Astro', 'Vue 3', 'React Native', 'Three.js'],
  },
  {
    id: 'backend',
    label: 'Backend & APIs',
    blurb: 'Python services that serve data to an app: FastAPI endpoints, typed models, and business logic with tests around it.',
    tools: ['Python', 'FastAPI', 'REST APIs', 'PostgreSQL', 'SQLite', 'Alembic'],
    match: ['FastAPI', 'Express', 'SQLite'],
  },
  {
    id: 'data',
    label: 'Data & BI',
    blurb: 'Where I started: SQL, dbt models and reports. Today it is the pipelines and models behind the product.',
    tools: ['SQL', 'dbt', 'Airflow', 'DuckDB', 'pandas', 'Power BI', 'Azure Synapse'],
    match: ['dbt', 'DuckDB', 'InfluxDB', 'Parquet', 'Grafana', 'OPC UA'],
  },
  {
    id: 'cloud',
    label: 'Cloud & DevOps',
    blurb: 'Infrastructure as code on Azure, and pipelines that test, typecheck and build before anything ships.',
    tools: ['Azure', 'Pulumi', 'Docker', 'GitHub Actions', 'Azure DevOps', 'CI/CD', 'SSO'],
    match: ['Azure', 'Pulumi', 'GitHub Actions', 'GitHub Pages', 'CI/CD'],
  },
  {
    id: 'ai',
    label: 'AI & ML',
    blurb: 'LLM features that get evaluated before they get trusted, and models that have to beat a baseline to count.',
    tools: ['LLM integration', 'RAG', 'Agents', 'MCP', 'Ollama', 'LightGBM', 'scikit-learn'],
    match: ['LLM', 'RAG', 'MCP', 'Ollama', 'LightGBM', 'scikit-learn', 'CatBoost', 'BERTopic'],
  },
  {
    id: 'quality',
    label: 'Quality & tools',
    blurb: 'Tests and reviews as gates, not afterthoughts. Claude Code every day, with my own skills, agents and hooks.',
    tools: ['pytest', 'Vitest', 'Playwright', 'Git', 'Claude Code'],
    match: ['Vitest', 'vitest', 'pytest', 'Jest', 'Playwright', 'Claude Code'],
  },
];

export interface EvidenceProject {
  slug: string;
  title: string;
  order: number;
  stack: string[];
  context: 'personal' | 'work';
}

/**
 * Projects whose stack contains one of the area's labels: day-job entries first (they are the
 * strongest evidence), then by display order. Returns the full count and the first `limit`.
 */
export function evidenceFor(
  area: Pick<SkillArea, 'match'>,
  projects: EvidenceProject[],
  limit: number,
): { count: number; shown: EvidenceProject[] } {
  const hits = projects
    .filter((p) => p.stack.some((s) => area.match.includes(s)))
    .sort((a, b) => Number(b.context === 'work') - Number(a.context === 'work') || a.order - b.order);
  return { count: hits.length, shown: hits.slice(0, limit) };
}
