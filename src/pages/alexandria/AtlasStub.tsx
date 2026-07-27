// AtlasStub — estado inicial da superfície do Atlas.
//
// Mesmo registro dos outros estados de produção do produto: contorno
// tracejado em terracota, frase específica sobre o que vai existir.
//
// Sem mapa, sem submercado desenhado, sem dado de ONS. A página real é de
// outra wave; aqui só o contrato de rota.

import { AlexandriaShell } from '@/components/alexandria/shell/AlexandriaShell';
import { A, A2, AT, AS, AR } from '@/design/alexandria-tokens';

export function AtlasStub() {
  return (
    <AlexandriaShell navAtivo="atlas">
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xl }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
          <span style={{ ...AT.rotulo, color: A.terracota }}>Atlas</span>
          <h1 style={{ ...AT.h1, color: A.tintaSobreCreme, margin: 0 }}>
            A geografia do sistema
          </h1>
        </div>

        <div
          style={{
            border: `1px dashed ${A.terracota}`,
            borderRadius: AR.none,
            padding: `${AS.xl} ${AS.xl}`,
            display: 'flex',
            flexDirection: 'column',
            gap: AS.md,
          }}
        >
          <span style={{ ...AT.rotulo, color: A.terracota }}>Superfície em produção</span>
          <p
            style={{
              ...AT.corpo,
              fontSize: '14px',
              lineHeight: 1.65,
              color: A.tintaSuave,
              maxWidth: '58ch',
              margin: 0,
            }}
          >
            Vai mostrar o SIN como prancha cartográfica: os quatro submercados,
            as interligações entre eles, e a aula que explica cada trecho —
            navegável pelo mapa, não por lista.
          </p>
          <span
            style={{ ...AT.dado, fontSize: '11px', fontStyle: 'italic', color: A2.tintaMetadado }}
          >
            Falta o recorte regional no nível da aula. É a mesma dependência que
            hoje deixa a cobertura por submercado como painel de leitura em vez
            de filtro.
          </span>
        </div>
      </div>
    </AlexandriaShell>
  );
}

export default AtlasStub;
