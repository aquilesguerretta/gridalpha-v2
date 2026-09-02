// DiagnosticoEnergeticoPage — ARCHITECT, Diagnóstico Energético Wave 2.
//
// A superfície do terceiro produto Advisory. Rota de TOPO
// (`/diagnostico-energetico`, `main.tsx`), no mesmo precedente que CLE
// e Solar já usam: a página de família aponta para o produto, nunca o
// hospeda.
//
// ─── O QUE ESTE PRODUTO TEM DE DIFERENTE ─────────────────────────────
// Os dois produtos Advisory anteriores são DISPARO ÚNICO: sobe um
// arquivo, recebe um parecer. Diagnóstico é diferente em dois eixos, e
// os dois estreiam aqui:
//
//   · INTAKE RICO — não é upload, é um formulário de escopo. Primeiro
//     consumidor real dos campos NIVAR portados nesta wave
//     (`components/nivar/campos.tsx`).
//   · ACOMPANHAMENTO — o trabalho dura semanas, então a tela mostra
//     histórico de evento e troca de mensagem, não um estado só.
//
// ─── FIAÇÃO REAL (Wave 3) ────────────────────────────────────────────
// O escopo vai por `POST /api/diagnostico-energetico/submissions` —
// JSON estruturado, sem arquivo. Contrato lido em
// `app/routers/diagnostico.py` e reconciliado na Fase 1 desta wave.
//
// TRÊS RECONCILIAÇÕES, porque o mock da Wave 2 e o backend divergiam:
//
//   1. `concern` é OBRIGATÓRIO no backend (`_strip_required`); o campo
//      de contexto era rotulado opcional. Agora a regra é "pelo menos
//      uma das duas entradas" — caixa marcada OU texto.
//   2. O mock tem DUAS entradas (caixas de "o que está em jogo" e o
//      texto livre) onde o backend tem UM campo. As duas compõem um
//      `concern` só: as marcadas viram a primeira linha, o texto vem
//      embaixo. Nada se perde e o backend não muda.
//   3. `'nao-sei'` viraria a string literal "nao-sei" gravada como se
//      fosse uma modalidade tarifária. Mapeia para `null` no envio —
//      continua opção de primeira classe na tela, só não viaja como
//      texto.
//
// ATIVAÇÃO ANTES DO ENVIO: o POST exige entitlement (`403` sem ele).
// Padrão do PerfilStub: `myProducts()` primeiro, `activateProduct` só
// se faltar — idempotente no backend, mas idempotente não é motivo
// para gastar escrita a cada envio.
//
// O catálogo NÃO muda nesta wave: `status: 'em-breve'` e `rota: null`
// seguem, então a família continua mostrando "Em construção" sem link.
// Ligar a tela e anunciar o produto são decisões separadas.

import { useEffect, useId, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

import { useAuth } from '../../lib/auth/AuthContext';
import { AuthError } from '../../lib/auth/authApi';
import {
  enviarEscopo,
  type SubmissaoDiagnostico,
} from '../../lib/diagnostico/api';

// Tokens NIVAR — só arquivos de VARIÁVEL, como PortalBR e FamiliaPage.
import '../../design/nivar/fonts.css';
import '../../design/nivar/colors.css';
import '../../design/nivar/typography.css';
import '../../design/nivar/space.css';
import '../../design/nivar/motion.css';

import { FOLHA_PORTAL, WordmarkNivar } from '../../components/br/portalChrome';
import { PlantaBaixa } from '../../components/br/DestinoCard';
import {
  CampoSelect,
  CampoTexto,
  Escolha,
  EscolhaFila,
  EstilosCampos,
} from '../../components/nivar/campos';
import { EstilosHistorico, HistoricoDiagnostico } from './HistoricoDiagnostico';

const PRODUTO_ID = 'diagnostico-energetico';
const MEDIDA = '1200px';
const RESPIRO_LATERAL = '32px';
const MEDIDA_FORM = '62ch';

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

// ─── O escopo, e por que estes campos ────────────────────────────────
// Quatro perguntas, na ordem em que um parecer precisa delas. Nenhuma
// é do tipo que só um consultor sabe responder — a tela não pode exigir
// que o cliente já tenha o diagnóstico para pedir o diagnóstico.
//
// Os valores são do vocabulário real do setor (Grupo A / Grupo B, Azul
// / Verde), sem tradução criativa — a disciplina de linguagem do
// catálogo vale aqui.

const SETORES = [
  { value: 'manufatura', label: 'Manufatura' },
  { value: 'mineracao', label: 'Mineração' },
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'data-center', label: 'Data center' },
  { value: 'varejo', label: 'Varejo e comércio' },
  { value: 'saneamento', label: 'Saneamento' },
  { value: 'outro', label: 'Outro' },
] as const;

const FAIXAS_CONSUMO = [
  { value: 'ate-50', label: 'Até 50 MWh/mês' },
  { value: '50-200', label: '50 a 200 MWh/mês' },
  { value: '200-500', label: '200 a 500 MWh/mês' },
  { value: '500-1500', label: '500 a 1.500 MWh/mês' },
  { value: 'acima-1500', label: 'Acima de 1.500 MWh/mês' },
] as const;

// "Não sei" é opção de primeira classe, não ausência. Modalidade
// tarifária é exatamente o tipo de coisa que o cliente contrata a
// análise para descobrir — exigir a resposta seria pedir o resultado
// como pré-requisito da pergunta.
const MODALIDADES = [
  { value: 'nao-sei', label: 'Não sei dizer' },
  { value: 'a4-azul', label: 'Grupo A · Azul' },
  { value: 'a4-verde', label: 'Grupo A · Verde' },
  { value: 'grupo-b', label: 'Grupo B' },
  { value: 'livre', label: 'Já estou no mercado livre' },
] as const;

const PREOCUPACOES = [
  { id: 'custo', rotulo: 'Custo total subindo' },
  { id: 'demanda', rotulo: 'Multa por demanda' },
  { id: 'migracao', rotulo: 'Avaliar mercado livre' },
  { id: 'contrato', rotulo: 'Revisar contrato vigente' },
  { id: 'expansao', rotulo: 'Expansão de carga' },
] as const;

/** As duas entradas viram UM `concern` — reconciliação 2 da Fase 1.
 *  As marcadas primeiro, em linha legível; o texto livre embaixo. */
function comporConcern(marcadas: ReadonlySet<string>, texto: string): string {
  const rotulos = PREOCUPACOES.filter((p) => marcadas.has(p.id)).map((p) => p.rotulo);
  const linha = rotulos.length > 0 ? `Em jogo: ${rotulos.join(' · ')}` : '';
  const livre = texto.trim();
  return [linha, livre].filter(Boolean).join('\n\n');
}

/** O que a tela diz para cada guarda do router, na ordem em que elas
 *  disparam. Sem semáforo: o fio e o glifo carregam o sinal. */
function mensagemDeErro(err: unknown): string {
  if (!(err instanceof AuthError)) return 'Algo falhou do nosso lado. Tente de novo em instantes.';
  switch (err.status) {
    case 0:
      return 'Não foi possível falar com o servidor. Verifique a conexão.';
    case 401:
      return 'A sessão expirou. Entre de novo para enviar.';
    case 403:
      return 'O produto não está ativo nesta conta. Recarregue a página e tente de novo.';
    case 422:
      return 'O servidor recusou o escopo. Revise os campos e tente de novo.';
    default:
      return 'Algo falhou do nosso lado. Tente de novo em instantes.';
  }
}

type Etapa = 'intake' | 'confirmado';

export function DiagnosticoEnergeticoPage() {
  const navigate = useNavigate();
  const idPreocupacoes = useId();
  const [modo, setModo] = useState<'claro' | 'noturno'>('claro');
  const [plantaVisivel, setPlantaVisivel] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>('intake');

  // Escopo — estado local, zero rede.
  const [setor, setSetor] = useState('');
  const [faixa, setFaixa] = useState('');
  const [modalidade, setModalidade] = useState('nao-sei');
  const [marcadas, setMarcadas] = useState<ReadonlySet<string>>(new Set());
  const [contexto, setContexto] = useState('');
  const [erros, setErros] = useState<{ setor?: string; faixa?: string; concern?: string }>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [submissao, setSubmissao] = useState<SubmissaoDiagnostico | null>(null);
  const { user, loading, myProducts, activateProduct } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const anterior = document.title;
    document.title = 'NIVAR — Diagnóstico Energético';
    return () => {
      document.title = anterior;
    };
  }, []);

  useEffect(() => {
    const t = window.requestAnimationFrame(() => setPlantaVisivel(true));
    return () => window.cancelAnimationFrame(t);
  }, []);

  function alternarPreocupacao(id: string, marcado: boolean) {
    setMarcadas((atual) => {
      const novo = new Set(atual);
      if (marcado) novo.add(id);
      else novo.delete(id);
      return novo;
    });
  }

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    // Validação de cliente é conveniência; a de verdade é a do backend.
    // `concern` entrou aqui porque o router o exige — sem isso o envio
    // levaria 422 depois de uma ida à rede.
    const concern = comporConcern(marcadas, contexto);
    const achados: { setor?: string; faixa?: string; concern?: string } = {};
    if (!setor) achados.setor = 'Escolha o setor da operação.';
    if (!faixa) achados.faixa = 'Escolha a faixa de consumo.';
    if (!concern) achados.concern = 'Marque ao menos uma opção acima ou escreva o contexto.';
    setErros(achados);
    if (Object.keys(achados).length > 0) return;

    setErroEnvio(null);
    setEnviando(true);
    try {
      // Entitlement primeiro — o POST devolve 403 sem ele.
      const { products } = await myProducts();
      if (!products.some((p) => p.productId === PRODUTO_ID)) {
        await activateProduct(PRODUTO_ID);
      }
      const criada = await enviarEscopo({
        sector: rotuloSetor,
        monthlyConsumptionBand: rotuloFaixa,
        // Reconciliação 3: "não sei dizer" viaja como null, nunca texto.
        tariffModality: modalidade === 'nao-sei' ? null : rotuloModalidade,
        concern,
      });
      setSubmissao(criada);
      comTransicao(() => setEtapa('confirmado'));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setErroEnvio(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  const rotuloSetor = SETORES.find((s) => s.value === setor)?.label ?? '—';
  const rotuloFaixa = FAIXAS_CONSUMO.find((f) => f.value === faixa)?.label ?? '—';
  const rotuloModalidade = MODALIDADES.find((m) => m.value === modalidade)?.label ?? '—';

  // Rota protegida — o escopo é por conta. Enquanto `/api/auth/me` não
  // respondeu ninguém conclui "não logado"; só com `loading === false`
  // e sem usuário é que vai para /entrar, carregando o destino.
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
      <EstilosCampos />
      <EstilosHistorico />

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
            <WordmarkNivar altura={30} idSufixo="diag-cabecalho" />
          </Link>
          <span
            aria-hidden="true"
            style={{ width: '1px', height: '14px', background: 'var(--rule)' }}
          />
          <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>Diagnóstico Energético</span>
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
        aria-label="Diagnóstico Energético — conteúdo rolável"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
      >
        <div style={{ maxWidth: MEDIDA, margin: '0 auto', padding: `0 ${RESPIRO_LATERAL}` }}>
          {/* ─── Identidade do produto ───────────────────────────── */}
          <section
            aria-label="Diagnóstico Energético — o produto"
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
                Diagnóstico Energético
              </h1>
              <p style={{ ...NT.lede, margin: 0, color: 'var(--text-muted)', maxWidth: MEDIDA_FORM }}>
                Análise 360° do custo energético de uma operação industrial.
              </p>
              <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-body)', maxWidth: MEDIDA_FORM }}>
                O trabalho começa por um escopo — setor, porte de consumo e o que está em
                jogo. A partir dele, a leitura cobre contrato, modalidade tarifária,
                demanda e a exposição que a operação carrega hoje. O parecer sai com o
                contraditório junto, e o percurso fica registrado nesta página enquanto a
                análise corre.
              </p>
            </div>

            <div
              aria-hidden="true"
              style={{ border: 'var(--fio) solid var(--rule)', padding: '16px' }}
            >
              <PlantaBaixa destinoId={PRODUTO_ID} visivel={plantaVisivel} altura={180} />
            </div>
          </section>

          {/* ─── 01 · Escopo ─────────────────────────────────────── */}
          <section
            aria-label="Escopo da análise"
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
                {etapa === 'intake' ? 'Escopo da análise' : 'Escopo recebido'}
              </span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                {etapa === 'intake' ? 'quatro perguntas' : 'registrado'}
              </span>
            </div>

            {etapa === 'intake' ? (
              <form
                onSubmit={aoEnviar}
                noValidate
                style={{ display: 'grid', gap: '20px', maxWidth: MEDIDA_FORM }}
              >
                {/* `alignItems: start` não é enfeite: sem ele os dois
                    campos esticam para a altura da linha, e o campo SEM
                    nota tem a linha do rótulo inflada (medido: 13px →
                    32px) para preencher o vão do vizinho que TEM nota.
                    Achado na verificação desta fase, não na leitura. */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                    alignItems: 'start',
                  }}
                >
                  <CampoSelect
                    rotulo="Setor da operação"
                    obrigatorio
                    valor={setor}
                    onChange={(v) => {
                      setSetor(v);
                      if (erros.setor) setErros((e) => ({ ...e, setor: undefined }));
                    }}
                    opcoes={[...SETORES]}
                    placeholder="Escolha o setor"
                    erro={erros.setor}
                  />
                  <CampoSelect
                    rotulo="Consumo mensal"
                    obrigatorio
                    valor={faixa}
                    onChange={(v) => {
                      setFaixa(v);
                      if (erros.faixa) setErros((e) => ({ ...e, faixa: undefined }));
                    }}
                    opcoes={[...FAIXAS_CONSUMO]}
                    placeholder="Escolha a faixa"
                    nota="Uma faixa basta — a fatura fecha o número depois."
                    erro={erros.faixa}
                  />
                </div>

                <CampoSelect
                  rotulo="Modalidade tarifária"
                  valor={modalidade}
                  onChange={setModalidade}
                  opcoes={[...MODALIDADES]}
                  nota="Não saber é resposta válida — é parte do que a análise apura."
                />

                {/* Escolha múltipla — caixa quadrada com glifo ×, o
                    primitivo do sistema. `fieldset` porque é um grupo
                    de controles com uma pergunta só. */}
                <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'grid', gap: '10px' }}>
                  <legend
                    style={{ ...NT.etiqueta, color: 'var(--text-muted)', padding: 0 }}
                    id={idPreocupacoes}
                  >
                    O que está em jogo
                  </legend>
                  <EscolhaFila>
                    {PREOCUPACOES.map((p) => (
                      <Escolha
                        key={p.id}
                        forma="quadrado"
                        rotulo={p.rotulo}
                        marcado={marcadas.has(p.id)}
                        onChange={(m) => alternarPreocupacao(p.id, m)}
                      />
                    ))}
                  </EscolhaFila>
                  {erros.concern ? (
                    <span
                      style={{ ...NT.nota, display: 'flex', gap: '6px', color: 'var(--campo-erro-texto)' }}
                    >
                      <i
                        aria-hidden="true"
                        style={{ fontFamily: 'var(--font-data)', fontStyle: 'normal', color: 'var(--campo-erro-fio)' }}
                      >
                        ×
                      </i>
                      {erros.concern}
                    </span>
                  ) : (
                    <span style={{ ...NT.nota, color: 'var(--text-faint)' }}>
                      Quantas quiser — ou descreva no campo abaixo.
                    </span>
                  )}
                </fieldset>

                <CampoTexto
                  rotulo="Contexto"
                  valor={contexto}
                  onChange={setContexto}
                  linhas={4}
                  placeholder="O que motivou procurar uma leitura independente agora."
                  nota={
                    marcadas.size > 0
                      ? 'Opcional. Uma frase já ajuda a direcionar a apuração.'
                      : 'Descreva o que está em jogo, ou marque uma opção acima.'
                  }
                />

                {erroEnvio && (
                  // Erro de rede/servidor — mesmo padrão de CLE e Solar:
                  // fio em brasa e glifo ×, o texto carrega a leitura.
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
                  <button
                    type="submit"
                    className="nv-btn nv-btn--primario"
                    disabled={enviando || loading}
                    aria-busy={enviando || undefined}
                  >
                    {enviando ? 'Abrindo…' : 'Abrir diagnóstico'}
                    {!enviando && (
                      <span className="nv-btn__glifo" aria-hidden="true">
                        →
                      </span>
                    )}
                  </button>
                  <span style={{ ...NT.nota, color: 'var(--text-muted)' }} aria-live="polite">
                    {enviando ? 'O escopo está indo para o servidor.' : 'Sem cobrança nesta etapa.'}
                  </span>
                </div>
              </form>
            ) : (
              // gridalpha-detect-disable-next-line equal-weight-grid — pilha vertical de ficha, nota e ação; não há célula focal numa confirmação
              <div style={{ display: 'grid', gap: '16px', maxWidth: MEDIDA_FORM }}>
                {/* // gridalpha-detect-disable-next-line equal-weight-grid — par rótulo/valor no registro do DataTable; não há célula focal numa ficha */}
                <dl
                  style={{
                    margin: 0,
                    display: 'grid',
                    gridTemplateColumns: 'auto minmax(0, 1fr)',
                    gap: '8px 20px',
                    alignItems: 'baseline',
                    borderTop: 'var(--fio) solid var(--rule)',
                    borderBottom: 'var(--fio) solid var(--rule)',
                    padding: '12px 0',
                  }}
                >
                  {/* Tudo abaixo vem da RESPOSTA do backend — é o que
                      foi gravado, não o que o browser tinha em estado. */}
                  <dt style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Protocolo</dt>
                  <dd
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-data)',
                      fontSize: 'var(--ts-dado-4)',
                      fontWeight: 500,
                      color: 'var(--text-strong)',
                      fontVariantNumeric: 'tabular-nums lining-nums',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {submissao?.id}
                  </dd>
                  <dt style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Setor</dt>
                  <dd style={{ margin: 0, ...NT.corpo, color: 'var(--text-strong)' }}>
                    {submissao?.sector}
                  </dd>
                  <dt style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Consumo</dt>
                  <dd style={{ margin: 0, ...NT.corpo, color: 'var(--text-strong)' }}>
                    {submissao?.monthlyConsumptionBand}
                  </dd>
                  <dt style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Modalidade</dt>
                  <dd style={{ margin: 0, ...NT.corpo, color: 'var(--text-body)' }}>
                    {/* `null` é o "não sei dizer" que o backend gravou —
                        e dizer isso é mais honesto que repetir o rótulo. */}
                    {submissao?.tariffModality ?? 'não informada'}
                  </dd>
                  <dt style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Em jogo</dt>
                  <dd
                    style={{
                      margin: 0,
                      ...NT.corpo,
                      color: 'var(--text-body)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {submissao?.concern}
                  </dd>
                  <dt style={{ ...NT.etiqueta, color: 'var(--text-faint)' }}>Aberto em</dt>
                  <dd style={{ margin: 0, ...NT.corpo, color: 'var(--text-body)' }}>
                    {submissao ? formatarDataHora(submissao.createdAt) : '—'}
                  </dd>
                </dl>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="nv-btn nv-btn--terciario"
                    onClick={() => {
                      setSubmissao(null);
                      comTransicao(() => setEtapa('intake'));
                    }}
                  >
                    Abrir outro diagnóstico
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ─── 02 · Acompanhamento ─────────────────────────────── */}
          <HistoricoDiagnostico NT={NT} />

          {/* ─── 03 · Método ─────────────────────────────────────── */}
          <MetodoDiagnostico NT={NT} />
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
              <WordmarkNivar altura={17} idSufixo="diag-rodape" />
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>
                Diagnóstico Energético
              </span>
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

// ─── 03 · Método ─────────────────────────────────────────────────────
// MARKUP NOVO reusando `.nv-metodo*` de FOLHA_PORTAL — o CSS já chega,
// só o markup faltava. NÃO é componente extraído: é o SEGUNDO uso
// (o primeiro é o PLD do hero), e a regra dos três não foi atingida.
// Quando um terceiro consumidor aparecer, aí sim vale extrair.
//
// A ORDEM DAS LINHAS É DO SISTEMA, NÃO DO CHAMADOR: método → fonte →
// método publicado em → dado coletado em → premissas. A data do método
// vem antes da data do dado porque é essa ordem que prova a tese — o
// método é público antes de existir número para defender. Inverter as
// duas desmonta o argumento sem alterar nenhum dado.

function MetodoDiagnostico({ NT }: { NT: Record<string, CSSProperties> }) {
  const [aberto, setAberto] = useState(false);
  // `useId` em vez do id fixo do hero (`metodo-pld-painel`): duas
  // instâncias na mesma página colidiriam.
  const idPainel = useId();

  return (
    <section
      aria-label="Método"
      style={{
        padding: '32px 0',
        borderTop: 'var(--fio) solid var(--rule)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
        <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>03</span>
        <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Método</span>
        <span
          aria-hidden="true"
          style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
        />
        <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>público antes do número</span>
      </div>

      <div className="nv-metodo">
        <div className="nv-metodo__ancora">
          <button
            type="button"
            className="nv-metodo__gatilho"
            aria-expanded={aberto}
            aria-controls={idPainel}
            onClick={() => setAberto((v) => !v)}
          >
            Como esta análise é feita
          </button>
        </div>
        {aberto && (
          <div className="nv-metodo__painel" id={idPainel}>
            <svg
              className="nv-metodo__fio-desenho"
              viewBox="0 0 1000 1"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="0" y1="0.5" x2="1000" y2="0.5" />
            </svg>
            <div className="nv-metodo__corpo">
              <div className="nv-metodo__linha">
                <span className="nv-metodo__rot">Método</span>
                <p className="nv-metodo__v">
                  Leitura da fatura e do contrato vigente contra a estrutura tarifária
                  aplicável, com verificação de enquadramento, demanda contratada e
                  encargos. Cada conclusão sai com o argumento que a contesta.
                </p>
              </div>
              <div className="nv-metodo__linha">
                <span className="nv-metodo__rot">Fonte</span>
                <p className="nv-metodo__v nv-metodo__v--dado">
                  Estrutura tarifária: ANEEL. Mercado de curto prazo: CCEE. Operação: ONS.
                </p>
              </div>
              <div className="nv-metodo__linha">
                <span className="nv-metodo__rot">Método publicado em</span>
                <p className="nv-metodo__v nv-metodo__v--dado">[DATA]</p>
              </div>
              <div className="nv-metodo__linha">
                <span className="nv-metodo__rot">Dado coletado em</span>
                <p className="nv-metodo__v nv-metodo__v--dado">
                  não aplicável — o produto ainda não recebeu escopo real.
                </p>
              </div>
              <div className="nv-metodo__linha">
                <span className="nv-metodo__rot">Premissas</span>
                <ul className="nv-metodo__premissas">
                  <li>
                    A leitura parte dos documentos enviados; nada é inferido de operação
                    não documentada.
                  </li>
                  <li>
                    Nenhuma economia é prometida — o que existe são oportunidades a validar
                    contra o contrato real.
                  </li>
                  <li>
                    A NIVAR não vende energia, não intermedia contrato e não recebe
                    comissão sobre nenhuma conclusão deste parecer.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default DiagnosticoEnergeticoPage;
