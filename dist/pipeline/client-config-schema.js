"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadClientConfig = loadClientConfig;
exports.listClients = listClients;
exports.createClientDirectory = createClientDirectory;
/**
 * Client Config Schema & Utilities
 * Schema, validation, and helpers for multi-client config.yaml files.
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
// ── Constants ───────────────────────────────────────────────────────
/**
 * Resolve workspace root by walking up from __dirname until we find
 * the pipeline/ directory (works from both source and compiled locations).
 */
function findRoot() {
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
const REQUIRED_VISUAL_FIELDS = [
    'background', 'primary', 'secondary', 'highlight',
    'text', 'muted', 'headline_font', 'body_font', 'logo',
];
const VALID_IMAGE_STRATEGIES = [
    'mascote-ia', 'imagem-ia', 'fotos', 'mix',
];
function validateConfig(data) {
    const errors = [];
    if (!data.name || typeof data.name !== 'string') {
        errors.push('Campo obrigatório ausente: name');
    }
    if (!data.slug || typeof data.slug !== 'string') {
        errors.push('Campo obrigatório ausente: slug');
    }
    // visual
    if (!data.visual || typeof data.visual !== 'object') {
        errors.push('Campo obrigatório ausente: visual');
    }
    else {
        const v = data.visual;
        for (const field of REQUIRED_VISUAL_FIELDS) {
            if (!v[field] || typeof v[field] !== 'string') {
                errors.push(`Campo obrigatório ausente: visual.${field}`);
            }
        }
    }
    // image_strategy
    if (!data.image_strategy || !VALID_IMAGE_STRATEGIES.includes(data.image_strategy)) {
        errors.push(`Campo obrigatório ausente ou inválido: image_strategy (deve ser: ${VALID_IMAGE_STRATEGIES.join(', ')})`);
    }
    // channels
    if (!Array.isArray(data.channels) || data.channels.length === 0) {
        errors.push('Campo obrigatório ausente: channels (deve ter pelo menos 1 canal)');
    }
    // schedule
    if (!data.schedule || typeof data.schedule !== 'object') {
        errors.push('Campo obrigatório ausente: schedule');
    }
    else {
        const s = data.schedule;
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
    }
    else {
        const ap = data.agent_profiles;
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
function loadClientConfig(slug) {
    const configPath = path.join(CLIENTS_DIR, slug, 'config.yaml');
    if (!fs.existsSync(configPath)) {
        throw new Error(`Config não encontrado: ${configPath}`);
    }
    const raw = fs.readFileSync(configPath, 'utf-8');
    const data = yaml.load(raw);
    if (!data || typeof data !== 'object') {
        throw new Error(`Config inválido (não é um objeto YAML): ${configPath}`);
    }
    const errors = validateConfig(data);
    if (errors.length > 0) {
        throw new Error(`Validação falhou para ${slug}:\n  - ${errors.join('\n  - ')}`);
    }
    return data;
}
/**
 * Scans the clients/ directory and returns slugs with valid configs.
 */
function listClients() {
    if (!fs.existsSync(CLIENTS_DIR)) {
        return [];
    }
    const entries = fs.readdirSync(CLIENTS_DIR, { withFileTypes: true });
    const slugs = [];
    for (const entry of entries) {
        if (!entry.isDirectory())
            continue;
        const configPath = path.join(CLIENTS_DIR, entry.name, 'config.yaml');
        if (fs.existsSync(configPath)) {
            try {
                loadClientConfig(entry.name);
                slugs.push(entry.name);
            }
            catch (_a) {
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
function createClientDirectory(slug) {
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
