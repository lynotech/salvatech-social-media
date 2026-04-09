import { AppState, defaultState, LogEntry } from './state';

// Singleton state — lives in Node.js process memory
let state: AppState = { ...defaultState };
let pendingCommand: string | null = null;
const listeners: Set<(data: string) => void> = new Set();

export function getState() { return state; }

export function resetState() {
  state = JSON.parse(JSON.stringify(defaultState));
  pendingCommand = null;
  broadcast({ type: 'reset', state });
}

export function updateState(data: Partial<AppState> & { 
  agent?: string; status?: string; message?: string; 
  step?: number; stepStatus?: string;
  log?: string; logType?: string;
}) {
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
  state.checkpoint = { ...cp, responded: false, response: null };
  state.pipeline = 'checkpoint';
  if (state.agents[cp.agent]) {
    state.agents[cp.agent].status = 'waiting';
    state.agents[cp.agent].message = 'Aguardando aprovação...';
  }
  broadcast({ type: 'checkpoint', state });
}

export function respondCheckpoint(approved: boolean, feedback: string) {
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

export function setCommand(cmd: string) { pendingCommand = cmd; }
export function consumeCommand() { const c = pendingCommand; pendingCommand = null; return c; }

export function addListener(fn: (data: string) => void) { listeners.add(fn); }
export function removeListener(fn: (data: string) => void) { listeners.delete(fn); }

function broadcast(data: any) {
  const json = JSON.stringify(data);
  listeners.forEach(fn => { try { fn(json); } catch {} });
}
