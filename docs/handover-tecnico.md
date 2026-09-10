# NIVAR — Handover Técnico do Código

**ARCHITECT · Handover Wave 1 · setembro de 2026.** Metade de código do
handover da plataforma. A metade estratégica e de infraestrutura
(domínio, DNS, Vercel, Railway, Resend, variáveis, método, doutrina,
pendências) é o documento **"NIVAR — Handover de Plataforma"**, escrito
fora do repositório e **não versionado aqui**. Este arquivo não repete
aquele; referencia.

Medido contra `feature/full-shell-buildout` em `7928971`. Tudo o que está
aqui foi lido no código, rodado no worktree ou medido contra produção —
o que não está no repositório está declarado como ausente, não inferido.

> **Numeração.** O registro de waves numera por trilha
> (`ARCHITECT — PORTAL BR WAVE 10`, `LYCEUM — ALEXANDRIA WAVE 49`…), sem
> N global. "Handover" não aparece em nenhum título: é trilha nova, N = 1.

---

## Fase 1 — Levantamento

### Achado que não espera a Fase 2

**O Atlas Mundial da Alexandria está quebrado em produção.** Medido por
clique real em `https://nivar.com.br/alexandria/atlas`:

```
Access to fetch at 'https://gridalpha-v2-production.up.railway.app/api/atlas/world/countries'
from origin 'https://nivar.com.br' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Causa, em três peças:

1. `src/lib/atlas/worldApi.ts:181` chama a API por `BASE_URL` **absoluto**
   (`src/services/api/client.ts:12`), não por caminho relativo. O
   comentário em `worldApi.ts:164-168` justifica isso com "um caminho
   relativo cairia no próprio frontend" — premissa que o `vercel.json`
   desfez em setembro.
2. O CORS do backend (`app/main.py:44-66`) aceita `gridalpha.vercel.app`,
   `*.vercel.app` e localhost. `nivar.com.br` só entra por `CORS_ORIGINS`,
   que em produção **não o contém**. Medido com controle: a mesma
   requisição com `Origin: https://gridalpha.vercel.app` recebe
   `access-control-allow-origin`; com `Origin: https://nivar.com.br`, não
   recebe, e o preflight responde 400.
3. `montarMundo()` (`worldApi.ts:201-205`) usa `Promise.all` sobre
   TopoJSON + perfis, então a falha dos perfis rejeita a montagem inteira.

**O esquema faltando no `VITE_BACKEND_URL` não é a causa.** O bundle de
produção traz `"//gridalpha-v2-production.up.railway.app"` (confirmado em
`/assets/index-Dl8BZII7.js`), e o protocolo-relativo resolve para
`https:` corretamente. O que bloqueia é a **origem**, não o esquema.

**Mesmo mecanismo, mesma falha, em toda chamada absoluta feita a partir
de `nivar.com.br`** — o middleware de CORS é global. Atinge o terminal
americano inteiro (`src/services/api/*`, SSE em `stream.ts:89`), Peregrine
(`components/peregrine/*`) e os hooks de `src/hooks/data/`. Identidade,
progresso, os três produtos Advisory e conversas usam caminho relativo e
não são afetados.

Duas correções, nenhuma na posse deste handover:

| Correção | Onde | Dono | Alcance |
| --- | --- | --- | --- |
| `CORS_ORIGINS=https://nivar.com.br,https://www.nivar.com.br` | painel do Railway | Aquiles | conserta tudo de uma vez, sem deploy de front |
| trocar `BASE_URL` por caminho relativo em `worldApi.ts` | `src/lib/atlas/` | LYCEUM | conserta o Atlas; é a correção durável, porque o rewrite do `vercel.json` já cobre `/api/*` |

---

### Divergências contra o handover estratégico

Numeradas para citação. "Estratégico" = o documento de plataforma.

**D1 · Contagem de endpoints.** Estratégico e brief: "39". Medido:
**62 rotas sob `/api` + `/health` = 63.** Por domínio: plataforma
(identidade 4, produtos 2, progresso 3, atlas mundial 2, CLE 6, Solar 6,
Diagnóstico 3, conversas 7) = **33**; terminal e legado (LMP 6, atlas
legado 6, news 3, energy 2, weather 2, infra 3, ai 1, fuel-mix 1,
reserve-margin 1, outages 1, ancillary 1, spark-spread 1, stream 1) =
**29**. Nenhuma partição dá 39. O `docs/v2-backend-contract.md` numera
24 (Endpoints 1–24) e documenta mais 2 sem número (atlas mundial).

**D2 · "Todos os três Advisory compartilham storage BYTEA e email nos dois
sentidos."** Só CLE e Solar. O Diagnóstico **não tem BYTEA** (é ficha
estruturada: `sector`, `monthly_consumption_band`, `tariff_modality`,
`concern` — `app/db/models/diagnostico.py`) e **não envia email nenhum**:
`app/routers/diagnostico.py` não importa serviço de email, e nem a criação
do caso nem mensagem em conversa avisam o operador.

**D3 · "Head em `0008`, com `0009` proposta."** A `0009` já está
**escrita e commitada**: `app/db/migrations/versions/0009_operator_queue.py`
(194 linhas) em `wave/operador-api`, commit `629e82c` ("cursor: fase 2
wave 2 — status nos tres produtos"), junto com mudança em três routers e
três models e um `advisory_status.py` novo. Não mergeada. Em
`feature/full-shell-buildout` o head segue `0008_diagnostico_energetico`.

**D4 · "Hook bloqueia `git add -A`, `git add .`, `git reset --hard`."**
O único hook (`.claude/hooks/block-git-add-all.mjs`) bloqueia só
variações de `git add` (`-A`, `--all`, `.`, `./`, `:/`, `*`,
`--no-ignore-removal`, cacho curto com `A`). **Nada bloqueia
`git reset --hard`** — nem `.claude/settings.json`, nem
`~/.claude/settings.json`. Pior: `.claude/settings.local.json` da árvore
principal tem `"Bash(git reset *)"` na lista **`allow`**, ou seja, o
reset passa sem nem pedir confirmação.

**D5 · "`VITE_BACKEND_URL` sem esquema afeta só dado de mercado; funciona
hoje por protocolo-relativo."** Duas correções: afeta também o **Atlas
Mundial** (produto publicado da Academy), e **não funciona** a partir de
`nivar.com.br` — ver o achado acima. O esquema é cosmético; a origem é o
defeito.

**D6 · "`ADVISORY_OPERATOR_EMAIL` — destino do aviso de submissão nova."**
É isso **e é a única definição de quem é operador**
(`app/services/advisory_operator.py:20-44`). Trocar o valor troca quem
anexa entregável, lê submissão de qualquer conta e responde conversa.
Sem ele: endpoints de operador → 503, e o `email_config()` de CLE/Solar
exige a variável, então **submissão nova de cliente também → 503**.

**D7 · Tabela de variáveis incompleta.** O código lê, além do que o
estratégico lista: `CORS_ORIGINS` (decisivo — ver achado),
`SESSION_TTL_DAYS`, `SESSION_COOKIE_{NAME,PATH,DOMAIN,SAMESITE,SECURE}`,
`{CLE,SPV}_MAX_{SOURCE,DELIVERABLE}_BYTES`, `{CLE,SPV}_RESEND_API_URL`,
`PJM_SUBSCRIPTION_KEY`, `HIFLD_TRANSMISSION_LAYER_URL`, `EIA_860_ZIP_URL`
(ingestão). Todas têm default, exceto o efeito de `CORS_ORIGINS`. No
front, além das cinco listadas: `VITE_MOCK_API` (`client.ts:26`).

**D8 · `VITE_API_URL` aponta para um backend que não existe mais.**
`src/hooks/data/useLiveOpsData.ts:23-25` usa `VITE_API_URL` com fallback
`https://gridalpha-production.up.railway.app` — o backend **V1**, não o
`-v2-`. Medido: o Railway responde `"Application not found"`
(`x-railway-fallback: true`). O estratégico lista `VITE_API_URL` sem
dizer isso.

**D9 · "Todas as páginas setam `document.title` em `useEffect`."** Seis
arquivos: `PortalBR`, `FamiliaPage`, as três páginas Advisory e
`NotFound`. Alexandria, `/conta`, `/operador` e o terminal não setam. O
scraper lê o `<title>` do `index.html`
("NIVAR — Inteligência independente do setor elétrico brasileiro"), não
"NIVAR".

**D10 · Elenco de agentes.** O estratégico dá território ativo a ATLAS,
SCRIBE ("renderizador verbatim") e CHROMA; o `AGENTS.md` os lista como
herdados sem atividade, e SCRIBE como "currículo legado do Vault — nunca
autor". FOUNDRY também diverge (estratégico: tokens, tipo, taxonomia;
`AGENTS.md`: tipo compartilhado, mock, primitivo, skills). E o histórico
já tem commits `codex:` (`7655a80` e anteriores, "phase 1–3 wave 1") —
o Codex agiu como agente sem constar do elenco de nenhum dos dois.

**D11 · "Oito ocorrências de defeito do harness."** O registro
(Método Wave 1, "O hook de harness não foi construído") conta **sete**,
heterogêneas, e só **duas** do bug de caixa contra `innerText` (L8836,
L9134). O `AGENTS.md` diz sete.

**D12 · Baseline do auditor.** Estratégico, brief e `AGENTS.md`:
0 P0 / 27 P2. Medido hoje: **0 P0 / 0 P1 / 25 P2**, todos
`equal-weight-grid`. Os outros dois gates batem: `tsc -b` exit 0,
`test:games` 14/14.

**D13 · Operador "invisível" ao backend.** Impreciso. CLE e Solar são
**visíveis por id** ao operador (`_require_visible_submission` libera
quem passa em `is_advisory_operator`) — ele lê, baixa a fonte e anexa o
entregável. O que não existe é **listagem**: nenhum endpoint devolve
submissões de outras contas. O operador só chega ao id pelo link do
email.

**D14 · Comentários que viraram falsos** — o estratégico aponta um
(`authApi.ts`); são pelo menos seis, todos com a mesma raiz (a saída do
front para o Vercel):

| Onde | O que afirma |
| --- | --- |
| `src/lib/auth/authApi.ts:36` | "prod — frontend e backend já dividem a origem no Railway" |
| `src/lib/auth/authApi.ts:16-17` | "`BASE_URL` é reaproveitado" — o arquivo não importa `BASE_URL` |
| `app/services/auth_service.py:5-6` | "Today frontend and backend share one Railway origin" |
| `docs/v2-backend-contract.md:696-698` | "same-origin Railway deploy" + "see the Wave 9 section of `CLAUDE.md`" (a seção não existe mais) |
| `src/main.tsx:75` | "não há `vercel.json`, `netlify.toml`…" |
| `src/lib/atlas/worldApi.ts:164-168` | relativo "cairia no próprio frontend" |

**Confirmados sem divergência:** `.mcp.json` com caminho do OneDrive
(e esta sessão teve `gridalpha-tokens` em `CONNECTION_CLOSED`);
`lang="en"` ausente no terminal (pendência escrita no `index.html:41-44`);
Solar e Diagnóstico ativam trocando `status`/`rota` em
`src/lib/data/br-destinos.ts:74-90`; `/operador/*` sem gate, alcançável
por digitação, com `PlatformUser` sem papel; `/us` sem nenhum link,
`navigate()` ou `href` em `src/` (só comentários); `PRODUCT_CATALOG` sem
`us-terminal`.

### Divergências contra o brief

**B1 · "~39 endpoints"** — ver D1.

**B2 · "Os 7 erros de Recharts em `nest/student/*`"** — **não existem
mais.** Estão registrados em várias waves (registro L599, L1072, L1187;
`docs/architect-shell-topology-audit.md:345`), mas `npx tsc -b` sai com
exit 0 hoje.

**B3 · "`DestinoCard.tsx` é código morto"** — **o arquivo é vivo.** O
componente `DestinoCard` não tem consumidor, mas o mesmo arquivo exporta
`PlantaBaixa`, importado por `PortalBR.tsx:114` e pelas três páginas
Advisory. Apagar o arquivo quebra o build. `FaixaIndependencia.tsx` e
`jaguar-tokens.ts`: **mortos confirmados**, zero importadores (o
`index.html:35` ainda cita `FaixaIndependencia.tsx:73` como fonte de
copy).

**B4 · "`campos.tsx`: 44 de 89 blocos"** — é o que o código declara
(`campos.tsx:9-22`). Recontagem de `field.css` do skill, excluindo os
quadros de `@keyframes` e o bloco dentro de `@media`: **90** (campo 27,
escolha 18, desl 14, multi 16, acesso 15). Um bloco de diferença em
`.nv-campo*`, dentro da ambiguidade de método — o código não define o
que conta como bloco.

**B5 · "Três clientes em vez de um"** — a justificativa do brief está
correta e está escrita no próprio código (`src/lib/diagnostico/api.ts:9-21`).
Mas o número real de embrulhos de `fetch` com o mesmo idioma de erro é
**cinco** (`authApi`, `submissoes`, `diagnostico`, `conversas`,
`progressApi`), todos lançando `AuthError` — inclusive para erro que não
é de autenticação.

**B6 · "Cache de módulo do Vite em troca de arquivo durante A/B"** —
registrado, com outras palavras: CLE Wave 5, "trocar o arquivo por baixo
do Vite deixou o grafo de módulo preso numa versão antiga" (~L9869).

### Esperava achar e não achei

- **Teste de backend.** Nenhum. `tests/` só tem `alexandria-games/`; os
  únicos `test_*.py` são do MCP de tokens.
- **CI.** Nenhum `.github/`. O `tools/gridalpha-detect/ci-integration.md`
  descreve integração que não foi ligada, e o `.husky/pre-commit` não
  está instalado (já no `AGENTS.md`).
- **Migração no deploy.** `Procfile` e `nixpacks.toml` só sobem o
  uvicorn. Migração é manual: `railway run py -3 -m alembic upgrade head`
  (`docs/diagnostico-energetico-wave-2-backend.md:144`).
- **Endpoint que fecha conversa.** O status `closed` existe no schema e
  bloqueia mensagem com 409 (`conversations.py:238-242`), mas nada o seta.
- **Cliente de front para `/api/operator/conversations`.** Nenhum. O
  console lê 100% de `src/lib/operador/mock.ts`.
- **Cliente para `GET /api/diagnostico-energetico/submissions/{id}`.**
  O endpoint existe; o front não o chama.
- **Code splitting.** Zero `React.lazy` em `main.tsx`: Three, Mapbox,
  deck.gl e o terminal inteiro entram no bundle do Portal (8 MB de JS
  medido no bundle de produção).
- **Registro atualizado.** O `docs/registro-de-waves.md` parou em
  2026-09-03 (Método Wave 2). **21 commits depois disso não estão lá**:
  as waves do operador, o piloto do Codex, patronos, as revisões visuais
  do console e o catálogo dos 17 módulos.

### Achado de segurança, lido no código e não testado

`POST /api/ai/complete` (`app/routers/ai.py`) é **passthrough sem
autenticação** para a API da Anthropic com a chave do servidor. Qualquer
pessoa que conheça o host — ou que chame `nivar.com.br/api/ai/complete`,
que o rewrite encaminha — gasta a `ANTHROPIC_API_KEY`, com `model` e
`max_tokens` escolhidos por ela. Não testado de propósito: testar é
gastar. `VITE_ANTHROPIC_API_KEY` aparece em `src/` só numa string de UI;
nenhuma chave no bundle de produção (medido).

---

### Baseline medido nesta wave

| Gate | Resultado | Como |
| --- | --- | --- |
| `npx tsc -b` | exit 0 | worktree com `npm ci` próprio |
| `npm run test:games` | 14/14 | idem |
| `gridalpha-detect src` | 0 P0 · 0 P1 · 25 P2 | `--json`, todos `equal-weight-grid` |
| Migration head | `0008_diagnostico_energetico` | cadeia linear `0001 → 0008` |
| Rotas de API | 62 + `/health` | contagem dos decoradores em `app/routers/` |

---

## Fase 2 — O documento

*(A Fase 2 escreve aqui os onze pontos do brief, sobre o que está medido
acima.)*
