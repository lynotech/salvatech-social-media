---
agent: designer
execution: inline
model_tier: fast
skills:
  - frontend-design
  - web-design-guidelines
---

# Geração dos Slides HTML — Carrossel Panorâmico

Leia o config do cliente ativo em `clients/{CLIENT}/config.yaml` antes de começar.
Use os campos `visual`, `agent_profiles.designer`, e `agent_profiles.copywriter.slides` do config.

Este step usa templates prontos com slices panorâmicas. Rode o script.

## Processo

1. Leia o campo `COMPOSIÇÃO DE CAPA` do brief (`clients/{CLIENT}/posts/{slug}/brief.md`)
2. Confirme que as slices existem em `clients/{CLIENT}/posts/{slug}/assets/slices/`
3. Rode o script de build com `--client`:

```bash
node pipeline/build-slides.js --client {CLIENT} --slug {SLUG}
```

4. Verifique os HTMLs gerados em `clients/{CLIENT}/posts/{slug}/slides/`

## Inputs necessários

- `clients/{CLIENT}/posts/{slug}/copy.md` — copy estruturado por zonas
- `clients/{CLIENT}/posts/{slug}/assets/slices/slice-01.jpg` até `slice-N.jpg` — fatias panorâmicas

## Design System

Leia as cores e fontes de `visual.*` do `clients/{CLIENT}/config.yaml`.
Os templates seguem as guidelines de `skills/frontend-design/SKILL.md`:
- Tipografia: conforme `visual.headline_font` e `visual.body_font` do config
- Noise texture sutil pra profundidade
- Backdrop-filter blur no rodapé e cards
- Gradient overlays pra legibilidade do texto sobre as slices
- Box-shadow com múltiplas camadas nos cards
- Label com borda lateral na cor `visual.primary` do config

## Templates

Templates ficam em `clients/{CLIENT}/templates/` (com fallback pra `pipeline/templates/`):
- `capa-a.html` — Slide 1 com headline + slice panorâmica (mascote visível)
- `slide-i1.html` — Interno com número decorativo grande
- `slide-i2.html` — Interno com card glassmorphism
- `slide-cta.html` — CTA com glow orb e botão gradiente

## Veto Conditions

- Menos HTMLs que o esperado → verificar copy.md e rodar novamente
- Texto cortado ou overflow → ajustar font-size no HTML
- Slices não encontradas → rodar compose-panorama.py primeiro
