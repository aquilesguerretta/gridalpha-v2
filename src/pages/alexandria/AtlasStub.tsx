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

import { Suspense, lazy, useEffect, useState } from 'react';
import { AlexandriaShell } from '@/components/alexandria/shell/AlexandriaShell';
import { A, A2, AT, AS, AR } from '@/design/alexandria-tokens';
import { carregarMundo, type MundoAtlas } from '@/lib/atlas/worldApi';

const AtlasGlobo = lazy(() => import('@/components/alexandria/atlas/AtlasGlobo'));

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

export function AtlasStub() {
  const [legenda, setLegenda] = useState<LegendaAtlas | null>(null);

  // Mesma promise cacheada que o globo consome — zero busca duplicada.
  useEffect(() => {
    let vivo = true;
    carregarMundo()
      .then((m) => { if (vivo) setLegenda(derivarLegenda(m)); })
      .catch(() => { /* o globo declara o erro; a legenda só se omite */ });
    return () => { vivo = false; };
  }, []);

  return (
    <AlexandriaShell navAtivo="atlas">
      {/* Palco em altura de viewport: 100vh − header (70) − paddings
          da prancha. O globo é a página; o rodapé vem no scroll. */}
      <div style={{ position: 'relative', height: 'max(520px, calc(100vh - 140px))' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
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
            <AtlasGlobo />
          </Suspense>
        </div>

        {/* Coluna lateral esquerda — masthead, leitura e referências.
            pointerEvents none: o arrasto do globo atravessa o texto. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '248px',
            display: 'flex',
            flexDirection: 'column',
            gap: AS.lg,
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
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
    </AlexandriaShell>
  );
}

export default AtlasStub;
