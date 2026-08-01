// AtlasGlobo — o globo 3D do Atlas Mundial (Wave 27).
//
// Estética de instrumento científico de gabinete, 1880-1900: esfera
// navy fosca, fronteiras em traço fino, campo quente escuro atrás.
// Nunca gêmeo digital, nunca terminal de trading — sem atmosfera
// brilhante (showAtmosphere DESLIGADO), sem gradiente, sem neon.
//
// Fronteiras vêm do TopoJSON real da Natural Earth 110m servido em
// /alexandria/geo/world-110m.json — nunca de imagem gerada. A junção
// com os 188 perfis reais do backend é feita em worldApi.carregarMundo.
//
// Este arquivo é o limite do chunk lazy: react-globe.gl + three-globe
// (~601 KB raw / 193 KB gzip) só são baixados quando /alexandria/atlas
// abre, porque AtlasStub importa este componente via React.lazy.

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { MeshPhongMaterial, Color } from 'three';
import { geoCentroid, geoBounds } from 'd3-geo';
import { A, A2, AT, AS } from '../../../design/alexandria-tokens';
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

// Pouso da câmera em repouso: Atlântico, com Brasil, África e Europa
// visíveis no primeiro paint.
const POV_REPOUSO = { lat: 8, lng: -35, altitude: 2.3 };

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
  //    movimento simétrico ao de entrada, mesma duração ──────────────
  const aoVoltar = useCallback(() => {
    setSelecionado(null);
    const globo = globoRef.current;
    if (globo) {
      voandoRef.current = true;
      globo.pointOfView(POV_REPOUSO, VOO_MS);
      vooRef.current = setTimeout(() => { voandoRef.current = false; }, VOO_MS + 50);
    }
  }, []);

  const aoGloboPronto = useCallback(() => {
    const globo = globoRef.current;
    if (!globo) return;
    globo.pointOfView(POV_REPOUSO, 0);
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

      {erro === null && mundo !== null && tamanho !== null && (
        <Globe
          ref={globoRef}
          width={tamanho.w}
          height={tamanho.h}
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
