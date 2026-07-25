// AlexandriaHome — placeholder mínimo. Existe para montar e verificar
// o shell; o conteúdo real chega nas waves seguintes.

import { AlexandriaShell } from '../../components/alexandria/shell/AlexandriaShell';
import { A, A2, AT, AS, AR } from '../../design/alexandria-tokens';

export function AlexandriaHome() {
  return (
    <AlexandriaShell showLeftRail>
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xl }}>
        <span style={{ ...AT.rotulo, color: A.terracota }}>Fundações</span>

        <h1 style={{ ...AT.h1, color: A.tintaSobreCreme, margin: 0 }}>
          Atlas vivo da energia do Brasil
        </h1>

        <p style={{ ...AT.corpo, color: A.tintaSobreCreme, margin: 0 }}>
          Alexandria é a camada educacional do GridAlpha — uma monografia de
          levantamento sobre o setor elétrico brasileiro, organizada em trilhas
          que se percorrem como expedição. Esta tela existe para montar o shell:
          header em campo navy, rail esquerdo em campo creme, canvas com textura
          de fibra, rail direito com as cinco seções fixas, e rodapé com a faixa
          de blueprint.
        </p>

        {/* Blocos irmãos separados por fio — nunca card dentro de card. */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: `1px solid ${A.fioSobreCreme}`,
            borderBottom: `1px solid ${A.fioSobreCreme}`,
          }}
        >
          {[
            { rotulo: 'Blocos', valor: '17', nota: 'catalogados' },
            { rotulo: 'Trilhas', valor: '—', nota: 'a definir' },
            { rotulo: 'Gravuras', valor: '106', nota: 'em acervo' },
          ].map((item, i) => (
            <div
              key={item.rotulo}
              style={{
                padding: `${AS.lg} ${AS.xl} ${AS.lg} ${i === 0 ? '0' : AS.xl}`,
                borderLeft: i > 0 ? `1px solid ${A.fioSobreCreme}` : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: AS.xs,
              }}
            >
              <span style={{ ...AT.rotulo, color: A2.tintaMetadado }}>{item.rotulo}</span>
              <span style={{ ...AT.h2, color: A.tintaSobreCreme }}>{item.valor}</span>
              <span style={{ ...AT.dado, color: A.tintaSuave }}>{item.nota}</span>
            </div>
          ))}
        </div>

        {/* Chip é retângulo de fio — nunca pílula. */}
        <div style={{ display: 'flex', gap: AS.sm, flexWrap: 'wrap' }}>
          {['Geração', 'Transmissão', 'Mercado', 'Tarifa'].map((t) => (
            <span
              key={t}
              style={{
                ...AT.dado,
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: A.tintaSuave,
                border: `1px solid ${A.fioSobreCreme}`,
                borderRadius: AR.none,
                padding: '3px 7px',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </AlexandriaShell>
  );
}

export default AlexandriaHome;
