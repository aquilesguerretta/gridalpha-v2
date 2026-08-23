# Conta de Luz Express — Wave 2 · backend real

**Status:** Fase 1 — decisões de storage, email e anexo.

**Autor:** CURSOR. **Data:** 23 de agosto de 2026.

## Numeração da trilha

O `CLAUDE.md` ainda não contém seção numerada da Conta de Luz Express. Ele
só menciona o produto no catálogo canônico e no mapa da família Advisory.
Isso é uma lacuna documental, não ausência da recon: a Wave 1 está provada
por `docs/conta-luz-express-recon-backend.md` e pelos commits publicados
`ecf6e6f` e `e298a43`, ambos nomeados `wave 1`.

Portanto esta construção é **Wave 2**. O `CLAUDE.md` não será corrigido por
esta wave porque não está na posse declarada.

## Restrições confirmadas

- Pagamento fica integralmente fora da Wave 2.
- `product_access` continua sendo entitlement e não será modificado.
- O novo domínio será irmão de `product_access`, referenciando o mesmo
  `users.id`.
- Nenhuma tabela ou service de progresso da Alexandria será modificado ou
  usado como storage.
- A análise é manual, fora do sistema. O backend cuida de intake, estado,
  entrega e notificação.

## Indícios de provider existentes

A checagem cobriu código, dependências e os **nomes** das variáveis do
serviço `gridalpha-v2` no Railway, sem imprimir valores.

### Storage

Não existe:

- dependência ou configuração de S3, R2, Azure Blob, GCS, Supabase Storage,
  Firebase ou Cloudinary;
- variável `AWS_*`, `S3_*`, `R2_*`, `BUCKET`, `BLOB` ou `STORAGE`;
- volume persistente ligado ao serviço web;
- adapter ou model de arquivo.

Existe um único storage persistente já configurado para o backend:
PostgreSQL/PostGIS, via `DATABASE_URL`. O `railway status` confirma o banco
`PostGIS 17` online com volume próprio. O volume pertence ao banco, não ao
container web.

### Email

Não existe:

- dependência de Resend, SendGrid, Postmark, Mailgun, SES ou SMTP;
- variável ou segredo de provedor de email no Railway;
- domínio remetente configurado no código;
- service, endpoint ou webhook de email.

As únicas variáveis externas do serviço são as já conhecidas de banco,
identidade e dados de mercado. Nenhuma é reutilizável como credencial de
email.

## Decisão 1 — storage em PostgreSQL

### Escolha

Os arquivos da V1 serão persistidos como `BYTEA` no novo model de submissão:

- documento de entrada (PDF ou imagem);
- relatório final (PDF, nullable até a entrega);
- metadata de nome, MIME type, tamanho e SHA-256 para cada lado.

### Por quê

1. É o único mecanismo persistente já configurado.
2. Não depende de credencial ou conta externa inexistente.
3. Preserva atomicidade entre metadata, status e bytes.
4. O recorte é deliberadamente pequeno: as primeiras cem análises.
5. Limites rígidos de tamanho impedem que o banco vire depósito sem teto.
6. A autorização continua no mesmo query por `user_id`, sem URL pública.

### Limite e custo aceito

`BYTEA` não é a escolha de escala para milhares de documentos grandes. Esta
decisão vale para a V1 manual e limitada. O endpoint aplicará limite
configurável, com default conservador, antes de gravar.

Uma futura migração para object storage pode manter o contrato HTTP e trocar
os bytes por object keys. Isso não justifica introduzir agora um provider sem
credencial, volume ou operação instalada.

### Por que disco local foi rejeitado

O container web do Railway não tem volume persistente. Gravar em path local
funcionaria em teste e perderia arquivos em restart/deploy — aparência de
storage sem durabilidade. Foi rejeitado.

## Decisão 2 — Resend por REST

### Escolha

Email transacional será enviado pela API REST do Resend:

```text
POST https://api.resend.com/emails
Authorization: Bearer <RESEND_API_KEY>
```

O backend usará `httpx`, já instalado, em vez de adicionar o SDK do Resend.
A documentação oficial confirma `from`, `to`, `subject` e `html`/`text`
como payload, além de `Idempotency-Key`.

### Por quê

1. Uma chamada HTTPS pequena cabe no stack atual.
2. Zero dependência nova de SDK.
3. Idempotency key permite retry sem email duplicado.
4. Suporta os dois eventos da V1 sem fila ou template engine externa.
5. Evita operar SMTP diretamente.

### Configuração necessária

- `RESEND_API_KEY`;
- `CLE_EMAIL_FROM` — remetente em domínio verificado;
- `CLE_OPERATOR_EMAIL` — destinatário das novas submissões e identidade
  autorizada a anexar o relatório;
- `CLE_APP_BASE_URL` — base dos links de revisão e resultado.

Nenhuma das quatro existe hoje no Railway. A implementação pode ser testada
contra transporte HTTP controlado, mas **envio externo real não pode ser
declarado verificado enquanto a chave e o domínio não forem configurados**.

O backend não cairá no import por configuração ausente. Os endpoints que
dependem de email responderão falha de configuração de forma explícita, em
vez de registrar submissão sem avisar o operador.

## Decisão 3 — anexo mínimo do PDF pelo operador

### Escolha

Endpoint multipart:

```text
POST /api/conta-luz-express/submissions/{submission_id}/deliverable
```

Contrato:

- autenticação normal por `get_current_user`;
- autorização adicional: `user.email == CLE_OPERATOR_EMAIL`;
- path param com a submissão;
- um arquivo PDF;
- validação de MIME, assinatura `%PDF-`, limite de tamanho e SHA-256;
- transição de status para `ready`;
- timestamp de entrega;
- envio do email ao dono da submissão;
- idempotência por hash: o mesmo PDF não cria nova entrega nem novo email;
- PDF diferente sobre submissão já entregue retorna conflito, em vez de
  substituir silenciosamente.

### Por quê

É o mecanismo menor que permite ao Aquiles concluir o ciclo sem criar:

- painel de admin;
- tabela de role;
- conta de operador paralela;
- worker;
- motor automático;
- storage externo.

O operador usa a própria conta da plataforma. O allowlist por email vem de
ambiente, não de string hardcoded. Um usuário comum nunca ganha capacidade
de anexar relatório apenas por conhecer o id da submissão.

### Link de revisão

O email de nova submissão apontará para o endpoint autenticado de detalhe da
submissão. O operador poderá baixar o arquivo original por endpoint
autorizado e anexar o PDF final por chamada multipart. A UI de admin fica
fora da V1.

## Modelo previsto para as fases seguintes

Um model irmão, `ContaLuzSubmission`, com:

- `id`;
- `user_id → users.id ON DELETE CASCADE`;
- status com conjunto fechado (`submitted`, `ready`);
- arquivo de entrada + metadata;
- PDF de saída nullable + metadata;
- timestamps de criação, atualização e entrega;
- timestamps/ids de notificação dos dois emails.

Não haverá FK, escrita ou metadata em `product_access`, `progress_event` ou
qualquer cache de progresso.

## Gate antes da implementação

As decisões acima foram tomadas só depois de confirmar que:

- não há provider escondido em dependência;
- não há credencial de storage/email no Railway;
- o container web não tem volume;
- o banco persistente existe;
- a API atual já tem autenticação e ownership por `user_id`;
- nenhum mecanismo de pagamento precisa ou pode entrar.

Fases 2–4 implementarão exatamente este recorte.
