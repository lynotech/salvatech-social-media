---
agent: designer
execution: inline
model_tier: fast
skills:
  - frontend-design
  - web-design-guidelines
---

# Geração dos Slides HTML — Carrossel Panorâmico

Este step usa templates prontos com slices panorâmicas. Rode o script.

## Processo

1. Leia o campo `COMPOSIÇÃO DE CAPA` do brief (`posts/{slug}/brief.md`)
2. Confirme que as slices existem em `posts/{slug}/assets/slices/`
3. Rode o script de build:

```bash
node pipeline/build-slides.js --slug {SLUG}
```

4. Verifique os HTMLs gerados em `posts/{slug}/slides/`

## Inputs necessários

- `posts/{slug}/copy.md` — copy estruturado por zonas
- `posts/{slug}/assets/slices/slice-01.jpg` até `slice-07.jpg` — fatias panorâmicas

## Design System

Os templates seguem as guidelines de `skills/frontend-design/SKILL.md`:
- Tipografia: Syne 800 (headlines), Outfit 300-600 (body/labels)
- Noise texture sutil pra profundidade
- Backdrop-filter blur no rodapé e cards
- Gradient overlays pra legibilidade do texto sobre as slices
- Box-shadow com múltiplas camadas nos cards
- Label com borda lateral roxa como âncora visual

## Templates

- `capa-a.html` — Slide 1 com headline + slice panorâmica (mascote visível)
- `slide-i1.html` — Interno com número decorativo grande
- `slide-i2.html` — Interno com card glassmorphism
- `slide-cta.html` — CTA com glow orb e botão gradiente

## Veto Conditions

- Menos de 7 HTMLs gerados → verificar copy.md e rodar novamente
- Texto cortado ou overflow → ajustar font-size no HTML
- Slices não encontradas → rodar compose-panorama.py primeiro
