// PortalBR — ARCHITECT, Portal BR Wave 1.
//
// A porta de entrada do lado brasileiro. Se apresenta e encaminha:
// header com seletor de mercado → hero → grade de destinos → faixa de
// independência → rodapé.
//
// Não é a Alexandria. A Alexandria é um dos cinco destinos, e mora fora
// do prefixo de mercado porque tem trilhas universal / brasil / usa —
// o portal BR aponta pra ela com a trilha brasileira como padrão.
//
// Esta wave é estrutural. A identidade visual está sendo desenhada em
// paralelo e chega numa wave seguinte; aqui existe a espinha e um
// esqueleto honesto, não um chute na estética final.
//
// SCROLL — `index.css` trava html/body/#root em 100vh com overflow
// hidden para o terminal. Duas saídas existem no repo: a LandingPage
// sequestra e restaura o overflow do documento num useEffect; o
// AlexandriaShell monta um quadro de 100vh e rola por dentro. O portal
// segue o AlexandriaShell — não muta estado global, então não há
// cleanup a falhar se a navegação sair por um caminho inesperado.

import { DESTINOS_BR } from '../../lib/data/br-destinos';
import { DestinoCard } from '../../components/br/DestinoCard';
import { FaixaIndependencia } from '../../components/br/FaixaIndependencia';
import { PortalHero } from '../../components/br/PortalHero';
import { SeletorMercado } from '../../components/br/SeletorMercado';

// TODO: substituir por tokens do portal BR quando a wave visual chegar
const BR = {
  campoFundo: '#0D0D11',
  tinta: '#F2F2F0',
  tintaSuave: 'rgba(242,242,240,0.62)',
  tintaFraca: 'rgba(242,242,240,0.34)',
  fio: 'rgba(242,242,240,0.14)',
};

// Medida máxima de prancha. O handoff visual do portal ainda não existe,
// então este teto é decisão de arquitetura, não extração: sem ele, em
// 3440px a grade de destinos estica e o portal vira landing page de
// SaaS. 1200px dá mais ar que os 1120px da Alexandria porque aqui há
// uma grade de quatro colunas, não uma página de monografia.
const MEDIDA = '1200px';
const RESPIRO_LATERAL = '32px';

/** Placeholder da gravura em grande formato. Substituído pela
 *  ilustração real quando a wave visual chegar. */
function GravuraReservada() {
  return (
    <span
      style={{
        fontSize: '10px',
        letterSpacing: '0.20em',
        textTransform: 'uppercase',
        color: BR.tintaFraca,
      }}
    >
      Gravura — espaço reservado
    </span>
  );
}

export function PortalBR() {
  // Separar por status é o que dá hierarquia à grade sem inventar
  // estética: o que está aberto ocupa a linha inteira, o que vem depois
  // se alinha em quatro colunas abaixo. Derivado dos dados, não
  // hardcoded — se um segundo destino abrir, a composição acompanha.
  const disponiveis = DESTINOS_BR.filter((d) => d.status === 'disponivel');
  const emBreve = DESTINOS_BR.filter((d) => d.status === 'em-breve');

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: BR.campoFundo,
        color: BR.tinta,
        borderRadius: 0,
      }}
    >
      <header
        style={{
          flexShrink: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          padding: `0 ${RESPIRO_LATERAL}`,
          borderBottom: `1px solid ${BR.fio}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '15px', letterSpacing: '-0.01em', color: BR.tinta }}>
            GridAlpha
          </span>
          <span aria-hidden="true" style={{ width: '1px', height: '14px', background: BR.fio }} />
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: BR.tintaSuave,
            }}
          >
            Brasil
          </span>
        </div>

        <SeletorMercado ativo="br" />
      </header>

      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ maxWidth: MEDIDA, margin: '0 auto', padding: `0 ${RESPIRO_LATERAL}` }}>
          <PortalHero
            titulo="Inteligência independente do setor elétrico brasileiro"
            subtitulo="Cinco destinos para quem precisa entender o mercado de energia do Brasil — dados, formação e análise. Um está aberto hoje; os outros chegam em sequência."
            illustrationSlot={<GravuraReservada />}
          />

          <section
            aria-label="Destinos"
            style={{
              padding: '56px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* auto-fit colapsa as trilhas vazias, então um único destino
                aberto ocupa a largura inteira e se torna o elemento
                dominante da grade sem precisar de span calculado. */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '20px',
              }}
            >
              {disponiveis.map((d) => (
                <DestinoCard key={d.id} destino={d} />
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(252px, 1fr))',
                gap: '20px',
              }}
            >
              {emBreve.map((d) => (
                <DestinoCard key={d.id} destino={d} />
              ))}
            </div>
          </section>

          <FaixaIndependencia />
        </div>

        <footer
          style={{
            marginTop: '24px',
            borderTop: `1px solid ${BR.fio}`,
          }}
        >
          <div
            style={{
              maxWidth: MEDIDA,
              margin: '0 auto',
              padding: `28px ${RESPIRO_LATERAL}`,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '12px', color: BR.tintaSuave }}>
              GridAlpha — análise independente do mercado de energia.
            </span>
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: BR.tintaFraca,
              }}
            >
              {new Date().getFullYear()}
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default PortalBR;
