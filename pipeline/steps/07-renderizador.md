---
agent: designer
execution: inline
model_tier: fast
skills:
  - image-creator
---

# Renderização dos Slides em PNG

Converta os 4 slides HTML em PNGs de 1080x1350px.

## Processo

1. Inicie um servidor HTTP **NA RAIZ DO PROJETO** (não dentro de slides/):
```bash
python -m http.server 8765 --directory .
```
IMPORTANTE: o `--directory .` deve apontar pra raiz do projeto (onde fica CLAUDE.md).
Isso garante que os paths relativos nos HTMLs (../assets/slices/, ../../../logo.png) funcionem.

2. Para cada slide (01 a 04), renderize:
```bash
npx playwright screenshot \
  --viewport-size "1080,1350" \
  "http://localhost:8765/posts/{slug}/slides/slide-01.html" \
  "posts/{slug}/export/slide-01.png"
```
Repita pra slide-02, slide-03, slide-04.

3. Pare o servidor:
```bash
pkill -f "http.server 8765" 2>/dev/null || taskkill /F /IM python.exe 2>nul
```

4. Valide — cada PNG deve ter mais de 50KB (se tiver menos, é screenshot de erro):
```bash
ls -lah posts/{slug}/export/
```

## Output esperado

```
posts/{slug}/export/
├── slide-01.png   (200KB+)
├── slide-02.png   (200KB+)
├── slide-03.png   (200KB+)
└── slide-04.png   (200KB+)
```

## Pós-renderização

Registre em `_memory/runs.md`.

## Veto Conditions

- PNG menor que 50KB → é screenshot de erro 404, re-renderizar
- Menos de 4 PNGs → verificar qual falhou
- HTTP server não iniciou na raiz → corrigir o --directory
