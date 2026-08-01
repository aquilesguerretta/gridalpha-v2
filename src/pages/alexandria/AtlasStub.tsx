// AtlasStub — Atlas Mundial de Energia (Wave 27).
//
// O nome do arquivo fica: é o contrato de rota da Wave 6, e o
// AlexandriaRouter (fora da posse) importa daqui. O corpo deixou de
// ser stub — é a página real do globo.
//
// O globo é carregado via React.lazy DE PROPÓSITO: react-globe.gl +
// three-globe pesam ~601 KB raw (193 KB gzip) e o app não tem nenhum
// outro lazy-loading — sem esta fronteira, o stack Three entraria no
// bundle que TODA página da plataforma baixa. Com ela, só quem abre
// /alexandria/atlas paga o chunk. Decisão registrada no relatório da
// wave; veto limpo = npm uninstall + revert deste arquivo.

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

function CelulaLegenda({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xs, minWidth: 0 }}>
      <span style={{ ...AT.rotulo, fontSize: '9px', letterSpacing: '0.15em', color: A2.tintaMetadado }}>
        {rotulo}
      </span>
      <span style={{ ...AT.dado, color: A.tintaSobreCreme }}>{valor}</span>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xl }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
          <span style={{ ...AT.rotulo, color: A.terracota }}>Atlas</span>
          <h1 style={{ ...AT.h1, color: A.tintaSobreCreme, margin: 0 }}>
            Atlas Mundial de Energia
          </h1>
          <p style={{ ...AT.corpo, fontSize: '15px', color: A.tintaSuave, margin: 0 }}>
            Cada país soberano com seu perfil elétrico real — matriz de
            geração, participação renovável, intensidade de carbono —
            extraído do Our World in Data, com fonte citada por campo.
            Gire a esfera com o mouse; pare o cursor sobre um país.
          </p>
        </div>

        {/* Prancha do globo: campo escuro emoldurado por fio duplo,
            como gravura montada na página de um atlas. Profundidade
            vem de fio, nunca de sombra. */}
        <div
          style={{
            border: `1px solid ${A.fioSobreCreme}`,
            borderRadius: AR.none,
            padding: '3px',
            background: A2.cremeSuperficie,
          }}
        >
          <div
            style={{
              border: `1px solid ${A2.fioClaroSobreCreme}`,
              borderRadius: AR.none,
              height: 'min(62vh, 620px)',
              minHeight: '420px',
              overflow: 'hidden',
            }}
          >
            <Suspense
              fallback={
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: A.tintaSobreCreme,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ ...AT.rotulo, color: A2.ouroSobreNavy }}>Montando o globo…</span>
                </div>
              }
            >
              <AtlasGlobo />
            </Suspense>
          </div>
        </div>

        {/* Legenda da prancha — contagens DERIVADAS da junção real. */}
        {legenda !== null && (
          <div
            style={{
              display: 'flex',
              gap: AS.xl,
              flexWrap: 'wrap',
              borderTop: `1px solid ${A.fioSobreCreme}`,
              borderBottom: `1px solid ${A.fioSobreCreme}`,
              padding: `${AS.md} 0`,
            }}
          >
            <CelulaLegenda rotulo="Perfis soberanos" valor={String(legenda.perfisSemGeometria + legenda.comPerfil)} />
            <CelulaLegenda rotulo="Ano de referência" valor={legenda.ano} />
            <CelulaLegenda rotulo="Fronteiras 1:110m" valor={String(legenda.fronteiras)} />
            <CelulaLegenda rotulo="Com perfil no globo" valor={String(legenda.comPerfil)} />
            <CelulaLegenda rotulo="Território sem dado" valor={String(legenda.semDado)} />
            <CelulaLegenda rotulo="Perfil sem geometria" valor={String(legenda.perfisSemGeometria)} />
          </div>
        )}

        {/* Proveniência + limitações reais, declaradas na página. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
          <span style={{ ...AT.dado, fontSize: '12px', color: A2.tintaMetadado }}>
            Fronteiras: Natural Earth 1:110m (TopoJSON world-atlas, cópia
            byte-idêntica). Perfis: Our World in Data — Ember, Energy
            Institute, EIA. Território desenhado sem perfil (Taiwan,
            Groenlândia, Antártida…) declara ausência no cursor — nenhum
            número é inventado. Micro-Estados insulares têm perfil mas
            não têm geometria nesta escala.
          </span>
        </div>

        {/* Camada Brasil: wave separada, ainda não construída. Mesmo
            registro de produção do sistema inteiro. */}
        <div
          style={{
            border: `1px dashed ${A.terracota}`,
            borderRadius: AR.none,
            padding: `${AS.md} ${AS.lg}`,
            display: 'flex',
            flexDirection: 'column',
            gap: AS.xs,
          }}
        >
          <span style={{ ...AT.rotulo, fontSize: '9px', color: A.terracota }}>Em produção</span>
          <span style={{ ...AT.dado, fontSize: '12px', color: A.tintaSuave }}>
            Camada Brasil — os quatro submercados do SIN sobre esta mesma
            esfera — é wave separada, ainda não construída.
          </span>
        </div>
      </div>
    </AlexandriaShell>
  );
}

export default AtlasStub;
