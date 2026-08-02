// AtlasGlobo — o globo 3D do Atlas Mundial (Wave 27; composição de
// frontispício na Wave 28).
//
// Estética de instrumento científico de gabinete, 1880-1900: esfera
// navy fosca em canvas TRANSPARENTE, repousando nas mãos da gravura de
// Atlas sobre o papel creme do canvas central. Nunca gêmeo digital,
// nunca terminal de trading — sem atmosfera brilhante (showAtmosphere
// DESLIGADO), sem gradiente decorativo, sem neon.
//
// Fronteiras vêm do TopoJSON real da Natural Earth 110m servido em
// /alexandria/geo/world-110m.json — nunca de imagem gerada. A junção
// com os 188 perfis reais do backend é feita em worldApi.carregarMundo.
//
// Este arquivo é o limite do chunk lazy: react-globe.gl + three-globe
// (~601 KB raw / 193 KB gzip) só são baixados quando /alexandria/atlas
// abre, porque AtlasStub importa este componente via React.lazy.

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { MeshPhongMaterial, Color } from 'three';
import { geoCentroid, geoBounds } from 'd3-geo';
import { A, A2, AT, AS, AE } from '../../../design/alexandria-tokens';
import {
  carregarMundo,
  combustivelDominante,
  nomePaisPt,
  type MundoAtlas,
  type PaisFeature,
  type PaisResumo,
} from '../../../lib/atlas/worldApi';
import { PaisTooltip, type AlvoTooltip } from './PaisTooltip';
import { PaisPerfil } from './PaisPerfil';
import { BuscaPais } from './BuscaPais';

// ─────────────────────────────────────────────────────────────────────
// Curva de movimento — a MESMA cubic-bezier(0.65, 0, 0.35, 1) de
// AE.easing, avaliada em JS porque o preenchimento de hover vive num
// canvas WebGL, fora do alcance de transition CSS. Sem bounce, sem
// overshoot: um atlas de 1890 não quica.
// ─────────────────────────────────────────────────────────────────────

function bezierAlexandria(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const x1 = 0.65, y1 = 0, x2 = 0.35, y2 = 1;
  const cx = (t: number) => 3 * t * (1 - t) * (1 - t) * x1 + 3 * t * t * (1 - t) * x2 + t * t * t;
  const cy = (t: number) => 3 * t * (1 - t) * (1 - t) * y1 + 3 * t * t * (1 - t) * y2 + t * t * t;
  // resolve x(t) = p por bisseção — 20 iterações dão precisão de sobra
  let lo = 0, hi = 1, t = p;
  for (let i = 0; i < 20; i++) {
    t = (lo + hi) / 2;
    if (cx(t) < p) lo = t;
    else hi = t;
  }
  return cy(t);
}

const FADE_MS = 180; // dentro da janela 150-200ms do brief
const OPACIDADE_HOVER = 0.38;

// Duração do voo de câmera: AE.desenhoLongo (1200ms), o teto já
// travado do sistema. pointOfView não tem callback de término — o fim
// se marca por timer da mesma duração, e SÓ ENTÃO o perfil abre.
const VOO_MS = 1200;

// Direção da câmera em repouso: Atlântico, com Brasil, África e
// Europa visíveis no primeiro paint. A ALTITUDE de repouso não é
// constante — é computada pela composição do frontispício (Wave 28):
// o enquadramento em que a esfera encaixa nas mãos da gravura. Esse
// mesmo valor é o piso de zoom-out da Fase 4.
const DIR_REPOUSO = { lat: 8, lng: -35 };

// ─────────────────────────────────────────────────────────────────────
// Frontispício (Wave 28) — gravura de Atlas ajoelhado, mãos abertas
// onde a esfera repousa. Âncoras MEDIDAS na imagem original
// (1536×1024, alpha 0 em 81% dos pixels — fundo transparente
// verificado por decodificação):
//   mão esquerda x=28,1% y=9,0% · mão direita x=73,9% y=8,4%
//   ponto médio x=51% y≈8,7% · vão entre as mãos = 45,8% da largura
// ─────────────────────────────────────────────────────────────────────
const GRAV = {
  src: '/alexandria/gravuras/grav-atlas-segurando-o-globo.png',
  proporcao: 1024 / 1536, // altura/largura do arquivo
  maoMeioX: 0.51,
  maoY: 0.087,
  vao: 0.458,
} as const;

// Botões da composição — decididos vendo renderizado (ver CLAUDE.md):
//   larguraFig: largura MÁXIMA da gravura como fração da largura do
//               palco (a altura pode reduzir — ver comporFrontispicio)
//   raioPorVao: raio da esfera / vão entre as mãos. Testadas as duas
//               composições do brief: 0,5 (encaixada, centro na linha
//               das mãos) ENGOLE cabeça, braços e mãos da figura —
//               reprovada no render; 0,62 (palmas tocando o arco
//               inferior) é a escolhida.
// Revisão direta pós-Wave 28 (pedido do Aquiles): o corte monumental
// do topo caiu — a composição INTEIRA (esfera + figura) agora cabe na
// altura do palco em qualquer viewport, e o zoom do browser re-encaixa
// sozinho via ResizeObserver + re-pouso da câmera.
// raioPorVao subiu 0,62 → 0,78 na segunda revisão (pedido: "aumente o
// tamanho do globo"): a esfera ganha participação na composição e as
// mãos passam a segurar mais por baixo — o gesto de erguer.
const COMPOSICAO = { larguraFig: 0.78, raioPorVao: 0.78 } as const;
const MARGEM_TOPO = 10; // ar acima da esfera quando a altura limita

// Fade do frontispício no zoom-in: opacidade 1 no repouso, 0 quando a
// altitude cruza ALT_FADE_FIM — acima do pouso mais baixo do voo
// (alt ≤ 1,6), então a figura some ANTES do mergulho terminar.
const ALT_FADE_FIM = 1.7;

// Raio da esfera em cena (three-globe) e meia-abertura vertical da
// câmera (fov 50°, CONFIRMADO por medição: a razão raio/altura 0,344
// na altitude 2,3 bate com asin(R/d)/tan(fov/2) em 0,1%).
const RAIO_CENA = 100;
const TAN_MEIO_FOV = Math.tan((25 * Math.PI) / 180);

interface Composicao {
  imgW: number;
  imgH: number;
  imgLeft: number;
  imgTop: number;
  canvasH: number;
  canvasTop: number;
  /** Altitude que produz exatamente o raio do encaixe — o repouso e o
   *  piso de zoom-out (Fase 4). */
  altRepouso: number;
  /** Altitude em que a esfera COBRE o palco inteiro (nenhuma borda,
   *  nenhum creme). O voo de clique nunca pousa acima dela — "não pode
   *  ter nenhuma circunstância em que o mapa fica cortado". */
  altCobertura: number;
}

function comporFrontispicio(w: number, h: number, imersivo: boolean): Composicao {
  // Fator vertical da composição por unidade de largura da gravura:
  // corpo da figura abaixo das mãos + subida do centro (dy) + raio.
  // É o que permite ajustar a largura para a composição INTEIRA caber
  // na altura h — globo nunca cortado.
  const rFrac = COMPOSICAO.raioPorVao * GRAV.vao;
  const dyFrac = Math.sqrt(Math.max(0, rFrac * rFrac - (GRAV.vao / 2) * (GRAV.vao / 2)));
  const kVert = GRAV.proporcao * (1 - GRAV.maoY) + dyFrac + rFrac;
  const imgW = Math.min(COMPOSICAO.larguraFig * w, (h - MARGEM_TOPO) / kVert);
  const imgH = imgW * GRAV.proporcao;
  const imgTop = h - imgH; // pedestal na base do palco
  const imgLeft = w / 2 - GRAV.maoMeioX * imgW; // ponto médio das mãos no eixo da esfera
  const maoY = imgTop + GRAV.maoY * imgH;
  const vao = GRAV.vao * imgW;
  const raio = COMPOSICAO.raioPorVao * vao;
  // esfera tocando as duas palmas: centro sobe dy acima da linha das mãos
  const dy = Math.sqrt(Math.max(0, raio * raio - (vao / 2) * (vao / 2)));
  const centroY = maoY - dy;
  // MODO PÁGINA: o canvas desce até a BASE do palco (o mergulho usa a
  // altura inteira, sem faixa morta) e sobe simétrico acima do centro
  // da esfera — o excesso é cortado pelo overflow do palco.
  // MODO IMERSIVO (revisão 3 — "vire tipo o Google Earth"): esfera
  // CENTRADA no viewport, canvas = palco inteiro, e o repouso é o
  // planeta grande e INTEIRO — perto o suficiente para dominar a tela,
  // nunca cortado.
  const esferaCentroY = imersivo ? h / 2 : centroY;
  const canvasH = imersivo ? h : Math.max(2 * (h - centroY), 2.2 * raio);
  const canvasTop = esferaCentroY - canvasH / 2;
  // Ótica exata: altitude cuja distância d faz a esfera aparecer com
  // `raio` px num canvas de canvasH px sob fov de 50°.
  const altPorRaio = (raioPx: number): number => {
    const x = (2 * raioPx * TAN_MEIO_FOV) / canvasH;
    const dist = RAIO_CENA / Math.sin(Math.atan(x));
    return dist / RAIO_CENA - 1; // altitude em raios de globo, não distância
  };
  // Raio de repouso: no imersivo, o maior que cabe INTEIRO com margem
  // (86% da altura, limitado pela largura); na página, o encaixe nas
  // mãos da gravura.
  const raioRepouso = imersivo ? Math.min(0.43 * h, 0.46 * w) : raio;
  const altRepouso = altPorRaio(raioRepouso);
  // Cobertura: raio aparente que alcança o canto mais distante do
  // PALCO a partir do centro da esfera — abaixo dessa altitude não
  // existe borda visível.
  const raioCobertura = Math.hypot(w / 2, Math.max(esferaCentroY, h - esferaCentroY));
  const altCobertura = altPorRaio(raioCobertura);
  return { imgW, imgH, imgLeft, imgTop, canvasH, canvasTop, altRepouso, altCobertura };
}

interface AnimHover {
  de: number;
  para: number;
  t0: number;
}

function chaveFeature(f: PaisFeature): string {
  return f.properties.a3 ?? f.properties.name;
}

export interface AtlasGloboProps {
  /** Recebe a opacidade de ambiente (1 no repouso → 0 no mergulho),
   *  na MESMA curva do fade do frontispício. É como a página esmaece
   *  título, descrição e referências quando só o globo deve restar. */
  aoMudarOpacidadeAmbiente?: (opacidade: number) => void;
  /** Modo imersivo (revisão 3): palco em tela cheia, sem header nem
   *  rodapé, planeta no enquadramento Google Earth + barra de busca. */
  imersivo: boolean;
  aoEntrarImersivo?: () => void;
  aoSairImersivo?: () => void;
}

export function AtlasGlobo({ aoMudarOpacidadeAmbiente, imersivo, aoEntrarImersivo, aoSairImersivo }: AtlasGloboProps) {
  const [mundo, setMundo] = useState<MundoAtlas | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tamanho, setTamanho] = useState<{ w: number; h: number } | null>(null);
  const [hover, setHover] = useState<PaisFeature | null>(null);
  const [selecionado, setSelecionado] = useState<{
    feature: PaisFeature;
    resumo: PaisResumo | null;
  } | null>(null);
  const [, tick] = useReducer((c: number) => c + 1, 0);

  const areaRef = useRef<HTMLDivElement | null>(null);
  const globoRef = useRef<GlobeMethods | undefined>(undefined);
  const animsRef = useRef(new Map<string, AnimHover>());
  const opacidadesRef = useRef(new Map<string, number>());
  const rafRef = useRef<number | null>(null);
  const vooRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voandoRef = useRef(false);
  const figuraRef = useRef<HTMLImageElement | null>(null);
  const controlesRef = useRef<{ removeEventListener: (t: string, f: () => void) => void } | null>(null);
  const aoMudarCameraRef = useRef<(() => void) | null>(null);
  const compRef = useRef<Composicao | null>(null);
  const altRepousoAnteriorRef = useRef<number | null>(null);
  const [longeDoRepouso, setLongeDoRepouso] = useState(false);
  const ambienteRef = useRef(aoMudarOpacidadeAmbiente);
  ambienteRef.current = aoMudarOpacidadeAmbiente;
  const aoVoltarRef = useRef<(() => void) | null>(null);
  const entrarImersivoRef = useRef(aoEntrarImersivo);
  entrarImersivoRef.current = aoEntrarImersivo;
  const sairImersivoRef = useRef(aoSairImersivo);
  sairImersivoRef.current = aoSairImersivo;
  // detecção de transição de modo em tempo de render: o snap do
  // configurarCamera fica suspenso até o voo de transição assentar
  const imersivoRef = useRef(imersivo);
  const transicaoModoRef = useRef(false);
  if (imersivoRef.current !== imersivo) {
    imersivoRef.current = imersivo;
    transicaoModoRef.current = true;
  }
  /** país clicado ainda no modo página — o voo dispara depois que o
   *  palco expande e a composição imersiva assenta */
  const vooPendenteRef = useRef<PaisFeature | null>(null);

  // ── dado: TopoJSON + 188 perfis, uma vez ──────────────────────────
  useEffect(() => {
    let vivo = true;
    carregarMundo()
      .then((m) => { if (vivo) setMundo(m); })
      .catch(() => {
        if (vivo) setErro('Não foi possível carregar os perfis energéticos agora. Recarregue a página para tentar de novo.');
      });
    return () => { vivo = false; };
  }, []);

  // ── medida do palco: o canvas WebGL precisa de width/height
  //    numéricos; medimos o wrapper com ResizeObserver ───────────────
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const medir = () => {
      const r = el.getBoundingClientRect();
      setTamanho({ w: Math.round(r.width), h: Math.round(r.height) });
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── fade de hover: rAF + bezier próprio ───────────────────────────
  const passoFade = useCallback(() => {
    const agora = performance.now();
    let vivoAlgum = false;
    animsRef.current.forEach((anim, chave) => {
      const p = Math.min(1, (agora - anim.t0) / FADE_MS);
      const valor = anim.de + (anim.para - anim.de) * bezierAlexandria(p);
      opacidadesRef.current.set(chave, valor);
      if (p < 1) vivoAlgum = true;
    });
    if (!vivoAlgum) {
      animsRef.current.forEach((anim, chave) => {
        if (anim.para === 0) opacidadesRef.current.delete(chave);
      });
      animsRef.current.clear();
    }
    tick();
    rafRef.current = vivoAlgum ? requestAnimationFrame(passoFade) : null;
  }, []);

  const iniciarFade = useCallback((chave: string, para: number) => {
    const atual = opacidadesRef.current.get(chave) ?? 0;
    if (atual === para) return;
    animsRef.current.set(chave, { de: atual, para, t0: performance.now() });
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(passoFade);
  }, [passoFade]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (vooRef.current !== null) clearTimeout(vooRef.current);
    if (controlesRef.current && aoMudarCameraRef.current) {
      controlesRef.current.removeEventListener('change', aoMudarCameraRef.current);
    }
  }, []);

  // ESC em camadas — mesmo idioma dos overlays do resto do sistema:
  // perfil aberto → fecha e reenquadra; senão, imersivo → volta à
  // página do atlas. (A busca intercepta o próprio ESC para limpar.)
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selecionado !== null) {
        aoVoltarRef.current?.();
      } else if (imersivoRef.current) {
        sairImersivoRef.current?.();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [selecionado]);

  const aoHover = useCallback((poligono: object | null) => {
    const f = (poligono as PaisFeature | null) ?? null;
    setHover((anterior) => {
      if (anterior && anterior !== f) iniciarFade(chaveFeature(anterior), 0);
      if (f && f !== anterior) iniciarFade(chaveFeature(f), 1);
      return f;
    });
  }, [iniciarFade]);

  // ── voo até um país → SÓ ENTÃO o perfil abre. Navegar antes do
  //    movimento terminar cortaria a sensação de voar até lá. ────────
  const voarAtePais = useCallback((f: PaisFeature) => {
    const globo = globoRef.current;
    if (!mundo || !globo) return;

    const [lng, lat] = geoCentroid(f);
    // Altitude proporcional ao tamanho do país — a Rússia não cabe no
    // enquadramento de Fiji. geoBounds em graus; clamp em [0.5, 1.6].
    // Teto (segunda revisão): nunca pousa acima da altitude de
    // cobertura — o mapa preenche o palco inteiro ao fim de todo voo,
    // sem borda de esfera nem creme à mostra ("mapa cortado").
    const [[oeste, sul], [leste, norte]] = geoBounds(f);
    const spanLng = Math.abs(leste - oeste) > 180 ? 360 - Math.abs(leste - oeste) : Math.abs(leste - oeste);
    const span = Math.max(spanLng, Math.abs(norte - sul));
    const cobertura = compRef.current?.altCobertura ?? 1.6;
    const altitude = Math.min(cobertura, Math.min(1.6, Math.max(0.5, span / 40)));

    setSelecionado(null); // perfil anterior sai antes do voo, não durante
    voandoRef.current = true;
    globo.pointOfView({ lat, lng, altitude }, VOO_MS);
    vooRef.current = setTimeout(() => {
      voandoRef.current = false;
      const a3 = f.properties.a3;
      setSelecionado({ feature: f, resumo: a3 ? (mundo.porIso.get(a3) ?? null) : null });
    }, VOO_MS + 50);
  }, [mundo]);

  // Clique (ou busca): no modo página, primeiro ABRE o imersivo — o
  // voo fica pendente e dispara quando o palco expandido assenta.
  const aoClicar = useCallback((poligono: object) => {
    const f = poligono as PaisFeature;
    if (!mundo || voandoRef.current) return;
    if (!imersivoRef.current) {
      vooPendenteRef.current = f;
      entrarImersivoRef.current?.();
      return;
    }
    voarAtePais(f);
  }, [mundo, voarAtePais]);

  // ── transição de modo: depois do palco trocar de geometria, voa —
  //    para o país pendente (clique que abriu o modo) ou para o
  //    repouso do modo novo. AE.desenhoCurto para o assentamento. ────
  useEffect(() => {
    if (!transicaoModoRef.current) return;
    const t = setTimeout(() => {
      const globo = globoRef.current;
      const comp = compRef.current;
      if (globo && comp) {
        const pendente = vooPendenteRef.current;
        vooPendenteRef.current = null;
        if (pendente) {
          transicaoModoRef.current = false;
          voarAtePais(pendente);
          return;
        }
        voandoRef.current = true;
        globo.pointOfView({ altitude: comp.altRepouso }, 700);
        vooRef.current = setTimeout(() => {
          voandoRef.current = false;
          transicaoModoRef.current = false;
        }, 750);
      } else {
        transicaoModoRef.current = false;
      }
    }, 130);
    return () => clearTimeout(t);
  }, [imersivo, voarAtePais]);

  // ── retorno: perfil fecha no clique, câmera voa de volta —
  //    movimento simétrico ao de entrada, mesma duração, pousando no
  //    MESMO enquadramento travado do frontispício ────────────────────
  const aoVoltar = useCallback(() => {
    setSelecionado(null);
    setLongeDoRepouso(false);
    const globo = globoRef.current;
    const comp = compRef.current;
    if (globo && comp) {
      voandoRef.current = true;
      globo.pointOfView({ ...DIR_REPOUSO, altitude: comp.altRepouso }, VOO_MS);
      vooRef.current = setTimeout(() => { voandoRef.current = false; }, VOO_MS + 50);
    }
  }, []);
  aoVoltarRef.current = aoVoltar;

  // ── configuração de câmera IDEMPOTENTE (segunda revisão) ──────────
  // Medido na linha do tempo pós-load: o three-render-objects pode
  // recriar câmera/controles DEPOIS do onGlobeReady — o listener de
  // 'change', o maxDistance e até o pointOfView aplicados no ready
  // eram clobberados (câmera largada no skyRadius, alt ~538). A
  // resposta não é acertar o timing, é ser re-aplicável: esta função
  // detecta troca de instância dos controles, reata o listener e
  // reaplica piso, luz e pouso. Chamada no ready, no resize e num
  // assentamento pós-mount.
  const configurarCamera = useCallback(() => {
    const globo = globoRef.current;
    const comp = compRef.current;
    if (!globo || !comp) return;

    const controles = globo.controls() as unknown as {
      addEventListener: (t: string, f: () => void) => void;
      removeEventListener: (t: string, f: () => void) => void;
      maxDistance: number;
    };

    if (controlesRef.current !== controles) {
      // instância nova (init tardio do TRO / StrictMode): reata tudo
      if (controlesRef.current && aoMudarCameraRef.current) {
        controlesRef.current.removeEventListener('change', aoMudarCameraRef.current);
      }
      // Fade do frontispício + página dirigido pela câmera: 'change'
      // cobre roda do mouse E o tween do pointOfView — sem estado
      // React por frame, só style direto.
      const aoMudarCamera = () => {
        const g = globoRef.current;
        if (!g) return;
        const alt = g.pointOfView().altitude;
        const repouso = compRef.current?.altRepouso ?? 2.3;
        // No imersivo a página inteira fica apagada (figura + coluna):
        // o repouso do modo (~1,6) está abaixo do limiar de fade, e a
        // fórmula da página inverteria o sinal — força zero.
        const teto = repouso * 0.97;
        const o = imersivoRef.current
          ? 0
          : Math.max(0, Math.min(1, (alt - ALT_FADE_FIM) / (teto - ALT_FADE_FIM)));
        const figura = figuraRef.current;
        if (figura) figura.style.opacity = o.toFixed(3);
        ambienteRef.current?.(o);
        // Gatilho de entrada por roda (revisão 3): zoom para dentro a
        // partir do repouso da página ABRE o modo imersivo.
        if (!imersivoRef.current && !voandoRef.current && !transicaoModoRef.current && alt < repouso * 0.92) {
          entrarImersivoRef.current?.();
        }
        // botão de reenquadrar: só quando o afastamento veio da roda
        setLongeDoRepouso(alt < repouso * 0.85 && !voandoRef.current && !transicaoModoRef.current);
      };
      controles.addEventListener('change', aoMudarCamera);
      controlesRef.current = controles;
      aoMudarCameraRef.current = aoMudarCamera;
    }

    // Fase 4 — piso de zoom-out pelo mecanismo NATIVO da biblioteca:
    // OrbitControls.maxDistance (default Infinity; clamp interno em
    // _clampDistance). minDistance fica intocado: é ele que permite o
    // mergulho (globe.gl o põe rente à superfície).
    controles.maxDistance = (1 + comp.altRepouso) * RAIO_CENA;

    // Luz de gabinete, não de estúdio (medida por pixel na Wave 27).
    for (const luz of globo.lights()) {
      const l = luz as unknown as { type: string; intensity: number };
      if (l.type === 'DirectionalLight') l.intensity = 0.4;
      if (l.type === 'AmbientLight') l.intensity = 3.4;
    }

    // Pouso: primeira vez, câmera fora do piso (estado clobberado),
    // ou estava NO repouso anterior e o palco mudou de tamanho.
    // Suspenso durante transição de modo — o voo da transição é quem
    // leva a câmera ao repouso novo, animado, não um snap.
    const alt = globo.pointOfView().altitude;
    const anterior = altRepousoAnteriorRef.current;
    const foraDoPiso = alt > comp.altRepouso + 0.05;
    const estavaEmRepouso = anterior !== null && Math.abs(alt - anterior) < 0.05;
    if (!voandoRef.current && !transicaoModoRef.current && (anterior === null || foraDoPiso || estavaEmRepouso)) {
      globo.pointOfView({ ...DIR_REPOUSO, altitude: comp.altRepouso }, 0);
    }
    altRepousoAnteriorRef.current = comp.altRepouso;

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__atlasGlobo = globo;
    }
  }, []);

  const aoGloboPronto = useCallback(() => {
    configurarCamera();
  }, [configurarCamera]);

  // ── cores — tudo token, nada de neon ──────────────────────────────
  // Superfície: navy fosco. Brilho quase zero: instrumento de gabinete,
  // não render de estúdio.
  const materialRef = useRef<MeshPhongMaterial | null>(null);
  if (materialRef.current === null) {
    materialRef.current = new MeshPhongMaterial({
      color: new Color(A.navy),
      shininess: 6,
      specular: new Color(A2.navyAfundado),
    });
  }

  // Preenchimento de topo: terra com dado ganha lavagem de creme um
  // grau mais forte que terra sem dado — a diferença é legível mas
  // não grita. Hover soma terracota (A.terracota #A8462A) com a
  // opacidade animada — cor de ESTADO, nunca glow.
  const corTopo = (obj: object): string => {
    const f = obj as PaisFeature;
    const o = opacidadesRef.current.get(chaveFeature(f)) ?? 0;
    if (o > 0.004) return `rgba(168, 70, 42, ${(o * OPACIDADE_HOVER).toFixed(3)})`;
    const temDado = f.properties.a3 !== null && (mundo?.porIso.has(f.properties.a3) ?? false);
    return temDado ? 'rgba(242, 233, 214, 0.10)' : 'rgba(242, 233, 214, 0.04)';
  };

  // Contorno: ouro-sépia sobre navy (A2.ouroSobreNavy) — decidido
  // olhando renderizado contra a alternativa creme; ver relatório da
  // wave. Traço fino, mesma família do fio duplo do frontispício.
  const corContorno = useCallback(() => A2.ouroSobreNavy, []);
  const corLateral = useCallback(() => 'rgba(0, 0, 0, 0)', []);

  // ── composição: derivada do tamanho medido + modo ─────────────────
  const comp: Composicao | null = useMemo(
    () => (tamanho ? comporFrontispicio(tamanho.w, tamanho.h, imersivo) : null),
    [tamanho, imersivo],
  );
  compRef.current = comp;

  // Piso, pouso e listener acompanham resize (inclusive zoom do
  // browser) E qualquer init tardio do three-render-objects que recrie
  // os controles: aplica já e reaplica em janelas curtas de
  // assentamento. configurarCamera é idempotente — reaplicar é barato.
  useEffect(() => {
    if (mundo === null || comp === null) return;
    configurarCamera();
    const timers = [50, 250, 700, 1500].map((ms) => setTimeout(configurarCamera, ms));
    return () => timers.forEach(clearTimeout);
  }, [mundo, comp, configurarCamera]);

  // ── alvo do tooltip: derivado do hover + índice O(1) por ISO ──────
  let alvoTooltip: AlvoTooltip | null = null;
  if (hover && mundo) {
    const a3 = hover.properties.a3;
    const resumo = a3 ? (mundo.porIso.get(a3) ?? null) : null;
    alvoTooltip = {
      nome: nomePaisPt(hover.properties, resumo?.countryName),
      resumo,
      dominante: resumo ? combustivelDominante(resumo.fuelMix) : null,
    };
  }

  return (
    <div
      ref={areaRef}
      role="img"
      aria-label="Globo interativo com o perfil energético de 188 países soberanos. Passe o cursor sobre um país para o resumo; clique para voar até ele e abrir o perfil completo."
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        // Canvas TRANSPARENTE (Wave 28): a esfera repousa direto sobre
        // o papel creme do canvas central — nenhum retângulo de fundo
        // atrás dela, em nenhum nível de zoom.
        background: 'transparent',
        overflow: 'hidden',
        cursor: hover ? 'pointer' : 'grab',
      }}
    >
      {erro !== null && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: AS.xl }}>
          <p style={{ ...AT.corpo, fontSize: '14px', color: A.tintaSuave, maxWidth: '46ch', textAlign: 'center', margin: 0 }}>
            {erro}
          </p>
        </div>
      )}

      {erro === null && (mundo === null || tamanho === null) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ ...AT.rotulo, color: A.terracota }}>Montando o globo…</span>
        </div>
      )}

      {/* Frontispício ATRÁS do canvas: Atlas ajoelhado, mãos abertas
          onde a esfera pousa. Sem lazy — o bug da Wave 10 provou que
          lazy nunca dispara em container que já está na viewport. */}
      {erro === null && comp !== null && (
        <img
          ref={figuraRef}
          src={GRAV.src}
          alt=""
          aria-hidden="true"
          decoding="async"
          style={{
            position: 'absolute',
            left: comp.imgLeft,
            top: comp.imgTop,
            width: comp.imgW,
            height: comp.imgH,
            // sem z-index em ninguém: a ordem do DOM (figura → canvas →
            // tooltip → perfil) é a ordem de pintura, e PaisTooltip é
            // intocável nesta wave
            pointerEvents: 'none',
            opacity: 1,
            transition: `opacity ${AE.estado} ${AE.easing}`,
          }}
        />
      )}

      {erro === null && mundo !== null && tamanho !== null && comp !== null && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: comp.canvasTop,
            width: '100%',
            height: comp.canvasH,
          }}
        >
          <Globe
            ref={globoRef}
            width={tamanho.w}
            height={comp.canvasH}
            backgroundColor="rgba(0,0,0,0)"
            showAtmosphere={false}
            globeMaterial={materialRef.current}
            onGlobeReady={aoGloboPronto}
            polygonsData={mundo.features}
            polygonAltitude={0.006}
            polygonCapColor={corTopo}
            polygonSideColor={corLateral}
            polygonStrokeColor={corContorno}
            polygonsTransitionDuration={0}
            onPolygonHover={aoHover}
            onPolygonClick={aoClicar}
            animateIn={false}
          />
        </div>
      )}

      <PaisTooltip alvo={alvoTooltip} areaRef={areaRef} />

      {/* Barra de ferramentas do modo imersivo (revisão 3): sair à
          esquerda, busca de país ao centro, e o espaço de ferramentas
          futuras declarado honestamente — nada finge existir. */}
      {imersivo && mundo !== null && (
        <div
          style={{
            position: 'absolute',
            top: AS.md,
            left: AS.md,
            right: AS.md,
            display: 'flex',
            alignItems: 'flex-start',
            gap: AS.lg,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSelecionado(null);
              sairImersivoRef.current?.();
            }}
            style={{
              background: A2.cremeSuperficie,
              border: `1px solid ${A.fioSobreCreme}`,
              borderRadius: 0,
              padding: `${AS.xs} ${AS.md}`,
              cursor: 'pointer',
              ...AT.rotulo,
              fontSize: '9px',
              color: A.tintaSobreCreme,
              whiteSpace: 'nowrap',
            }}
          >
            ← Página do atlas
          </button>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <BuscaPais mundo={mundo} aoEscolher={aoClicar} />
          </div>

          <span
            style={{
              border: `1px dashed ${A.terracota}`,
              padding: `${AS.xs} ${AS.md}`,
              ...AT.rotulo,
              fontSize: '8px',
              letterSpacing: '0.13em',
              color: A.terracota,
              whiteSpace: 'nowrap',
            }}
          >
            Mais ferramentas em produção
          </span>
        </div>
      )}

      {/* Reenquadrar: aparece quando o usuário se afastou do repouso
          pela roda (nunca durante voo dirigido nem com perfil aberto).
          Caixa de fio sobre papel — o idioma de ação do sistema. */}
      {longeDoRepouso && selecionado === null && (
        <button
          type="button"
          onClick={aoVoltar}
          style={{
            position: 'absolute',
            left: AS.md,
            bottom: AS.md,
            background: A2.cremeSuperficie,
            border: `1px solid ${A.fioSobreCreme}`,
            borderRadius: 0,
            padding: `${AS.xs} ${AS.md}`,
            cursor: 'pointer',
            ...AT.rotulo,
            fontSize: '9px',
            color: A.tintaSobreCreme,
          }}
        >
          ← Enquadrar o globo
        </button>
      )}

      {selecionado !== null && (
        <PaisPerfil
          nome={nomePaisPt(selecionado.feature.properties, selecionado.resumo?.countryName)}
          isoA3={selecionado.feature.properties.a3}
          resumo={selecionado.resumo}
          aoVoltar={aoVoltar}
        />
      )}
    </div>
  );
}

export default AtlasGlobo;
