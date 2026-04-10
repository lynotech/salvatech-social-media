import { AppState, defaultState, LogEntry } from './state';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// ── Multi-client state ──────────────────────────────────────────────

const clientStates: Map<string, AppState> = new Map();
let activeClient: string | null = null;

// Singleton state — backward compatibility (lives in Node.js process memory)
let state: AppState = { ...defaultState };
let pendingCommand: string | null = null;
const listeners: Set<(data: string) => void> = new Set();

// Per-client pending commands
const clientCommands: Map<string, string | null> = new Map();

// ── Resolve workspace root (clients/ lives at repo root) ────────────

function findRoot(): string {
  // In Next.js, process.cwd() is the dashboard-next/ dir
  const cwd = process.cwd();
  // Check if clients/ is at cwd parent (repo root)
  const parent = path.dirname(cwd);
  if (fs.existsSync(path.join(parent, 'clients'))) return parent;
  // Maybe we're already at root
  if (fs.existsSync(path.join(cwd, 'clients'))) return cwd;
  return parent;
}

const ROOT = findRoot();
const CLIENTS_DIR = path.join(ROOT, 'clients');

// ── Multi-client functions ──────────────────────────────────────────

export function getClientState(slug: string): AppState {
  if (!clientStates.has(slug)) {
    clientStates.set(slug, JSON.parse(JSON.stringify(defaultState)));
  }
  return clientStates.get(slug)!;
}

export function updateClientState(slug: string, data: Partial<AppState> & {
  agent?: string; status?: string; message?: string;
  step?: number; stepStatus?: string;
  log?: string; logType?: string;
}) {
  const s = getClientState(slug);

  if (data.agent && s.agents[data.agent]) {
    s.agents[data.agent].status = (data.status as any) || 'idle';
    s.agents[data.agent].message = data.message || '';
  }
  if (data.step) {
    s.currentStep = data.step;
    s.steps[data.step] = data.stepStatus || data.status || 'active';
  }
  if (data.pipeline) s.pipeline = data.pipeline;
  if (data.slug) s.slug = data.slug;
  if (data.tema) s.tema = data.tema;
  if (data.composicao) s.composicao = data.composicao;
  if (data.log) {
    const time = new Date().toTimeString().slice(0, 5);
    s.log.push({ time, msg: data.log, type: data.logType || '' });
    if (s.log.length > 100) s.log.shift();
  }

  clientStates.set(slug, s);
  broadcast({ type: 'update', client: slug, state: s });
}

export function resetClientState(slug: string) {
  clientStates.set(slug, JSON.parse(JSON.stringify(defaultState)));
  clientCommands.set(slug, null);
  broadcast({ type: 'reset', client: slug, state: getClientState(slug) });
}

export function setActiveClient(slug: string) {
  activeClient = slug;
  broadcast({ type: 'active-client', client: slug, state: getClientState(slug) });
}

export function getActiveClient(): string | null {
  return activeClient;
}

// Per-client command queue
export function setClientCommand(slug: string, cmd: string) {
  clientCommands.set(slug, cmd);
}

export function consumeClientCommand(slug: string): string | null {
  const cmd = clientCommands.get(slug) || null;
  clientCommands.set(slug, null);
  return cmd;
}

// Per-client checkpoint
export function setClientCheckpoint(slug: string, cp: any) {
  const s = getClientState(slug);
  s.checkpoint = { ...cp, responded: false, response: null };
  s.pipeline = 'checkpoint';
  if (cp.agent && s.agents[cp.agent]) {
    s.agents[cp.agent].status = 'waiting';
    s.agents[cp.agent].message = 'Aguardando aprovação...';
  }
  clientStates.set(slug, s);
  broadcast({ type: 'checkpoint', client: slug, state: s });
}

export function respondClientCheckpoint(slug: string, approved: boolean, feedback: string) {
  const s = getClientState(slug);
  if (s.checkpoint) {
    s.checkpoint.responded = true;
    s.checkpoint.response = { approved, feedback };
    const agent = s.checkpoint.agent;
    if (s.agents[agent]) {
      s.agents[agent].status = approved ? 'done' : 'working';
      s.agents[agent].message = approved ? 'Aprovado!' : 'Ajustando...';
    }
    s.pipeline = 'running';
    clientStates.set(slug, s);
    broadcast({ type: 'update', client: slug, state: s });
  }
}

// ── Clients Overview ────────────────────────────────────────────────

export interface ClientOverview {
  name: string;
  slug: string;
  logo: string;
  briefs: number;
  copys: number;
  artes: number;
  exports: number;
  totalPosts: number;
}

export function getClientsOverview(): ClientOverview[] {
  const overview: ClientOverview[] = [];

  if (!fs.existsSync(CLIENTS_DIR)) return overview;

  const entries = fs.readdirSync(CLIENTS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const clientDir = path.join(CLIENTS_DIR, entry.name);
    const configPath = path.join(clientDir, 'config.yaml');

    if (!fs.existsSync(configPath)) continue;

    let name = entry.name;
    let slug = entry.name;
    let logo = '';

    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const config = yaml.load(raw) as Record<string, any>;
      if (config?.name) name = config.name;
      if (config?.slug) slug = config.slug;
      if (config?.visual?.logo) logo = config.visual.logo;
    } catch {
      // If config is unreadable, use directory name
    }

    const postsDir = path.join(clientDir, 'posts');
    let briefs = 0;
    let copys = 0;
    let artes = 0;
    let exports = 0;
    let totalPosts = 0;

    if (fs.existsSync(postsDir)) {
      const postEntries = fs.readdirSync(postsDir, { withFileTypes: true });

      for (const postEntry of postEntries) {
        if (!postEntry.isDirectory()) continue;
        totalPosts++;

        const postPath = path.join(postsDir, postEntry.name);

        // Count briefs: post has brief.md
        if (fs.existsSync(path.join(postPath, 'brief.md'))) {
          briefs++;
        }

        // Count copys: post has copy.md
        if (fs.existsSync(path.join(postPath, 'copy.md'))) {
          copys++;
        }

        // Count artes: post has assets/capa.jpg
        if (fs.existsSync(path.join(postPath, 'assets', 'capa.jpg'))) {
          artes++;
        }

        // Count exports: post has export/ dir with at least one PNG
        const exportDir = path.join(postPath, 'export');
        if (fs.existsSync(exportDir)) {
          try {
            const exportFiles = fs.readdirSync(exportDir);
            const hasPng = exportFiles.some(f => f.toLowerCase().endsWith('.png'));
            if (hasPng) exports++;
          } catch {
            // skip unreadable export dirs
          }
        }
      }
    }

    overview.push({ name, slug, logo, briefs, copys, artes, exports, totalPosts });
  }

  return overview;
}

// ── Legacy singleton functions (backward compatibility) ─────────────

export function getState() {
  // If there's an active client, return that client's state
  if (activeClient) return getClientState(activeClient);
  return state;
}

export function resetState() {
  if (activeClient) {
    resetClientState(activeClient);
    return;
  }
  state = JSON.parse(JSON.stringify(defaultState));
  pendingCommand = null;
  broadcast({ type: 'reset', state });
}

export function updateState(data: Partial<AppState> & {
  agent?: string; status?: string; message?: string;
  step?: number; stepStatus?: string;
  log?: string; logType?: string;
}) {
  if (activeClient) {
    updateClientState(activeClient, data);
    return;
  }

  if (data.agent && state.agents[data.agent]) {
    state.agents[data.agent].status = (data.status as any) || 'idle';
    state.agents[data.agent].message = data.message || '';
  }
  if (data.step) {
    state.currentStep = data.step;
    state.steps[data.step] = data.stepStatus || data.status || 'active';
  }
  if (data.pipeline) state.pipeline = data.pipeline;
  if (data.slug) state.slug = data.slug;
  if (data.tema) state.tema = data.tema;
  if (data.composicao) state.composicao = data.composicao;
  if (data.log) {
    const time = new Date().toTimeString().slice(0, 5);
    state.log.push({ time, msg: data.log, type: data.logType || '' });
    if (state.log.length > 100) state.log.shift();
  }
  broadcast({ type: 'update', state });
}

export function setCheckpoint(cp: any) {
  if (activeClient) {
    setClientCheckpoint(activeClient, cp);
    return;
  }
  state.checkpoint = { ...cp, responded: false, response: null };
  state.pipeline = 'checkpoint';
  if (state.agents[cp.agent]) {
    state.agents[cp.agent].status = 'waiting';
    state.agents[cp.agent].message = 'Aguardando aprovação...';
  }
  broadcast({ type: 'checkpoint', state });
}

export function respondCheckpoint(approved: boolean, feedback: string) {
  if (activeClient) {
    respondClientCheckpoint(activeClient, approved, feedback);
    return;
  }
  if (state.checkpoint) {
    state.checkpoint.responded = true;
    state.checkpoint.response = { approved, feedback };
    const agent = state.checkpoint.agent;
    if (state.agents[agent]) {
      state.agents[agent].status = approved ? 'done' : 'working';
      state.agents[agent].message = approved ? 'Aprovado!' : 'Ajustando...';
    }
    state.pipeline = 'running';
    broadcast({ type: 'update', state });
  }
}

export function setCommand(cmd: string) {
  if (activeClient) {
    setClientCommand(activeClient, cmd);
    return;
  }
  pendingCommand = cmd;
}

export function consumeCommand() {
  if (activeClient) return consumeClientCommand(activeClient);
  const c = pendingCommand;
  pendingCommand = null;
  return c;
}

// ── SSE listeners ───────────────────────────────────────────────────

export function addListener(fn: (data: string) => void) { listeners.add(fn); }
export function removeListener(fn: (data: string) => void) { listeners.delete(fn); }

function broadcast(data: any) {
  const json = JSON.stringify(data);
  listeners.forEach(fn => { try { fn(json); } catch {} });
}
