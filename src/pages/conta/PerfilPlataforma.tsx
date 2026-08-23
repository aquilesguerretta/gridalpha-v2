// src/pages/conta/PerfilPlataforma.tsx
// ARCHITECT — Identidade de Plataforma, Wave 1.
// ARCHITECT — Portal BR Wave [N] · Migração de conta para tokens NIVAR.
//
// Perfil da PLATAFORMA, não de produto. O perfil da Alexandria (com
// progresso, trilhas, conquistas) é superfície própria dela e é wave
// do LYCEUM — esta tela não sabe nada sobre currículo.
//
// Três seções, todas de estado real:
//   · Dados pessoais — só o que `users` tem de fato.
//   · Assinatura     — não existe sistema de pagamento. Declarado como
//                      ausência, no mesmo idioma de "em produção" que
//                      o resto do sistema já usa. Zero plano, zero preço.
//   · Produtos       — catálogo do BACKEND (não cópia local), com
//                      ativado / não-ativado por item.
//
// Rota protegida: sem sessão, volta para /entrar carregando o destino
// pretendido, para a pessoa cair aqui de novo depois de entrar.
//
// REGISTRO VISUAL: NIVAR. Migração é só APRESENTAÇÃO — a lógica de
// sessão, produtos e navegação abaixo é byte-idêntica à da Wave 1.
// Cabeçalho de seção adota o idioma `SectionHeader` do sistema
// (número · título · fio · nota numa linha de baseline), o mesmo que
// a Portal BR Wave 6 já usa para as seções do Portal — não é
// invenção desta wave, é aplicação do componente que o sistema já
// documenta para exatamente este papel.

import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { DESTINOS_BR } from '../../lib/data/br-destinos';
import { useAuth } from '../../lib/auth/AuthContext';
import type { ProductsResponse } from '../../lib/auth/authApi';
import { ContaShell, NT } from './ContaShell';

/** Id do catálogo → rótulo. Deriva do id quando ninguém nomeou ainda,
 *  em vez de esconder o produto ou inventar nome.
 *
 *  O CATÁLOGO (quais produtos existem) vem do backend — o contrato diz
 *  que ele é servido justamente para o front não manter uma segunda
 *  cópia que deriva. O que mora aqui é só a APRESENTAÇÃO, e só para os
 *  ids que o portal brasileiro já nomeia, via `DESTINOS_BR`.
 *
 *  Havia aqui um mapa `TITULO_EXTRA` cuja única entrada nomeava o
 *  terminal americano — o último lugar do `/conta` que ainda o
 *  mencionava. Saiu na Topologia de Shell Wave 3, junto com o id, que
 *  o backend já tinha tirado do `PRODUCT_CATALOG`. Confirmado nesta
 *  wave que continua fora — nenhum remanescente estático do lado
 *  americano restou no arquivo. É a mesma doutrina provisória da
 *  Wave 2: o lado americano continua inteiro no disco e alcançável em
 *  `/us`, mas não é anunciado por superfície nenhuma. Quando o portal
 *  americano voltar à mesa, o rótulo volta — de preferência por
 *  `DESTINOS_BR`, não por um mapa paralelo. */
function rotularProduto(productId: string): string {
  const destino = DESTINOS_BR.find((d) => d.id === productId);
  if (destino) return destino.titulo;
  return productId
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ─── Conta de Luz Express — status MOCK (Conta de Luz Express Wave 2) ──
// Os três estados do fluxo v1: nada enviado · em leitura · parecer
// pronto. DADO LOCAL, trocável pelo seletor visível na própria seção —
// o brief pede os três visíveis para teste. Nenhuma chamada de rede:
// o backend de submissão/entrega não existe (recon backend §1, §6), e
// a CURSOR está construindo storage + email em paralelo. Quando o
// endpoint chegar, `StatusCle` vira resposta de `GET` e o seletor sai.
type EstadoCle = 'nada' | 'em-leitura' | 'pronto';

interface StatusCle {
  estado: EstadoCle;
  /** Protocolo do último envio — null quando nada foi enviado. */
  protocolo: string | null;
  /** Nome do arquivo enviado — null quando nada foi enviado. */
  arquivo: string | null;
  /** ISO do envio — null quando nada foi enviado. */
  enviadoEm: string | null;
  /** ISO da entrega do parecer — só no estado `pronto`. */
  prontoEm: string | null;
}

/** Amostra fixa por estado. Datas FIXAS, não relativas a "hoje" — a
 *  mesma disciplina do progresso mock da Alexandria (FOUNDRY Wave 3). */
const STATUS_CLE_MOCK: Record<EstadoCle, StatusCle> = {
  nada: { estado: 'nada', protocolo: null, arquivo: null, enviadoEm: null, prontoEm: null },
  'em-leitura': {
    estado: 'em-leitura',
    protocolo: 'CLE-20260819-0412',
    arquivo: 'fatura-julho-2026.pdf',
    enviadoEm: '2026-08-19T14:02:00-03:00',
    prontoEm: null,
  },
  pronto: {
    estado: 'pronto',
    protocolo: 'CLE-20260812-0087',
    arquivo: 'fatura-junho-2026.pdf',
    enviadoEm: '2026-08-12T09:31:00-03:00',
    prontoEm: '2026-08-14T17:45:00-03:00',
  },
};

const ROTULO_ESTADO: Record<EstadoCle, string> = {
  nada: 'Nada enviado',
  'em-leitura': 'Em leitura',
  pronto: 'Parecer pronto',
};

export function PerfilPlataforma() {
  const { user, loading, logout, myProducts } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<ProductsResponse | null>(null);
  const [erroProdutos, setErroProdutos] = useState(false);
  const [saindo, setSaindo] = useState(false);
  // Estado MOCK da Conta de Luz Express — trocável pelo seletor da seção.
  const [estadoCle, setEstadoCle] = useState<EstadoCle>('nada');

  useEffect(() => {
    if (!user) return;
    const ctrl = new AbortController();
    myProducts(ctrl.signal)
      .then(setProdutos)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setErroProdutos(true);
      });
    return () => ctrl.abort();
  }, [user, myProducts]);

  // Enquanto `/api/auth/me` não respondeu, ninguém pode concluir "não
  // logado" — só "ainda não sabemos". Redirecionar aqui expulsaria
  // quem TEM sessão válida, a cada carga de página.
  if (loading) {
    return (
      <ContaShell eyebrow="Conta NIVAR" titulo="Perfil">
        <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-muted)' }}>Carregando…</p>
      </ContaShell>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" replace state={{ de: location.pathname }} />;
  }

  const ativados = new Set((produtos?.products ?? []).map((p) => p.productId));
  const ativadoEm = new Map((produtos?.products ?? []).map((p) => [p.productId, p.activatedAt]));

  async function aoSair() {
    setSaindo(true);
    await logout();
    navigate('/br', { replace: true });
  }

  return (
    <ContaShell
      eyebrow="Conta NIVAR"
      titulo="Perfil de plataforma"
      subtitulo="Uma conta para todos os produtos. Cada um ativa quando você entra nele."
      largura="prancha"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* ─── Dados pessoais ─────────────────────────────────── */}
        <Secao numero="01" titulo="Dados pessoais">
          {/* Lista de pares rótulo/valor, de peso deliberadamente
              igual: nome, email e data de cadastro são três fatos do
              mesmo nível sobre a mesma conta, e eleger um como
              dominante inventaria hierarquia que o dado não tem. */}
          <dl
            style={{
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              columnGap: '40px',
              rowGap: '20px',
            }}
          >
            {[
              { rotulo: 'Nome', valor: user.name },
              { rotulo: 'Email', valor: user.email },
              { rotulo: 'Membro desde', valor: formatarData(user.createdAt) },
            ].map((d) => (
              <div key={d.rotulo} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <dt style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>{d.rotulo}</dt>
                {/* overflowWrap: e-mail é uma palavra só, sem espaço —
                    achado na verificação desta wave: sem quebra, um
                    endereço longo vaza da coluna da grade e cola no
                    valor vizinho (Membro desde). Pré-existente na
                    versão Jaguar, exposto aqui pela largura própria do
                    Work Sans; correção de robustez, sem mudança de
                    layout. */}
                <dd
                  style={{
                    margin: 0,
                    ...NT.corpo,
                    fontSize: '16px',
                    color: 'var(--text-strong)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {d.valor}
                </dd>
              </div>
            ))}
          </dl>

          <div
            style={{
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: 'var(--fio) solid var(--rule)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={aoSair}
              disabled={saindo}
              className="conta-botao"
              style={{ width: 'auto' }}
            >
              {saindo ? 'Saindo…' : 'Sair da conta'}
            </button>
            <span style={{ ...NT.nota, color: 'var(--text-muted)' }}>
              Alterar nome, email ou senha ainda não existe — os endpoints de edição não
              foram construídos.
            </span>
          </div>
        </Secao>

        {/* ─── Assinatura ─────────────────────────────────────── */}
        {/* NÃO INVENTAR plano nem preço. O banco tem email, senha,
            google_id, nome e created_at — nada sobre cobrança. Estado
            honesto de ausência — idioma `EmptyState` do sistema
            (components/states/states.css), sem cor de acento: o
            sistema reserva acento para sinal real, e "isto ainda não
            existe" não é sinal, é ausência declarada. */}
        <Secao numero="02" titulo="Assinatura">
          <div
            style={{
              border: '1px dashed var(--rule-strong)',
              borderRadius: 0,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Ainda não existe</span>
            <p style={{ ...NT.corpo, margin: 0, fontSize: '15px', color: 'var(--text-muted)' }}>
              Não há sistema de pagamento nem plano de assinatura — nem aqui, nem por trás.
              Nada é cobrado hoje, e o acesso ao que está aberto não depende disso. Esta
              seção passa a mostrar algo quando a base do produto estiver completa.
            </p>
          </div>
        </Secao>

        {/* ─── Produtos ───────────────────────────────────────── */}
        <Secao
          numero="03"
          titulo="Produtos"
          nota={
            produtos
              ? `${ativados.size} de ${produtos.catalog.length} ativados`
              : undefined
          }
        >
          {erroProdutos ? (
            <p style={{ ...NT.corpo, margin: 0, fontSize: '15px', color: 'var(--text-muted)' }}>
              Não foi possível carregar seus produtos agora. Recarregue a página.
            </p>
          ) : !produtos ? (
            <p style={{ ...NT.corpo, margin: 0, fontSize: '15px', color: 'var(--text-muted)' }}>
              Carregando produtos…
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                borderTop: 'var(--fio) solid var(--rule)',
              }}
            >
              {produtos.catalog.map((id) => {
                const ativo = ativados.has(id);
                const destino = DESTINOS_BR.find((d) => d.id === id);
                const rota = destino?.status === 'disponivel' ? destino.rota : null;
                return (
                  <li
                    key={id}
                    style={{
                      borderBottom: 'var(--fio) solid var(--rule)',
                      padding: '16px 0',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: '20px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ ...NT.titulo2, color: 'var(--text-strong)' }}>
                        {rotularProduto(id)}
                      </span>
                      <span style={{ ...NT.nota, color: 'var(--text-muted)' }}>
                        {ativo
                          ? `Ativado em ${formatarData(ativadoEm.get(id) ?? '')}`
                          : 'Ativa quando você entrar pela primeira vez.'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Sem caixa: idioma `RecentMarker` do sistema —
                          texto em versalete na cor de acento, nunca
                          bolinha nem badge preenchido. */}
                      {ativo ? (
                        <span style={{ ...NT.etiqueta, color: 'var(--accent-house)' }}>Ativado</span>
                      ) : (
                        <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>
                          Não ativado
                        </span>
                      )}
                      {rota && (
                        <Link className="conta-link" to={rota}>
                          Abrir
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <p
            style={{
              ...NT.nota,
              marginTop: '16px',
              marginBottom: 0,
              color: 'var(--text-muted)',
            }}
          >
            O catálogo acima vem do próprio backend — a lista aqui nunca diverge da lista
            que o servidor reconhece.
          </p>
        </Secao>

        {/* ─── Conta de Luz Express ────────────────────────────── */}
        {/* Status do produto ABERTO de Advisory — o parecer chega AQUI,
            no perfil, com aviso por email (v1 decidida). Três estados,
            sem semáforo: texto, fio e protocolo em mono. Dado MOCK com
            seletor visível e rotulado; ver o cabeçalho de STATUS_CLE_MOCK. */}
        <Secao numero="04" titulo="Conta de Luz Express" nota={ROTULO_ESTADO[estadoCle]}>
          <StatusConta status={STATUS_CLE_MOCK[estadoCle]} />

          {/* Seletor de estado — só existe porque o dado é mock. Sai
              junto com o mock quando o endpoint chegar. */}
          <div
            style={{
              marginTop: '4px',
              paddingTop: '12px',
              borderTop: 'var(--fio) solid var(--rule)',
              display: 'flex',
              alignItems: 'baseline',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontWeight: 400,
                fontSize: '10.5px',
                lineHeight: 1.5,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: 'var(--ilustrativa-fg)',
                borderBottom: 'var(--fio) solid var(--ilustrativa-fio)',
                paddingBottom: '2px',
              }}
            >
              Amostra ilustrativa — estado trocável para teste
            </span>
            <div className="nv-modo" role="group" aria-label="Estado de demonstração">
              {(['nada', 'em-leitura', 'pronto'] as const).map((e, i) => (
                <span key={e} style={{ display: 'contents' }}>
                  {i > 0 && (
                    <span className="nv-modo__sep" aria-hidden="true">
                      ·
                    </span>
                  )}
                  <button
                    type="button"
                    className={`nv-modo__op${estadoCle === e ? ' nv-modo__op--ativo' : ''}`}
                    aria-pressed={estadoCle === e}
                    onClick={() => setEstadoCle(e)}
                  >
                    {ROTULO_ESTADO[e]}
                  </button>
                </span>
              ))}
            </div>
          </div>
        </Secao>
      </div>
    </ContaShell>
  );
}

// ─── Peças da prancha ─────────────────────────────────────────────

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Os três estados da Conta de Luz Express no perfil. Sem verde de
 *  sucesso nem amarelo de espera: o estado é TEXTO em etiqueta, e o
 *  único sinal visual é o fio — `--rule-strong` em repouso,
 *  `--accent-house` quando há parecer para abrir. Idioma do
 *  `DataFreshness` do sistema ("frescor de dado não é semáforo"). */
function StatusConta({ status }: { status: StatusCle }) {
  if (status.estado === 'nada') {
    return (
      // Estado vazio DECLARADO — mesmo contorno tracejado das seções
      // "ainda não existe", com a porta de entrada real.
      <div
        style={{
          border: '1px dashed var(--rule-strong)',
          borderRadius: 0,
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Nenhuma fatura enviada</span>
        <p style={{ ...NT.corpo, margin: 0, fontSize: '15px', color: 'var(--text-muted)' }}>
          O parecer de uma fatura chega nesta seção, com aviso por email, depois que a
          leitura terminar. Nada foi enviado por esta conta ainda.
        </p>
        <Link className="conta-link" to="/conta-de-luz-express" style={{ alignSelf: 'flex-start' }}>
          Enviar uma fatura
        </Link>
      </div>
    );
  }

  const pronto = status.estado === 'pronto';
  const linhas: Array<{ k: string; v: React.ReactNode }> = [
    {
      k: 'Protocolo',
      v: (
        <span
          style={{
            fontFamily: 'var(--font-data)',
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums lining-nums',
            color: 'var(--text-strong)',
          }}
        >
          {status.protocolo}
        </span>
      ),
    },
    { k: 'Arquivo', v: status.arquivo },
    { k: 'Enviado em', v: status.enviadoEm ? formatarDataHora(status.enviadoEm) : '—' },
    {
      k: pronto ? 'Parecer em' : 'Situação',
      v: pronto
        ? status.prontoEm
          ? formatarDataHora(status.prontoEm)
          : '—'
        : 'Uma pessoa está lendo a fatura. O aviso por email sai quando o parecer ficar pronto.',
    },
  ];

  return (
    <div
      style={{
        borderLeft: `2px solid ${pronto ? 'var(--accent-house)' : 'var(--rule-strong)'}`,
        paddingLeft: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* // gridalpha-detect-disable-next-line equal-weight-grid — par rótulo/valor no registro do DataTable; não há célula focal numa ficha */}
      <dl
        style={{
          margin: 0,
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          gap: '8px 20px',
          alignItems: 'baseline',
        }}
      >
        {linhas.map((l) => (
          <div key={l.k} style={{ display: 'contents' }}>
            <dt style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>{l.k}</dt>
            <dd style={{ margin: 0, ...NT.corpo, color: 'var(--text-body)', overflowWrap: 'anywhere' }}>
              {l.v}
            </dd>
          </div>
        ))}
      </dl>

      {pronto ? (
        // O parecer é um documento que já existe — DownloadLink do
        // sistema, não botão: "download é link, não botão". O href é
        // MOCK (âncora inerte, rotulada): não existe artefato nem
        // autorização de download no backend (recon backend §6).
        <a
          className="conta-link"
          href="#parecer-mock"
          onClick={(e) => e.preventDefault()}
          aria-describedby="cle-parecer-mock-nota"
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '10px',
            fontFamily: 'var(--font-data)',
            fontSize: '12.5px',
            letterSpacing: '.01em',
          }}
        >
          <span aria-hidden="true" style={{ color: 'var(--text-faint)' }}>
            ↓
          </span>
          {/* Nome + extensão num span só: o gap do flex é entre o glifo
              e o nome, nunca dentro do nome do arquivo. */}
          <span>
            parecer-{status.protocolo?.toLowerCase()}
            <b style={{ fontWeight: 500 }}>.pdf</b>
          </span>
        </a>
      ) : (
        <span style={{ ...NT.nota, color: 'var(--text-muted)' }}>
          Nenhuma ação necessária nesta etapa.
        </span>
      )}
      {pronto && (
        <span
          id="cle-parecer-mock-nota"
          style={{
            fontFamily: 'var(--font-data)',
            fontWeight: 400,
            fontSize: '10.5px',
            lineHeight: 1.5,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}
        >
          Documento de demonstração — o arquivo real chega com o backend
        </span>
      )}
    </div>
  );
}

/** Cabeçalho de seção — número em mono no acento da casa, título em
 *  Zilla Slab, fio e nota alinhados na mesma linha de base. Mesmo
 *  idioma do `SectionHeader` do sistema (components/structure/
 *  structure.css, `.nv-sech`), reproduzido inline pela mesma razão
 *  que o restante desta tela: o CSS de componente do NIVAR ainda não
 *  chegou a `src/design/nivar/`, só os tokens de variável. */
function Secao({
  numero,
  titulo,
  nota,
  children,
}: {
  numero: string;
  titulo: string;
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* // gridalpha-detect-disable-next-line equal-weight-grid — número · título · fio · nota são pesos deliberadamente iguais, idioma SectionHeader do sistema */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto 1fr auto',
          alignItems: 'baseline',
          gap: '14px',
          paddingBottom: '10px',
          borderBottom: 'var(--fio) solid var(--rule-strong)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-data)',
            fontWeight: 500,
            fontSize: '13px',
            lineHeight: 1.2,
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--accent-house)',
          }}
        >
          {numero}
        </span>
        <h2 style={{ ...NT.titulo2, margin: 0, color: 'var(--text-strong)' }}>{titulo}</h2>
        <span
          aria-hidden="true"
          style={{ height: '1px', background: 'var(--rule)', transform: 'translateY(-4px)' }}
        />
        {nota && (
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontWeight: 500,
              fontSize: '10.5px',
              lineHeight: 1.5,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              textAlign: 'right',
            }}
          >
            {nota}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

export default PerfilPlataforma;
