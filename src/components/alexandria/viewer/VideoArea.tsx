// VideoArea — o topo do viewer.
//
// Nenhuma das nove aulas do Módulo 01 tem vídeo: o HTML de origem não traz
// vídeo nenhum, e `video` é null nas nove. Isso é ESTADO REAL, não lacuna a
// preencher. Então aqui não tem player quebrado nem retângulo vazio sem
// explicação — tem o mesmo idioma que módulo sem aula já usa: contorno
// tracejado em terracota, dizendo o que é e por quê.

import type { LessonVideo } from '@/lib/types/alexandria';
import { A, A2, AT, AS, AR } from '@/design/alexandria-tokens';

export function VideoArea({ video }: { video: LessonVideo | null }) {
  if (video) {
    return (
      <div
        style={{
          border: `1px solid ${A.fioSobreCreme}`,
          borderRadius: AR.none,
          aspectRatio: '16 / 9',
          background: A2.navyProfundo,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ ...AT.rotulo, color: A.tintaSobreNavy }}>{video.title}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        // Tracejado, não sólido: mesma forma que o nó de módulo em produção
        // usa no caminho de expedição. Contorno não preenchido = ainda não
        // foi gravado.
        border: `1px dashed ${A.terracota}`,
        borderRadius: AR.none,
        padding: `${AS.xxl} ${AS.xl}`,
        display: 'flex',
        flexDirection: 'column',
        gap: AS.sm,
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <span style={{ ...AT.rotulo, color: A.terracota }}>Vídeo em produção</span>
      <span
        style={{
          ...AT.corpo,
          fontSize: '13px',
          lineHeight: 1.6,
          color: A.tintaSuave,
          maxWidth: '46ch',
          margin: 0,
        }}
      >
        Esta aula ainda não tem gravação. O texto abaixo é a aula completa —
        não é resumo nem transcrição de um vídeo que existe em outro lugar.
      </span>
      <span style={{ ...AT.dado, fontSize: '11px', fontStyle: 'italic', color: A2.tintaMetadado }}>
        Nenhuma das nove aulas do Módulo 01 tem vídeo hoje.
      </span>
    </div>
  );
}

export default VideoArea;
