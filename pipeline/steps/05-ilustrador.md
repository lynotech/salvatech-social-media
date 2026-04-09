---
agent: ilustrador
execution: inline
inputFile: posts/{slug}/brief.md
outputFile: posts/{slug}/assets/capa.jpg
model_tier: standard
skills:
  - image-ai-generator
  - image-creator
---

# Geração de Imagens do Carrossel

Com base no tema, referência visual do brief e copy aprovados, gere as imagens do carrossel.

## O que gerar

### 1. Capa (capa.jpg)

Leia o campo `COMPOSIÇÃO DE CAPA` do brief (A, B, C ou D) e construa o prompt adequado.

Construa o prompt do zero seguindo o sistema de camadas do seu agent:

- **Camada 1 — Enquadramento:** escolha o mais adequado ao tema (close-up, costas, corpo inteiro, três-quartos, lateral)
- **Camada 2 — Ação/postura:** conecte ao tema do carrossel
- **Camada 3 — Ambiente/cenário:** espacial ou tech, sempre relacionado ao tema
- **Camada 4 — Iluminação:** cold blue-white como padrão, ajuste conforme a emoção
- **Camada 5 — Elemento de destaque:** opcional, use se agregar ao tema
- **Camada 6 — Expressão:** só se rosto visível

DNA fixo obrigatório: chimpanzé, traje branco NASA-style (sem logo NASA visível — traje liso branco), fotorrealista, Hasselblad 8K, sem texto na imagem.

**Instrução de composição obrigatória no final de todo prompt de capa:**
Use a instrução correspondente à composição definida no brief (A, B, C ou D).
Consulte o Mapa de Zonas no seu agent para copiar a instrução correta.

Consulte `_memory/runs.md` para não repetir o mesmo enquadramento do carrossel anterior.

### 2. Background (background.jpg)
Fundo abstrato dark para os slides internos — deve suportar texto branco sobreposto sem competir.

## Execução

```bash
python3 skills/image-ai-generator/scripts/generate.py \
  --prompt "{prompt da capa construído}" \
  --output "posts/{slug}/assets/capa.jpg" \
  --width 1080 \
  --height 1350 \
  --mode test
```

```bash
python3 skills/image-ai-generator/scripts/generate.py \
  --prompt "Abstract deep space dark background. Base color deep black #0a0414. Faint violet (#9755FF) glowing circuit-like geometric lines and soft nebula clouds scattered subtly across the frame. Low contrast, very dark — designed to sit behind white text overlay without competing. No characters, no objects, no text. Vertical portrait format 1080x1350px. Photorealistic space atmosphere, cinematic color grade." \
  --output "posts/{slug}/assets/background.jpg" \
  --width 1080 \
  --height 1350 \
  --mode test
```

## Veto Conditions

- Imagem contém texto renderizado → regerar
- Imagem tem fundo claro/branco → regerar
- Rosto do mascote está no terço superior da imagem (acima de 35% da altura) → regerar
- Personagem não está na metade inferior do frame → regerar
- Imagem tem bordas pretas ou moldura (não é edge-to-edge) → regerar
- Bordas laterais não são escuras o suficiente pra integrar com #0a0414 → regerar
- Arquivo vazio ou não gerado → regerar
- Mesmo enquadramento do carrossel anterior → regerar com composição diferente
