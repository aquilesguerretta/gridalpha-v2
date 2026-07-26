// PortalHero — ARCHITECT, Portal BR Wave 2 · Jaguar.
//
// A sequência confirmada por protótipo (spec §2), com as duas correções
// obrigatórias aplicadas:
//   1. o contorno é o GeoJSON real do IBGE convertido em build-time
//      (src/lib/geo/brasil-outline.ts), nunca o rascunho ilustrativo;
//   2. as regiões são os polígonos reais dos submercados (IBGE dissolvido
//      pela classificação CCEE/ONS), não círculos-marcador. Decisão tomada
//      olhando o render: as formas regionais são legíveis e em tela pequena
//      degradam para mancha de região, não para ruído.
//
// Sequência de scroll (0→100% da seção):
//   0–25%   contorno desenha via stroke-dashoffset (pathLength=1 — mesma
//           normalização que a Alexandria usa nos primitivos)
//   20–50%  quatro submercados preenchem em sequência escalonada
//   45–75%  conectores de intercâmbio desenham com a mesma técnica de traço
//   70–100% número sobe até o valor — MOCK, marcado como ilustrativo
//
// Os conectores entre centroides são ESQUEMÁTICOS — representam os
// intercâmbios entre submercados (S↔SE/CO, SE/CO↔NE, SE/CO↔N, N↔NE),
// não o traçado físico de linha de transmissão. A regra travada de
// geometria real cobre contorno e fronteira; o conector é diagrama de
// rede, declarado como tal.
//
// prefers-reduced-motion cai para o ESTADO FINAL (mapa pronto, número
// cheio), nunca para vazio — regra que o repo já segue desde a Alexandria.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import { J, JF } from '../../design/jaguar-tokens';
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

// Valor ILUSTRATIVO — nenhum feed de PLD existe no front hoje. A spec
// permite mock desde que marcado como tal; o rótulo na tela diz
// "ilustrativo" em texto corrido, não em tooltip escondido.
const PLD_MOCK = 138.72;

// Janelas da sequência, em fração do progresso total.
const fase = (p: number, ini: number, fim: number) =>
  Math.min(1, Math.max(0, (p - ini) / (fim - ini)));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Opacidade de preenchimento por região. Mesma tinta ocre em quatro
// pesos — sem isso os quatro submercados fundem numa mancha única e a
// fronteira entre eles some (visto no render de verificação). Vizinhos
// alternam contraste; o fio interno hairline faz o resto.
const PESO_FILL: Record<SubmercadoPath['id'], number> = {
  norte: 0.34,
  nordeste: 0.18,
  sudesteCentroOeste: 0.26,
  sul: 0.12,
};

// Intercâmbios esquemáticos entre submercados (pares de ids).
const CONEXOES: ReadonlyArray<readonly [string, string]> = [
  ['sul', 'sudesteCentroOeste'],
  ['sudesteCentroOeste', 'nordeste'],
  ['sudesteCentroOeste', 'norte'],
  ['norte', 'nordeste'],
];

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

  const p = progresso;
  const tContorno = easeOut(fase(p, 0, 0.25));
  const tNumero = easeOut(fase(p, 0.7, 1));
  const valor = PLD_MOCK * tNumero;

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
      // Bojo perpendicular alternado — diagrama de rede, não rota física.
      const bojo = 0.14 * norma * (i % 2 === 0 ? 1 : -1);
      const cx = mx - (dy / norma) * bojo;
      const cy = my + (dx / norma) * bojo;
      return { d: `M${ca[0]} ${ca[1]}Q${cx} ${cy} ${cb[0]} ${cb[1]}`, chave: `${a}-${b}` };
    });
  }, []);

  const rotulo: CSSProperties = {
    fontFamily: JF.mono,
    fontSize: '10px',
    letterSpacing: '0.20em',
    textTransform: 'uppercase',
  };

  return (
    // Pista de rolagem: o palco fica sticky enquanto o wrapper percorre
    // ~1.8 viewports — é esse percurso que vira o progresso da sequência.
    // Com prefers-reduced-motion a pista colapsa e o mapa nasce pronto.
    <div ref={wrapRef} style={{ height: reduzido ? 'auto' : '280vh' }}>
      <section
        aria-label="O Sistema Interligado Nacional em quatro submercados"
        style={{
          position: 'sticky',
          top: 0,
          // Altura do scrollport do <main>: 100vh menos o header de 64px
          // do PortalBR. Acoplamento consciente com o layout do pai.
          height: 'calc(100vh - 64px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)',
          gap: '48px',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <span style={{ ...rotulo, color: J.acenteOcre }}>Portal · Brasil</span>

          <h1
            style={{
              margin: 0,
              fontSize: '40px',
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              fontWeight: 500,
              color: J.tintaPrimaria,
            }}
          >
            {titulo}
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: '48ch',
              fontSize: '15px',
              lineHeight: 1.65,
              color: J.tintaSecundaria,
            }}
          >
            {subtitulo}
          </p>

          {/* 70–100%: o número sobe. MOCK marcado em texto visível. */}
          <div
            style={{
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: `1px solid ${J.bordaDefault}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              opacity: 0.25 + 0.75 * tNumero,
            }}
          >
            <span style={{ ...rotulo, color: J.tintaMuted }}>
              PLD médio SE/CO · R$/MWh · valor ilustrativo
            </span>
            <span
              data-numeric
              style={{
                fontFamily: JF.mono,
                fontVariantNumeric: 'tabular-nums',
                fontSize: '52px',
                lineHeight: 1,
                fontWeight: 500,
                color: J.tintaPrimaria,
              }}
            >
              {valor.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <span
            aria-hidden="true"
            style={{
              ...rotulo,
              color: J.tintaMuted,
              opacity: reduzido ? 0 : Math.max(0, 1 - fase(p, 0, 0.1)),
            }}
          >
            Role — o mapa se constrói
          </span>
        </div>

        <div style={{ height: '100%', minWidth: 0, padding: '40px 0', boxSizing: 'border-box' }}>
          <svg
            viewBox={BRASIL_VIEWBOX}
            role="group"
            aria-label="Mapa do Brasil com os quatro submercados do SIN"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            {/* 20–50%: submercados reais preenchem em sequência. */}
            {SUBMERCADOS.map((s, i) => {
              const ini = 0.2 + i * 0.055;
              const t = easeOut(fase(p, ini, ini + 0.13));
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
                    outlineColor: J.acenteOcre,
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

            {/* 0–25%: contorno IBGE desenha. pathLength=1 normaliza o
                comprimento — o traço não depende de medição em runtime. */}
            <path
              d={BRASIL_OUTLINE_D}
              fillRule="evenodd"
              fill="none"
              stroke={J.tintaPrimaria}
              strokeWidth={1.1}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - tContorno}
              style={{ pointerEvents: 'none' }}
            />

            {/* 45–75%: intercâmbios esquemáticos desenham em sequência. */}
            {conectores.map((c, i) => {
              const ini = 0.45 + i * 0.06;
              const t = easeOut(fase(p, ini, ini + 0.12));
              return (
                <path
                  key={c.chave}
                  d={c.d}
                  fill="none"
                  stroke={J.acenteOcre}
                  strokeWidth={1.4}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - t}
                  opacity={0.85}
                  style={{ pointerEvents: 'none' }}
                />
              );
            })}

            {/* Nós e rótulos de sigla acompanham o preenchimento. */}
            {SUBMERCADOS.map((s, i) => {
              const t = easeOut(fase(p, 0.2 + i * 0.055, 0.33 + i * 0.055));
              return (
                <g key={`rotulo-${s.id}`} opacity={t} style={{ pointerEvents: 'none' }}>
                  <circle cx={s.centroid[0]} cy={s.centroid[1]} r={3} fill={J.tintaPrimaria} />
                  <text
                    x={s.centroid[0] + 9}
                    y={s.centroid[1] + 4}
                    fontFamily={JF.mono}
                    fontSize={13}
                    letterSpacing="0.08em"
                    fill={J.tintaPrimaria}
                  >
                    {s.sigla}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>
    </div>
  );
}

export default PortalHero;
