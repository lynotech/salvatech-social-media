export interface AgentState {
  status: 'idle' | 'working' | 'done' | 'waiting' | 'error';
  message: string;
}

export interface LogEntry {
  time: string;
  msg: string;
  type: string;
}

export interface CheckpointData {
  agent: string;
  question: string;
  items: string[];
  type?: 'approval' | 'text' | 'choice';
  options?: string[];
  responded: boolean;
  response: { approved: boolean; feedback: string } | null;
}

export interface AppState {
  pipeline: string;
  currentStep: number;
  slug: string | null;
  tema: string | null;
  composicao: string | null;
  agents: Record<string, AgentState>;
  steps: Record<string, string>;
  log: LogEntry[];
  checkpoint: CheckpointData | null;
}

export const defaultState: AppState = {
  pipeline: 'idle',
  currentStep: 0,
  slug: null,
  tema: null,
  composicao: null,
  agents: {
    orquestrador: { status: 'idle', message: '' },
    estrategista: { status: 'idle', message: '' },
    copywriter: { status: 'idle', message: '' },
    ilustrador: { status: 'idle', message: '' },
    designer: { status: 'idle', message: '' },
  },
  steps: { 1: 'pending', 2: 'pending', 3: 'pending', 4: 'pending', 5: 'pending', 6: 'pending', 7: 'pending' },
  log: [],
  checkpoint: null,
};
