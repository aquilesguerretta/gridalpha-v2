// ContaDeLuzExpressPage — ARCHITECT, Conta de Luz Express Wave 2.
//
// A superfície de intake do produto. Rota de TOPO (`/conta-de-luz-express`,
// `main.tsx`), no precedente exato da Alexandria — a recon desta trilha
// (`docs/conta-luz-express-recon-frontend.md`, §5 Opção A) mediu que a
// página de família nunca hospeda produto, só aponta para ele.
//
// UMA TELA, NÃO UM ROUTER. O fluxo v1 é upload → enviar → confirmação;
// intake e confirmação são ESTADOS desta tela, não telas. Montar um
// splat `/conta-de-luz-express/*` para isso seria estrutura maior que
// o necessário (Fase 1 da Wave 2, H3). Quando a v2 trouxer histórico
// ou tela de relatório, vira splat sem migração — o padrão `/x/*` já
// existe para copiar.
//
// FIAÇÃO REAL (Wave 3). O envio é `POST /api/conta-luz-express/
// submissions`, multipart, campo `file` — contrato lido em
// `app/routers/conta_luz.py` e MEDIDO ao vivo (recon, adendo Wave 3).
// O cookie de sessão do AuthProvider viaja por `credentials: 'include'`,
// caminho relativo, como o `authApi.ts` já faz.
//
// ATIVAÇÃO ANTES DO ENVIO: o POST exige entitlement (`403` sem ele —
// medido). O padrão é o do PerfilStub da Alexandria: `myProducts()`
// primeiro, `activateProduct` só se faltar — idempotente no backend,
// mas idempotente não é motivo para gastar escrita a cada envio.
//
// O backend responde `503` com o nome da variável de ambiente ausente
// enquanto o email do operador não estiver configurado em produção
// (CLE_APP_BASE_URL / CLE_OPERATOR_EMAIL / RESEND_API_KEY /
// CLE_EMAIL_FROM). É guarda dele, não defeito daqui: a tela trata o
// 503 como estado declarado, sem fingir que enviou.
//
// SEM COMPONENTE DE UPLOAD NO SISTEMA: o NIVAR não tem `FileInput`
// (verificado na Fase 2, zero ocorrência em `components/`). Composto a
// partir do que existe — caixa de fio (`.nv-campo__caixa`), botão
// primário e `Tag` — em vez de inventar zona tracejada de drag-and-drop,
// que é vocabulário de SaaS.

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

import { useAuth } from '../../lib/auth/AuthContext';
import { AuthError } from '../../lib/auth/authApi';

// Tokens NIVAR — só arquivos de VARIÁVEL, como PortalBR e FamiliaPage.
// base.css fica de fora: restila elemento global e vazaria para outras
// superfícies; o que ele daria entra escopado em FOLHA_PORTAL.
import '../../design/nivar/fonts.css';
import '../../design/nivar/colors.css';
import '../../design/nivar/typography.css';
import '../../design/nivar/space.css';
import '../../design/nivar/motion.css';

import { FOLHA_PORTAL, WordmarkNivar } from '../../components/br/portalChrome';
// PlantaBaixa está VIVA (PortalBR.tsx a importa para o overlay "em
// breve") e já tem a geometria de `conta-de-luz-express` desenhada —
// é o ponto de partida, não redesenho. `DestinoCard` em si é código
// morto desde a Wave 8 e NÃO é tocado; só a exportação é lida.
import { PlantaBaixa } from '../../components/br/DestinoCard';

const PRODUTO_ID = 'conta-de-luz-express';
const MEDIDA = '1200px';
const RESPIRO_LATERAL = '32px';
const MEDIDA_FORM = '62ch';

/** Tipos aceitos no intake v1 — PDF ou imagem. A extensão é exibida
 *  ao usuário, a lista é o `accept` do input. Nenhum limite de tamanho
 *  declarado: o contrato de storage não existe (recon backend §1), e
 *  inventar um número aqui seria promessa sem dono. */
const TIPOS_ACEITOS = 'application/pdf,image/jpeg,image/png,image/webp';
const EXTENSOES_LEGIVEIS = 'PDF · JPG · PNG · WEBP';

// Papéis tipográficos — declarados localmente, como todo componente do
// Portal faz (ver a razão em portalChrome.tsx e PortalBR.tsx).
const NT = {
  etiqueta: {
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    fontSize: 'var(--ts-etiqueta)',
    lineHeight: 'var(--lh-etiqueta)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-etiqueta)',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  proc: {
    fontFamily: 'var(--font-data)',
    fontWeight: 400,
    fontSize: '10.5px',
    lineHeight: 1.5,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontVariantNumeric: 'tabular-nums lining-nums',
  } satisfies CSSProperties,
  display3: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-display-3)',
    lineHeight: 'var(--lh-display-3)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-display-3)',
  } satisfies CSSProperties,
  titulo2: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-titulo-2)',
    lineHeight: 'var(--lh-titulo-2)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-titulo-2)',
  } satisfies CSSProperties,
  lede: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo-leve)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-lede)',
    lineHeight: 'var(--lh-lede)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-lede)',
  } satisfies CSSProperties,
  corpo: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-corpo)',
    lineHeight: 'var(--lh-corpo)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
  nota: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-nota)',
    lineHeight: 'var(--lh-nota)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
} as const;

/** View transition quando o browser suporta; fallback seco. Mesma
 *  função do FamiliaPage — copiada, não importada, porque a página
 *  de família não a exporta e importar página de página criaria o
 *  ciclo que o Portal evita. */
function comTransicao(mudanca: () => void) {
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduzido && 'startViewTransition' in document) {
    document.startViewTransition(() => {
      flushSync(mudanca);
    });
  } else {
    mudanca();
  }
}

/** Data e hora no fuso do leitor — o backend devolve ISO com offset. */
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

/** Tamanho legível, vírgula decimal e espaço como o sistema manda. */
function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} KB`;
  const mb = kb / 1024;
  return `${mb.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`;
}

// ─── Contrato do backend (CURSOR Wave 2) ────────────────────────────
// Forma EXATA de `_submission_payload` em app/routers/conta_luz.py.
// Exportada para o PerfilPlataforma ler o status com o mesmo tipo —
// nenhum arquivo novo é posse desta wave, então o cliente mora aqui.
export interface ArquivoSubmissao {
  filename: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  /** Relativo — `/api/conta-luz-express/submissions/{id}/{source|deliverable}`. */
  downloadUrl: string;
}

export interface Submissao {
  id: string;
  productId: 'conta-de-luz-express';
  /** Os DOIS estados do backend. "Nada enviado" não é status: é lista vazia. */
  status: 'submitted' | 'ready';
  source: ArquivoSubmissao;
  /** Só com `status === 'ready'`; já traz o `downloadUrl` do PDF final. */
  deliverable: ArquivoSubmissao | null;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
}

export interface ListaSubmissoes {
  data: Submissao[];
  summary: { count: number; submitted: number; ready: number };
}

const BASE = '/api/conta-luz-express';

/** Lê `{"detail": "..."}` do backend e devolve `AuthError` com o
 *  status preservado — o mesmo idioma do `pedir()` de authApi.ts, que
 *  não serve aqui porque só fala JSON e o envio é multipart. */
async function falhar(res: Response): Promise<never> {
  let detalhe = `HTTP ${res.status}`;
  try {
    const corpo = (await res.json()) as { detail?: unknown };
    if (typeof corpo?.detail === 'string') detalhe = corpo.detail;
  } catch {
    /* corpo não-JSON: fica o status */
  }
  throw new AuthError(detalhe, res.status);
}

/** `POST /submissions` — multipart, campo `file`. Sem `Content-Type`
 *  manual: o browser põe o boundary.
 *
 *  Exportar função de um arquivo de componente desliga o Fast Refresh
 *  deste arquivo em dev (reload completo em vez de HMR) — só em dev,
 *  zero efeito em produção. Aceito de propósito: a wave não tem posse
 *  para criar `src/lib/contaLuz/api.ts`, e duplicar o cliente no perfil
 *  criaria a "segunda cópia que deriva" do contrato. PENDÊNCIA: mover
 *  cliente + tipos para `src/lib/` quando uma wave tiver essa posse. */
// eslint-disable-next-line react-refresh/only-export-components
export async function enviarSubmissao(arquivo: File, signal?: AbortSignal): Promise<Submissao> {
  const fd = new FormData();
  fd.append('file', arquivo, arquivo.name);
  let res: Response;
  try {
    res = await fetch(`${BASE}/submissions`, {
      method: 'POST',
      body: fd,
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    throw new AuthError(err instanceof Error ? err.message : 'Falha de rede.', 0);
  }
  if (!res.ok) return falhar(res);
  return (await res.json()) as Submissao;
}

/** `GET /submissions` — as submissões da conta, mais recente primeiro. */
// eslint-disable-next-line react-refresh/only-export-components
export async function listarSubmissoes(signal?: AbortSignal): Promise<ListaSubmissoes> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/submissions`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    throw new AuthError(err instanceof Error ? err.message : 'Falha de rede.', 0);
  }
  if (!res.ok) return falhar(res);
  return (await res.json()) as ListaSubmissoes;
}

/** O que a tela diz para cada status do backend. Sem semáforo: é texto.
 *  Os números vêm das guardas reais do router, na ordem em que disparam. */
function mensagemDeErro(err: unknown): string {
  if (!(err instanceof AuthError)) return 'Algo falhou do nosso lado. Tente de novo em instantes.';
  switch (err.status) {
    case 0:
      return 'Não foi possível falar com o servidor. Verifique a conexão.';
    case 401:
      return 'A sessão expirou. Entre de novo para enviar.';
    case 403:
      return 'O produto não está ativo nesta conta. Recarregue a página e tente de novo.';
    case 413:
      return 'Arquivo grande demais. O limite é 15 MB.';
    case 415:
      return `Formato não aceito pelo servidor. Envie ${EXTENSOES_LEGIVEIS}.`;
    case 502:
      return 'O aviso ao operador falhou e o envio não foi registrado. Tente de novo em instantes.';
    case 503:
      // Guarda de produção do backend: configuração de email ausente.
      // Não fingir que enviou — declarar.
      return 'O recebimento de faturas ainda não está ligado neste ambiente. O envio não foi registrado.';
    default:
      return 'Algo falhou do nosso lado. Tente de novo em instantes.';
  }
}

type Etapa = 'intake' | 'confirmado';

export function ContaDeLuzExpressPage() {
  const navigate = useNavigate();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [modo, setModo] = useState<'claro' | 'noturno'>('claro');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<Etapa>('intake');
  const [submissao, setSubmissao] = useState<Submissao | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [plantaVisivel, setPlantaVisivel] = useState(false);
  const { user, loading, myProducts, activateProduct } = useAuth();
  const location = useLocation();

  // Identidade de documento — entra e sai com a página, como o Portal.
  useEffect(() => {
    const anterior = document.title;
    document.title = 'NIVAR — Conta de Luz Express';
    return () => {
      document.title = anterior;
    };
  }, []);

  // A planta desenha no primeiro paint — mesma revelação por traço do
  // card de destino que ela ilustrava.
  useEffect(() => {
    const t = window.requestAnimationFrame(() => setPlantaVisivel(true));
    return () => window.cancelAnimationFrame(t);
  }, []);

  function aoEscolher(lista: FileList | null) {
    setErro(null);
    const f = lista?.[0] ?? null;
    if (!f) {
      setArquivo(null);
      return;
    }
    // Validação de TIPO só — é o que dá para afirmar sem contrato de
    // storage. O `accept` do input já filtra o diálogo; isto cobre
    // arrastar-e-soltar e browser que ignora `accept`.
    if (!TIPOS_ACEITOS.split(',').includes(f.type)) {
      setArquivo(null);
      setErro(`Formato não aceito. Envie ${EXTENSOES_LEGIVEIS}.`);
      return;
    }
    setArquivo(f);
  }

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!arquivo || enviando) return;
    setErroEnvio(null);
    setEnviando(true);
    try {
      // Entitlement primeiro — o POST devolve 403 sem ele (medido).
      // Consulta antes de ativar: idempotente no backend, mas não é
      // motivo para uma escrita por envio.
      const { products } = await myProducts();
      if (!products.some((p) => p.productId === PRODUTO_ID)) {
        await activateProduct(PRODUTO_ID);
      }
      const criada = await enviarSubmissao(arquivo);
      setSubmissao(criada);
      comTransicao(() => setEtapa('confirmado'));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setErroEnvio(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  function novoEnvio() {
    setArquivo(null);
    setErro(null);
    setErroEnvio(null);
    setSubmissao(null);
    if (inputRef.current) inputRef.current.value = '';
    comTransicao(() => setEtapa('intake'));
  }

  // Rota protegida — o envio é por conta. Enquanto `/api/auth/me` não
  // respondeu ninguém conclui "não logado"; só com `loading === false`
  // e sem usuário é que vai para /entrar, carregando o destino para
  // voltar aqui (mesmo mecanismo do PerfilPlataforma).
  if (!loading && !user) {
    return <Navigate to="/entrar" replace state={{ de: location.pathname }} />;
  }

  return (
    <div
      lang="pt-BR"
      data-nv-page=""
      data-mode={modo === 'noturno' ? 'noturno' : undefined}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--surface-page)',
        color: 'var(--text-body)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--ts-corpo)',
        lineHeight: 'var(--lh-corpo)',
        borderRadius: 0,
      }}
    >
      <style>{FOLHA_PORTAL}</style>
      <style>{`
        /* Campo de arquivo — a caixa de fio do sistema (.nv-campo__caixa)
           envolvendo o controle nativo. O <input type=file> fica
           visualmente integrado, sem caixa própria de browser. */
        .cle-arquivo {
          display: flex;
          align-items: stretch;
          border: var(--fio) solid var(--campo-fio);
          border-radius: 0;
          background: none;
          transition: border-color var(--dur-estado) var(--ease);
        }
        .cle-arquivo:hover { border-color: var(--fio-hover); }
        .cle-arquivo:focus-within {
          border-color: var(--accent-focus);
          outline: 2px solid var(--accent-focus);
          outline-offset: 2px;
        }
        .cle-arquivo--erro { border-color: var(--campo-erro-fio); }
        /* O <input type=file> fica INVISÍVEL por cima do desenho, como o
           sistema faz no Slider: teclado, leitor de tela e o diálogo
           nativo continuam funcionando; o que se vê é o nosso — o texto
           "Choose File / No file chosen" do browser é em inglês e não
           aceita tradução. */
        .cle-arquivo__zona {
          position: relative;
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 11px;
        }
        .cle-arquivo__ctrl {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          opacity: 0;
          cursor: pointer;
        }
        .cle-arquivo__botao {
          flex: none;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: .02em;
          line-height: 1;
          color: var(--text-strong);
          border: var(--fio) solid var(--rule-heavy);
          border-radius: 0;
          padding: 6px 11px;
          transition: color var(--dur-hover) var(--ease), border-color var(--dur-hover) var(--ease);
        }
        .cle-arquivo__zona:hover .cle-arquivo__botao {
          color: var(--fg-hover);
          border-color: var(--fio-hover);
        }
        .cle-arquivo__nome {
          flex: 1;
          min-width: 0;
          font-family: var(--font-body);
          font-weight: 400;
          font-size: 14px;
          line-height: 1.2;
          color: var(--text-strong);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cle-arquivo__nome--vazio { color: var(--text-faint); font-weight: 300; }
        /* Botão desabilitado — regra do sistema (button.css), que a
           FOLHA_PORTAL não carrega porque o Portal nunca precisou. */
        .nv-btn:disabled { opacity: .4; cursor: not-allowed; }
        .cle-arquivo__sufixo {
          display: flex;
          align-items: center;
          padding: 0 11px;
          border-left: var(--fio) solid var(--campo-fio);
          font-family: var(--font-data);
          font-size: 10.5px;
          letter-spacing: .07em;
          text-transform: uppercase;
          color: var(--text-faint);
          white-space: nowrap;
        }
        .cle-arquivo--erro .cle-arquivo__sufixo { border-left-color: var(--campo-erro-fio); }
      `}</style>

      {/* Faixa incandescente do topo — a mesma do Portal. */}
      <span
        aria-hidden="true"
        style={{ flexShrink: 0, height: '4px', background: 'var(--gradiente-incandescente)' }}
      />

      <header
        style={{
          flexShrink: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          padding: `0 ${RESPIRO_LATERAL}`,
          borderBottom: 'var(--fio) solid var(--rule)',
          background: 'var(--surface-page)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/br"
            aria-label="NIVAR — voltar ao Portal Brasil"
            onClick={(e) => {
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              comTransicao(() => navigate('/br'));
            }}
            style={{ display: 'inline-flex', textDecoration: 'none', border: 'none' }}
          >
            <WordmarkNivar altura={30} idSufixo="cle-cabecalho" />
          </Link>
          <span
            aria-hidden="true"
            style={{ width: '1px', height: '14px', background: 'var(--rule)' }}
          />
          <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>Conta de Luz Express</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <Link
            className="nv-btn nv-btn--secundario"
            to="/br/familia/advisory"
            onClick={(e) => {
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              comTransicao(() => navigate('/br/familia/advisory'));
            }}
          >
            <span className="nv-btn__glifo" aria-hidden="true">
              ←
            </span>
            Advisory
          </Link>
          <span
            aria-hidden="true"
            style={{ width: '1px', height: '12px', background: 'var(--rule)' }}
          />
          <div className="nv-modo" role="group" aria-label="Modo de exibição">
            <button
              type="button"
              className={`nv-modo__op${modo === 'claro' ? ' nv-modo__op--ativo' : ''}`}
              aria-pressed={modo === 'claro'}
              onClick={() => setModo('claro')}
            >
              claro
            </button>
            <span className="nv-modo__sep" aria-hidden="true">
              ·
            </span>
            <button
              type="button"
              className={`nv-modo__op${modo === 'noturno' ? ' nv-modo__op--ativo' : ''}`}
              aria-pressed={modo === 'noturno'}
              onClick={() => setModo('noturno')}
            >
              noturno
            </button>
          </div>
        </div>
      </header>

      <main
        tabIndex={0}
        aria-label="Conta de Luz Express — conteúdo rolável"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
      >
        <div style={{ maxWidth: MEDIDA, margin: '0 auto', padding: `0 ${RESPIRO_LATERAL}` }}>
          {/* ─── Identidade do produto ─────────────────────────────
              Marcador na cor da família (Advisory — como FIO, nunca
              texto: 1,9:1 sobre papel), nome, e a descrição do
              CATÁLOGO verbatim — a linha pública já existe em
              br-destinos.ts e não é redigitada com palavras novas. */}
          <section
            aria-label="Conta de Luz Express — o produto"
            style={{
              padding: '32px 0',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 380px)',
              gap: '32px',
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: '22px',
                    height: '3px',
                    background: 'var(--family-advisory)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>
                  Advisory · parecer e contraditório
                </span>
              </span>
              <h1 style={{ ...NT.display3, margin: 0, color: 'var(--text-strong)' }}>
                Conta de Luz Express
              </h1>
              <p style={{ ...NT.lede, margin: 0, color: 'var(--text-muted)', maxWidth: MEDIDA_FORM }}>
                Análise independente de fatura industrial — modalidade, demanda e oportunidades a
                validar.
              </p>
              <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-body)', maxWidth: MEDIDA_FORM }}>
                A fatura é lida por uma pessoa, não por um motor. O parecer sai com o
                contraditório produzido junto — a conclusão vem acompanhada do argumento que
                a contesta. Nenhuma economia é prometida: o que existe são oportunidades a
                validar contra o contrato real.
              </p>
            </div>

            {/* A planta baixa do produto — a MESMA geometria que ilustrava
                o card no Portal antes da Wave 8. Fio da família Software
                (é o que a PlantaBaixa desenha para todo produto
                instrumentado); o fio de acento desta página é Advisory. */}
            <div
              aria-hidden="true"
              style={{
                border: 'var(--fio) solid var(--rule)',
                padding: '16px',
              }}
            >
              <PlantaBaixa destinoId={PRODUTO_ID} visivel={plantaVisivel} altura={180} />
            </div>
          </section>

          {/* ─── 01 · Envio ──────────────────────────────────────── */}
          <section
            aria-label="Envio da fatura"
            aria-live="polite"
            style={{
              padding: '32px 0',
              borderTop: 'var(--fio) solid var(--rule)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>01</span>
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>
                {etapa === 'intake' ? 'Envio da fatura' : 'Fatura recebida'}
              </span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                {etapa === 'intake' ? EXTENSOES_LEGIVEIS : 'registrada'}
              </span>
            </div>

            {etapa === 'intake' ? (
              <form
                onSubmit={aoEnviar}
                noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: MEDIDA_FORM }}
              >
                <div style={{ display: 'grid', gap: '6px' }}>
                  <label htmlFor={inputId} style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>
                    Fatura de energia
                    <span
                      aria-hidden="true"
                      style={{
                        marginLeft: '3px',
                        fontFamily: 'var(--font-data)',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: 'var(--accent-house)',
                      }}
                    >
                      *
                    </span>
                    <span className="nv-sr"> obrigatório</span>
                  </label>
                  <div className={`cle-arquivo${erro ? ' cle-arquivo--erro' : ''}`}>
                    <div className="cle-arquivo__zona">
                      <input
                        ref={inputRef}
                        id={inputId}
                        className="cle-arquivo__ctrl"
                        type="file"
                        accept={TIPOS_ACEITOS}
                        aria-invalid={erro ? 'true' : undefined}
                        aria-describedby={`${inputId}-ajuda`}
                        onChange={(e) => aoEscolher(e.target.files)}
                      />
                      <span className="cle-arquivo__botao" aria-hidden="true">
                        Escolher arquivo
                      </span>
                      <span
                        className={`cle-arquivo__nome${arquivo ? '' : ' cle-arquivo__nome--vazio'}`}
                        aria-hidden="true"
                      >
                        {arquivo ? arquivo.name : 'Nenhum arquivo escolhido'}
                      </span>
                    </div>
                    <span className="cle-arquivo__sufixo" aria-hidden="true">
                      {arquivo ? formatarTamanho(arquivo.size) : 'pdf · imagem'}
                    </span>
                  </div>
                  {erro ? (
                    <span
                      id={`${inputId}-ajuda`}
                      style={{ ...NT.nota, display: 'flex', gap: '6px', color: 'var(--campo-erro-texto)' }}
                    >
                      <i
                        aria-hidden="true"
                        style={{ fontFamily: 'var(--font-data)', fontStyle: 'normal', color: 'var(--campo-erro-fio)' }}
                      >
                        ×
                      </i>
                      {erro}
                    </span>
                  ) : (
                    <span id={`${inputId}-ajuda`} style={{ ...NT.nota, color: 'var(--text-faint)' }}>
                      A fatura completa, com as páginas de demanda e de tributos. Uma por envio.
                    </span>
                  )}
                </div>

                {arquivo && (
                  // Tag do sistema — retângulo de fio, sem preenchimento.
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: '10px',
                      padding: '4px 8px',
                      border: 'var(--fio) solid var(--tag-fio)',
                      borderRadius: 0,
                    }}
                  >
                    <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>{arquivo.name}</span>
                    <span style={{ ...NT.proc, color: 'var(--text-faint)' }}>
                      {arquivo.type.replace('application/', '').replace('image/', '')}
                    </span>
                  </span>
                )}

                {erroEnvio && (
                  // Erro de rede/servidor — mesmo padrão do erro de campo: fio
                  // em brasa e glifo ×, texto carrega a leitura. role=alert
                  // para o leitor de tela anunciar sem precisar de foco.
                  <div
                    role="alert"
                    style={{
                      ...NT.corpo,
                      fontSize: '13.5px',
                      color: 'var(--text-strong)',
                      borderTop: '2px solid var(--campo-erro-fio)',
                      paddingTop: '10px',
                      display: 'flex',
                      gap: '8px',
                    }}
                  >
                    <i
                      aria-hidden="true"
                      style={{ fontFamily: 'var(--font-data)', fontStyle: 'normal', color: 'var(--campo-erro-fio)' }}
                    >
                      ×
                    </i>
                    <span>{erroEnvio}</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {/* Estado de carregamento: o rótulo muda e o botão trava
                      (disabled → opacidade .4 do sistema). Sem spinner —
                      o sistema não tem um; o texto declara a espera. */}
                  <button
                    type="submit"
                    className="nv-btn nv-btn--primario"
                    disabled={!arquivo || enviando || loading}
                    aria-busy={enviando || undefined}
                  >
                    {enviando ? 'Enviando…' : 'Enviar para análise'}
                    {!enviando && (
                      <span className="nv-btn__glifo" aria-hidden="true">
                        →
                      </span>
                    )}
                  </button>
                  <span style={{ ...NT.nota, color: 'var(--text-muted)' }} aria-live="polite">
                    {enviando ? 'A fatura está subindo para o servidor.' : 'Sem cobrança nesta etapa.'}
                  </span>
                </div>
              </form>
            ) : (
              /* Confirmação — estado da mesma tela, não tela nova. Sem
                 verde de sucesso: texto, fio e o id da submissão em mono. */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: MEDIDA_FORM }}>
                {/* // gridalpha-detect-disable-next-line equal-weight-grid — par rótulo/valor no registro do DataTable do sistema; não há célula focal numa ficha de três linhas */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto minmax(0, 1fr)',
                    gap: '8px 20px',
                    alignItems: 'baseline',
                    borderTop: 'var(--fio) solid var(--rule)',
                    borderBottom: 'var(--fio) solid var(--rule)',
                    padding: '12px 0',
                  }}
                >
                  {/* Tudo abaixo vem da RESPOSTA do backend — nome, tamanho e
                      id são o que foi gravado, não o que o browser tinha. */}
                  <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Arquivo</span>
                  <span style={{ ...NT.corpo, color: 'var(--text-strong)', overflowWrap: 'anywhere' }}>
                    {submissao?.source.filename}
                    {submissao && (
                      <span style={{ ...NT.proc, color: 'var(--text-faint)', marginLeft: '10px' }}>
                        {formatarTamanho(submissao.source.sizeBytes)}
                      </span>
                    )}
                  </span>
                  <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Protocolo</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: 'var(--ts-dado-4)',
                      fontWeight: 500,
                      color: 'var(--text-strong)',
                      fontVariantNumeric: 'tabular-nums lining-nums',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {submissao?.id}
                  </span>
                  <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Recebida em</span>
                  <span style={{ ...NT.corpo, color: 'var(--text-body)' }}>
                    {submissao ? formatarDataHora(submissao.createdAt) : '—'}
                  </span>
                  <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Prazo</span>
                  <span style={{ ...NT.corpo, color: 'var(--text-body)' }}>
                    O parecer chega no perfil da conta, com aviso por email, quando a leitura
                    terminar.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <Link
                    className="nv-btn nv-btn--primario"
                    to="/conta"
                    onClick={(e) => {
                      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                      e.preventDefault();
                      comTransicao(() => navigate('/conta'));
                    }}
                  >
                    Ver no perfil
                    <span className="nv-btn__glifo" aria-hidden="true">
                      →
                    </span>
                  </Link>
                  <button type="button" className="nv-btn nv-btn--terciario" onClick={novoEnvio}>
                    Enviar outra fatura
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ─── 02 · Como funciona ─────────────────────────────────
              Três passos, declarados — nenhum é automático nesta fase. */}
          <section
            aria-label="Como funciona"
            style={{
              padding: '32px 0',
              borderTop: 'var(--fio) solid var(--rule)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>02</span>
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Como funciona</span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>leitura manual</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                borderTop: 'var(--fio) solid var(--rule)',
                borderBottom: 'var(--fio) solid var(--rule)',
              }}
            >
              {[
                {
                  n: '1',
                  t: 'A fatura entra',
                  d: 'PDF ou imagem, uma por envio. Fica associada à conta que enviou.',
                },
                {
                  n: '2',
                  t: 'Uma pessoa lê',
                  d: 'Modalidade tarifária, demanda contratada e medida, tributos e encargos. Sem motor automático nesta fase.',
                },
                {
                  n: '3',
                  t: 'O parecer volta ao perfil',
                  d: 'Com o contraditório junto. Um email avisa quando estiver pronto.',
                },
              ].map((passo, i) => (
                <div
                  key={passo.n}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '20px 24px',
                    borderLeft: i > 0 ? 'var(--fio) solid var(--rule)' : 'none',
                  }}
                >
                  <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>
                    {passo.n.padStart(2, '0')}
                  </span>
                  <span style={{ ...NT.titulo2, color: 'var(--text-strong)' }}>{passo.t}</span>
                  <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-muted)' }}>{passo.d}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer
          style={{
            position: 'relative',
            borderTop: 'var(--fio) solid var(--rule-strong)',
            background: 'var(--surface-sunken)',
            overflow: 'hidden',
          }}
        >
          <span aria-hidden="true" className="nivar-textura-rede" />
          <div
            style={{
              position: 'relative',
              maxWidth: MEDIDA,
              margin: '0 auto',
              padding: `24px ${RESPIRO_LATERAL}`,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
              <WordmarkNivar altura={17} idSufixo="cle-rodape" />
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Conta de Luz Express</span>
            </span>
            <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
              Não vende energia · não intermedia contrato · não recebe comissão
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default ContaDeLuzExpressPage;
