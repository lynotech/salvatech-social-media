---
agent: designer
execution: inline
model_tier: fast
skills:
  - image-creator
---

# Renderização dos Slides em PNG

Converta os slides HTML em PNGs de 1080x1350px.
A quantidade de slides vem de `agent_profiles.copywriter.slides` do `clients/{CLIENT}/config.yaml`.

## Processo

1. Inicie um servidor HTTP **NA RAIZ DO PROJETO** (não dentro de slides/):
```bash
python -m http.server 8765 --directory .
```
IMPORTANTE: o `--directory .` deve apontar pra raiz do projeto (onde fica CLAUDE.md).
Isso garante que os paths relativos nos HTMLs funcionem.

2. Para cada slide (01 a N), renderize:
```bash
npx playwright screenshot \
  --viewport-size "1080,1350" \
  "http://localhost:8765/clients/{CLIENT}/posts/{slug}/slides/slide-01.html" \
  "clients/{CLIENT}/posts/{slug}/export/slide-01.png"
```
Repita pra cada slide.

3. Pare o servidor:
```bash
pkill -f "http.server 8765" 2>/dev/null || taskkill /F /IM python.exe 2>nul
```

4. Valide — cada PNG deve ter mais de 50KB (se tiver menos, é screenshot de erro):
```bash
ls -lah clients/{CLIENT}/posts/{slug}/export/
```

## Output esperado

```
clients/{CLIENT}/posts/{slug}/export/
├── slide-01.png   (200KB+)
├── slide-02.png   (200KB+)
├── slide-03.png   (200KB+)
└── slide-04.png   (200KB+)
```

## Pós-renderização

Registre em `clients/{CLIENT}/_memory/runs.md`.

## Veto Conditions

- PNG menor que 50KB → é screenshot de erro 404, re-renderizar
- Menos PNGs que slides → verificar qual falhou
- HTTP server não iniciou na raiz → corrigir o --directory
