# Portal BR — auditoria de terreno para expansão em cinco famílias

Wave de reconhecimento, só leitura. Resolve o estado real do repositório
antes do primeiro brief de construção da expansão em cinco famílias
comerciais (Advisory, Intelligence, Academy, Software, Hardware) sair.
Nenhum arquivo de `src/` foi tocado nesta wave.

## Fase 1 — N e o estado real da trilha PORTAL BR

**N não estava confirmado no brief — resolvido contra o CLAUDE.md do disco,
não contra citação de mensagem anterior.**

Última seção `## ARCHITECT — PORTAL BR WAVE N` no `CLAUDE.md`: **Wave 6**
("TESE, CONFLITO E MÉTODO NO HERO", linha 8787). Depois dela, duas
revisões diretas NÃO numeradas (mesmo idioma que as revisões diretas do
LYCEUM pós-Wave 16/28/36 já usam):

- `## ARCHITECT — REVISÃO DIRETA PÓS-WAVE 6` (linha 8855) — logo colorida
  nos dois modos, faixa incandescente no topo, marca GridAlpha→NIVAR na
  superfície `/conta`, seção "O mercado agora" + Glossário na landing.
- `## ARCHITECT — REVISÃO DIRETA 2 PÓS-WAVE 6` (linha 8924) — glossário
  removido da landing, prévia do Terminal Brasil que liga sozinha ao
  entrar em viewport, passos com pulso de corrente, contadores reais da
  Alexandria, CTA duplo, FAQ.

**Não existe nenhuma "Wave 5" registrada com esse número** — o que o
brief chama de Wave 5 é a seção que fechei como **Wave 5 · Marca, Sistema
Visual e Movimento NIVAR** (linha 8650), que É numerada e É a origem real
dos tokens NIVAR na superfície. A trilha, portanto, é: Wave 1 → 2 → 3 → 4
→ **5 (NIVAR)** → **6 (tese/conflito/método)** → revisão direta → revisão
direta 2. Não há lacuna nem wave "perdida" entre a 4 e a 5.

### A premissa do "Fable Ultracode" não bate com o histórico de commits

O brief descreve uma sessão de ferramenta de design externa
("Fable Ultracode") que teria reconstruído a página em seis seções,
admitindo não ter seguido o sketch original nem o sistema NIVAR, seguida
de uma rodada de ajuste não confirmada. **`git log` não sustenta essa
leitura.**

`git log --oneline -- src/pages/br/PortalBR.tsx`, do topo:

```
1b21c56 architect: fecha revisao direta 2 pos-wave 6
861a419 architect: previa do terminal que liga, corrente, contadores reais, cta e faq na landing
5735177 architect: fecha revisao direta pos-wave 6
e2bb473 architect: adiciona mercado agora e glossario a landing do portal br
c429a21 architect: troca marca gridalpha por nivar na superficie de conta
97452ef architect: wordmark colorido nos dois modos e faixa incandescente no topo
e640c1c architect: adiciona secao conflito de interesse
3a1111e architect: adiciona method disclosure ao mapa
b6f9da0 architect: fase 1 wave 6 — pontos de insercao confirmados
301a295 architect: aplica sistema de movimento nivar no portal br
4ca139d architect: aplica sistema visual nivar nos dois modos
2d0cea4 architect: substitui marca gridalpha por nivar no portal br
fa840d6 architect: fase 1 wave 5 — inventario de arquivo confirmado
```

**`1b21c56` é o HEAD atual da branch** — conferido por `git log -5`, é o
commit mais recente que existe. Não há nenhum commit depois dele. Os dois
hashes que o brief cita como marcos do episódio Fable (`861a419` e
`1b21c56`) são, na verdade, dois dos **meus próprios** commits de fechamento
das duas revisões diretas — a "previa do terminal que liga" e o "fecha
revisao direta 2 pos-wave 6". A mensagem de cada commit e o diff batem
exatamente com o que a Wave 6 e as revisões diretas registraram no
`CLAUDE.md`: nenhuma seção nova, nenhum autor diferente, nenhuma
reescrita silenciosa.

**Conclusão factual, não interpretação:** o estado de seis seções (hero
com CTA, prévia de terminal interativa, quatro passos, contador da
Alexandria, FAQ, CTA final) que o brief atribui ao Fable é o mesmo estado
que as Waves 5-6 e as duas revisões diretas já documentam como próprio
trabalho, seguindo o sistema NIVAR (confirmado na Fase 2, abaixo). Não há
evidência no histórico git de uma segunda rodada de ajuste ("tirar a
prévia sempre-ligada em favor de vídeo, reordenar seções") tendo
rodado — se ela aconteceu, não chegou a commit nenhum nesta branch.

## Fase 2 — Estado real de `/br` hoje

Lido direto de `src/pages/br/PortalBR.tsx` (HEAD `5f4662a`), não presumido.
Nove `<section>` na página, nesta ordem — clique real não foi necessário
para confirmar a ordem porque o JSX é sequencial e sem `sort`/condicional
de reordenação:

| # | `aria-label` / `aria-labelledby` | Conteúdo |
| --- | --- | --- |
| — | (hero, componente `PortalHero`) | H1, tese, subtítulo, CTA duplo, mapa dos 4 submercados |
| 1 | "O portal em números" | faixa de fatos (4 submercados, geografia IBGE, contagem de destinos) |
| 2 | "Prévia do Terminal Brasil — amostra ilustrativa" | terminal que liga ao entrar em viewport |
| 3 | "Como a NIVAR lê o mercado" | 4 passos com fio de corrente |
| 4 | "Destinos" | **os CINCO CARDS DE PRODUTO ainda estão aqui** — `DestinoCard` × `DESTINOS_BR`, não a faixa de família que o Aquiles decidiu |
| 5 | "A Alexandria em números" | contador real (3 trilhas / 17 módulos / 141 aulas) |
| 6 | `#br-conflito` (componente inline) | seção Conflito de Interesse |
| 7 | `#br-independencia` (componente `FaixaIndependencia`) | os três compromissos afirmativos |
| 8 | `#br-perguntas` | FAQ, 5 perguntas |
| 9 | "Criar conta" | CTA final |

**Não é a versão das Waves 1-4** (cinco cards + Independência + rodapé
sem o resto), **não é um híbrido em transição** — é exatamente o estado
final que a Wave 6 e as duas revisões diretas fecharam, de ponta a ponta.
**O glossário que a Revisão Direta 1 tinha adicionado não está mais na
página** — confirmado ausente (a Revisão Direta 2 o removeu, como o
próprio `CLAUDE.md` registra).

### Marca — GridAlpha ou NIVAR

`grep -in "gridalpha" src/pages/br/PortalBR.tsx src/components/br/*.tsx`
devolve **zero ocorrências** nos cinco arquivos (`PortalBR.tsx`,
`PortalHero.tsx`, `DestinoCard.tsx`, `FaixaIndependencia.tsx`,
`SeletorMercado.tsx`, `AcessoConta.tsx`). A marca visível é NIVAR — o
wordmark SVG inline com gradiente de incandescência, nos dois modos.

### Teste decisivo dos tokens

`grep -c` de `--accent-house`, `--text-strong`, `data-mode`,
`--surface-page`, `var(--rule` em `PortalBR.tsx`: **90 ocorrências**.
Presente, sem ambiguidade — a página inteira é construída em cima dos
tokens de `src/design/nivar/`, com `data-mode="noturno"` como escopo de
alternância no elemento raiz.
