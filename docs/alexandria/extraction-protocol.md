# Protocolo de extração — Alexandria

Consolidação da disciplina que nove waves de extração (LYCEUM 4, 18, 19,
24, 25, 29, 30, 32, 37) confirmaram uma a uma. Não é teoria: cada seção
abaixo existe porque a ausência dela produziu um defeito real, e o
defeito está citado.

Quem abrir um módulo novo lê isto antes de escrever a primeira linha de
extrator.

---

## 1. Vocabulário de classe: sempre medido, nunca presumido

A fonte mudou de vocabulário no meio do currículo. Os seletores dos
Módulos 01-03 (`class="aula"`, `aula-marker`, `div.exercise`,
`exercise-tag`, `glossary-item`, `checklist-item`) dão **zero** nos
Módulos 04+, que usam o vocabulário abreviado (`sec-id`, `lede`, `inst`,
`lv`, `det-bd`).

E o vocabulário abreviado tem variação interna: o callout do Módulo 04 é
`class="box"`; no Módulo 05 é `class="box gd"`. Uma varredura exata por
`class="box"` daria zero e perderia os oito.

**Regra:** contar as ocorrências de cada seletor candidato no arquivo
real antes de escolher o extrator. Nunca herdar o extrator da wave
anterior sem essa medição.

## 2. Cobertura de TEXTO, nunca contagem de elemento

Esta é a regra mais cara de aprender. **Contagem de elemento por aula
não detecta perda de conteúdo.**

No Módulo 09 a checagem por elemento passou limpa — desvio de −34% a
+41% em torno da média, nada fora de ±50% — e mesmo assim a Aula 04
tinha perdido **6.004 caracteres reais** (seis fichas `div.fi`, 42 pares
chave/valor). Contagem de elemento dupla-conta os `<p>` aninhados dentro
de `box`/`lv`, e essa inflação mascarou a perda.

Só a medição de cobertura de texto revelou:

| aula | cobertura inicial | final |
| --- | --- | --- |
| 04 | **57,5%** | 95,6% |
| 03 | 72,6% | 95,0% |

**Regra:** para cada aula, medir `caracteres extraídos ÷ caracteres de
texto da seção na fonte`. **Investigar qualquer aula abaixo de ~85%**
antes de seguir. Cobertura saudável fica em 90-96%; o resíduo é
pontuação de aparato e normalização de entidade.

Precedentes de estrutura descartada em silêncio, todos achados por
cobertura: `src-card` (Módulo 08, 8 fichas / 52 pares), `div.fi`
(Módulo 09, 6 fichas / 42 pares), `<ol>` ordenada (Módulo 09 — o
extrator só capturava `<ul>`).

## 3. Frequência de termo nunca é veredito — leia a frase

Mapear gravura por contagem de ocorrência produz falso positivo. **Nove
já confirmados**, cada um pego lendo a frase real:

| termo | falso positivo | wave |
| --- | --- | --- |
| Francis | "São **Francisco**", o rio | 19 |
| PA (pá) | "(Xingu, **PA**)", a sigla do estado | 19 |
| lítio | "a bateria que veio antes do **lítio**" — contraste retórico | 19 |
| torre / isolador | enumeração de itens de custo, nenhum é o assunto | 18 |
| motor | lista de cinco equipamentos indutivos | 5 |
| vazio | "preencher esse **vazio** com usinas a gás" | 29 |
| Senado | cláusula sobre nomeação de diretor | 30 |
| cimento | "cres·**cimento**" | 32 |
| turbina | 11+ ocorrências: hidráulica, eólica, a gás e a vapor | 19 |

**Regra:** varrer por equipamento/conceito específico, e **ler a frase
real** antes de aceitar. Mapear só quando o objeto da gravura é o
assunto declarado da seção — nunca por menção dentro de enumeração.
Prefixo de catálogo casando só em parte com o conteúdo é resultado
normal (Módulo 08: 2 de 8; Módulo 09: 2 de 6), não sinal de erro.

## 4. Nome de instrumento repetido não garante mesma mecânica

"Termômetro" aparece três vezes no currículo, com **três mecânicas
distintas**:

| módulo | mecânica real | `kind` |
| --- | --- | --- |
| 05 | 8 chaves booleanas com peso | `quebra-cabeca` |
| 06 | 4 campos numéricos de balanço | `simulador` |
| 08 | `foto` por submercado, ena/ear, quadrante | `simulador` |

"Mapa" idem: Módulo 05 é simulação paramétrica contínua (`simulador`),
Módulo 06 é consulta discreta que revela texto (`explorador`).

O risco inverso também existe: no Módulo 07, "Comparador de instrumentos
jurídicos" tem a **mesma forma de campo** que os seis `explorador` do
módulo — um `select`, zero saída numérica. Forma idêntica também não é
atalho seguro.

**Regra:** inspecionar a marcação real (campos, saídas, tipo de
interação) e decidir o `kind` pela MECÂNICA. O título literal da fonte é
sempre preservado na tela — o `kind` é taxonomia interna. Catálogo em
`docs/alexandria/instrument-taxonomy.md`.

## 5. Exercício sem vínculo de aula é o padrão desde o Módulo 04

Nos Módulos 01-03 a tag aponta a aula (`Ex · 04 · Aula 05`). A partir do
Módulo 04 o `<summary>` traz só `NN · Título`, e a varredura por
`/[Aa]ula\s*\d+/` no enunciado **e** no gabarito costuma dar zero.

Referência em prosa não é tag de posse: o Módulo 05 tem "é precisamente
o caminho híbrido descrito na Aula 06" no fecho de um gabarito, e mesmo
assim aquele exercício é solto — a tag dele não aponta aula nenhuma.

**Regra:** varrer os três campos. Sem vínculo declarado, o exercício vai
para `MODULO_NN_EXERCICIOS_SOLTOS` e a aula fica com `activities: []`.
Nunca inventar o vínculo.

## 6. Contagem por três sinais independentes

Contagem bruta de seção superestima: `.aula` era classe compartilhada
entre aula real e aparato (§ Lex, § Ex, § Quiz…), e `sec-id` também é.

Cruzar sempre: **seções que casam `Aula NN`** × **a prosa do hero /
§ MAP** × **numeração de subseção `x.y` da própria fonte**.

Quando prosa e markup divergem, **o markup vence** e a divergência é
registrada, não corrigida. Precedentes: Módulo 01 ("seis dos oito", há
8), Módulo 02 ("Oito exercícios", há 10), glossário do Módulo 01
("Vinte e oito termos", há 38).

## 7. `illustrations` é NOME DE ARQUIVO PURO

O componente `Prancha` prefixa `/alexandria/gravuras/` sozinho. Gerar
caminho completo produz `/alexandria/gravuras//alexandria/gravuras/…` e
**`naturalWidth` 0 em todas as gravuras do módulo** — o defeito da Wave
29, que só apareceu na verificação por clique.

**Regra:** `'tar-03-conta-industrial.png'`, nunca com barra inicial nem
prefixo. Conferir contra um módulo que já funciona antes de gerar.

## 8. Cálculo portado, nunca rederivado

A lógica vem do `<script>` da fonte, transcrita, não reconstruída do
enunciado. A prova de fidelidade é confrontar a porta contra uma
**reimplementação independente do original** com os defaults da fonte —
ou executar o script original num DOM simulado, que é o método mais
forte (Waves 34 e 38).

**Condicional aninhada exige teste ramo por ramo.** A linearização de
`if(grupo===1){…} else {…}` produziu veredito errado no INST 07 do
Módulo 06 (Wave 29): 2024/Grupo A caía no ramo de baixa tensão. O
extrator de ramos da Wave 30 pegou só os `else if` e perdeu o `else`
terminal — o `tsc` denunciou.

Quirk da fonte é **sinalizado, não corrigido**: o `|| 1` que faz campo
vazio virar 1, o preset que reescreve campo alheio, a numeração
`INST · NN` que não bate com o prefixo dos ids internos.

Onde o espaço de entrada é finito e pequeno, **cobrir o espaço inteiro**
em vez de amostrar (Wave 38: 96 e 36 combinações exaustivas).

Nota de método (Wave 38): toda falha de fidelidade investigada até a
causa foi **defeito do harness de teste**, nunca da porta — tipicamente
chamar a calculadora com entrada vazia, quando o painel sempre semeia os
`defaultValue`.

## 9. Limitações de contrato conhecidas

Registrar, não contornar:

- **Saída textual não cabe em `valores`.** `ResultadoInstrumento.valores`
  é `Record<string, number>`, então mês, quadrante, nome de usina
  marginal, veredito categórico ficam de fora. Cinco waves de evidência
  (19, 24, 25, 29, 38). O veredito literal costuma carregá-los em prosa.
- **Desenho não porta** — SVG, pizza, mapa, calendário. O conteúdo
  numérico e textual deles entra como saída ou veredito; descartá-lo
  seria a perda silenciosa da seção 2.
- **`durationMinutes`, `difficulty`, `video` são `null` MEDIDOS.** Zero
  `<video>`, `<iframe>`, youtube, vimeo, `.mp4` — medir, não herdar dos
  módulos anteriores.

## 10. Higiene de sessão

- **`git` sempre com pathspec explícito.** Nunca `git add -A`: sessões
  paralelas trabalham na mesma árvore, e o commit `f955e62` carregou
  dois arquivos de outra sessão por causa disso.
- **`git status` conferido antes de cada commit**, staged batendo com o
  que a fase deveria tocar.
- **Gate real é `tsc -b` escopado**, não `tsc --noEmit` — o tsconfig raiz
  não typecheca os arquivos da app (nota da Wave 3). Erros pré-existentes
  de Recharts em `nest/student/*` não são da wave.
- **`gridalpha-detect`** sobre os arquivos da wave, 0 P0.
- **Verificação por clique real**, com `naturalWidth` lido no DOM — não
  presença de tag. E **medir `window.innerWidth` antes de acreditar em
  qualquer medida de layout**: o painel Browser pode nascer 0×0 com
  `visibilityState: hidden`, o que faz toda largura medir 0 e o
  `IntersectionObserver` do lazy nunca disparar (Wave 39).
