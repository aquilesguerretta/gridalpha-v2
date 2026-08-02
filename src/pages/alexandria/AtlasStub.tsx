// AtlasStub — Atlas Mundial de Energia (Wave 27; frontispício e
// composição de página na Wave 28 + revisão direta).
//
// O nome do arquivo fica: é o contrato de rota da Wave 6, e o
// AlexandriaRouter (fora da posse) importa daqui.
//
// Revisão direta pós-Wave 28 (pedido do Aquiles): o globo inteiro na
// tela — o palco ocupa a altura útil do viewport, e título, descrição
// e referências saem de cima/baixo para a COLUNA LATERAL esquerda,
// flutuando sobre o creme vazio ao lado da figura. Nada rouba altura
// do frontispício.
//
// O globo é carregado via React.lazy DE PROPÓSITO: react-globe.gl +
// three-globe pesam ~601 KB raw (193 KB gzip) e o app não tem nenhum
// outro lazy-loading — sem esta fronteira, o stack Three entraria no
// bundle que TODA página da plataforma baixa. Com ela, só quem abre
// /alexandria/atlas paga o chunk. Veto limpo = npm uninstall + revert
// deste arquivo.

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { AlexandriaShell } from '@/components/alexandria/shell/AlexandriaShell';
import { A, A2, AT, AS, AR, AE } from '@/design/alexandria-tokens';
import { carregarMundo, type MundoAtlas } from '@/lib/atlas/worldApi';
import type { FiltroFonte, ModoCor } from '@/lib/atlas/atlasDerivacoes';
import { AtlasControles } from '@/components/alexandria/atlas/AtlasControles';

const AtlasGlobo = lazy(() => import('@/components/alexandria/atlas/AtlasGlobo'));

// Duração do zoom entre a página e o modo imersivo. Vive AQUI (e vai
// por prop) porque importar do AtlasGlobo puxaria o chunk lazy para o
// bundle de entrada. A mesma constante rege o palco, a figura e a
// altitude da câmera — as três precisam ser solidárias.
const MODO_MS = 900;

interface LegendaAtlas {
  fronteiras: number;
  comPerfil: number;
  semDado: number;
  perfisSemGeometria: number;
  ano: string;
}

/** Tudo derivado da junção real — nenhuma contagem digitada. Se o
 *  catálogo do backend crescer, a legenda acompanha. */
function derivarLegenda(mundo: MundoAtlas): LegendaAtlas {
  const comPerfil = mundo.features.filter(
    (f) => f.properties.a3 !== null && mundo.porIso.has(f.properties.a3),
  ).length;
  return {
    fronteiras: mundo.features.length,
    comPerfil,
    semDado: mundo.features.length - comPerfil,
    perfisSemGeometria: mundo.porIso.size - comPerfil,
    ano: mundo.meta.year ?? '—',
  };
}

function LinhaLegenda({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: AS.md,
        borderBottom: `1px solid ${A2.fioClaroSobreCreme}`,
        padding: `${AS.xs} 0`,
      }}
    >
      <span style={{ ...AT.rotulo, fontSize: '8px', letterSpacing: '0.13em', color: A2.tintaMetadado }}>
        {rotulo}
      </span>
      <span style={{ ...AT.dado, fontSize: '13px', color: A.tintaSobreCreme }}>{valor}</span>
    </div>
  );
}

interface Ret {
  top: number;
  left: number;
  w: number;
  h: number;
}

export function AtlasStub() {
  const [legenda, setLegenda] = useState<LegendaAtlas | null>(null);
  // O mundo já carregado, para os controles derivarem sem refazer
  // busca — `carregarMundo` tem cache de módulo, então é a MESMA
  // promise que o globo consome.
  const [mundo, setMundo] = useState<MundoAtlas | null>(null);
  // Estado analítico (Wave 35): quem decide é aqui, o globo só desenha.
  const [modoCor, setModoCor] = useState<ModoCor>('nenhum');
  const [filtro, setFiltro] = useState<FiltroFonte>(null);
  const [pedidoDeVoo, setPedidoDeVoo] = useState<{ iso: string; nonce: number } | null>(null);
  const colunaRef = useRef<HTMLDivElement | null>(null);
  const espacadorRef = useRef<HTMLDivElement | null>(null);
  // Modo imersivo (revisão 3): o palco vira overlay FIXO por cima de
  // header e rodapé — o shell nem é tocado; ao sair, tudo volta. O
  // globo continua montado no mesmo nó, então nada recarrega.
  const [imersivo, setImersivo] = useState(false);
  // Retângulo do palco quando ele está FIXO (durante a animação e no
  // imersivo). null = palco no fluxo, dentro do espaçador.
  const [retFixo, setRetFixo] = useState<Ret | null>(null);
  const [animandoModo, setAnimandoModo] = useState(false);
  const [dimPagina, setDimPagina] = useState<Ret | null>(null);
  const [dimJanela, setDimJanela] = useState({ w: 0, h: 0 });
  const [larguraMain, setLarguraMain] = useState<number | null>(null);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Geometria do palco no modo página (o espaçador reserva o lugar no
  // fluxo, mesmo quando o palco está fixo) e da janela.
  useEffect(() => {
    const el = espacadorRef.current;
    if (!el) return;
    const main = el.closest('main');
    const medir = () => {
      const r = el.getBoundingClientRect();
      setDimPagina({ top: r.top, left: r.left, w: r.width, h: r.height });
      setDimJanela({ w: window.innerWidth, h: window.innerHeight });
      if (main) setLarguraMain(main.clientWidth);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    if (main) ro.observe(main);
    main?.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
    return () => {
      ro.disconnect();
      main?.removeEventListener('scroll', medir);
      window.removeEventListener('resize', medir);
    };
  }, []);

  // ── Zoom entre os modos (revisão 5) ───────────────────────────────
  // `fixed` ↔ `relative` não é animável, então a troca acontece em três
  // tempos: o palco vira FIXO no retângulo que já ocupa (invisível),
  // no frame seguinte anima para o retângulo de destino, e ao chegar
  // volta ao fluxo se o destino era a página. Enquanto isso a figura e
  // a altitude da câmera animam na mesma curva e duração — o globo
  // cresce nas mãos que crescem junto, em vez de piscar.
  const trocarModo = useCallback((paraImersivo: boolean) => {
    const el = espacadorRef.current;
    if (!el) return;
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current);

    const rEsp = el.getBoundingClientRect();
    const retPagina: Ret = { top: rEsp.top, left: rEsp.left, w: rEsp.width, h: rEsp.height };
    const retJanela: Ret = { top: 0, left: 0, w: window.innerWidth, h: window.innerHeight };

    // 1. fixa o palco no retângulo que JÁ ocupa, sem trocar de modo:
    //    mesmo pixel na tela, nada anima, nada salta.
    setRetFixo(paraImersivo ? retPagina : retJanela);

    // 2. no frame seguinte, TUDO muda no mesmo commit e com as
    //    transições acesas — modo (que redefine a figura e a posição
    //    do canvas), retângulo do palco e, no effect do globo, a
    //    altitude. Um movimento só. Trocar o modo junto com o retângulo
    //    é o que faltava: antes a figura saltava 667→1150 no frame em
    //    que o modo mudava, porque as transições só acendiam depois.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimandoModo(true);
        setImersivo(paraImersivo);
        setRetFixo(paraImersivo ? retJanela : retPagina);
      });
    });

    // 3. ao chegar, a página volta ao fluxo (coordenadas idênticas)
    temporizadorRef.current = setTimeout(() => {
      setAnimandoModo(false);
      if (!paraImersivo) setRetFixo(null);
    }, MODO_MS + 80);
  }, []);

  useEffect(() => () => {
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
  }, []);

  const entrarImersivo = useCallback(() => trocarModo(true), [trocarModo]);
  const sairImersivo = useCallback(() => trocarModo(false), [trocarModo]);

  // Mesma promise cacheada que o globo consome — zero busca duplicada.
  useEffect(() => {
    let vivo = true;
    carregarMundo()
      .then((m) => { if (vivo) { setLegenda(derivarLegenda(m)); setMundo(m); } })
      .catch(() => { /* o globo declara o erro; a legenda só se omite */ });
    return () => { vivo = false; };
  }, []);

  // Zoom-in esmaece a página inteira (segunda revisão pós-Wave 28,
  // pedido do Aquiles): o globo dirige a opacidade da coluna lateral
  // pela mesma curva do frontispício — no mergulho só restam globo,
  // header e rodapé. Style direto no DOM, zero re-render por frame.
  const aoMudarOpacidadeAmbiente = useCallback((o: number) => {
    const coluna = colunaRef.current;
    if (coluna) coluna.style.opacity = o.toFixed(3);
  }, []);

  return (
    <AlexandriaShell navAtivo="atlas">
      {/* Espaçador: reserva no fluxo a altura do palco da página, para
          nada colapsar quando o palco está fixo (durante o zoom e no
          modo imersivo). É também de onde sai a geometria do modo
          página — medida real, não estimada. */}
      <div
        ref={espacadorRef}
        style={{
          position: 'relative',
          height: 'max(520px, calc(100vh - 118px))',
          // full-bleed pela largura real do <main> (clientWidth exclui
          // a scrollbar — 100vw aqui causaria overflow horizontal)
          width: larguraMain !== null ? `${larguraMain}px` : '100%',
          marginLeft: larguraMain !== null ? `calc((100% - ${larguraMain}px) / 2)` : 0,
        }}
      >
        {/* Palco: no fluxo (absoluto dentro do espaçador) quando em
            repouso na página; FIXO com retângulo animado durante o
            zoom e no imersivo. As quatro coordenadas animam na mesma
            curva e duração da câmera e da figura. */}
        <div
          style={{
            ...(retFixo
              ? {
                  position: 'fixed' as const,
                  top: retFixo.top,
                  left: retFixo.left,
                  width: retFixo.w,
                  height: retFixo.h,
                  zIndex: 60,
                }
              : { position: 'absolute' as const, inset: 0 }),
            background: imersivo ? A.cremePapel : 'transparent',
            overflow: 'hidden',
            transition: animandoModo
              ? `top ${MODO_MS}ms ${AE.easing}, left ${MODO_MS}ms ${AE.easing}, width ${MODO_MS}ms ${AE.easing}, height ${MODO_MS}ms ${AE.easing}, background ${MODO_MS}ms ${AE.easing}`
              : 'none',
          }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ ...AT.rotulo, color: A.terracota }}>Montando o globo…</span>
              </div>
            }
          >
            {dimPagina !== null && dimJanela.h > 0 && (
              <AtlasGlobo
                aoMudarOpacidadeAmbiente={aoMudarOpacidadeAmbiente}
                imersivo={imersivo}
                dimPagina={{ w: dimPagina.w, h: dimPagina.h }}
                dimImersivo={dimJanela}
                animandoModo={animandoModo}
                duracaoModo={MODO_MS}
                modoCor={modoCor}
                filtro={filtro}
                pedidoDeVoo={pedidoDeVoo}
                aoEntrarImersivo={entrarImersivo}
                aoSairImersivo={sairImersivo}
              />
            )}
          </Suspense>

        {/* Coluna lateral esquerda — masthead, leitura e referências.
            pointerEvents none: o arrasto do globo atravessa o texto.
            A opacidade é dirigida pela câmera do globo (esmaece no
            zoom-in, volta no repouso). */}
        <div
          ref={colunaRef}
          style={{
            position: 'absolute',
            left: AS.xl,
            top: 0,
            width: '248px',
            // Com o painel analítico da Wave 35 a coluna passa da
            // altura do palco (medido: 1571px de conteúdo em 837px de
            // palco). Rola por dentro, e por isso precisa de ponteiro —
            // o cabeçalho abaixo devolve `none` para o arrasto do globo
            // continuar atravessando o texto de leitura.
            maxHeight: '100%',
            overflowY: 'auto',
            paddingRight: AS.sm,
            display: 'flex',
            flexDirection: 'column',
            gap: AS.lg,
            pointerEvents: 'auto',
            transition: `opacity ${AE.estado} ${AE.easing}`,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm, pointerEvents: 'none' }}>
            <span style={{ ...AT.rotulo, color: A.terracota }}>Atlas</span>
            <h1 style={{ ...AT.h1, fontSize: '26px', lineHeight: 1.25, color: A.tintaSobreCreme, margin: 0 }}>
              Atlas Mundial de Energia
            </h1>
            <p style={{ ...AT.corpo, fontSize: '13px', lineHeight: 1.6, color: A.tintaSuave, margin: 0 }}>
              Cada país soberano com seu perfil elétrico real — matriz de
              geração, participação renovável, intensidade de carbono —
              extraído do Our World in Data, com fonte citada por campo.
              Gire a esfera com o mouse; pare o cursor sobre um país
              para a leitura rápida, e clique para voar até ele.
            </p>
          </div>

          {/* Legenda da prancha — contagens DERIVADAS da junção real. */}
          {legenda !== null && (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${A.fioSobreCreme}` }}>
              <LinhaLegenda rotulo="Perfis soberanos" valor={String(legenda.perfisSemGeometria + legenda.comPerfil)} />
              <LinhaLegenda rotulo="Ano de referência" valor={legenda.ano} />
              <LinhaLegenda rotulo="Fronteiras 1:110m" valor={String(legenda.fronteiras)} />
              <LinhaLegenda rotulo="Com perfil no globo" valor={String(legenda.comPerfil)} />
              <LinhaLegenda rotulo="Território sem dado" valor={String(legenda.semDado)} />
              <LinhaLegenda rotulo="Perfil sem geometria" valor={String(legenda.perfisSemGeometria)} />
            </div>
          )}

          {/* Painel analítico (Wave 35) — coloração, filtro e rankings,
              todos derivados dos 12 campos já ingeridos. */}
          {mundo !== null && (
            <AtlasControles
              mundo={mundo}
              modoCor={modoCor}
              aoMudarModoCor={setModoCor}
              filtro={filtro}
              aoMudarFiltro={setFiltro}
              aoEscolherPais={(iso) => setPedidoDeVoo({ iso, nonce: Date.now() })}
            />
          )}

          <span style={{ ...AT.dado, fontSize: '11px', lineHeight: 1.55, color: A2.tintaMetadado }}>
            Fronteiras: Natural Earth 1:110m (TopoJSON, cópia
            byte-idêntica). Perfis: Our World in Data — Ember, Energy
            Institute, EIA. Território sem perfil declara ausência no
            cursor — nenhum número é inventado. Micro-Estados insulares
            têm perfil mas não têm geometria nesta escala.
          </span>

          {/* Camada Brasil: wave separada, ainda não construída. */}
          <div
            style={{
              border: `1px dashed ${A.terracota}`,
              borderRadius: AR.none,
              padding: `${AS.sm} ${AS.md}`,
              display: 'flex',
              flexDirection: 'column',
              gap: AS.xs,
            }}
          >
            <span style={{ ...AT.rotulo, fontSize: '8px', color: A.terracota }}>Em produção</span>
            <span style={{ ...AT.dado, fontSize: '11px', lineHeight: 1.5, color: A.tintaSuave }}>
              Camada Brasil — os quatro submercados do SIN sobre esta
              mesma esfera — é wave separada, ainda não construída.
            </span>
          </div>
        </div>
        </div>
      </div>
    </AlexandriaShell>
  );
}

export default AtlasStub;
