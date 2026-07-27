// PortalHero — ARCHITECT, Portal BR Wave 3 · hero imersivo.
//
// O mapa deixa de morar num painel fixo e vira o protagonista físico
// da sequência. Cinco fases sobre uma pista de 340vh:
//
//   0–25%   contorno IBGE desenha — mapa nasce menor, próximo do
//           centro da viewport, não ancorado à direita
//   20–50%  quatro submercados reais preenchem, escalonados
//   45–75%  intercâmbios esquemáticos conectam os centroides
//   75–95%  FASE NOVA — o mapa cresce e recentraliza até dominar a
//           tela; título e parágrafo esmaecem; rótulos regionais
//           (sigla + PLD ilustrativo) ancoram nos centroides
//   95–100% assentamento — barra compacta reintegra o headline e o
//           PLD agregado; a seção solta o scroll e o documento segue
//
// MECANISMO: cálculo de progresso em JS (validado na Wave 2),
// estendido para dirigir também transform/opacity. animation-timeline:
// view() foi avaliado e descartado nesta wave: cobertura ainda parcial
// fora do Chromium para view()+animation-range, e a sequência dirige
// ESTADO React (contadores, rótulos, interpolações SVG) — duas linhas
// do tempo (CSS e JS) dessincronizariam a mesma cena.
//
// ESCAPE: botão "Pular apresentação" — primeiro focável da seção,
// visível enquanto a sequência roda; rola o <main> direto para o fim
// da pista. Ninguém fica preso.
//
// REDUCED-MOTION: sem pista, sem sticky, sem fase — layout ESTÁTICO em
// fluxo com todo o conteúdo legível (eyebrow, headline, parágrafo,
// mapa grande com rótulos, PLD). Não é o estado final da animação com
// texto esmaecido: é uma composição própria, porque esmaecer o
// parágrafo para quem nunca viu as fases seria perda de conteúdo, não
// redução de movimento.
//
// Os conectores seguem ESQUEMÁTICOS (diagrama de intercâmbio, não
// traçado físico); PLD segue MOCK, marcado ilustrativo em texto
// visível. Regra de geometria real: contorno e fronteira vêm de
// src/lib/geo/brasil-outline.ts (IBGE), nunca de path desenhado.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';

import { J, JF, JT } from '../../design/jaguar-tokens';
import {
  BRASIL_OUTLINE_D,
  BRASIL_VIEWBOX,
  SUBMERCADOS,
  type SubmercadoPath,
} from '../../lib/geo/brasil-outline';

export interface PortalHeroProps {
  titulo: string;
  subtitulo: string;
  /** O elemento que rola (o <main> do PortalBR). O hero lê o scroll dele —
   *  o documento não rola neste layout. */
  scrollHost: RefObject<HTMLElement | null>;
  /** Clique num polígono de submercado. */
  onRegiaoClick: (regiao: SubmercadoPath) => void;
}

// Valores ILUSTRATIVOS — nenhum feed de PLD existe no front hoje.
// Mesma linguagem de submercado que Atlas e Alexandria já usam; o
// rótulo na tela diz "ilustrativo" em texto corrido.
const PLD_AGREGADO_MOCK = 138.72; // referência SE/CO
const PLD_REGIONAL_MOCK: Record<SubmercadoPath['id'], number> = {
  norte: 132.45,
  nordeste: 129.8,
  sudesteCentroOeste: 138.72,
  sul: 141.1,
};

// Deslocamento do rótulo regional em relação ao centroide (unidades do
// viewBox), escolhido para não cobrir o polígono vizinho.
const ROTULO_OFFSET: Record<SubmercadoPath['id'], readonly [number, number]> = {
  norte: [12, -10],
  nordeste: [16, -2],
  sudesteCentroOeste: [14, 26],
  sul: [14, 14],
};

const fase = (p: number, ini: number, fim: number) =>
  Math.min(1, Math.max(0, (p - ini) / (fim - ini)));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const CONEXOES: ReadonlyArray<readonly [string, string]> = [
  ['sul', 'sudesteCentroOeste'],
  ['sudesteCentroOeste', 'nordeste'],
  ['sudesteCentroOeste', 'norte'],
  ['norte', 'nordeste'],
];

// Opacidade de preenchimento por região — vizinhos alternam contraste;
// o fio interno hairline faz o resto (decisão da Wave 2).
const PESO_FILL: Record<SubmercadoPath['id'], number> = {
  norte: 0.34,
  nordeste: 0.18,
  sudesteCentroOeste: 0.26,
  sul: 0.12,
};

function usePrefereMenosMovimento(): boolean {
  const [reduzido, setReduzido] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduzido(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduzido;
}

const formatoBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function PortalHero({ titulo, subtitulo, scrollHost, onRegiaoClick }: PortalHeroProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progresso, setProgresso] = useState(0);
  const [regiaoSobre, setRegiaoSobre] = useState<string | null>(null);
  const reduzido = usePrefereMenosMovimento();

  useEffect(() => {
    if (reduzido) {
      setProgresso(1);
      return;
    }
    const host = scrollHost.current;
    const wrap = wrapRef.current;
    if (!host || !wrap) return;

    let raf = 0;
    const medir = () => {
      raf = 0;
      const runway = wrap.offsetHeight - host.clientHeight;
      if (runway <= 0) {
        setProgresso(1);
        return;
      }
      const delta = host.getBoundingClientRect().top - wrap.getBoundingClientRect().top;
      setProgresso(Math.min(1, Math.max(0, delta / runway)));
    };
    const aoRolar = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    host.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar);
    return () => {
      host.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRolar);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollHost, reduzido]);

  // Escape da sequência presa: rola o <main> direto para o fim da
  // pista. Primeiro focável da seção — teclado sai na primeira parada.
  // O foco muda para o próprio scroller ANTES de o botão sumir: sem
  // isso, o aria-hidden do assentamento cai num nó que ainda segura o
  // foco (violação que o Chromium bloqueia e loga).
  const botaoPularRef = useRef<HTMLButtonElement>(null);
  const pular = useCallback(() => {
    const host = scrollHost.current;
    const wrap = wrapRef.current;
    if (!host || !wrap) return;
    const alvo =
      wrap.getBoundingClientRect().bottom -
      host.getBoundingClientRect().top +
      host.scrollTop -
      host.clientHeight;
    host.focus({ preventScroll: true });
    host.scrollTo({ top: alvo, behavior: 'smooth' });
  }, [scrollHost]);

  // Mesmo resgate quando o usuário rola manualmente até o assentamento
  // com o foco parado no botão.
  useEffect(() => {
    if (progresso >= 0.98 && document.activeElement === botaoPularRef.current) {
      scrollHost.current?.focus({ preventScroll: true });
    }
  }, [progresso, scrollHost]);

  const p = progresso;
  const tContorno = easeOut(fase(p, 0, 0.25));
  const tCresce = easeInOut(fase(p, 0.75, 0.95));
  const opTexto = reduzido ? 1 : 1 - easeOut(fase(p, 0.75, 0.88));
  const opBarra = reduzido ? 1 : easeOut(fase(p, 0.9, 0.98));
  const tNumero = easeOut(fase(p, 0.75, 0.98));
  const valorAgregado = reduzido ? PLD_AGREGADO_MOCK : PLD_AGREGADO_MOCK * tNumero;

  const conectores = useMemo(() => {
    const porId = new Map(SUBMERCADOS.map((s) => [s.id, s]));
    return CONEXOES.map(([a, b], i) => {
      const ca = porId.get(a as SubmercadoPath['id'])!.centroid;
      const cb = porId.get(b as SubmercadoPath['id'])!.centroid;
      const mx = (ca[0] + cb[0]) / 2;
      const my = (ca[1] + cb[1]) / 2;
      const dx = cb[0] - ca[0];
      const dy = cb[1] - ca[1];
      const norma = Math.hypot(dx, dy) || 1;
      const bojo = 0.14 * norma * (i % 2 === 0 ? 1 : -1);
      const cx = mx - (dy / norma) * bojo;
      const cy = my + (dx / norma) * bojo;
      return { d: `M${ca[0]} ${ca[1]}Q${cx} ${cy} ${cb[0]} ${cb[1]}`, chave: `${a}-${b}` };
    });
  }, []);

  // ─── O SVG do mapa — compartilhado pelos dois layouts ─────────────
  const mapa = (
    <svg
      viewBox={BRASIL_VIEWBOX}
      role="group"
      aria-label="Mapa do Brasil com os quatro submercados do SIN"
      style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
    >
      {SUBMERCADOS.map((s, i) => {
        const ini = 0.2 + i * 0.055;
        const t = reduzido ? 1 : easeOut(fase(p, ini, ini + 0.13));
        const sobre = regiaoSobre === s.id;
        const clicavel = t > 0.15;
        return (
          <path
            key={s.id}
            d={s.d}
            fillRule="evenodd"
            fill={J.acenteOcre}
            fillOpacity={t * (PESO_FILL[s.id] + (sobre ? 0.16 : 0))}
            stroke={sobre ? J.acenteOcre : J.tintaPrimaria}
            strokeOpacity={sobre ? 1 : 0.3 * t}
            strokeWidth={sobre ? 1.2 : 0.7}
            role="button"
            tabIndex={clicavel ? 0 : -1}
            aria-label={`Submercado ${s.nome} — Terminal Brasil, em breve`}
            style={{
              cursor: clicavel ? 'pointer' : 'default',
              pointerEvents: clicavel ? 'auto' : 'none',
              outlineColor: J.acenteOcreEscuro,
              transition: 'fill-opacity 140ms ease',
            }}
            onMouseEnter={() => setRegiaoSobre(s.id)}
            onMouseLeave={() => setRegiaoSobre(null)}
            onFocus={() => setRegiaoSobre(s.id)}
            onBlur={() => setRegiaoSobre(null)}
            onClick={() => onRegiaoClick(s)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRegiaoClick(s);
              }
            }}
          />
        );
      })}

      <path
        d={BRASIL_OUTLINE_D}
        fillRule="evenodd"
        fill="none"
        stroke={J.tintaPrimaria}
        strokeWidth={1.1}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={reduzido ? 0 : 1 - tContorno}
        style={{ pointerEvents: 'none' }}
      />

      {conectores.map((c, i) => {
        const ini = 0.45 + i * 0.06;
        const t = reduzido ? 1 : easeOut(fase(p, ini, ini + 0.12));
        return (
          <path
            key={c.chave}
            d={c.d}
            fill="none"
            // Mapa é protagonista agora — o intercâmbio intensifica.
            stroke={J.acenteOcre}
            strokeWidth={1.8}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - t}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}

      {/* Nós dos centroides — aparecem com os conectores. */}
      {SUBMERCADOS.map((s, i) => {
        const t = reduzido ? 1 : easeOut(fase(p, 0.45 + i * 0.04, 0.58 + i * 0.04));
        return (
          <circle
            key={`no-${s.id}`}
            cx={s.centroid[0]}
            cy={s.centroid[1]}
            r={3.6}
            // Nó de dado vivo em ocre, ancorado por hairline de tinta.
            fill={J.acenteOcre}
            stroke={J.tintaPrimaria}
            strokeWidth={0.6}
            opacity={t}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}

      {/* Fase nova (75–95%): rótulos regionais ancorados — sigla + PLD
          ilustrativo. Tamanhos em unidades de viewBox ≈ px no estado
          final (escala ~1). Piso de 13px respeitado onde o rótulo é
          legível de fato: no estado crescido. */}
      {SUBMERCADOS.map((s, i) => {
        const t = reduzido ? 1 : easeOut(fase(p, 0.78 + i * 0.03, 0.9 + i * 0.03));
        if (t === 0) return null;
        const [dx, dy] = ROTULO_OFFSET[s.id];
        const x = s.centroid[0] + dx;
        const y = s.centroid[1] + dy;
        const valor = reduzido ? PLD_REGIONAL_MOCK[s.id] : PLD_REGIONAL_MOCK[s.id] * t;
        return (
          <g key={`rotulo-${s.id}`} opacity={t} style={{ pointerEvents: 'none' }}>
            <line
              x1={s.centroid[0]}
              y1={s.centroid[1]}
              x2={x - 3}
              y2={y - 4}
              stroke={J.acenteOcre}
              strokeWidth={1}
            />
            {/* Halo de papel (paint-order) — a etiqueta cai DENTRO do
                fill ocre da própria região; sem o halo o contraste
                desaba para ~3:1 (achado da revisão adversarial). */}
            <text
              x={x}
              y={y}
              fontFamily={JF.mono}
              fontSize={14}
              letterSpacing="0.14em"
              fill={J.tintaSecundaria}
              stroke={J.papelBase}
              strokeWidth={4}
              strokeLinejoin="round"
              style={{ paintOrder: 'stroke' }}
            >
              {s.sigla}
            </text>
            <text
              x={x}
              y={y + 21}
              fontFamily={JF.mono}
              fontSize={20}
              fontWeight={500}
              fill={J.acenteOcreEscuro}
              stroke={J.papelBase}
              strokeWidth={5}
              strokeLinejoin="round"
              style={{ paintOrder: 'stroke', fontVariantNumeric: 'tabular-nums' }}
            >
              {formatoBRL(valor)}
            </text>
          </g>
        );
      })}

      {/* A marca de ilustrativo entra JUNTO com os primeiros valores
          regionais (78%), não só na barra final (90%) — sem janela em
          que número mock apareça sem aviso. */}
      <text
        x={360}
        y={750}
        textAnchor="middle"
        fontFamily={JF.mono}
        fontSize={13}
        letterSpacing="0.14em"
        fill={J.tintaSecundaria}
        stroke={J.papelBase}
        strokeWidth={4}
        strokeLinejoin="round"
        opacity={reduzido ? 1 : easeOut(fase(p, 0.78, 0.9))}
        style={{ paintOrder: 'stroke', textTransform: 'uppercase', pointerEvents: 'none' }}
      >
        PLD por submercado · R$/MWh · valores ilustrativos
      </text>
    </svg>
  );

  // Eyebrow em ocre DE VERDADE — acenteOcreEscuro (Wave 4) passa AA
  // sobre papelBase, o que o #C17D1F nunca passou. A intenção original
  // da Fase 3 da Wave 3, destravada pelo token novo.
  const eyebrow = (
    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span
        aria-hidden="true"
        style={{ width: '22px', height: '3px', background: J.acenteOcre, flexShrink: 0 }}
      />
      <span style={{ ...JT.rotulo, color: J.acenteOcreEscuro }}>Portal · Brasil</span>
    </span>
  );

  const barraPld = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        // Fio ocre de 3px — o acento marcando o dado vivo, não decoração.
        borderLeft: `3px solid ${J.acenteOcre}`,
        paddingLeft: '18px',
      }}
    >
      <span style={{ ...JT.h3, color: J.tintaPrimaria }}>{titulo}</span>
      <span style={{ ...JT.rotulo, color: J.tintaSecundaria }}>
        PLD médio SE/CO · R$/MWh · valor ilustrativo
      </span>
      <span
        data-numeric
        // fontVariantNumeric literal repetido do JT.dadoDestaque — o
        // auditor não resolve spread de token; o valor é o mesmo.
        // Ocre escuro: o dado vivo É o lugar da cor (5,09:1 em 84px).
        style={{
          ...JT.dadoDestaque,
          fontVariantNumeric: 'tabular-nums',
          color: J.acenteOcreEscuro,
        }}
      >
        {formatoBRL(valorAgregado)}
      </span>
    </div>
  );

  // ─── Reduced-motion: composição estática própria, em fluxo ────────
  // Nada de pista, nada de sticky, nada esmaecido. Todo o conteúdo
  // (parágrafo incluso) legível — esmaecer texto para quem nunca viu
  // as fases seria perda de conteúdo, não redução de movimento.
  if (reduzido) {
    return (
      <section
        aria-label="O Sistema Interligado Nacional em quatro submercados"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          padding: '56px 0',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '62ch' }}>
          {eyebrow}
          <h1 style={{ ...JT.h1, margin: 0, color: J.tintaPrimaria }}>{titulo}</h1>
          <p style={{ ...JT.corpo, margin: 0, color: J.tintaSecundaria }}>{subtitulo}</p>
        </div>
        {/* min 770px: abaixo disso a escala do viewBox (720u) derruba a
            sigla de 14u para menos de 13px renderizados — piso da JT. */}
        <div style={{ width: 'min(770px, 94%)', aspectRatio: '720 / 755', alignSelf: 'center' }}>
          {mapa}
        </div>
        {barraPld}
      </section>
    );
  }

  // ─── Sequência imersiva ───────────────────────────────────────────
  return (
    <div ref={wrapRef} style={{ height: '340vh' }}>
      <section
        aria-label="O Sistema Interligado Nacional em quatro submercados"
        style={{
          position: 'sticky',
          top: 0,
          // Scrollport do <main>: 100vh menos o header de 64px do
          // PortalBR. Acoplamento consciente com o layout do pai.
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
        }}
      >
        {/* Fio de progresso da sequência — orientação de onde se está
            na pista presa. Some no assentamento. */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '2px',
            width: `${p * 100}%`,
            background: J.acenteOcre,
            opacity: p >= 0.98 ? 0 : 1,
            transition: 'opacity 200ms ease',
            zIndex: 3,
          }}
        />

        {/* Legenda de hover — redundância VISUAL do aria-label que os
            polígonos já carregam; aria-hidden para não virar live
            region tagarela no leitor de tela. À esquerda, longe do
            botão de pular, com teto de largura. */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            bottom: '20px',
            maxWidth: '58%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            ...JT.rotulo,
            color: J.acenteOcreEscuro,
            opacity: regiaoSobre ? 1 : 0,
            transition: 'opacity 140ms ease',
            pointerEvents: 'none',
            zIndex: 3,
            whiteSpace: 'nowrap',
          }}
        >
          {regiaoSobre
            ? `${SUBMERCADOS.find((s) => s.id === regiaoSobre)?.nome} — Terminal Brasil, em breve`
            : ''}
        </span>

        {/* Escape — primeiro focável da seção, some quando a sequência
            assenta. Ninguém fica preso na pista. */}
        <button
          ref={botaoPularRef}
          type="button"
          onClick={pular}
          aria-hidden={p >= 0.98}
          tabIndex={p >= 0.98 ? -1 : 0}
          style={{
            position: 'absolute',
            right: '4px',
            bottom: '20px',
            zIndex: 3,
            ...JT.rotulo,
            color: J.tintaSecundaria,
            background: J.papelBase,
            border: `1px solid ${J.bordaDefault}`,
            borderRadius: 0,
            padding: '8px 14px',
            cursor: 'pointer',
            opacity: p >= 0.98 ? 0 : 1,
            pointerEvents: p >= 0.98 ? 'none' : 'auto',
            transition: 'opacity 200ms ease',
            outlineColor: J.acenteOcreEscuro,
          }}
        >
          Pular apresentação ↓
        </button>

        {/* Camada do mapa — nasce menor, levemente à direita do centro;
            cresce e recentraliza em 75–95% até dominar o palco. */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            height: '58%',
            aspectRatio: '720 / 755',
            // 1.65 no fim: garante escala ≥1 do viewBox mesmo em palco
            // de 836px — os rótulos de 14u nunca caem abaixo de 13px.
            transform: `translate(-50%, -50%) translateX(${(1 - tCresce) * 14}vw) scale(${
              1 + 0.65 * tCresce
            })`,
            zIndex: 1,
          }}
        >
          {mapa}
        </div>

        {/* Camada de texto — recua quando o mapa assume (75–88%). */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(40%, 560px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            opacity: opTexto,
            pointerEvents: opTexto < 0.1 ? 'none' : 'auto',
            zIndex: 2,
          }}
        >
          {eyebrow}
          <h1 style={{ ...JT.h1, margin: 0, color: J.tintaPrimaria }}>{titulo}</h1>
          <p style={{ ...JT.corpo, margin: 0, color: J.tintaSecundaria }}>{subtitulo}</p>
          <span
            style={{
              ...JT.rotulo,
              color: J.tintaSecundaria,
              opacity: Math.max(0, 1 - fase(p, 0, 0.1)),
            }}
          >
            Role — o mapa se constrói
          </span>
        </div>

        {/* Assentamento (90–100%): headline reintegrado + PLD agregado.
            O agregado É a referência SE/CO — o mesmo número que o
            rótulo regional mostra no mapa, promovido a figura. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: '9%',
            zIndex: 2,
            opacity: opBarra,
            pointerEvents: opBarra < 0.1 ? 'none' : 'auto',
          }}
        >
          {barraPld}
        </div>
      </section>
    </div>
  );
}

export default PortalHero;
