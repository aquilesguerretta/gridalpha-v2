PENDÊNCIAS DE INFRA — DATABASE / VPS / DNS
Resolver em lote quando tiver ajuda. Não bloqueia build de feature.

── EMAIL TRANSACIONAL (Conta de Luz Express + Solar Proposal
   Validator — bloqueia só PRODUÇÃO, dev funciona sem isso)
  [ ] RESEND_API_KEY — conta no Resend + verificação do domínio
      nivar.com.br via registro DNS
  [ ] ADVISORY_OPERATOR_EMAIL — compartilhado entre os dois produtos
      Advisory com fluxo de envio (renomeado de CLE_OPERATOR_EMAIL)
  [ ] CLE_EMAIL_FROM — proposta: contato@nivar.com.br
  [ ] CLE_APP_BASE_URL — URL real de produção
  [ ] SPV_EMAIL_FROM
  [ ] SPV_APP_BASE_URL

── PERFORMANCE (FOUNDRY NIVAR Wave 1, não urgente)
  [ ] tokens/fonts.css importa Zilla Slab e Work Sans via @import —
      requisição externa bloqueante de render. Auto-hospedar .woff2
      quando der.

── QUANDO PAGAMENTO ENTRAR EM ESCOPO (ainda não decidido)
  [ ] Conta em processador (Stripe, ou Pix nativo tipo Pagar.me/Iugu)
      + chaves de API + webhook
