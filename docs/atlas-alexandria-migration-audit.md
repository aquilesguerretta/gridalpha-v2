# Atlas Mundial → identidade Alexandria — auditoria de migração

**Wave:** ATLAS Wave 37 (revisada) · somente leitura  
**Data:** 2026-08-06  
**Produto:** Atlas Mundial de Energia em `/alexandria/atlas`  
**Não é:** o Grid Atlas americano em `src/components/atlas/` (Mapbox / PJM)

Este documento é o brief de correção. Zero código foi alterado nesta wave.

---

## Fase 1 — Caminhos reais confirmados

### Correção ao handoff

O brief citava `src/components/atlas/`. No disco isso é o **Atlas do terminal americano** (GridAtlasMap, time-travel, infra EIA). O Atlas Mundial da Alexandria vive em outro lugar:

| Papel | Caminho real no disco |
| --- | --- |
| Peças de UI do globo | `src/components/alexandria/atlas/` |
| Derivação / coloração | `src/lib/atlas/atlasDerivacoes.ts` |
| Cliente HTTP OWID | `src/lib/atlas/worldApi.ts` |
| Página / composição | `src/pages/alexandria/AtlasStub.tsx` |
| Tokens visuais Alexandria | `src/design/alexandria-tokens.ts` |

### `src/components/alexandria/atlas/` — inventário completo

| Arquivo | Papel |
| --- | --- |
| `AtlasGlobo.tsx` | **Render do globo** (react-globe.gl + Three) — nome que o handoff não dava |
| `PaisPerfil.tsx` | **Perfil de país** — nome que o handoff não dava |
| `PaisTooltip.tsx` | Tooltip no hover |
| `AtlasControles.tsx` | Coloração, filtro, rankings |
| `ComparadorPaises.tsx` | Comparador 2–3 países |
| `BuscaPais.tsx` | Busca no modo imersivo |
| `CamadaBrasil.tsx` | Contorno dos quatro submercados + hit-test |

### Arquivos nomeados no brief — batem com o disco?

| Citado no brief | Existe? | Caminho real |
| --- | --- | --- |
| `atlasDerivacoes.ts` | sim | `src/lib/atlas/atlasDerivacoes.ts` (lib, não components) |
| `AtlasControles.tsx` | sim | `src/components/alexandria/atlas/AtlasControles.tsx` |
| `ComparadorPaises.tsx` | sim | `src/components/alexandria/atlas/ComparadorPaises.tsx` |
| `BuscaPais.tsx` | sim | `src/components/alexandria/atlas/BuscaPais.tsx` |

### Tokens da Alexandria — caminho localizado

**Arquivo canônico:** `src/design/alexandria-tokens.ts`

- Exporta `A`, `A2`, `AF`, `AT`, `AS`, `AR`, `AE`, `ALAYOUT`, `ATEXTURA`, `AFONT_HREF`.
- Sem custom properties CSS / `:root` / `var()` — o handoff também não tinha; valores são hex literais no TS.
- Separado de propósito de `src/design/tokens.ts` (terminal US). O cabeçalho do arquivo proíbe import cruzado.
- Criação: `0c92fcad` · `lyceum: alexandria wave 2 design tokens`.

### Hipótese do rodapé — confirmada por import, não por olho

`src/components/alexandria/shell/AlexandriaFooter.tsx` importa:

```ts
import { A, A2, AT, AS, AR, AE, ALAYOUT } from '../../../design/alexandria-tokens';
```

`borderRadius: AR.none` aparece no chassi. **Não é coincidência visual:** usa o arquivo de tokens. A hipótese do brief (“conforme — a confirmar”) fica **confirmada** para o Footer.

### Asset do frontispício

`public/alexandria/gravuras/grav-atlas-segurando-o-globo.png` — existe (2.848.577 bytes). Mesmo diretório que `fis-*`, `orn-*`, `his-*`, etc. Prefixo `grav-` é convenção própria (não é bloco curricular). Detalhe de conformidade na Fase 2.
