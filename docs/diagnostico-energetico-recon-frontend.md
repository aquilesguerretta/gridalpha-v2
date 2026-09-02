# Diagnóstico Energético — recon de intake rico e status (frontend)

**Wave:** ARCHITECT — Diagnóstico Energético Wave 1. Trilha nova:
varredura do CLAUDE.md por `DIAGN` devolve zero seção. É a Wave 1.

**Escopo:** recon. Zero código escrito, zero arquivo de produto
modificado. Quatro hipóteses, cada uma medida no disco — e a primeira
também **no render**, porque é a que decide se a wave de build começa
generalizando ou construindo.

**Trabalho paralelo:** na entrada da sessão havia trabalho não
commitado da wave Solar Proposal Validator em `app/services/
advisory_email.py` e `solar_proposal_email.py`. **Não foi tocado nem
stashado** — o `git pull --rebase` foi trocado por `fetch` +
comparação (0 atrás, 0 à frente). Nada em `app/` foi lido nesta wave.

---

## Veredito curto

| Hipótese | Achado |
| --- | --- |
| H1 · O mecanismo aguenta três produtos? | **JÁ AGUENTA. Já foi generalizado, e Advisory já serve os três — provado no render.** A pendência que eu registrei na Wave 2 foi paga pela Solar Proposal Validator Wave 2. |
| H2 · `MethodDisclosure` é reusável? | **O CSS sim, o componente não existe.** É JSX inline no hero, com estado e ids próprios. |
| H3 · Padrão de formulário multi-campo? | **Existe estrutura, não existe estilo.** Cinco formulários ricos — todos no terminal americano, tokens errados. O NIVAR tem `field.css` completo, mas ele nunca chegou a `src/`. |
| H4 · Padrão de lista/timeline? | **Existe, e o melhor não é um chat.** `PublicationList` do próprio NIVAR é o precedente certo; o chat da IA é vocabulário de outro sistema. |

**A wave de build começa mais barata do que o brief supõe.** Nada
precisa ser generalizado antes: Diagnóstico entra declarando um bloco
num array. O trabalho real está em H3 (trazer os campos do NIVAR para
`src/`) e H4 (decidir o que é "conversa" num produto que não tem
conversa modelada em lugar nenhum).

---

## 1. H1 — o mecanismo com três produtos

### A pendência que eu registrei foi paga, e não por mim

O CLAUDE.md da Conta de Luz Express Wave 2 fecha com:

> **`ehAdvisory` é o segundo `if` hardcoded.** Generalizar o slot de
> família é decisão de arquitetura para o terceiro produto, não para o
> segundo.

**O terceiro produto chegou antes desta wave.** A Solar Proposal
Validator Wave 2, Fase 1, substituiu os dois condicionais por um slot
declarado. O comentário está no próprio `FamiliaPage.tsx:35-39`:

> substitui os dois condicionais hardcoded (`ehAcademy`, `ehAdvisory`)
> por um slot declarado em módulo próprio.

Varredura confirma: **zero ocorrência** de `ehAcademy`, `ehAdvisory` ou
`familia.id ===` no `FamiliaPage.tsx` — a única linha que os menciona é
o comentário histórico acima.

### O mecanismo real, hoje

`src/components/br/blocosFamilia.tsx` (383 linhas). O contrato
(`BlocoFamiliaProduto`, L99) é **por PRODUTO, não por família** — que é
exatamente a correção que faltava:

| Campo | Papel |
| --- | --- |
| `produtoId` | chave contra `DESTINOS_BR`; o bloco só aparece se o produto pertencer à família da página |
| `ariaLabel`, `titulo`, `nota` | cabeçalho da seção |
| `colunas: {k,v}[]` | faixa de bordas colapsadas (o padrão que a CLE usa) |
| `ctaRotulo`, `ctaNota` | CTA; **a rota vem do catálogo**, nunca digitada. `null` = sem CTA — "produto sem rota não ganha link morto" |
| `Antes?` | conteúdo ACIMA do cabeçalho (a gravura da Academy) |
| `Corpo?` | corpo próprio que substitui colunas + CTA (a grade de contadores da Academy) |

O resolvedor (L379) é três linhas: mapeia os produtos da família contra
`BLOCOS_FAMILIA` e descarta quem não declarou bloco.

A numeração deixou de ser digitada. `FamiliaPage.tsx:407-408`:

```tsx
{blocos.map((bloco, i) => {
  const numero = String(2 + i).padStart(2, '0');
```

O comentário na L137 nomeia o defeito antigo: *"Era este o defeito que
os dois condicionais hardcoded escondiam: `02` digitado em…"*.

### Provado no render, não só na leitura

`/br/familia/advisory`, medido:

```
01 · PRODUTOS · 3 NO CATÁLOGO
     Conta de Luz Express      → Aberto →
     Solar Proposal Validator  → EM CONSTRUÇÃO
     Diagnóstico Energético    → EM CONSTRUÇÃO
02 · CONTA DE LUZ EXPRESS     · O PRODUTO ABERTO HOJE
03 · SOLAR PROPOSAL VALIDATOR · EM CONSTRUÇÃO
```

`br-familias.ts:109` já lista os três:
`['conta-de-luz-express', 'solar-proposal-validator', 'diagnostico-energetico']`.

**Advisory já é uma família de três produtos em produção.** Diagnóstico
já aparece na lista `01`; o que falta é só o bloco de profundidade —
por isso a página fecha em `03` e não em `04`.

### O que a wave de build precisa fazer em H1

**Nada de arquitetura.** Acrescentar uma entrada em `BLOCOS_FAMILIA`
com `produtoId: 'diagnostico-energetico'`, e a seção `04` aparece
sozinha, numerada, na ordem do catálogo. Um bloco sem `Corpo` já rende
a faixa de colunas — que é o formato que CLE e Solar usam.

O que **fica** como limite conhecido (não bloqueia): o slot é uma lista
literal num arquivo do frontend. Um produto sem entrada some da camada
de profundidade em silêncio — comportamento documentado no próprio
resolvedor, e é o correto, mas não há trava de DEV avisando (a que
existe, em `br-familias.ts:152`, cobre produto sem FAMÍLIA, não produto
sem BLOCO).

## 2. H2 — `MethodDisclosure`

**Não é componente. É JSX inline no `PortalHero`.**

- Estado local: `const [metodoAberto, setMetodoAberto] = useState(false)`
  (`PortalHero.tsx:193`).
- Markup: `PortalHero.tsx:533-598`, `<div className="nv-metodo">` com
  gatilho `aria-expanded`/`aria-controls` e painel revelado por fio que
  desenha (`nv-metodo__fio-desenho`, SVG de 1 unidade de altura).
- **Ids hardcoded** (`metodo-pld-painel`) — duas instâncias na mesma
  página colidiriam. Conteúdo é do PLD, literal.
- Zero export em qualquer arquivo. Ninguém mais consome.

**O que É reusável, e sem custo:** o CSS. `.nv-metodo*` vive em
`FOLHA_PORTAL` (`portalChrome.tsx`, 17 ocorrências), que **toda página
do Portal já injeta** — inclusive `ContaDeLuzExpressPage`. Uma seção de
método em Diagnóstico só precisa do markup; o estilo já chega.

A ordem das linhas é do componente, não do chamador, e o readme do
sistema explica por quê: método → fonte → *método publicado em* →
*dado coletado em* → premissas, porque *"o método é público antes de
existir número para defender"*. Inverter as duas datas desmonta a tese
sem mudar nenhum dado. **Se a wave de build reescrever o markup, essa
ordem não é negociável.**

Duas opções para a wave, sem escolher: (a) copiar o markup e trocar o
conteúdo, com `useId()` no lugar do id fixo — barato, e é o que o
Portal já faz com Button/ModeToggle; (b) extrair um componente de
verdade em `components/br/`, o que paga só se um terceiro consumidor
aparecer.

## 3. H3 — formulário com vários campos

### Estrutura existe; estilo não serve

Cinco formulários ricos, todos no **terminal americano**:

| Arquivo | Controles |
| --- | --- |
| `nest/storage/DABidOptimizer/AssetRegistrationForm.tsx` | 9 |
| `nest/trader/journal/JournalEntryEditor.tsx` | 7 |
| `nest/industrial/StrategySimulator/FacilityProfileForm.tsx` | 7 |
| `nest/student/SandboxTrading/PositionEntryForm.tsx` | 5 |
| `nest/developer/UnderwritingCalculator/ProjectInputForm.tsx` | 5 |

Os três maiores importam `{ C, F, R, S } from '@/design/tokens'` — o
sistema do terminal, com `R` (raio) que o NIVAR proíbe. **Não são
reusáveis como estilo.**

Como **estrutura**, o `ProjectInputForm` é o precedente mais próximo do
que Diagnóstico precisa: um `presetId` que repopula todos os campos
(`applyPreset`), um `useState` por campo, e um efeito que reseta o que
depende de tecnologia quando ela muda. É o padrão "preset + campos +
submit" que um diagnóstico 360° pede — vale ler, não copiar.

### O NIVAR tem os campos, mas eles nunca chegaram a `src/`

`components/forms/field.css` do skill tem **61 ocorrências** de
`.nv-campo*` / `.nv-escolha*` / `.nv-desl*` — Input, NumberInput
(mono tabular com sufixo de unidade atrás de fio), Select, Checkbox,
Radio, Slider, UnitField, MultiSelect, mais o marcador de campo
obrigatório e a validação assíncrona por fio que se desenha.

**Nada disso está em `src/`:** `FOLHA_PORTAL` tem **zero** ocorrência
de `nv-campo`, e `src/design/nivar/` só tem os cinco arquivos de
variável. Foi por isso que a CLE compôs `.cle-arquivo*` local imitando
`.nv-campo__caixa` — copiou os valores, não o arquivo (o cabeçalho dela
declara isso, L32-36).

**Consequência para o build:** um intake de vários campos é o primeiro
consumidor real do `field.css`. As opções, sem decidir:

| Caminho | Custo | Observação |
| --- | --- | --- |
| Copiar o subconjunto para `FOLHA_PORTAL` | zero dependência; segue o precedente literal do Portal (Button, ModeToggle, MethodDisclosure já entraram assim, "verbatim no subconjunto usado") | engorda uma folha já longa |
| Portar `field.css` para `src/design/nivar/` | é o destino que a FOUNDRY NIVAR Wave 1 declarou ("o CSS de componente entra por demanda, conforme cada tela usar") | cria arquivo em diretório que várias waves listam como somente-leitura — precisa de posse explícita no brief |
| Repetir o padrão local (`diag-campo*`) | consistente com o que a CLE fez | terceira cópia dos mesmos valores; é onde a divergência começa |

Convenção do sistema que a wave herda de graça: **uma convenção só de
campo obrigatório** — asterisco em `--accent-house` junto ao rótulo
mais a palavra `obrigatório` para leitor de tela; nunca marcar
"opcional" nos outros. A CLE já aplicou isso no campo de arquivo.

## 4. H4 — lista / timeline / conversa

### O que existe, e o que serve

| Candidato | O que é | Serve? |
| --- | --- | --- |
| `shared/AIAssistant.tsx` | thread de chat com a IA — balões `alignSelf: flex-end/flex-start`, `background` washes por papel (`C.electricBlueWash`), tokens do terminal | **Não.** É conversa homem-máquina, e balão colorido é vocabulário de SaaS que o NIVAR não usa |
| `nest/trader/journal/JournalView.tsx` | lista cronológica de entradas, ordenada `desc` por data | Parcial — é lista datada, mas do próprio usuário, sem interlocutor, e em tokens do terminal |
| `PublicationList` / `PublicationCard` (NIVAR) | lista editorial de itens datados: coluna de família, título, resumo, meta em mono tabular à direita, bordas colapsadas | **Sim — é o precedente certo** |
| `Collapsible` / `ExpandableRow` (NIVAR) | item que abre painel abaixo e empurra os seguintes, marcador `+`/`−` | Sim, para o detalhe de cada evento |

`editorial.css` do skill, `.nv-publista` / `.nv-pub`: grade
`146px | 1fr | auto`, `border-top` forte na lista e `border-bottom` por
item — exatamente "lista de eventos datados" sem inventar componente.

### O ponto que a recon precisa deixar claro

**Não existe conversa modelada em lugar nenhum do produto** — nem no
frontend, nem (pelas recons anteriores desta família) no backend, que
só conhece submissão com `status`, `createdAt`, `updatedAt` e
`deliveredAt`. Uma tela de "status + mensagem contínua" tem duas
leituras muito diferentes de custo:

1. **Timeline de eventos** (submetido → em leitura → parecer entregue),
   derivada dos carimbos que a submissão já tem. `PublicationList` +
   `Collapsible` cobrem isso hoje, sem backend novo.
2. **Thread bidirecional** (cliente escreve, operador responde). Não
   existe entidade, endpoint, nem componente. É domínio novo inteiro —
   e o `AIAssistant` não é precedente porque a mensagem dele não
   persiste nem tem dois humanos.

Qual das duas o produto quer é decisão do war room. A recon registra
que a (1) é composição do que existe e a (2) é uma trilha de backend
própria.

## 5. O que a wave de build herda pronto

- **O slot de família** (§1) — Diagnóstico é uma entrada num array.
- **`FOLHA_PORTAL`** já injetada em qualquer página do Portal: Button,
  ModeToggle, MethodDisclosure, planta baixa, textura, wordmark.
- **A moldura de página de produto**: `ContaDeLuzExpressPage` é o
  esqueleto completo (faixa de gradiente, header com wordmark + volta
  para a família + ModeToggle, `<main>` rolável, rodapé com a tese) já
  em NIVAR e já com guard de rota por sessão.
- **`PlantaBaixa`** — `DestinoCard.tsx` tem geometria desenhada para
  `diagnostico-energetico`, do mesmo jeito que tinha para a CLE.
- **O registro de submissões** (`src/lib/submissoes/api.ts`,
  `FLUXOS_SUBMISSAO` + `criarClienteSubmissoes`) — a Wave 5 da CLE
  criou o cliente canônico; um produto novo entra declarando prefixo,
  não reescrevendo fetch.

## 6. O que precisa ser construído

- **Campos de formulário em NIVAR** (§3) — o `field.css` existe no
  sistema e não está em `src/`. É o item mais estrutural desta lista.
- **Um bloco de família para Diagnóstico** (§1) — trivial, mas é o que
  faz o produto aparecer com profundidade.
- **A superfície de método** (§2) — markup novo, CSS existente, ordem
  de linhas travada pelo sistema.
- **A tela de status** (§4) — composição de `PublicationList` +
  `Collapsible` se for timeline; domínio novo se for thread.

## Registrado, não resolvido

- **O slot não avisa quando um produto não tem bloco.** A trava de DEV
  de `br-familias.ts` cobre produto sem família; produto sem bloco some
  em silêncio da camada de profundidade. Hoje é o caso do Diagnóstico —
  e é o comportamento correto, mas se um dia for acidente, ninguém
  descobre por console.
- **`[DATA]` continua literal no MethodDisclosure do hero**
  (`PortalHero.tsx:570`) — pendência da Portal BR Wave 6, não desta
  trilha. Se Diagnóstico copiar o markup, copia o placeholder junto.
- **Três cópias do mesmo valor de campo** vão existir se Diagnóstico
  repetir a estratégia local da CLE (§3). A terceira é onde a
  divergência costuma nascer.
