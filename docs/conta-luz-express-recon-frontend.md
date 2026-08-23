# Conta de Luz Express — recon de ponto de integração (frontend)

**Wave:** ARCHITECT — Conta de Luz Express Wave 1. Trilha nova;
confirmado no CLAUDE.md que nenhuma seção `CONTA DE LUZ EXPRESS`
existia antes desta.

**Escopo:** recon. Zero código escrito, zero arquivo de produto
modificado. Tudo abaixo foi lido no código ou medido no render — nada
presumido a partir do brief.

**Método:** leitura de `PortalBRRouter.tsx`, `FamiliaPage.tsx`,
`br-familias.ts`, `br-destinos.ts`, `main.tsx`, `AlexandriaRouter.tsx`
e `DestinoCard.tsx`, mais varredura de `<Route` em todo
`src/pages/br` + `src/components/br` e de `activateProduct` em todo
`src/`. As duas páginas de família (Advisory e Academy) foram
**renderizadas** e o texto lido do DOM.

---

## Veredito curto

Separando as duas coisas que o brief junta numa pergunta só:

| O quê | Precisa de mecanismo novo? |
| --- | --- |
| A linha do produto virar **"Aberto →"** na página de família | **Não.** É troca de dois campos de dado. Zero mudança em componente. |
| O produto ter **superfície própria** (uma tela) | **Sim, uma rota que não existe** — mas nas duas opções com precedente é UMA LINHA num router que já existe. Mecanismo novo, não. |
| A Advisory ganhar **bloco próprio** na página de família (como a Academy tem) | **Sim, e este é o trabalho estrutural real.** O bloco da Academy é condicional hardcoded, não slot. Ver §2.3. |

**Rota de produto individual NÃO é extensão da rota de família.** O
precedente existente (Alexandria) põe o produto em rota de TOPO e faz
a página de família apenas apontar para lá.

---

## 1. Hipótese A — `FamiliaPage` provisiona rota de produto?

**Não. Zero provisionamento.** Medido, não deduzido.

`PortalBRRouter.tsx` tem exatamente **três** rotas, e
`familia/:familiaId` é **folha**:

```tsx
<Route index element={<PortalBR />} />
<Route path="familia/:familiaId" element={<FamiliaPage />} />
<Route path="*" element={<PortalBR />} />
```

Varredura de `<Route` em todo `src/pages/br` + `src/components/br`
devolve **só essas três**. Não existe `produto/:produtoId` em lugar
nenhum da árvore BR.

Dentro do `FamiliaPage`, produto é **linha de lista**, não destino. O
elemento terminal da linha é um de dois, decidido em uma linha
(`FamiliaPage.tsx:426`):

```tsx
const aberto = p.status === 'disponivel' && p.rota !== null;
```

- `aberto` → `<Link className="nv-btn nv-btn--primario" to={p.rota}>`
  com o rótulo `Aberto →`, e navegação por view transition.
- senão → `<span>` com a etiqueta `Em construção`. **Não é link** —
  o comentário no código é explícito: *"não há para onde ir"*.

Consequência para a wave de build: **a página de família não hospeda
produto, ela aponta para produto.** O que ela sabe fazer é renderizar
um link quando o catálogo diz que existe destino.

---

## 2. Hipótese B — como a Academy chegou a ter a Alexandria "aberta"

Este é o precedente mais próximo, e ele tem **cinco** partes. Nenhuma
delas é um mecanismo da página de família.

### 2.1 A rota é de TOPO, não aninhada na família

`main.tsx:112`:

```tsx
<Route path="/alexandria/*" element={<AlexandriaHome />} />
```

A Alexandria **precede a camada de família inteira**. `br-destinos.ts`
apenas declara `rota: '/alexandria?trilha=brasil'`, e o `FamiliaPage`
renderiza um link para essa string. A família nunca hospedou nada.

### 2.2 O estado "aberto" é 100% dirigido por dado

Em `br-destinos.ts`, Alexandria é o único com:

```ts
status: 'disponivel',
rota: '/alexandria?trilha=brasil',
```

Os outros quatro — incluindo `conta-de-luz-express` — são
`status: 'em-breve'`, `rota: null`.

**Virar a chave é editar esses dois campos.** O `FamiliaPage` não muda
uma linha: o `aberto` da §1 passa a ser `true` e o botão primário
aparece sozinho. `conta-de-luz-express` **já está** em
`FAMILIAS_BR.advisory.produtoIds` — a atribuição de família não
precisa de nada.

O que a troca exige é que `rota` aponte para um endereço que **exista**
— senão o botão leva ao catch-all e cai no Portal.

### 2.3 O bloco extra da Academy é CONDICIONAL HARDCODED, não slot

Este é o achado que mais importa para a wave de build.

`FamiliaPage.tsx:231`:

```tsx
const ehAcademy = familia.id === 'academy';
```

`FamiliaPage.tsx:499`:

```tsx
{ehAcademy && ( <section aria-label="A Alexandria em números"> … )}
```

O conteúdo dentro é **inteiramente específico da Alexandria**: a
gravura (`ALEXANDRIA_GRAVURA_SRC`), o papel do sistema Alexandria
hardcoded (`ALEXANDRIA_PAPEL = '#F2E9D6'`), contadores derivados de
`ALEXANDRIA_TRILHAS` / `ALEXANDRIA_BLOCKS`, e um CTA que procura
`produtos.find((d) => d.id === 'alexandria')`.

**Não existe** `familia.blocoExtra`, nem slot, nem registro, nem
qualquer campo em `FamiliaBR` que descreva conteúdo próprio. `FamiliaBR`
tem oito campos e nenhum deles é conteúdo de bloco: `id`, `nome`,
`dominio`, `hex`, `token`, `paragrafo`, `produtoIds`, `porQue`.

Se a Advisory quiser um bloco próprio, há dois caminhos e nenhum é de
graça:

- **segundo `if`** (`const ehAdvisory = familia.id === 'advisory'`) —
  barato, mas é o começo da divergência que o próprio cabeçalho do
  arquivo diz que a decisão de "um componente, cinco rotas" existe para
  evitar: *"quando uma família crescer o bastante para precisar de
  composição própria, ela ganha o arquivo dela"*;
- **generalizar o slot** — trabalho maior, e é decisão de arquitetura,
  não de implementação. Fica para o war room.

A numeração de seção depende disso: hoje Academy fecha em `01 · 02` e
as outras quatro em `01` sozinho (comentário em `FamiliaPage.tsx:227-230`).
Um bloco na Advisory a leva para `01 · 02` também.

### 2.4 A ativação acontece DENTRO do produto, não na família

Varredura de `activateProduct` em todo `src/` devolve **dois** call
sites, e só um está vivo:

| Arquivo | Estado |
| --- | --- |
| `src/pages/alexandria/PerfilStub.tsx:114` | **VIVO** — a tela de perfil da própria Alexandria (LYCEUM Wave 23) |
| `src/components/br/DestinoCard.tsx:345` | **CÓDIGO MORTO** — `DestinoCard` perdeu o consumidor na Wave 8; só `PlantaBaixa` ainda é importado desse arquivo |

Ou seja: o precedente real é **o produto ativa a si mesmo quando a
pessoa entra nele**, com `myProducts()` consultado antes para não
gastar escrita à toa. A página de família nunca ativou nada.

### 2.5 Produto com várias telas tem router próprio

`AlexandriaRouter.tsx` declara **dez** rotas sob o splat
`/alexandria/*` (`index`, `trilha/:trilhaId`, `.../modulo/:moduloId`,
`.../modulo/:moduloId/jogo`, `.../aula/:aulaNumero`, `biblioteca`,
`perfil`, `atlas`, `glossario`, catch-all).

É o modelo pronto para um produto que precise de mais de uma tela — e
Conta de Luz Express provavelmente precisa (entrada da fatura →
resultado, no mínimo).

---

## 3. Hipótese C — conteúdo real da Advisory hoje, exato

**Medido no render** (`/br/familia/advisory`), não deduzido.
`document.title` = `NIVAR — Advisory`.

Texto integral da página, verbatim:

```
ADVISORY
← Portal Brasil
CLARO · NOTURNO

FAMÍLIA
Advisory
Parecer e contraditório
Parecer sobre um caso concreto, com o contraditório produzido junto —
não depois. A conclusão vem acompanhada do argumento que a contesta.

01  PRODUTOS                                        2 NO CATÁLOGO
Conta de Luz Express
Análise independente de fatura industrial — modalidade, demanda e
oportunidades a validar.                              EM CONSTRUÇÃO

Diagnóstico Energético
Análise 360° do custo energético de uma operação industrial.
                                                      EM CONSTRUÇÃO

ADVISORY
FONTES · ONS · ANEEL · CCEE · EPE
```

**Correção à descrição do brief:** o brief descreve o estado como
`"PARECER E CONTRADITÓRIO · 2 PRODUTOS · EM CONSTRUÇÃO"`. A string
real da nota de seção é **`2 NO CATÁLOGO`**, não "2 PRODUTOS"; e
`EM CONSTRUÇÃO` é etiqueta **por produto**, não estado da família.
Registrado para a wave de build não escrever copy contra uma string
que não existe.

**Nada aqui precisa ser duplicado.** A descrição do produto
(`br-destinos.ts:56-57`) já é a linha de face pública, e respeita a
disciplina de linguagem do catálogo — *"oportunidades a validar"*,
nunca "economize X%".

---

## 4. O que a wave de build já herda pronto

Medido, não suposto:

- **Planta baixa do produto já desenhada.** `DestinoCard.tsx:105-114`
  tem a geometria de `conta-de-luz-express`, e `PlantaBaixa` **está
  vivo** (importado por `PortalBR.tsx:114` para o overlay "em breve").
  Reaproveitável sem tocar em arquivo órfão.
- **O backend já reconhece o id.** `app/db/models/product_access.py:33`
  lista `conta-de-luz-express` no `PRODUCT_CATALOG`, então
  `POST /api/products/conta-de-luz-express/activate` já resolve hoje —
  a fiação de conta não precisa de mudança de catálogo. (A wave CURSOR
  em paralelo cobre capacidade de backend; isto aqui é só a constatação
  de que o id já existe.)
- **A atribuição de família já está feita.**
  `br-familias.ts:109` — `produtoIds: ['conta-de-luz-express',
  'diagnostico-energetico']`.
- **`AuthProvider` já envolve a árvore inteira** (`main.tsx:31`), então
  qualquer superfície nova lê `useAuth()` sem fiação nova.
- **Trava de DEV já cobre órfão**: `br-familias.ts` avisa em console se
  um produto do catálogo ficar sem família ou aparecer em duas.

---

## 5. Onde a superfície pode morar — três opções, com o precedente de cada

A decisão é do war room; recon não a fecha. As três, com o que cada uma
custa e o que a sustenta:

| Opção | Endereço | Precedente | Custo |
| --- | --- | --- | --- |
| **A** | `/conta-de-luz-express/*` (topo) | **Exato** — é o que a Alexandria faz | 1 linha em `main.tsx` + router próprio do produto |
| **B** | `/br/conta-de-luz-express` | **Nenhum de uso, mas antecipado por escrito** | 1 linha em `PortalBRRouter.tsx` |
| **C** | `/br/familia/advisory/conta-de-luz-express` | **Nenhum** | rota aninhada nova; sem precedente na árvore |

**Sobre a B:** o cabeçalho de `PortalBRRouter.tsx` registra que o
prefixo `familia/` foi escolhido **justamente** para que outras
sub-páginas do Portal pudessem coexistir sem desambiguação — cita
`/br/precos` e `/br/sobre` como exemplos. Um produto sob `/br/` é
exatamente o caso que aquela decisão antecipou. Não tem precedente de
uso, mas tem precedente de intenção, escrito no arquivo.

**Sobre a C, e por que a desaconselho:** acopla o endereço do produto a
uma taxonomia de marketing. O design system é explícito — *"a casa
marca as cinco famílias comerciais, não os 44 produtos"* — e a própria
`br-familias.ts` declara que a atribuição produto→família é
**atribuição do implementador, sujeita a veto**. Se Conta de Luz
Express for reatribuída um dia, a URL quebra. Um endereço citável não
deve depender de uma decisão declarada como revisável.

Entre A e B, a diferença real é se o produto é irmão do Portal ou filho
dele — pergunta de arquitetura de informação, não de código.

---

## 6. Sequência mínima que a wave de build precisa cobrir

Derivada dos achados acima, na ordem em que as dependências mandam:

1. **Decidir o endereço** (§5). Tudo depois depende disso.
2. **Construir a superfície** — com router próprio se tiver mais de uma
   tela (§2.5).
3. **Ativar dentro do produto**, no padrão do `PerfilStub` da
   Alexandria: `myProducts()` primeiro, `activateProduct` só se faltar
   (§2.4).
4. **Virar a chave no catálogo** — `status: 'disponivel'` + `rota` em
   `br-destinos.ts`. A linha da Advisory passa a "Aberto →" sozinha
   (§2.2). **Esta é a única mudança que a página de família precisa, e
   ela não é na página.**
5. **Decidir se a Advisory ganha bloco próprio** (§2.3) — e, se sim,
   decidir entre segundo `if` e generalizar o slot. É a única parte com
   trabalho estrutural de verdade neste conjunto.

---

## Pendências registradas, não resolvidas

- **`DestinoCard.tsx` é código morto com uma chamada de
  `activateProduct` viva dentro.** Não quebra nada hoje (ninguém monta
  o componente), mas é uma segunda implementação de ativação divergindo
  em silêncio da do `PerfilStub`. Alguém deveria decidir se apaga ou
  reaproveita; não é desta wave.
- **O bloco condicional da Academy não escala** (§2.3). O segundo
  produto aberto expõe isso, seja ele Conta de Luz Express ou outro.
- **`FamiliaBR` não tem campo de conteúdo próprio.** Se a resposta ao
  item anterior for "generalizar", é aqui que o campo nasce.
