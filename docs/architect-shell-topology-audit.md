# ARCHITECT — TOPOLOGIA DE SHELL WAVE 1

Auditoria de reconhecimento. **Zero edição de código** — o único arquivo
escrito por esta wave é este relatório. Todo caminho citado foi
confirmado contra o disco antes de ser nomeado.

**Objetivo:** achar o ponto exato onde o Terminal US pode sair da
navegação sem tocar seus internals e sem deletar código, para que a wave
de execução não precise presumir caminho nenhum.

---

## Nota preliminar — a numeração N, resolvida contra o CLAUDE.md

O brief instrui: "procure a última `ARCHITECT WAVE` fechada — esse
número +1 é o N desta wave", com a alternativa "se ARCHITECT nunca
fechou wave nenhuma, essa é a primeira".

**Nenhum dos dois casos se aplica, e reporto em vez de escolher em
silêncio.** A string literal `ARCHITECT WAVE` aparece **zero vezes** no
CLAUDE.md — mas ARCHITECT fechou **cinco** waves, todas namespaçadas por
trilha:

| linha do CLAUDE.md | seção |
| --- | --- |
| 631 | `ARCHITECT — PORTAL BR WAVE 1` |
| 980 | `ARCHITECT — PORTAL BR WAVE 2 · JAGUAR` |
| 1225 | `ARCHITECT — PORTAL BR WAVE 3 · HERO IMERSIVO E RODAPÉ` |
| 1417 | `ARCHITECT — PORTAL BR WAVE 4 · AUDITORIA LIVRE` |
| 3184 | `ARCHITECT — IDENTIDADE DE PLATAFORMA WAVE 1` |

São **duas sequências concorrentes** — Portal BR em 4, Identidade em 1 —
e não existe um contador único de onde tirar "+1". O assunto desta wave
(topologia entre Terminal US, Portal e Alexandria) não pertence a
nenhuma das duas: não é Portal BR e não é Identidade.

**Resolução adotada:** trilha nova, `TOPOLOGIA DE SHELL`, wave **1** —
seguindo a convenção que o próprio repositório já usa para ARCHITECT.
Se o war room preferir um contador único de ARCHITECT, a renumeração é
uma linha neste cabeçalho.

### Estado do repositório na abertura

`git pull --rebase origin feature/full-shell-buildout` **recusou** por
haver mudança não commitada de sessão paralela (a seção `CURSOR WAVE 12`
em `CLAUDE.md` e portas de dev em `.claude/launch.json`). Nada foi
stashado nem sobrescrito. O pull era **no-op**, verificado em vez de
presumido:

```
git rev-parse HEAD                              → 8fe158f
git rev-parse origin/feature/full-shell-buildout → 8fe158f
git log HEAD..origin/…                          → (vazio)
git log origin/…..HEAD                          → (vazio)
```

Local e remoto no mesmo commit; não havia o que puxar.

### Auditoria paralela relacionada, lida antes de duplicar

`docs/atlas-alexandria-migration-audit.md` (commits `889e7c3`, `9852777`,
`e0e56a6`, `c432097`) auditou posse do shell **interno da Alexandria** —
`AlexandriaRouter.tsx`, `TrilhasHub.tsx`, `CaminhoExpedicao.tsx`,
`AlexandriaHome.tsx`, mais `AlexandriaHeader.tsx` / `AlexandriaFooter.tsx`.
Concluiu: os seis são posse **LYCEUM**.

Aquela auditoria cobre a camada **dentro** de `/alexandria/*`. Esta cobre
a camada **acima**, onde Terminal US, Portal e Alexandria são irmãos.
Não há sobreposição de arquivo entre as duas, e o método é o mesmo
(`git log --all --diff-filter=A`).

---

## Fase 1 — a raiz real

### A hipótese do brief está metade certa

O brief registra `GlobalShell.tsx` como "raiz da aplicação", vindo do
relatório de abril/2026, e pede para tratar isso como hipótese.
**Medido: o arquivo existe, continua sendo o shell do Terminal US, e
NÃO é a raiz da aplicação.**

A cadeia real, do HTML para dentro:

| passo | evidência no disco |
| --- | --- |
| `index.html:17` | `<script type="module" src="/src/main.tsx">` |
| `src/main.tsx` | **95 linhas.** Cria o root React, monta `BrowserRouter` → `AuthProvider` → a tabela de rotas inteira |
| `src/components/GlobalShell.tsx` | **1.876 linhas.** Componente de view, `export default function GlobalShell({ initialView = 'nest' })` (L1716) |

`GlobalShell` é **montado por rota, com prop** — não envolve a árvore.
`main.tsx` importa (L6) e o monta em nove rotas passando
`initialView`. Ele é irmão de `LandingPage`, `PortalBR` e
`AlexandriaHome` na mesma tabela, não pai de nenhum.

**A raiz real é `src/main.tsx`.**

### Posse — a pergunta que `--diff-filter=A` não responde aqui

| arquivo | commit de criação | prefixo |
| --- | --- | --- |
| `src/main.tsx` | `586fbe4` · `phase-1: infrastructure, mapbox config, SSE scaffold, zustand store` | **nenhum** |
| `src/components/GlobalShell.tsx` | `a9fdb70` · `feat: GridAlpha V2 shell integration complete` | **nenhum** |
| `src/components/LandingPage.tsx` | `27f1ffa` · `feat: GridAlpha auth flow + landing port` | **nenhum** |
| `src/pages/br/PortalBR.tsx` | `0ad40e5` · `architect: portal br routes` | **architect** |
| `src/pages/alexandria/AlexandriaHome.tsx` | `1df0c84` · `lyceum: alexandria wave 2 route and visual verification` | **lyceum** |

**Os três arquivos mais antigos precedem a convenção de prefixo por
agente — não há prefixo a ler neles.** A criação, sozinha, não decide
posse aqui; foi preciso medir quem de fato escreve.

`src/main.tsx` — **13 commits em toda a história**, na ordem do mais
recente para o mais antigo:

| commit | agente |
| --- | --- |
| `f8a355e` identidade wave 1 conta antes do arquetipo | **architect** |
| `f90019a` identidade wave 1 perfil de plataforma | **architect** |
| `e1a0b51` identidade wave 1 entrar e criar conta | **architect** |
| `22d3771` identidade wave 1 auth context | **architect** |
| `821d0ff` alexandria wave 3 internal routing | lyceum |
| `0ad40e5` portal br routes | **architect** |
| `1df0c84` alexandria wave 2 route and visual verification | lyceum |
| `5cf7617` entry routing · `91ec85a` lesson routing | scribe |
| `dfbcae8` extend shell — Peregrine top-level, Vault sub-routes | arch |
| `27f1ffa` · `a9fdb70` · `586fbe4` | pré-convenção |

**Posse de fato: ARCHITECT.** Cinco dos treze commits são `architect:`
(mais um `arch:`, a abreviação antiga), incluindo os quatro mais
recentes e toda a mudança estrutural. Os demais agentes tocam o arquivo
cirurgicamente — uma linha de rota quando entregam um destino próprio
(LYCEUM ×2 para Alexandria, SCRIBE ×2 para lição/entrada). Isso bate com
o roster do CLAUDE.md L50, que declara `src/main.tsx` a ARCHITECT — mas
agora está confirmado por histórico, não só por declaração.

`src/components/GlobalShell.tsx` — **53 commits**, último em
**2026-05-12** (`548d8af` · `chroma: wave 5.1 pure-neutral remediation`).
Os últimos a tocá-lo foram CHROMA, CONDUIT e `arch:`. Está **estático há
cerca de três meses**, enquanto `main.tsx` foi mexido em 2026-07-29 e
`PortalBR.tsx` no mesmo dia. O produto andou para Portal e Alexandria; o
shell americano ficou onde estava.

### Nenhum outro ponto de montagem

Varredura por `GlobalShell` em todo o `src/`: o componente é importado
como default **por um único arquivo**, `src/main.tsx:6`. Não há segundo
ponto de montagem, nem lazy import, nem re-export que o monte.

**Uma dependência lateral, que importa para a wave de execução:**
`src/components/AnalyticsPage.tsx:8` faz
`import { PeregrineFeedMarketAlerts } from './GlobalShell'`. É import de
**export nomeado**, não montagem. Consequência prática: **ocultar o
Terminal US da navegação é seguro; deletar `GlobalShell.tsx` não é** —
quebraria `AnalyticsPage`. Como a decisão do Aquiles é exatamente
"código fica no disco, some da navegação", isso não bloqueia nada — mas
fecha a porta para qualquer wave futura que confunda ocultar com remover.
