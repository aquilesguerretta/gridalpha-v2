// SolarProposalValidatorPage — ARCHITECT, Solar Proposal Validator
// Wave 2 · Fase 3.
//
// A superfície de intake do segundo produto Advisory. Rota de TOPO
// (precedente exato de `/conta-de-luz-express` — a página de família
// nunca hospeda produto, só aponta para ele). ADAPTADA da
// ContaDeLuzExpressPage: a recon desta trilha
// (`docs/solar-proposal-validator-recon-frontend.md`, §4) mediu que
// estrutura, zona de upload, helpers e lógica de estado eram reusáveis
// quase inteiros, e enumerou as 17 âncoras de copy a reescrever. A
// copy nova vem do MÓDULO 11 da Alexandria
// (`alexandria-modulo-11-content.ts`), lido antes de escrever — é a
// especificação mais completa do produto no repositório: eixos do
// relatório, classificador de porte, roteador de regime, duas trilhas
// de leitura e os três vereditos.
//
// MODO DEMONSTRAÇÃO, ZERO REDE — o precedente da CLE Wave 2. O
// `status` do produto no catálogo NÃO é 'disponivel' nesta wave (regra
// absoluta do brief): o backend da CURSOR aterrissou na árvore em
// paralelo, mas ativação e envio real são a próxima wave, junto com a
// guarda de rota por sessão (o mesmo par que a CLE Wave 3 trouxe
// junto). O envio aqui produz um protocolo SINTÉTICO, rotulado de
// demonstração na tela — nada afirma recebimento.
//
// Os TIPOS vêm de `src/lib/submissoes` (Fase 2 desta wave) — quando a
// fiação real chegar, a troca é `submissaoDemonstracao(arquivo)` →
// `criarClienteSubmissoes(PREFIXO).enviar(arquivo)`, e o resto da
// tela não muda.
//
// DISCIPLINA DE LINGUAGEM (regra do projeto, e a linguagem de saída
// que o próprio Módulo 11 declara): nenhuma economia é prometida —
// "oportunidades a validar", nunca "economize X%".

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

// Tokens NIVAR — só arquivos de VARIÁVEL, como toda superfície do
// Portal. base.css fica de fora: restila elemento global e vazaria.
import '../../design/nivar/fonts.css';
import '../../design/nivar/colors.css';
import '../../design/nivar/typography.css';
import '../../design/nivar/space.css';
import '../../design/nivar/motion.css';

import { FOLHA_PORTAL, WordmarkNivar } from '../../components/br/portalChrome';
// A planta baixa do produto — `PLANTA_GENERICA` cobre até a geometria
// própria entrar em `PLANTAS` (recon §3.1: fallback, nunca quebra).
import { PlantaBaixa } from '../../components/br/DestinoCard';
import type { Submissao } from '../../lib/submissoes/api';

const PRODUTO_ID = 'solar-proposal-validator';
const MEDIDA = '1200px';
const RESPIRO_LATERAL = '32px';
const MEDIDA_FORM = '62ch';

/** Tipos aceitos no intake — proposta comercial também chega como PDF
 *  ou imagem (recon §4: a constante da CLE é reusável como está). */
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
    fontSize: '13px',
    lineHeight: 1.55,
  } satisfies CSSProperties,
} as const;

/** startViewTransition com checagem de suporte — mesma técnica e mesma
 *  duplicação deliberada das outras superfícies do Portal. */
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

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} KB`;
  const mb = kb / 1024;
  return `${mb.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`;
}

/** A submissão SINTÉTICA da demonstração. Nada sai desta tela: o
 *  protocolo é gerado localmente e rotulado como ilustrativo em toda
 *  aparição. Quando a fiação real chegar, esta função morre e o
 *  `enviar()` de `src/lib/submissoes` entra no lugar. */
function submissaoDemonstracao(arquivo: File): Submissao {
  const agora = new Date().toISOString();
  return {
    id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
    productId: PRODUTO_ID,
    status: 'submitted',
    source: {
      filename: arquivo.name,
      contentType: arquivo.type,
      sizeBytes: arquivo.size,
      sha256: '',
      downloadUrl: '',
    },
    deliverable: null,
    createdAt: agora,
    updatedAt: agora,
    deliveredAt: null,
  };
}

type Etapa = 'intake' | 'confirmado';

export function SolarProposalValidatorPage() {
  const navigate = useNavigate();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [modo, setModo] = useState<'claro' | 'noturno'>('claro');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<Etapa>('intake');
  const [submissao, setSubmissao] = useState<Submissao | null>(null);
  const [plantaVisivel, setPlantaVisivel] = useState(false);

  // Identidade de documento — entra e sai com a página, como o Portal.
  useEffect(() => {
    const anterior = document.title;
    document.title = 'NIVAR — Solar Proposal Validator';
    return () => {
      document.title = anterior;
    };
  }, []);

  // A planta desenha no primeiro paint — mesma revelação por traço.
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
    // Validação de TIPO só — mesma regra da CLE: o `accept` do input já
    // filtra o diálogo; isto cobre arrastar-e-soltar e browser que
    // ignora `accept`.
    if (!TIPOS_ACEITOS.split(',').includes(f.type)) {
      setArquivo(null);
      setErro(`Formato não aceito. Envie ${EXTENSOES_LEGIVEIS}.`);
      return;
    }
    setArquivo(f);
  }

  function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!arquivo) return;
    // ZERO REDE: a demonstração gera o protocolo localmente. A fiação
    // real (ativação + POST multipart) entra na wave que virar o
    // `status` do produto — junto com a guarda de rota por sessão,
    // como a CLE Wave 3 fez.
    setSubmissao(submissaoDemonstracao(arquivo));
    comTransicao(() => setEtapa('confirmado'));
  }

  function novoTeste() {
    setArquivo(null);
    setErro(null);
    setSubmissao(null);
    if (inputRef.current) inputRef.current.value = '';
    comTransicao(() => setEtapa('intake'));
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
        /* Campo de arquivo — as MESMAS oito classes da CLE (recon §4:
           reusável como está; o prefixo é só nome). O <input type=file>
           fica invisível por cima do desenho — o texto "Choose File /
           No file chosen" do browser é em inglês e não aceita
           tradução. */
        .spv-arquivo {
          display: flex;
          align-items: stretch;
          border: var(--fio) solid var(--campo-fio);
          border-radius: 0;
          background: none;
          transition: border-color var(--dur-estado) var(--ease);
        }
        .spv-arquivo:hover { border-color: var(--fio-hover); }
        .spv-arquivo:focus-within {
          border-color: var(--accent-focus);
          outline: 2px solid var(--accent-focus);
          outline-offset: 2px;
        }
        .spv-arquivo--erro { border-color: var(--campo-erro-fio); }
        .spv-arquivo__zona {
          position: relative;
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 11px;
        }
        .spv-arquivo__ctrl {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          opacity: 0;
          cursor: pointer;
        }
        .spv-arquivo__botao {
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
        .spv-arquivo__zona:hover .spv-arquivo__botao {
          color: var(--fg-hover);
          border-color: var(--fio-hover);
        }
        .spv-arquivo__nome {
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
        .spv-arquivo__nome--vazio { color: var(--text-faint); font-weight: 300; }
        /* Botão desabilitado — regra do sistema (button.css), que a
           FOLHA_PORTAL não carrega porque o Portal nunca precisou. */
        .nv-btn:disabled { opacity: .4; cursor: not-allowed; }
        .spv-arquivo__sufixo {
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
        .nv-sr {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>

      {/* Faixa incandescente do topo — a mesma de toda superfície NIVAR. */}
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
            <WordmarkNivar altura={30} idSufixo="spv-cabecalho" />
          </Link>
          <span
            aria-hidden="true"
            style={{ width: '1px', height: '14px', background: 'var(--rule)' }}
          />
          <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>
            Solar Proposal Validator
          </span>
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
        aria-label="Solar Proposal Validator — conteúdo rolável"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
      >
        <div style={{ maxWidth: MEDIDA, margin: '0 auto', padding: `0 ${RESPIRO_LATERAL}` }}>
          {/* ─── Identidade do produto ─────────────────────────────
              Marcador na cor da família (Advisory — como FIO, nunca
              texto: 1,9:1 sobre papel; recon §4.1 — o fio serve os
              dois produtos sem mudança). */}
          <section
            aria-label="Solar Proposal Validator — o produto"
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
                Solar Proposal Validator
              </h1>
              <p style={{ ...NT.lede, margin: 0, color: 'var(--text-muted)', maxWidth: MEDIDA_FORM }}>
                Análise independente de proposta solar — enquadramento, regime de compensação e
                premissas a validar.
              </p>
              {/* A tese, na arquitetura que o Módulo 11 declara: o
                  parecer separa fato de premissa em cada linha, sem
                  substituir número nenhum — e a linguagem de saída é
                  sempre "oportunidades a validar", nunca economia
                  prometida. */}
              <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-body)', maxWidth: MEDIDA_FORM }}>
                A proposta é lida por uma pessoa, não por um motor. O parecer separa fato de
                premissa em cada linha — a modalidade descrita está disponível para este
                arranjo? a trajetória tarifária assumida tem série identificável? — sem
                substituir nenhum número por outro. Nenhuma economia é prometida: o que existe
                são oportunidades a validar com dados completos.
              </p>
            </div>

            {/* A planta baixa do produto — fio da família Software (é o
                que a PlantaBaixa desenha); o fio de acento desta página
                é Advisory. */}
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

          {/* ─── 01 · Envio (demonstração) ───────────────────────── */}
          <section
            aria-label="Envio da proposta — demonstração"
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
                {etapa === 'intake' ? 'Envio da proposta' : 'Demonstração registrada na tela'}
              </span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                {etapa === 'intake' ? EXTENSOES_LEGIVEIS : 'demonstração'}
              </span>
            </div>

            {/* O estado do produto, DECLARADO antes do formulário —
                contorno tracejado, o registro de "ainda não existe" do
                sistema. Nada nesta seção finge envio real. */}
            <div
              style={{
                border: 'var(--fio) dashed var(--rule-strong)',
                padding: '14px 18px',
                maxWidth: MEDIDA_FORM,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>
                Demonstração — o envio ainda não abriu
              </span>
              <p style={{ ...NT.nota, margin: 0, color: 'var(--text-muted)' }}>
                Esta tela mostra o fluxo do produto sem enviar nada: o arquivo não sai do seu
                navegador e nenhum protocolo é registrado. O envio real abre quando o produto
                for ativado.
              </p>
            </div>

            {etapa === 'intake' ? (
              <form
                onSubmit={aoEnviar}
                noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: MEDIDA_FORM }}
              >
                <div style={{ display: 'grid', gap: '6px' }}>
                  <label htmlFor={inputId} style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>
                    Proposta comercial
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
                  <div className={`spv-arquivo${erro ? ' spv-arquivo--erro' : ''}`}>
                    <div className="spv-arquivo__zona">
                      <input
                        ref={inputRef}
                        id={inputId}
                        className="spv-arquivo__ctrl"
                        type="file"
                        accept={TIPOS_ACEITOS}
                        aria-invalid={erro ? 'true' : undefined}
                        aria-describedby={`${inputId}-ajuda`}
                        onChange={(e) => aoEscolher(e.target.files)}
                      />
                      <span className="spv-arquivo__botao" aria-hidden="true">
                        Escolher arquivo
                      </span>
                      <span
                        className={`spv-arquivo__nome${arquivo ? '' : ' spv-arquivo__nome--vazio'}`}
                      >
                        {arquivo
                          ? `${arquivo.name} · ${formatarTamanho(arquivo.size)}`
                          : 'Nenhum arquivo escolhido'}
                      </span>
                    </div>
                    <span className="spv-arquivo__sufixo" aria-hidden="true">
                      {EXTENSOES_LEGIVEIS}
                    </span>
                  </div>
                  {erro ? (
                    <span
                      role="alert"
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px',
                        ...NT.nota,
                        color: 'var(--campo-erro-fg, var(--text-strong))',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{ fontFamily: 'var(--font-data)', color: 'var(--campo-erro-fio)' }}
                      >
                        ×
                      </span>
                      {erro}
                    </span>
                  ) : (
                    <span
                      id={`${inputId}-ajuda`}
                      style={{ ...NT.nota, color: 'var(--text-faint)' }}
                    >
                      A proposta completa, com dimensionamento, geração estimada e condições
                      comerciais. Uma por envio.
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <button type="submit" className="nv-btn nv-btn--primario" disabled={!arquivo}>
                    Testar o fluxo
                    <span className="nv-btn__glifo" aria-hidden="true">
                      →
                    </span>
                  </button>
                  <span style={{ ...NT.nota, color: 'var(--text-muted)' }} aria-live="polite">
                    Nada sai desta tela — demonstração.
                  </span>
                </div>
              </form>
            ) : (
              /* Confirmação da DEMONSTRAÇÃO — estado da mesma tela. O
                 protocolo é sintético e diz isso em toda linha; nenhum
                 texto afirma recebimento. */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: MEDIDA_FORM }}>
                {/* // gridalpha-detect-disable-next-line equal-weight-grid — par rótulo/valor no registro do DataTable do sistema; não há célula focal numa ficha */}
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
                  <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Arquivo</span>
                  <span style={{ ...NT.corpo, color: 'var(--text-strong)', overflowWrap: 'anywhere' }}>
                    {submissao?.source.filename}
                    {submissao && (
                      <span style={{ ...NT.proc, color: 'var(--text-faint)', marginLeft: '10px' }}>
                        {formatarTamanho(submissao.source.sizeBytes)}
                      </span>
                    )}
                  </span>
                  <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>
                    Protocolo de demonstração
                  </span>
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
                  <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Gerado em</span>
                  <span style={{ ...NT.corpo, color: 'var(--text-body)' }}>
                    {submissao ? formatarDataHora(submissao.createdAt) : '—'}
                  </span>
                  <span style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>
                    O que aconteceu
                  </span>
                  <span style={{ ...NT.corpo, color: 'var(--text-body)' }}>
                    Nada foi enviado — este protocolo é ilustrativo, gerado no seu navegador, e
                    não está registrado em lugar nenhum. Quando o produto abrir, o envio real
                    devolve um protocolo do servidor e o parecer chega no perfil da conta.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <button type="button" className="nv-btn nv-btn--secundario" onClick={novoTeste}>
                    Testar com outro arquivo
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ─── 02 · Como funciona ─────────────────────────────────
              As duas trilhas e a saída por natureza de achado — a
              estrutura REAL do Módulo 11 (ordem de avaliação em trinta
              minutos, duas trilhas sincronizadas; eixos; roteador de
              veredito), não inventada. */}
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
                  t: 'A proposta entra',
                  d: 'PDF ou imagem, uma por envio. Enquadramento, regime e geração estimada são lidos do próprio documento — dois dos campos que decidem a leitura estão em qualquer proposta.',
                },
                {
                  n: '2',
                  t: 'Duas trilhas de leitura',
                  d: 'A trilha regulatória data o documento e verifica porte, modalidade e regime de compensação. A trilha técnica confronta geração estimada, degradação e trajetória tarifária contra referência citável.',
                },
                {
                  n: '3',
                  t: 'O parecer volta ao perfil',
                  d: 'Cada linha classificada pela natureza — fato com fonte, premissa ancorada, premissa não ancorada ou embutida por omissão — com as perguntas de negociação e a base normativa citada. Um email avisa quando estiver pronto.',
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
              <WordmarkNivar altura={17} idSufixo="spv-rodape" />
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>
                Solar Proposal Validator
              </span>
            </span>
            {/* A tese da casa aplicada ao produto — a independência que
                o Módulo 11 declara: quem não vende operação e
                manutenção pode apontar a ausência dela. */}
            <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
              Não vende sistema · não indica instalador · não recebe comissão
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default SolarProposalValidatorPage;
