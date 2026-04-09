---
agent: designer
execution: inline
inputFile: posts/{slug}/slides/slide-01.html
outputFile: posts/{slug}/export/slide-01.png
model_tier: fast
skills:
  - image-creator
---

# Renderização dos Slides em PNG

Converta todos os slides HTML em imagens PNG prontas para postagem via Manus.

## Processo

1. Leia o slug do post em `posts/{slug}/brief.md` (campo SLUG)

2. Inicie um servidor HTTP na raiz do projeto:
```bash
python -m http.server 8765 --directory "{project_root}"
```

3. Para cada slide (slide-01.html até slide-07.html), renderize em PNG:
```bash
npx playwright screenshot \
  --viewport-size "1080,1350" \
  "http://localhost:8765/posts/{slug}/slides/slide-0X.html" \
  "posts/{slug}/export/slide-0X.png"
```

4. Pare o servidor HTTP

5. Valide os arquivos gerados:
```bash
ls -lah posts/{slug}/export/
```

## Viewport

**1080x1350px** — retrato 4:5, padrão Instagram feed e carrossel

## Output esperado

```
posts/{slug}/export/
├── slide-01.png
├── slide-02.png
├── slide-03.png
├── slide-04.png
├── slide-05.png
├── slide-06.png
└── slide-07.png
```

## Pós-renderização — atualizar memória

Após gerar os PNGs com sucesso, registre em `_memory/runs.md`:

```markdown
## {slug}
- Data: [AAAA-MM-DD]
- Tema: [tema completo]
- Pilar: [pilar]
- Enquadramento visual: [composição usada pelo Ilustrador]
- Composição de capa: [Tipo A/B/C/D]
- Slides: slide-01.png até slide-07.png ✓
```

## Veto Conditions

- Algum PNG não foi gerado ou está vazio → re-renderizar o slide específico
- Menos de 7 PNGs no output → verificar qual falhou e re-renderizar
- Dimensão diferente de 1080x1350px → ajustar viewport e re-renderizar
