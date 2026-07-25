// AlexandriaFooter — faixa navy no pé, com a banda de blueprint em
// opacidade baixa como fundo.
//
// Altura vem de padding, não de valor fixo: o handoff não declara
// footerHeight em lugar nenhum (busca exaustiva — nenhum height,
// min-height ou max-height nos rodapés). Os dois rodapés reais são
// dimensionados por conteúdo, ambos com border-top 1px navy-line.
// Reproduzo esse padrão em vez de inventar um número.
//
// DIVERGÊNCIA REGISTRADA: o brief pede a faixa de blueprint aqui, e é
// o que está implementado. O handoff descreve 'rodapé navy com faixa
// de blueprint' em prosa (L1084) mas nenhum dos rodapés de produto
// (L1312, L1835) carrega background-image. A faixa existe no arquivo
// só como chrome do próprio documento de handoff.

import { A, A2, AT, AS, AR, ALAYOUT } from '../../../design/alexandria-tokens';

export function AlexandriaFooter() {
  return (
    <footer
      style={{
        position: 'relative',
        flex: 'none',
        background: A2.navyProfundo,
        borderTop: `1px solid ${A.fioSobreNavy}`,
        borderRadius: AR.none,
        padding: `${ALAYOUT.footerPaddingY} ${ALAYOUT.footerPaddingX}`,
        overflow: 'hidden',
      }}
    >
      {/* Banda de blueprint — decorativa, atrás do conteúdo, opacidade baixa. */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/alexandria/textura/texture-blueprint-band-on-navy.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.14,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr 1fr',
          gap: AS.xxl,
          alignItems: 'center',
        }}
      >
        <span style={{ ...AT.rotulo, color: A2.tintaMetadadoNavy }}>
          Alexandria · GridAlpha
        </span>

        <span
          style={{
            ...AT.corpo,
            fontSize: '13px',
            fontStyle: 'italic',
            lineHeight: 1.5,
            color: A2.tintaSobreNavySuave,
            maxWidth: 'none',
            textAlign: 'center',
          }}
        >
          Um atlas se lê devagar — e se corrige sempre.
        </span>

        <span style={{ ...AT.rotulo, color: A2.tintaMetadadoNavy, textAlign: 'right' }}>
          Atlas vivo da energia do Brasil
        </span>
      </div>
    </footer>
  );
}

export default AlexandriaFooter;
