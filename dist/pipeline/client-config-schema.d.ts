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
/**
 * Loads and validates a client config from clients/{slug}/config.yaml.
 * Throws an error with details if the file is missing or validation fails.
 */
export declare function loadClientConfig(slug: string): ClientConfig;
/**
 * Scans the clients/ directory and returns slugs with valid configs.
 */
export declare function listClients(): string[];
/**
 * Creates the complete directory structure for a new client.
 * Directories: posts/, templates/, assets/, assets/photos/, _memory/
 */
export declare function createClientDirectory(slug: string): void;
