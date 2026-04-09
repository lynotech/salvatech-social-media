---
agent: designer
execution: inline
model_tier: fast
---

# Geração dos Slides HTML

Este step usa templates prontos. NÃO gere HTML manualmente — rode o script.

## Processo

1. Leia o campo `COMPOSIÇÃO DE CAPA` do brief (`posts/{slug}/brief.md`)
2. Rode o script de build:

```bash
node pipeline/build-slides.js --slug {SLUG} --composicao {A|B|C|D}
```

Exemplo:
```bash
node pipeline/build-slides.js --slug 2026-04-08-ia-acelera-desenvolvimento --composicao A
```

3. Verifique os HTMLs gerados em `posts/{slug}/slides/`
4. Se algum slide precisar de ajuste fino (texto longo demais, etc.), edite o HTML diretamente

## Inputs necessários antes de rodar

- `posts/{slug}/copy.md` — copy estruturado por zonas (output do Copywriter)
- `posts/{slug}/assets/capa.jpg` — imagem da capa (output do Ilustrador)
- `posts/{slug}/assets/background.jpg` — fundo dos slides internos (output do Ilustrador)

## Templates disponíveis

Os templates ficam em `pipeline/templates/`:
- `capa-a.html` — Objeto Dominante (mascote embaixo)
- `capa-b.html` — Texto em Bloco Total (imagem como fundo)
- `capa-c.html` — Objeto Central (mascote no centro)
- `capa-d.html` — Split Lateral (imagem à direita)
- `slide-i1.html` — Slide interno com número decorativo
- `slide-i2.html` — Slide interno com card centralizado
- `slide-cta.html` — Slide final com CTA

## Veto Conditions

- Menos de 7 HTMLs gerados → verificar copy.md e rodar novamente
- Texto cortado ou overflow → ajustar font-size no HTML específico
- Imagem não carrega → verificar paths relativos dos assets
