# Registro de waves — GridAlpha / NIVAR

Log histórico de fechamento de wave. Cada seção abaixo é o relatório de
uma wave fechada, preservado como foi escrito no fechamento.

**Este arquivo é histórico, não instrução.** O que vale como regra
permanente está em `AGENTS.md` na raiz. Se os dois divergirem, `AGENTS.md`
vence — aqui é registro do que aconteceu, não do que fazer.

Ordem: as seções estão na ordem em que foram anexadas ao `CLAUDE.md`, que
é a ordem de fechamento, não a ordem numérica das waves (waves paralelas
fecharam fora de ordem).

---

## Por que este arquivo existe — ARCHITECT, Método Wave 1, Fase 1

O `CLAUDE.md` tinha **10.107 linhas**: 73 de instrução permanente e
**10.034 de log de fechamento**. Toda wave anexava o próprio relatório,
sem estrutura e sem dono declarado. Três recons recentes citaram isso
como fato; nenhuma resolveu.

A divisão aplicada, medida antes de decidir:

| Faixa | Conteúdo | Destino |
| --- | --- | --- |
| L1–73 | projeto, skill, tooling, tokens, convenção de git, roster, quirks | reescrito em `AGENTS.md` |
| L74–86 | `## Wave status` — tabela de estado das waves 1–6 | histórico, vem para cá |
| L87–10107 | 96 seções de fechamento de wave | histórico, vem para cá |

### O que a leitura achou, e que muda a Fase 2

**Quatro afirmações do cabeçalho estavam desatualizadas.** Não podiam ser
simplesmente mudadas de casa — carregar erro para uma fonte declarada
permanente é pior que deixá-lo num log.

1. **A descrição do projeto** dizia "Professional PJM electricity market
   intelligence terminal". Hoje o produto é a NIVAR — Portal Brasil,
   Alexandria e os produtos Advisory —, com o terminal americano como uma
   superfície entre várias.
2. **A linha de base do auditor** dizia "40 P0 / 22 P2". Medido agora:
   **0 P0, 27 P2**.
3. **"Pre-commit hook in `.husky/pre-commit`"** — o arquivo existe e é
   correto, mas **não está instalado**: `.git/hooks/pre-commit` não
   existe e o `package.json` não tem script `prepare`. Regra escrita, zero
   execução. É exatamente o problema que esta wave existe para resolver.
4. **O roster de agentes omitia LYCEUM e CURSOR** — os dois agentes mais
   ativos das últimas ~40 waves —, e listava cinco (TERMINAL, CHROMA,
   CONDUIT, ORACLE, SCRIBE) que não aparecem há dezenas de waves.

**Achado não previsto no brief:** existe `CODEX-OPERATING-PROTOCOL.md` na
raiz, **400 linhas, não rastreado pelo git** (não ignorado — nunca foi
adicionado). O cabeçalho dele se declara "documento de referência
permanente, lido por Claude, ChatGPT/Codex e qualquer instância nova". É
um `AGENTS.md` com outro nome, e cobre justamente o que o brief pede:
mapa de agentes (§5), posse (§6), fontes de verdade (§7), protocolo de
git (§8), comandos de teste (§14), regras aprendidas por erro (§12).

Por isso o `AGENTS.md` foi construído reconciliando **três** fontes — o
cabeçalho do `CLAUDE.md`, este protocolo, e a medição do repositório — em
vez de só mudar a primeira de lugar. Sem isso a wave criaria a terceira
fonte paralela de verdade em vez de acabar com a segunda.

O arquivo do Codex **não foi tocado**: ele não consta de nenhuma das
quatro listas de posse do brief, e decidir o destino dele (apagar,
rastrear, ou manter como briefing específico do Codex) é decisão do
Aquiles.

### O hook de harness não foi construído, e a razão é medida

O brief pede um hook contra "asserção contra `innerText` de elemento com
`text-transform`, sem normalizar case", descrito como bug que "já se
repetiu sete vezes nesta trilha". A contagem não se sustenta na leitura:

- **"defeito do harness" como CLASSE aparece 7 vezes** no log (L6076,
  L6951, L7279, L7489, L8203, L8767) — e as instâncias são heterogêneas:
  calculadora chamada sem semear defaults, contador de gravura incluindo
  o rodapé, medida de cobertura por trecho contíguo em vez de token,
  heurística de "40 letras seguidas", timers estrangulados em aba oculta.
- **O bug de case contra `innerText` aparece 2 vezes** (L8836 e L9134),
  ambas minhas, ambas na superfície do Portal. As duas linhas se rotulam
  "sexta" e "sétima ocorrência **do padrão**" — do padrão amplo, não do
  bug de case.

Além disso: **não existe corpus no repositório contra o qual desenhar a
detecção.** `innerText` ocorre em exatamente dois arquivos rastreados, e
os dois são prosa (`CLAUDE.md` e `docs/alexandria/extraction-protocol.md`)
— zero harness. Todo script de verificação desta trilha viveu no
scratchpad da sessão e nunca foi commitado.

E o sinal decisivo é **CSS de runtime**: se o elemento tem
`text-transform` só se sabe com o estilo computado. Um hook estático não
consegue ver isso, e a alternativa — alertar em toda comparação de
`innerText` contra literal minúsculo — dispara em asserção legítima
sempre que não há transform.

Dois casos, sem corpus, com o sinal fora do alcance estático: seria a
"regra frágil" que o próprio brief proíbe. A regra foi para `AGENTS.md`
como disciplina escrita, e o hook determinístico construído nesta wave é
só o de `git add -A`, que é estaticamente decidível.

---
