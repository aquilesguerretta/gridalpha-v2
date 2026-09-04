# Portal do Operador — Wave 2 · Fase 1 — schema proposto

**Status:** aprovada (3 de setembro de 2026), com uma mudança de
vocabulário na porta de saída. Fase 2 aplica a `0009`.

**Autor:** CURSOR. **Data:** 3 de setembro de 2026.

**Reconhecimentos**

- Submissão antiga continua funcionando depois do intake crescer:
  colunas novas **nullable**, POST antigo (quatro campos) permanece
  válido. Ausência se declara (`null`), sem sentinela.
- Retenção e LGPD ficam como pendência herdada da recon. Não entram
  nesta wave.

## Numeração

Wave 1 desta trilha é a recon `docs/operador-recon-backend.md` (commit
`1baba6e`). ARCHITECT fechou a recon de front em paralelo
(`docs/operador-recon-frontend.md`). Não há Wave 2 de operador no
registro. **N = 2.**

Worktree: `C:\dev\gridalpha-v2-operador-api`, branch `wave/operador-api`,
base `feature/full-shell-buildout` (`412a130`). ARCHITECT constrói o
console mock em `wave/operador-console` — zero arquivo em comum.

## As quatro hipóteses, medidas de novo no disco

### 1. Próxima migration

**`0009`.** Confirmado contra
`app/db/migrations/versions/`: `0001` … `0008`. Cabeçalho de `0008`:
`revision = "0008_diagnostico_energetico"`, `down_revision =
"0007_conversation"`. Nenhum `0009`. A recon acertou; não herdei o
número do relatório.

**Forma:** uma migration `0009_operator_queue` que aplica os três
desenhos aprovados (status nos três + deliverable de Diagnóstico +
intake rico). Fases 3–5 desta wave são código sobre schema já no banco.
Alterar a mesma tabela três vezes (`0010`, `0011`) só aumenta janela de
falha. Se a aprovação cortar um dos desenhos, a `0009` encolhe — não se
inventa número.

### 2. Um endpoint de fila, ou um por produto?

**Um.** `GET /api/operator/submissions`, gate
`require_advisory_operator` (reusa `advisory_operator.py`, não
reescreve).

O operador é um. O front lista por produto via query param
`productId`. Três listas forçariam o “Advisory inteiro” a três round
trips e a um merge no browser. Família não entra no backend — a recon
já mediu que `PRODUCT_CATALOG` é tupla plana; esta wave não cria
taxonomia. Os únicos `productId` aceitos neste recurso são os três
Advisory:

- `conta-de-luz-express`
- `solar-proposal-validator`
- `diagnostico-energetico`

Outro id → 422. Sem filtro → os três, `createdAt` desc.

Não reusa `/api/operator/conversations`. Conversa continua sendo fio;
este recurso é **pedido**.

`PATCH /api/operator/submissions/{productId}/{submissionId}` muda
status. O UUID não é único entre tabelas irmãs por constraint; o
`productId` no path é o discriminante.

### 3. Paginação, filtro por status, nome do cliente

A recon acertou: `/api/operator/conversations` não tem nenhum dos três.
A fila nova precisa dos três, mais idade derivada.

| necessidade | forma |
| --- | --- |
| paginação | `limit` (default 50, max 100) + `offset`; `summary.count` é a contagem filtrada, não a página |
| filtro `status` | um dos três valores abaixo, ou omitido = todos |
| filtro `productId` | um dos três ids Advisory, ou omitido = os três |
| cliente | `{ id, name, email }` via join em `users` — a lista de conversas só tem `userId` opaco |
| idade | **não persiste**; o front formata a partir de `createdAt` (a recon de front já registrou que não existe `timeAgo` de verdade em `src/`) |
| conversa ligada | `conversationId` nullable, lookup pelo par `origin_kind` / `origin_id` já existente; Diagnóstico hoje é o único que preenche |

BYTEA **fora** do payload da fila (`defer` como os GET de produto já
fazem).

### 4. `advisory_files.py` e `advisory_email.py` precisam crescer?

**Não.** São primitivos e já servem o deliverable de Diagnóstico sem
alteração.

| helper | o que é | caller hoje |
| --- | --- | --- |
| `advisory_files.py` | leitura limitada, MIME por assinatura, `download_headers`, `read_advisory_upload` | `solar_proposal_storage.py`, `solar_proposal.py` (headers) |
| `advisory_email.py` | `send_transactional_email` (Resend) | `solar_proposal_email.py` |

CLE ainda tem cópias próprias (`conta_luz_storage.py`,
`conta_luz_email.py`). Unificar CLE **não é desta wave**.

Diagnóstico ganha wrappers finos no padrão Solar, **arquivos novos**:

- `app/services/diagnostico_storage.py` — `read_deliverable_upload`
  sobre `advisory_files` (PDF only, teto 20 MB, env
  `DIAG_MAX_DELIVERABLE_BYTES`);
- `app/services/diagnostico_email.py` — `notify_customer_deliverable_ready`
  sobre `advisory_email`.

Env de e-mail do entregável (espelho Solar, nomes do produto):

- `RESEND_API_KEY` (já compartilhada)
- `ADVISORY_OPERATOR_EMAIL` (já compartilhada; reply-to)
- `DIAG_EMAIL_FROM`
- `DIAG_APP_BASE_URL`

Intake de Diagnóstico **continua sem Resend**. A fila substitui o
e-mail “chegou um caso”. Só o `POST …/deliverable` passa a exigir
config de e-mail (503 se falta; 502 + rollback se o envio falha) — o
mesmo contrato de CLE/Solar na entrega, sem contaminar o POST da
ficha.

`docs/pendencias-infra.md` ganha as duas env `DIAG_*` na Fase 4 (é o
único doc de infra; se isso cruzar posse, registro no relatório da
Fase 4 e não toco).

---

## Desenho 1 — estados

Vocabulário **inglês no banco e na API**, como o resto da casa
(`open`/`closed`, `customer`/`operator`). Português é copy do console
(ARCHITECT).

| API / CHECK | copy PT | o que significa | BYTEA de entrega |
| --- | --- | --- | --- |
| `received` | recebido | chegou; ninguém pegou | null |
| `in_review` | em análise | operador pegou | null |
| `delivered` | entregue | PDF anexado | preenchido |

No **campo** (Postgres), substitui `submitted` / `ready`. Diagnóstico
**ganha** a coluna, default `received`. Na **porta de saída** do
cliente CLE/Solar, os literais velhos continuam como alias de leitura
— ver abaixo.

### Por que não ficar com `submitted` / `ready` e só acrescentar um meio

O console pede três estados com nomes de trabalho, não de upload. Manter
os dois velhos mais um terceiro deixa CLE/Solar falando uma língua e
Diagnóstico outra. Um vocabulário só.

### Transições

```
received  ──PATCH──►  in_review  ──PATCH──►  received
    │                      │
    └──────── POST deliverable ──────────►  delivered
```

- `PATCH` só troca `received` ↔ `in_review`. 409 fora disso.
- `POST …/deliverable` (os três produtos) move para `delivered`. É a
  única via. Não existe `PATCH status=delivered`.
- `delivered` é terminal para status. PDF com hash diferente continua
  409, igual hoje. Mesmo hash continua idempotente (`alreadyReady` →
  `alreadyDelivered`).
- Não exige passar por `in_review`. Operador pode entregar direto de
  `received` — é o fluxo atual de CLE/Solar, só com outro nome.

### CHECK novo (CLE, Solar, e Diagnóstico depois do blob)

O CHECK atual de CLE/Solar **acopla** `submitted` a BYTEA nulo e
`ready` a BYTEA preenchido. Reescreve:

```
status IN ('received', 'in_review', 'delivered')

AND (
  status IN ('received', 'in_review')
  AND deliverable_* IS NULL AND delivered_at IS NULL
  OR
  status = 'delivered'
  AND deliverable BYTEA completo AND delivered_at IS NOT NULL
)
```

Diagnóstico, **antes** das colunas de blob, não pode ter esse CHECK.
Por isso a `0009` aplica status + blob de Diagnóstico **no mesmo
passo**: senão existiria uma janela em que Diagnóstico tem `status`
sem invariante de entrega.

### Backfill

| tabela | regra |
| --- | --- |
| `conta_luz_submission` | `submitted` → `received`; `ready` → `delivered` |
| `solar_proposal_submission` | idem |
| `diagnostico_energetico_submission` | todas as linhas existentes → `received` |

Sem sentinela. Casos Diagnóstico já no banco são pedidos recebidos
sem PDF — isso é fato, não invenção.

Índice novo em Diagnóstico: `(status, created_at)`, irmão do que CLE
e Solar já têm.

### Alias de leitura no Portal do cliente (aprovado)

Uma língua no campo, duas na porta de saída, **por tempo determinado**.

| porta | `status` | outro campo |
| --- | --- | --- |
| coluna Postgres | `received` \| `in_review` \| `delivered` | — |
| fila do operador (Fase 3) | canônico | — |
| GET CLE/Solar (cliente vivo) | alias: `received`/`in_review` → `submitted`; `delivered` → `ready` | `queueStatus` canônico, aditivo |
| GET Diagnóstico | canônico (nunca teve `submitted`/`ready`; campo novo é aditivo) | — |

`in_review` aliasa para `submitted` no cliente: o tipo em
`src/lib/submissoes/api.ts` não tem terceiro literal, e "em análise"
é estado de operador.

**Pendência explícita da wave de ligação (ARCHITECT):** migrar
`src/lib/submissoes/api.ts` para o vocabulário canônico e **remover**
o alias `submitted`/`ready` desta porta. Duas línguas permanentes é
dívida; esta nota existe para a remoção não ficar silenciosa. Esta
wave **não** toca `src/`.

---

## Desenho 2 — deliverable de Diagnóstico

Mesmo padrão CLE/Solar, **na mesma linha** da ficha — não tabela
irmã. O terceiro produto ainda não justifica domínio genérico de
submissão (o model de Solar disse isso; continua verdadeiro). Colunas
novas, todas nullable até `delivered`:

| coluna | papel |
| --- | --- |
| `deliverable_filename` | TEXT |
| `deliverable_content_type` | TEXT, CHECK implícito via estado: `application/pdf` quando delivered |
| `deliverable_size_bytes` | BIGINT |
| `deliverable_sha256` | TEXT |
| `deliverable_data` | BYTEA |
| `delivered_at` | TIMESTAMPTZ |
| `customer_email_id` | TEXT (Resend) |
| `customer_notified_at` | TIMESTAMPTZ |

Não há `source_*`: Diagnóstico não recebe arquivo do cliente. Não há
e-mail de “chegou um caso” (`operator_email_id` não entra).

Endpoints, no router que já existe (`/api/diagnostico-energetico`):

| método | quem |
| --- | --- |
| `POST /submissions/{id}/deliverable` | operador; PDF; transação e-mail+commit como CLE/Solar |
| `GET /submissions/{id}/deliverable` | dono ou operador; 404 se ainda não `delivered` |

Payload do `GET /submissions/{id}` ganha `status`, `deliverable`
(objeto ou `null`) e `deliveredAt`, no mesmo shape dos irmãos.

### O que acontece com a conversa quando o parecer sai

**Permanece `open`.** O PDF é o documento; o fio é o contraditório
que a copy do produto promete. Auto-fechar no `POST deliverable`
apagaria da lista de conversas o canal que o cliente ainda precisa.

Não crio endpoint de fechar conversa nesta wave (a recon já registrou
que o status `closed` existe e ninguém transita). Se o Aquiles
quiser fechar junto com a entrega, isso é um `PATCH` futuro no
`operator_router` de conversas — não efeito colateral do blob.

`conversationId` na fila fica preenchido; o console abre o fio ao
lado do PDF.

---

## Desenho 3 — intake rico (caminho A)

Quatro colunas novas em `diagnostico_energetico_submission`, **todas
NULL**. Os quatro campos atuais não mudam (`sector` e
`monthly_consumption_band` e `concern` continuam NOT NULL;
`tariff_modality` continua nullable).

| coluna | tipo | null | teto API | JSON do POST/GET |
| --- | --- | --- | --- | --- |
| `location` | TEXT | sim | 500 | `location` |
| `installation_size` | TEXT | sim | 80 | `installationSize` |
| `consuming_equipment` | TEXT | sim | 4000 | `consumingEquipment` |
| `current_monthly_cost_brl` | NUMERIC(14,2) | sim | > 0 se presente | `currentMonthlyCostBrl` |

### Por que cada tipo

**`location` TEXT, não ponto PostGIS.** Endereço de planta é o que o
cliente sabe escrever. Nenhum model Advisory usa a extensão PostGIS
(`0001` é infra americana). Geocode nesta wave seria inventar
precisão.

**`installation_size` TEXT, não `NUMERIC` m².** O brief junta
metragem **e** porte. O cliente pode mandar `"1200 m²"`, `"galpão
médio"` ou `"casa térrea"`. NUMERIC sozinho descarta porte;
dois campos para um fato descrito como um. Mesmo idioma da faixa de
consumo, teto 80.

**`consuming_equipment` TEXT livre, não JSONB, não tabela filha.**
Intake de ficha: o cliente descreve. JSONB de `{nome, potencia}`
pede UI de linhas repetidas que o backend não deve antecipar, e a
recon CLE Wave 3 já registrou que JSONB de array tipado **não** é
precedente da casa. Tabela filha é identidade por equipamento — caro
demais para scoping. Se um dia virar inventário, aí sim a filha.
4000 caracteres, teto irmão de `concern`.

**`current_monthly_cost_brl` NUMERIC(14,2).** Custo atual é o único
dos quatro que pede número para análise futura. Moeda implícita BRL,
como o produto. `null` = não soube informar. Rejeitar ≤ 0 na API
(422), não no CHECK do banco — CHECK com NULL já é chato; a API
basta.

### POST antigo

`CreateDiagnosticoRequest` passa a ter os quatro com default `None`.
Quem manda só setor / faixa / tarifa / preocupação continua 201.
Quem manda string vazia em TEXT → `null` (strip, igual tarifa hoje).
Linhas já persistidas: os quatro novos ficam `null` para sempre até
alguém reenviar — e **não há PATCH de cliente** nesta wave.

GET devolve os quatro. `null` visível, nunca omitido de forma que o
front invente zero.

### LGPD (pendência, não trabalho)

Localização e custo mensal são dado a mais no POST do cliente. A
recon Wave 1 listou o que uma política precisaria. Continua não
existindo. Só registro.

---

## Contrato da fila (para a ARCHITECT alinhar o mock)

```
GET /api/operator/submissions
    ?productId=conta-de-luz-express|solar-proposal-validator|diagnostico-energetico
    &status=received|in_review|delivered
    &limit=50&offset=0
```

Item:

```json
{
  "id": "<uuid>",
  "productId": "diagnostico-energetico",
  "status": "received",
  "createdAt": "…",
  "updatedAt": "…",
  "deliveredAt": null,
  "customer": {
    "id": "<uuid>",
    "name": "…",
    "email": "…"
  },
  "conversationId": "<uuid>|null",
  "summary": "setor · faixa  |  filename da fatura  |  filename da proposta"
}
```

`summary` é um TEXT curto derivado: Diagnóstico usa `sector`; CLE/Solar
usam `source_filename`. Evita a fila ter que conhecer a ficha inteira.
Detalhe continua no `GET` por produto que já existe.

Envelope:

```json
{
  "data": [ … ],
  "summary": {
    "count": 0,
    "received": 0,
    "inReview": 0,
    "delivered": 0,
    "limit": 50,
    "offset": 0
  }
}
```

Contagens do `summary` respeitam o `productId` filtrado (e ignoram o
filtro `status`, para o console desenhar os três baldes). Se isso
atrapalhar, corta-se na Fase 3 — não é schema.

```
PATCH /api/operator/submissions/{productId}/{submissionId}
{ "status": "in_review" }
```

403/503 iguais ao resto do operador. 404 se o id não é daquele
produto.

---

## O que esta Fase 1 não cobre, de propósito

- Anotação sobre documento (recon Wave 1 desenhou; o brief desta
  wave não pediu).
- Famílias no backend.
- Fechar conversa.
- Fila de Hardware / Academy / Software / Intelligence — não há
  pedido.
- Unificar storage/e-mail da CLE nos helpers compartilhados.
- Política de retenção.

## Aprovação

Aprovada em 3 de setembro de 2026, com uma mudança: o vocabulário
canônico entra no campo; `submitted`/`ready` permanecem alias de
leitura até a wave de ligação. Os outros quatro pontos seguem como
propostos. A `0009` aplica os três desenhos nesta Fase 2.
