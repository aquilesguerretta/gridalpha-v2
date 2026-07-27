// GlossarioStub — estado inicial da superfície do Glossário.
//
// Mesmo registro dos outros estados de produção do produto: contorno
// tracejado em terracota, frase específica sobre o que vai existir.
//
// Sem verbete, sem busca de termo, sem contagem. A página real é de outra
// wave; aqui só o contrato de rota.

import { AlexandriaShell } from '@/components/alexandria/shell/AlexandriaShell';
import { A, A2, AT, AS, AR } from '@/design/alexandria-tokens';

export function GlossarioStub() {
  return (
    <AlexandriaShell navAtivo="glossario">
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xl }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
          <span style={{ ...AT.rotulo, color: A.terracota }}>Glossário</span>
          <h1 style={{ ...AT.h1, color: A.tintaSobreCreme, margin: 0 }}>
            O vocabulário defensável
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
            Vai reunir os termos do setor com a definição usada no currículo e
            um link para a aula onde cada um é ensinado — para que a palavra
            aponte de volta para onde ela foi construída, e não para uma
            definição solta.
          </p>
          <span
            style={{ ...AT.dado, fontSize: '11px', fontStyle: 'italic', color: A2.tintaMetadado }}
          >
            O Módulo 01 já tem uma seção § Lex extraível. Os outros dezesseis
            módulos ainda não têm conteúdo para render termo.
          </span>
        </div>
      </div>
    </AlexandriaShell>
  );
}

export default GlossarioStub;
