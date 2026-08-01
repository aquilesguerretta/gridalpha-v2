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
//   larguraFig: largura da gravura como fração da largura do palco
//   raioPorVao: raio da esfera / vão entre as mãos. Testadas as duas
//               composições do brief: 0,5 (encaixada, centro na linha
//               das mãos) ENGOLE cabeça, braços e mãos da figura —
//               reprovada no render; 0,62 (monumental, palmas tocando
//               o arco inferior, topo cortando o limite do palco em
//               viewport baixo) é a escolhida.
const COMPOSICAO = { larguraFig: 0.73, raioPorVao: 0.62 } as const;

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
}

function comporFrontispicio(w: number, h: number): Composicao {
  const imgW = COMPOSICAO.larguraFig * w;
  const imgH = imgW * GRAV.proporcao;
  const imgTop = h - imgH; // pedestal na base do palco
  const imgLeft = w / 2 - GRAV.maoMeioX * imgW; // ponto médio das mãos no eixo da esfera
  const maoY = imgTop + GRAV.maoY * imgH;
  const vao = GRAV.vao * imgW;
  const raio = COMPOSICAO.raioPorVao * vao;
  // esfera tocando as duas palmas: centro sobe dy acima da linha das mãos
  const dy = Math.sqrt(Math.max(0, raio * raio - (vao / 2) * (vao / 2)));
  const centroY = maoY - dy;
  // O canvas desce até a BASE do palco (o mergulho usa a altura
  // inteira, sem faixa morta) e sobe simétrico acima do centro da
  // esfera — o excesso é cortado pelo overflow do palco.
  const canvasH = Math.max(2 * (h - centroY), 2.2 * raio);
  const canvasTop = centroY - canvasH / 2;
  // Ótica exata: altitude cuja distância d faz a esfera aparecer com
  // `raio` px num canvas de canvasH px sob fov de 50°.
  const x = (2 * raio * TAN_MEIO_FOV) / canvasH;
  const dist = RAIO_CENA / Math.sin(Math.atan(x));
  const altRepouso = dist / RAIO_CENA - 1;
  return { imgW, imgH, imgLeft, imgTop, canvasH, canvasTop, altRepouso };
}

interface AnimHover {
  de: number;
  para: number;
  t0: number;
}

function chaveFeature(f: PaisFeature): string {
  return f.properties.a3 ?? f.properties.name;
}

export function AtlasGlobo() {
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

  const aoHover = useCallback((poligono: object | null) => {
    const f = (poligono as PaisFeature | null) ?? null;
    setHover((anterior) => {
      if (anterior && anterior !== f) iniciarFade(chaveFeature(anterior), 0);
      if (f && f !== anterior) iniciarFade(chaveFeature(f), 1);
      return f;
    });
  }, [iniciarFade]);

  // ── clique → voo de câmera → SÓ ENTÃO o perfil abre. Navegar antes
  //    do movimento terminar cortaria a sensação de voar até lá. ─────
  const aoClicar = useCallback((poligono: object) => {
    const f = poligono as PaisFeature;
    const globo = globoRef.current;
    if (!mundo || !globo || voandoRef.current) return;

    const [lng, lat] = geoCentroid(f);
    // Altitude proporcional ao tamanho do país — a Rússia não cabe no
    // enquadramento de Fiji. geoBounds em graus; clamp em [0.5, 1.6].
    const [[oeste, sul], [leste, norte]] = geoBounds(f);
    const spanLng = Math.abs(leste - oeste) > 180 ? 360 - Math.abs(leste - oeste) : Math.abs(leste - oeste);
    const span = Math.max(spanLng, Math.abs(norte - sul));
    const altitude = Math.min(1.6, Math.max(0.5, span / 40));

    setSelecionado(null); // perfil anterior sai antes do voo, não durante
    voandoRef.current = true;
    globo.pointOfView({ lat, lng, altitude }, VOO_MS);
    vooRef.current = setTimeout(() => {
      voandoRef.current = false;
      const a3 = f.properties.a3;
      setSelecionado({ feature: f, resumo: a3 ? (mundo.porIso.get(a3) ?? null) : null });
    }, VOO_MS + 50);
  }, [mundo]);

  // ── retorno: perfil fecha no clique, câmera voa de volta —
  //    movimento simétrico ao de entrada, mesma duração, pousando no
  //    MESMO enquadramento travado do frontispício ────────────────────
  const aoVoltar = useCallback(() => {
    setSelecionado(null);
    const globo = globoRef.current;
    const comp = compRef.current;
    if (globo && comp) {
      voandoRef.current = true;
      globo.pointOfView({ ...DIR_REPOUSO, altitude: comp.altRepouso }, VOO_MS);
      vooRef.current = setTimeout(() => { voandoRef.current = false; }, VOO_MS + 50);
    }
  }, []);

  const aoGloboPronto = useCallback(() => {
    const globo = globoRef.current;
    if (!globo) return;
    globo.pointOfView({ ...DIR_REPOUSO, altitude: compRef.current?.altRepouso ?? 2.3 }, 0);
    // Fade do frontispício dirigido pela câmera: o evento 'change' dos
    // OrbitControls cobre roda do mouse E o tween do pointOfView, então
    // a figura esmaece em qualquer zoom-in e reaparece no retorno —
    // sem estado React por frame, só style no <img>.
    const controles = globo.controls() as unknown as {
      addEventListener: (t: string, f: () => void) => void;
      removeEventListener: (t: string, f: () => void) => void;
      maxDistance: number;
    };
    // Fase 4 — piso de zoom-out pelo mecanismo NATIVO da biblioteca:
    // OrbitControls.maxDistance (three/examples/jsm/controls/
    // OrbitControls.js, default Infinity; clamp interno em
    // _clampDistance), que o globe.gl inicializa em globeR*100
    // (globe.gl.mjs L549). Reescrevemos para a distância do repouso do
    // frontispício — a roda do mouse trava EXATAMENTE no encaixe.
    // minDistance fica intocado: é ele que permite o mergulho de hoje
    // (globe.gl o põe rente à superfície, L548).
    if (compRef.current) {
      controles.maxDistance = (1 + compRef.current.altRepouso) * RAIO_CENA;
    }
    const aoMudarCamera = () => {
      const figura = figuraRef.current;
      if (!figura) return;
      const alt = globo.pointOfView().altitude;
      const teto = (compRef.current?.altRepouso ?? 2.3) * 0.97;
      const o = Math.max(0, Math.min(1, (alt - ALT_FADE_FIM) / (teto - ALT_FADE_FIM)));
      figura.style.opacity = o.toFixed(3);
    };
    controles.addEventListener('change', aoMudarCamera);
    controlesRef.current = controles;
    aoMudarCameraRef.current = aoMudarCamera;
    // Luz de gabinete, não de estúdio: a cena nasce com ambiente π e
    // direcional 1,88 (medido), o que desenha um brilho lateral de
    // render 3D. Um globo de 1890 é papel fosco sob luz difusa —
    // direcional cai para 0,4 (modelagem suave, medida por pixel:
    // uniforme com 0, brilho de estúdio com 1,88) e o ambiente vai a
    // 3,4 para compensar o nível.
    for (const luz of globo.lights()) {
      const l = luz as unknown as { type: string; intensity: number };
      if (l.type === 'DirectionalLight') l.intensity = 0.4;
      if (l.type === 'AmbientLight') l.intensity = 3.4;
    }
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__atlasGlobo = globo;
    }
  }, []);

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

  // ── composição do frontispício: derivada do tamanho medido ────────
  const comp: Composicao | null = useMemo(
    () => (tamanho ? comporFrontispicio(tamanho.w, tamanho.h) : null),
    [tamanho],
  );
  compRef.current = comp;

  // Piso de zoom-out acompanha o repouso quando o palco redimensiona.
  useEffect(() => {
    const controles = controlesRef.current as { maxDistance?: number } | null;
    if (controles && comp) {
      controles.maxDistance = (1 + comp.altRepouso) * RAIO_CENA;
    }
  }, [comp]);

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
