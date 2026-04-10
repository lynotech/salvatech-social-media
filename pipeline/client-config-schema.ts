/**
 * Client Config Schema & Utilities
 * Schema, validation, and helpers for multi-client config.yaml files.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// ── Interfaces ──────────────────────────────────────────────────────

export interface VisualIdentity {
  background: string;
  primary: string;
  secondary: string;
  highlight: string;
  text: string;
  muted: string;
  headline_font: string;
  body_font: string;
  logo: string;
}

export type ImageStrategy = 'mascote-ia' | 'imagem-ia' | 'fotos' | 'mix';

export interface ScheduleEntry {
  day: string;
  channel: string;
}

export interface Schedule {
  posts_per_month: number;
  weeks: ScheduleEntry[];
}

export interface Pillar {
  name: string;
  description: string;
  channels: string[];
}

export interface EstrategistaProfile {
  fontes: string[];
  tipo_temas: string;
  prioridade: string;
}

export interface CopywriterProfile {
  tom: string;
  slides: number;
  estrutura: string;
  regras: string[];
}

export interface IlustradorProfile {
  estilo: string;
  composicoes: string[];
  regras: string[];
}

export interface DesignerProfile {
  templates: string[];
  rodape: string;
  efeitos: string[];
}

export interface AgentProfiles {
  estrategista: EstrategistaProfile;
  copywriter: CopywriterProfile;
  ilustrador: IlustradorProfile;
  designer: DesignerProfile;
}

export interface ClientConfig {
  name: string;
  slug: string;
  visual: VisualIdentity;
  image_strategy: ImageStrategy;
  mascot_prompt?: string;
  photo_dir?: string;
  channels: string[];
  schedule: Schedule;
  pillars: Pillar[];
  audience: string;
  research_topics: string[];
  agent_profiles: AgentProfiles;
}

// ── Constants ───────────────────────────────────────────────────────

/**
 * Resolve workspace root by walking up from __dirname until we find
 * the pipeline/ directory (works from both source and compiled locations).
 */
function findRoot(): string {
  let dir = __dirname;
  // If running from dist/pipeline/, go up to dist/ then up to root
  // If running from pipeline/, go up to root
  for (let i = 0; i < 5; i++) {
    const parent = path.dirname(dir);
    if (fs.existsSync(path.join(parent, 'pipeline')) && fs.existsSync(path.join(parent, 'dashboard'))) {
      return parent;
    }
    if (fs.existsSync(path.join(dir, 'pipeline')) && fs.existsSync(path.join(dir, 'dashboard'))) {
      return dir;
    }
    dir = parent;
  }
  // Fallback: assume __dirname/../ is root (original behavior)
  return path.resolve(__dirname, '..');
}

const ROOT = findRoot();
const CLIENTS_DIR = path.join(ROOT, 'clients');

// ── Validation ──────────────────────────────────────────────────────

const REQUIRED_VISUAL_FIELDS: (keyof VisualIdentity)[] = [
  'background', 'primary', 'secondary', 'highlight',
  'text', 'muted', 'headline_font', 'body_font', 'logo',
];

const VALID_IMAGE_STRATEGIES: ImageStrategy[] = [
  'mascote-ia', 'imagem-ia', 'fotos', 'mix',
];

function validateConfig(data: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Campo obrigatório ausente: name');
  }
  if (!data.slug || typeof data.slug !== 'string') {
    errors.push('Campo obrigatório ausente: slug');
  }

  // visual
  if (!data.visual || typeof data.visual !== 'object') {
    errors.push('Campo obrigatório ausente: visual');
  } else {
    const v = data.visual as Record<string, unknown>;
    for (const field of REQUIRED_VISUAL_FIELDS) {
      if (!v[field] || typeof v[field] !== 'string') {
        errors.push(`Campo obrigatório ausente: visual.${field}`);
      }
    }
  }

  // image_strategy
  if (!data.image_strategy || !VALID_IMAGE_STRATEGIES.includes(data.image_strategy as ImageStrategy)) {
    errors.push(`Campo obrigatório ausente ou inválido: image_strategy (deve ser: ${VALID_IMAGE_STRATEGIES.join(', ')})`);
  }

  // channels
  if (!Array.isArray(data.channels) || data.channels.length === 0) {
    errors.push('Campo obrigatório ausente: channels (deve ter pelo menos 1 canal)');
  }

  // schedule
  if (!data.schedule || typeof data.schedule !== 'object') {
    errors.push('Campo obrigatório ausente: schedule');
  } else {
    const s = data.schedule as Record<string, unknown>;
    if (typeof s.posts_per_month !== 'number' || s.posts_per_month < 1) {
      errors.push('Campo obrigatório ausente: schedule.posts_per_month (deve ser >= 1)');
    }
    if (!Array.isArray(s.weeks) || s.weeks.length === 0) {
      errors.push('Campo obrigatório ausente: schedule.weeks (deve ter pelo menos 1 entrada)');
    }
  }

  // pillars
  if (!Array.isArray(data.pillars) || data.pillars.length < 2) {
    errors.push('Campo obrigatório ausente: pillars (deve ter pelo menos 2 pilares)');
  }

  // audience
  if (!data.audience || typeof data.audience !== 'string') {
    errors.push('Campo obrigatório ausente: audience');
  }

  // research_topics
  if (!Array.isArray(data.research_topics) || data.research_topics.length === 0) {
    errors.push('Campo obrigatório ausente: research_topics (deve ter pelo menos 1 tópico)');
  }

  // agent_profiles
  if (!data.agent_profiles || typeof data.agent_profiles !== 'object') {
    errors.push('Campo obrigatório ausente: agent_profiles');
  } else {
    const ap = data.agent_profiles as Record<string, unknown>;
    for (const agent of ['estrategista', 'copywriter', 'ilustrador', 'designer']) {
      if (!ap[agent] || typeof ap[agent] !== 'object') {
        errors.push(`Campo obrigatório ausente: agent_profiles.${agent}`);
      }
    }
  }

  return errors;
}

// ── Exported Functions ──────────────────────────────────────────────

/**
 * Loads and validates a client config from clients/{slug}/config.yaml.
 * Throws an error with details if the file is missing or validation fails.
 */
export function loadClientConfig(slug: string): ClientConfig {
  const configPath = path.join(CLIENTS_DIR, slug, 'config.yaml');

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config não encontrado: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf-8');
  const data = yaml.load(raw) as Record<string, unknown>;

  if (!data || typeof data !== 'object') {
    throw new Error(`Config inválido (não é um objeto YAML): ${configPath}`);
  }

  const errors = validateConfig(data);
  if (errors.length > 0) {
    throw new Error(
      `Validação falhou para ${slug}:\n  - ${errors.join('\n  - ')}`
    );
  }

  return data as unknown as ClientConfig;
}

/**
 * Scans the clients/ directory and returns slugs with valid configs.
 */
export function listClients(): string[] {
  if (!fs.existsSync(CLIENTS_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(CLIENTS_DIR, { withFileTypes: true });
  const slugs: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const configPath = path.join(CLIENTS_DIR, entry.name, 'config.yaml');
    if (fs.existsSync(configPath)) {
      try {
        loadClientConfig(entry.name);
        slugs.push(entry.name);
      } catch {
        // Config exists but is invalid — skip
      }
    }
  }

  return slugs;
}

/**
 * Creates the complete directory structure for a new client.
 * Directories: posts/, templates/, assets/, assets/photos/, _memory/
 */
export function createClientDirectory(slug: string): void {
  const base = path.join(CLIENTS_DIR, slug);
  const dirs = [
    path.join(base, 'posts'),
    path.join(base, 'templates'),
    path.join(base, 'assets', 'photos'),
    path.join(base, '_memory'),
  ];

  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
